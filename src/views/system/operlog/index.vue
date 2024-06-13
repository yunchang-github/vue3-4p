<template>
  <div class="card content-box">
    <div class="table-box">
      <el-form class="search-form" :inline="true" :model="formInline">
        <el-form-item label="">
          <el-input
            v-model="formInline.title"
            placeholder="系统模块"
            clearable
            style="width: 192px"
            @keyup.enter="renderTable"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model="formInline.operName"
            placeholder="操作人员"
            clearable
            style="width: 192px"
            @keyup.enter="renderTable"
          />
        </el-form-item>
        <el-form-item label="" prop="businessType">
          <el-select
            v-model="formInline.businessType"
            placeholder="操作类型"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="dict in operLogStatus"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="formInline.status"
            placeholder="操作状态"
            clearable
            style="width: 192px"
          >
            <el-option
              v-for="item in operLogStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-date-picker
            v-model="lastDate"
            clearable
            type="daterange"
            unlink-panels
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 260px"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="renderTable"
            ><el-icon><Search /></el-icon>搜索</el-button
          >
          <el-button @click="resetQuery"
            ><el-icon><Refresh /></el-icon>重置</el-button
          >
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 10px">
        <el-button
          type="danger"
          :disabled="multipleSelection.length == 0"
          plain
          @click="batchDelete"
          v-hasPermi="['system:operlog:remove']"
          ><Delete style="width: 1em; height: 1em; margin-right: 8px" />删除</el-button
        >
        <el-button
          type="danger"
          :disabled="multipleSelection.length == 0"
          plain
          @click="batchClear"
          v-hasPermi="['system:operlog:remove']"
          ><Delete style="width: 1em; height: 1em; margin-right: 8px" />清空</el-button
        >
        <el-button type="warning" @click="handleExport" plain v-hasPermi="['system:operlog:export']"
          ><Download style="width: 1em; height: 1em; margin-right: 8px" />导出</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        ref="multipleTableRef"
        :header-cell-style="{ background: '#f5f7fa' }"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column
          v-for="item in tableColumns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width || 80"
          align="center"
        >
          <template #default="{ row }">
            <template v-if="item.prop == 'status'">
              <dict-tag :options="operLogStatus" :value="row.status + ''" />
            </template>
            <template v-else-if="item.prop == 'businessType'">
              <span>
                <dict-tag :options="operLogTypeStatus" :value="row.businessType + ''" />
              </span>
            </template>
            <template v-else>
              {{ row[item.prop] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row, index }">
            <el-button
              type="primary"
              text
              v-hasPermi="['system:operlog:query']"
              @click="handleView(row, index)"
            >
              <el-icon><View /></el-icon>
              详细</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        style="float: right; margin-top: 10px"
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[100, 200, 300, 400]"
        small
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 导出 -->
    <FileExport ref="fileExportRef" @saveExportDialog="saveExportDialog" />
    <!-- 详情弹窗 -->
    <detailDialog ref="detailDialogRef" :form-data="mainRow" />
  </div>
</template>

<script setup lang="ts" name="operlog">
import { ref, Ref, reactive, onMounted, computed } from 'vue'
import { Operlog } from '@/api/interface/system'
import { getList, exportInfo, delFun, cleanOperlog } from '@/api/modules/system/operlog'
import { operLogStatus, operLogTypeStatus } from '@/utils/serviceDict'
import { ElTable, ElMessageBox, ElMessage } from 'element-plus'
import FileExport from '@/components/FileExport/index.vue'
import { useAuthStore } from '@/stores/modules/auth'
import detailDialog from './detailDialog.vue'
const loading = ref(false)
// 查询参数 初始值
const formInline = reactive({
  title: undefined,
  operName: undefined,
  businessType: undefined,
  status: undefined
})
// 处理公司Id
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 时间范围
const lastDate = ref([])
// 表格数据
let tableData: Operlog.RuleForm[] = []
// 表格列`
const tableColumns = [
  { key: 1, label: `日志编号`, prop: 'operId', visible: true },
  { key: 2, label: `系统模块`, prop: 'title', visible: true },
  { key: 3, label: `操作类型`, prop: 'businessType', visible: true },
  { key: 4, label: `请求方式`, prop: 'requestMethod', visible: true },
  {
    key: 5,
    label: `操作人员`,
    prop: 'operName',
    sortable: 'custom',
    visible: true
  },
  { key: 6, label: `主机`, prop: 'operIp', visible: true },
  { key: 7, label: `操作状态`, prop: 'status', visible: true },
  {
    key: 8,
    label: `操作日期`,
    prop: 'addTime',
    sortable: 'custom',
    visible: true
  }
]
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)

