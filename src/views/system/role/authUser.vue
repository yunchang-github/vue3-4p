<template>
  <div class="card table-box">
    <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
      <el-form-item label="用户名称" prop="username">
        <el-input v-model="formInline.username" placeholder="请输入用户名称" clearable />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="formInline.phone" placeholder="请输入用户名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="renderTable">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-header">
      <el-button type="primary" plain @click="addRow" v-hasPermi="['system:role:add']"
        ><el-icon><Plus /></el-icon>添加用户</el-button
      >
      <el-button
        type="danger"
        plain
        :disabled="multiple"
        @click="cancelAuthUserAll"
        v-hasPermi="['system:role:remove']"
        ><el-icon><CircleClose /></el-icon>批量取消授权</el-button
      >
      <el-button type="warning" plain @click="handleClose"
        ><el-icon><Close /></el-icon>关闭</el-button
      >
      <span style="float: right">
        <el-button circle @click="showSearch = !showSearch"
          ><el-icon><Search /></el-icon
        ></el-button>
        <el-button circle @click="renderTable"
          ><el-icon><Refresh /></el-icon
        ></el-button>
      </span>
    </div>
    <el-table
      v-loading="loading"
      :header-cell-style="{ background: '#f5f7fa' }"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      border
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column
        v-for="item in tableColumns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
      />
      <el-table-column fixed="right" label="操作">
        <template #default="{ row }">
          <el-link type="primary" @click="cancelAuthUser(row)" v-hasPermi="['system:role:remove']"
            ><el-icon><CircleClose /></el-icon>取消授权</el-link
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="float: right; margin-top: 10px"
      :current-page="pageNum"
      :page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 添加用户 -->
    <SelectUser ref="selectUserRef" @render-table="renderTable" />
  </div>
</template>

<script lang="ts" setup>
import { allocatedUserList, authUserCancelAll, authUserCancel } from '@/api/modules/system/role'
import { Role } from '@/api/interface/system'
import SelectUser from './selectUser.vue'
import { useTabsStore } from '@/stores/modules/tabs'
import { ref, reactive, onBeforeMount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const loading = ref(false)
import { useRoute, useRouter } from 'vue-router'
const tabStore = useTabsStore()
const route = useRoute()
const router = useRouter()
// 是否显示查询form
const showSearch = ref(true)
// 查询参数
const formInline = reactive<Role.roleAuth>({
  roleId: '',
  username: '',
  phone: ''
})
// 选中的用户
let userIds = ref([])
// 是否禁用
const multiple = ref(true)

// 编辑参数 未处理成响应式
interface formDataInterface {
  id?: number
  userId?: string
  phone: string
  username: string
}
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)
// 表格列
const tableColumns = [
  { prop: 'username', label: '用户名称' },
  { prop: 'nickName', label: '用户昵称' },
  { prop: 'email', label: '邮箱' },
  { prop: 'phone', label: '手机' },
  { prop: 'delFlag', label: '状态' },
  { prop: 'addTime', label: '创建时间' }
]
const cancelAuthUserAll = () => {
  const userIdList = userIds.value.join(',')
  ElMessageBox.confirm('是否取消选中用户授权数据项？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await authUserCancelAll({ roleId: formInline.roleId, userIds: userIdList })
      ElMessage.success('取消授权成功')
      renderTable()
    })
    .catch(() => {})
}
// 表格数据
let tableData = []
// 多选框选中数据
const handleSelectionChange = (selection) => {
  userIds.value = selection.map((item) => item.userId)
  multiple.value = !selection.length
}

// 生命周期钩子 类似vue2中 created
onBeforeMount(async () => {
  if (route.query.roleId) {
    formInline.roleId = route.query.roleId
    renderTable()
  }
})
const selectUserRef = ref()
// 方法
const addRow = () => {
  selectUserRef.value.roleId = route.query.roleId
  selectUserRef.value.dialogFormVisible = true
  selectUserRef.value.handleQuery()
}
// 重置查询
const resetQuery = () => {}

// 取消授权
const cancelAuthUser = (row: formDataInterface) => {
  ElMessageBox.confirm('确认要取消该用户"' + row.username + '"角色吗？', '警告', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await authUserCancel({ userId: row.userId, roleId: formInline.roleId })
      ElMessage.success('取消授权成功')
      renderTable()
    })
    .catch(() => {})
}
// 返回按钮
const handleClose = () => {
  tabStore.removeTabs(route.fullPath)
  router.push('/system/role')
}

// 刷新tabel
const renderTable = (type = 0) => {
  if (type === 0) {
    pageNum.value = 1
  }
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  let _lastData = {
    ...formInline,
    pageSize: pageSize.value,
    pageNum: pageNum.value
  }
  loading.value = true
  try {
    let { data } = await allocatedUserList(_lastData)
    tableData = data.list
    total.value = data.total
    loading.value = false
  } catch (e) {
    loading.value = false
  }
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
</script>