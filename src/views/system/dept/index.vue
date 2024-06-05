<template>
  <div class="card content-box">
    <div class="table-box">
      <el-form class="search-form" :inline="true" :model="formInline">
        <el-form-item label="">
          <el-input
            v-model="formInline.deptName"
            placeholder="部门名称"
            clearable
            style="width: 192px"
            @keyup.enter="getTableData"
          />
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="formInline.status"
            placeholder="部门状态"
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
          <el-button type="primary" @click="getTableData"
            ><el-icon><Search /></el-icon>搜索</el-button
          >
          <el-button @click="resetQuery"
            ><el-icon><Refresh /></el-icon>重置</el-button
          >
        </el-form-item>
      </el-form>
      <div style="margin-bottom: 10px">
        <el-button type="primary" plain @click="addRow"
          ><Plus style="width: 1em; height: 1em; margin-right: 8px" />新增</el-button
        >
        <el-button type="info" @click="handleLaunch" plain>
          <el-icon><Sort /></el-icon>展开/折叠</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        v-if="refreshTable"
        ref="tableRef"
        row-key="deptId"
        :header-cell-style="{ background: '#f5f7fa' }"
        :data="tableData"
        default-expand-all
        style="width: 100%"
      >
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
            <el-button
              type="primary"
              text
              @click="handleDelete(row)"
              :disabled="row.userId == companyId"
              ><el-icon><Plus /></el-icon>新增</el-button
            >
            <el-button type="primary" text v-if="row.parentId !== 0" @click="handleDel(row)"
              ><el-icon><Delete /></el-icon>删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 弹窗 -->
    <AddOrEdit
      @render-table="getTableData"
      ref="AddOrEditRef"
      :handle-type="handleType"
      :form-data="mainRow"
      :tree-data="tableData"
    />
  </div>
</template>

<script setup lang="ts" name="dept">
import { ref, Ref, reactive, onMounted, computed } from 'vue'
import { handleTree } from '@/utils'
import { Dept } from '@/api/interface/system'
import { useAuthStore } from '@/stores/modules/auth'
import { listDept } from '@/api/modules/system/dept'
import { commonStatus } from '@/utils/serviceDict'
import AddOrEdit from './EditForm.vue'
const loading = ref(false)
// 查询参数
const formInline = reactive({
  deptName: undefined,
  status: undefined
})
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 刷新
const refreshTable = ref(true)
// 当前是否是展开的状态 默认进来展开
const isLaunch = ref(true)
// 新增与编辑
const handleType = ref('add')
// table 组件的实例 类比vue2中 this.$refs.tableRef
const tableRef = ref()
// 表格数据
let tableData:Dept.ResDeptList[] = []
// 表格列`
const tableColumns = [
  { key: 1, label: `部门名称`, prop: 'deptName', visible: true, isChecked: false },
  { key: 2, label: `排序`, prop: 'orderTag', visible: true },
  { key: 3, label: `状态`, prop: 'status', visible: true },
  { key: 4, label: `创建时间`, prop: 'addTime', visible: true }
]
onMounted(() => {
  getTableData()
})
let mainRow: Ref<Dept.ResUserList | {}> = ref({})
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref()
// 新增
const addRow = () => {
  handleType.value = 'add'
  AddOrEditRef.value.dialogFormVisible = true
}
// 删除
const handleDel = (row) => {
  console.log(row)
}

// 处理展开与折叠
const handleLaunch = () => {
  isLaunch.value = !isLaunch.value
  tableData.forEach((opt) => {
    tableRef.value.toggleRowExpansion(opt, isLaunch.value)
  })
}
// 重置查询
const resetQuery = () => {
  formInline.deptName = undefined
  formInline.status = undefined
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let res = await listDept(formInline)
    tableData = handleTree(res.data, 'deptId')
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
// 编辑
const handleEdit = (row: Dept.RuleForm) => {
  handleType.value = 'edit'
  mainRow.value = {
    userId: row.userId,
    deptId: row.deptId,
    username: row.username,
    nickName: row.nickName,
    // password: '',
    phone: row.phone,
    email: row.email,
    sex: row.sex,
    status: row.status,
    postIds: row.postIds || [],
    roleIds: row.roleIds || []
  }
  AddOrEditRef.value.dialogFormVisible = true
}
</script>