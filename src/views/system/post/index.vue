<template>
  <div class="card content-box">
    <div class="table-box">
      <el-form class="search-form" :inline="true" :model="formInline">
        <el-form-item label="">
          <el-input
            v-model="formInline.postCode"
            placeholder="岗位编码"
            clearable
            style="width: 192px"
            @keyup.enter="renderTable"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model="formInline.postName"
            placeholder="岗位名称"
            clearable
            style="width: 192px"
            @keyup.enter="renderTable"
          />
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="formInline.status"
            placeholder="岗位状态"
            clearable
            style="width: 192px"
          >
            <el-option
              v-for="item in commonStatus"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <el-button type="primary" plain @click="addRow" v-hasPermi="['system:post:add']"
          ><Plus style="width: 1em; height: 1em; margin-right: 8px" />新增</el-button
        >
        <el-button
          :disabled="multipleSelection.length !== 1"
          type="success"
          plain
          v-hasPermi="['system:post:edit']"
          @click="editFun"
        >
          <EditPen style="width: 1em; height: 1em; margin-right: 8px" />
          修改</el-button
        >
        <el-button
          type="danger"
          :disabled="multipleSelection.length == 0"
          plain
          @click="batchDelete"
          v-hasPermi="['system:post:remove']"
          ><Delete style="width: 1em; height: 1em; margin-right: 8px" />删除</el-button
        >
        <el-button type="warning" @click="handleExport" plain v-hasPermi="['system:post:export']"
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
        >
          <template #default="{ row }">
            <template v-if="item.prop == 'status'">
              <dict-tag :options="commonStatus" :value="row.status + ''" />
            </template>
            <template v-else>
              {{ row[item.prop] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button type="primary" text @click="handleEdit(row)"
              ><el-icon><EditPen /></el-icon>修改</el-button
            >
            <el-button type="primary" text v-if="row.parentId !== 0" @click="handleDel(row)"
              ><el-icon><Delete /></el-icon>删除</el-button
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
    <FileExport ref="fileExportRef" @saveExportDialog="saveExportDialog" />
    <!-- 弹窗 -->
    <AddOrEdit
      @render-table="renderTable"
      ref="AddOrEditRef"
      :handle-type="handleType"
      :form-data="mainRow"
      :tree-data="tableData"
    />
  </div>
</template>

<script setup lang="ts" name="post">
import { ref, Ref, reactive, onMounted } from 'vue'
import { Post } from '@/api/interface/system'
// import { useAuthStore } from '@/stores/modules/auth'
import { getList, delFun, exportPostInfo } from '@/api/modules/system/post'
import { commonStatus } from '@/utils/serviceDict'
import AddOrEdit from './EditForm.vue'
import FileExport from '@/components/FileExport/index.vue'
import { ElTable, ElMessageBox, ElMessage } from 'element-plus'
const loading = ref(false)
// 查询参数 初始值
const formInline = reactive({
  postCode: undefined,
  postName: undefined,
  status: undefined
})
// const authStore = useAuthStore()
// const companyId = computed(() => authStore.companyId)
// 刷新
// const refreshTable = ref(true)
// 新增与编辑
const handleType = ref('add')
// 表格数据
let tableData: Post.ResPostList[] = []
// 表格列`
const tableColumns = [
  { key: 1, label: `岗位编码`, prop: 'postCode', visible: true },
  { key: 2, label: `岗位名称`, prop: 'postName', visible: true },
  { key: 3, label: `岗位排序`, prop: 'orderTag', visible: true },
  { key: 4, label: `状态`, prop: 'status', visible: true },
  { key: 5, label: `创建时间`, prop: 'addTime', visible: true }
]
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)

onMounted(() => {
  renderTable()
})
let mainRow: Ref<Post.RuleForm | {}> = ref({})
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref()
// 新增
const addRow = () => {
  handleType.value = 'add'
  AddOrEditRef.value.dialogFormVisible = true
}

// 上面的编辑
const editFun = () => {
  handleEdit(multipleSelection.value[0])
}
// 编辑
const handleEdit = (row: Post.RuleForm) => {
  handleType.value = 'edit'
  mainRow.value = {
    postId: row.postId,
    postCode: row.postCode,
    postName: row.postName,
    status: row.status,
    orderTag: row.orderTag,
    remarks: row.remarks
  }
  AddOrEditRef.value.dialogFormVisible = true
}
// 批量删除
const batchDelete = () => {
  handleDel(null)
}
// 单行删除
const handleDel = (row: Post.RuleForm | null) => {
  let postIds = ''
  let str = ''
  if (row && row.postId) {
    str = row.postCode
    postIds = row.postId
  } else {
    str = multipleSelection.value.map((opt) => opt.postCode).join()
    postIds = multipleSelection.value.map((opt) => opt.postId).join()
  }
  ElMessageBox.confirm('是否确认删除岗位编码为"' + str + '"的数据项？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await delFun(postIds)
      ElMessage.success('操作成功!')
      renderTable()
    })
    .catch(() => {})
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
  fileExportRef.value.acceptParams({ pageName: 'post', columns, isWMS: false })
}
//导出数据
const saveExportDialog = (columnList) => {
  let _data = {
    ...formInline,
    // columnList,
    sortColumn: null,
    sortType: null
  }
  exportPostInfo(`post_${new Date().getTime()}.xlsx`, _data, {
    columnList,
    idList: multipleSelection.value.map((opt) => opt.postId)
  })
}
// 重置查询
const resetQuery = () => {
  formInline.postCode = undefined
  formInline.postName = undefined
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
//  table 组件的实例 类比vue2中 this.$refs.tableRef
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
// 勾选相关
const multipleSelection = ref<Post.RuleForm[]>([])
const handleSelectionChange = (val: Post.RuleForm[]) => {
  multipleSelection.value = val
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let res = await getList({ ...formInline, pageSize: pageSize.value, pageNum: pageNum.value })
    tableData = res.data.list
    total.value = res.data.total
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
</script>