interface Column {
  value: string
  label: string
  isChecked: boolean
}
onMounted(() => {
  renderTable()
})
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const detailDialogRef = ref()
let mainRow: Ref<Operlog.RuleForm | {}> = ref({})
/** 详细按钮操作 */
const handleView = (row) => {
  mainRow.value = {
    ...row
  }
  detailDialogRef.value.dialogFormVisible = true
}
//  table 组件的实例 类比vue2中 this.$refs.tableRef
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
// 勾选相关
const multipleSelection = ref<Operlog.RuleForm[]>([])
const handleSelectionChange = (val: Operlog.RuleForm[]) => {
  multipleSelection.value = val
}

// 下载内容
const fileExportRef = ref()
const handleExport = () => {
  // tableColumns 处理表头
  let columns = tableColumns.map((opt) => {
    return {
      label: opt.label,
      value: opt.prop,
      isChecked: false
    }
  })
  fileExportRef.value.acceptParams({ pageName: 'operlog', columns, isWMS: false })
}
//导出数据
const saveExportDialog = (columnList: Column[]) => {
  let _data = {
    ...formInline,
    // columnList,
    sortColumn: null,
    sortType: null,
    companyId: companyId.value
  }
  let date = Array.isArray(lastDate.value) ? lastDate.value : []
  if (date.length > 0) {
    _data['params'] = {
      beginTime: lastDate.value[0],
      endTime: lastDate.value[1]
    }
  }
  exportInfo(`operlog_${new Date().getTime()}.xlsx`, _data, {
    columnList,
    idList: multipleSelection.value.map((opt) => opt.operId)
  })
}
// 清空操作
const batchClear = () => {
  ElMessageBox.confirm('是否确认清空所有操作日志数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await cleanOperlog()
      ElMessage.success('清空成功!')
      renderTable()
    })
    .catch(() => {})
}
// 批量删除
const batchDelete = () => {
  handleDel(null)
}
// 单行删除
const handleDel = (row: Operlog.RuleForm | null) => {
  let operIds = ''
  if (row && row.operId) {
    operIds = row.operId + ''
  } else {
    operIds = multipleSelection.value.map((opt) => opt.operId).join()
  }
  ElMessageBox.confirm('是否确认删除日志编号为"' + operIds + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await delFun(operIds)
      ElMessage.success('操作成功!')
      renderTable()
    })
    .catch(() => {})
}
// 重置查询
const resetQuery = () => {
  formInline.title = undefined
  formInline.operName = undefined
  formInline.businessType = undefined
  formInline.status = undefined
}
const handleSizeChange = (val: number) => {
  pageNum.value = 1
  pageSize.value = val
  getTableData()
}
const handleCurrentChange = (val: number) => {
  pageNum.value = val
  getTableData()
}

// 刷新tabel
const renderTable = (flag = 0) => {
  if (flag == 0) {
    pageNum.value = 1
  }
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let _data = {
      ...formInline,
      pageSize: pageSize.value,
      pageNum: pageNum.value
    }
    let date = Array.isArray(lastDate.value) ? lastDate.value : []
    if (date.length > 0) {
      _data['params'] = {
        beginTime: lastDate.value[0],
        endTime: lastDate.value[1]
      }
    }
    let res = await getList(_data)
    tableData = res.data.list
    total.value = res.data.total
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
</script>