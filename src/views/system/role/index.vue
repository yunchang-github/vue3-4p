<template>
  <div class="card table-box">
    <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
      <el-form-item label="">
        <el-input
          v-model="formInline.roleName"
          placeholder="角色名称"
          clearable
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="">
        <el-input
          v-model.trim="formInline.roleKey"
          placeholder="权限字符"
          clearable
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="">
        <el-select
          v-model="formInline.status"
          placeholder="用户状态"
          clearable
          style="width: 240px"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-date-picker
          v-model="dateRange"
          clearable
          type="daterange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 260px"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :shortcuts="shortcuts"
        />
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
      <el-button type="primary" plain @click="addRow" v-hasPermi="['system:role:add']"
        ><Plus style="width: 1em; height: 1em; margin-right: 8px" />
        新增
      </el-button>
      <el-button
        :disabled="multipleSelection.length !== 1"
        type="success"
        plain
        v-hasPermi="['system:role:edit']"
        ><EditPen style="width: 1em; height: 1em; margin-right: 8px" />修改</el-button
      >
      <el-button
        type="danger"
        :disabled="multipleSelection.length == 0"
        plain
        @click="batchDelete"
        v-hasPermi="['system:role:remove']"
        ><Delete style="width: 1em; height: 1em; margin-right: 8px" />删除</el-button
      >
      <el-button type="warning" plain v-hasPermi="['system:role:export']"
        ><Download style="width: 1em; height: 1em; margin-right: 8px" />导出</el-button
      >
    </div>
    <el-table
      v-loading="loading"
      v-if="refreshTable"
      ref="multipleTableRef"
      row-key="roleId"
      :header-cell-style="{ background: '#f5f7fa' }"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" :selectable="selectEnable" width="55" />
      <el-table-column
        v-for="item in tableColumns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width || 80"
      >
        <template #default="{ row }">
          <template v-if="item.prop == 'status'">
            <span v-hasPermi="['system:role:edit']">
              <el-switch
                v-model="row.status"
                :active-value="'0'"
                :inactive-value="'1'"
                v-if="row.roleKey !== 'admin'"
                @change="handleStatusChange(row)"
              />
            </span>
          </template>
          <template v-else>
            {{ row[item.prop] }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <span v-if="row.roleKey !== 'admin'">
            <el-button
              type="primary"
              text
              @click="handleEdit(row)"
              v-hasPermi="['system:role:edit']"
              ><el-icon><Tools /></el-icon>修改</el-button
            >
            <el-button
              type="primary"
              text
              @click="handleDelete(row)"
              v-hasPermi="['system:role:remove']"
              :disabled="row.userId == companyId"
              ><el-icon><Delete /></el-icon>删除</el-button
            >
            <el-dropdown
              @command="(command) => handleCommand(command, row)"
              v-hasPermi="['system:role:edit']"
            >
              <span class="el-dropdown-link">
                <el-button type="primary" text
                  ><el-icon><DArrowRight /></el-icon>更多</el-button
                >
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="handleDataScope" :disabled="!isShowBtn"
                    ><el-icon><Setting /></el-icon>数据权限</el-dropdown-item
                  >
                  <el-dropdown-item command="handleAuthRole"
                    ><el-icon><CircleCheck /></el-icon>分配用户</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </span>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="float: right; margin-top: 10px"
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 新增编辑弹窗 -->
    <AddOrEdit
      @render-table="renderTable"
      ref="AddOrEditRef"
      :handle-type="handleType"
      :form-data="mainRow"
      :tree-data="treeData"
    />
    <!-- 数据权限弹窗 -->
    <DataScope
      @render-table="renderTable"
      ref="DataScopeRef"
      :form-data="tableRow"
      :tree-data="deptTreeData"
    />
  </div>
</template>

<script lang="ts" setup name="role">
import AddOrEdit from './addAndEdit.vue'
import DataScope from './dataScope.vue'
import { Role } from '@/api/interface/system'
import { getRoleList, changeRoleStatus, delRole } from '@/api/modules/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/modules/system/menu'
import {
  treeselect as deptTreeselect,
  roleDeptTreeselect,
} from "@/api/modules/system/dept";
import { ref,Ref,reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { ElTable, ElMessageBox, ElMessage } from 'element-plus'
const statusOptions = [
  { label: '正常', value: 0 },
  { label: '停用', value: 1 }
]
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
const roles = authStore.roles

const loading = ref(false)
// 是否可以操作数据权限
const isShowBtn = ref(false)
// 刷新
const refreshTable = ref(true)
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)
const dateRange = ref('')

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]
let mainRow:Ref<Role.ResRoleList | null> = ref(null)
let tableRow:Ref<Role.ResRoleList | null> = ref(null)

const selectEnable = (row: Role.ResRoleList) => {
  if (row.roleKey !== 'admin') {
    return true
  } else {
    return false // 禁用
  }
}

let treeData: Role.treeData[] = []
let deptTreeData: Role.treeData[] = []
// 是否显示查询form
const showSearch = ref(true)
// 查询参数
const formInline = reactive({
  roleName: undefined,
  roleKey: undefined,
  status: undefined
})
// 表格列
const tableColumns = [
  { key: 1, label: `角色名称`, prop: 'roleName', visible: true },
  { key: 2, label: `权限字符`, prop: 'roleKey', visible: true },
  { key: 3, label: `显示顺序`, prop: 'orderTag', visible: true },
  { key: 4, label: `状态`, prop: 'status', visible: true },
  { key: 5, label: `创建时间`, prop: 'addTime', visible: true }
]
onMounted(() => {
  isShowBtn.value = roles?.indexOf('admin') !== -1
  getMenuTreeselect()
  getDeptTreeselect()
  renderTable()
})
/** 查询菜单树结构 */
const getMenuTreeselect = () => {
  menuTreeselect().then((response) => {
    treeData = response.data
  })
}
const getDeptTreeselect = () => {
  deptTreeselect().then((response) => {
    deptTreeData = response.data
  })
}
// 勾选相关
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<Role.ResRoleList[]>([])
const handleSelectionChange = (val: Role.ResRoleList[]) => {
  multipleSelection.value = val
}
// 上传下载
// const importRef = ref()
// 用户状态修改
const handleStatusChange = (row: Role.ResRoleList) => {
  let text = row.status === '0' ? '启用' : '停用'
  ElMessageBox.confirm('确认要"' + text + '""' + row.roleName + '"角色吗？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await changeRoleStatus(row.roleId, row.status)
      ElMessage.success('操作成功!')
    })
    .catch(() => {
      row.status = row.status === '0' ? '1' : '0'
    })
}
// 更多操作触发
const handleCommand = (command: string, row: Role.ResRoleList) => {
  switch (command) {
    case 'handleAuthRole':
      handleAuthRole(row)
      break
    case 'handleDataScope':
      handleDataScope(row)
      break
    default:
      break
  }
}
// 分配角色
const handleAuthRole = (row: Role.ResRoleList) => {
  console.log(row)
}
const handleType = ref('add')
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref()
const DataScopeRef = ref()
// 新增
const addRow = () => {
  handleType.value = 'add'
  AddOrEditRef.value.dialogFormVisible = true
}
// 编辑
const handleEdit = async (row: Role.ResRoleList) => {
  handleType.value = 'edit'
  let res = await roleMenuTreeselect(row.roleId)
  mainRow.value = {
    roleId: row.roleId,
    roleName: row.roleName,
    roleKey: row.roleKey,
    orderTag: row.orderTag,
    status: row.status,
    // deptIds: string[],
    menuCheckStrictly: row.menuCheckStrictly,
    deptCheckStrictly: row.deptCheckStrictly,
    remarks: row.remarks,
    menuIds: res.data.checkedKeys
  }
  AddOrEditRef.value.dialogFormVisible = true
}
const handleDataScope = async (row: Role.ResRoleList) => {
  let res = await roleDeptTreeselect(row.roleId)
  tableRow.value = {
    roleId: row.roleId,
    roleName: row.roleName,
    roleKey: row.roleKey,
    dataScope: (row.roleId !== 1 && row.dataScope == 1) ? '2': row.dataScope,
    orderTag: row.orderTag,
    status: row.status,
    menuCheckStrictly: row.menuCheckStrictly,
    deptCheckStrictly: row.deptCheckStrictly,
    remarks: row.remarks,
    deptIds: res.data.checkedKeys
  }
  DataScopeRef.value.dialogFormVisible = true
}
// 批量删除
const batchDelete = () => {
  handleDelete(null)
}
// 删除
const handleDelete = (row: Role.ResRoleList | null) => {
  let roleIds: string = ''
  let str = ''
  if (row && row.roleId) {
    str = row.roleName
    roleIds = row.roleId + ''
  } else {
    str = multipleSelection.value.map((opt) => opt.roleName).join()
    roleIds = multipleSelection.value.map((opt) => opt.roleId).join()
  }
  ElMessageBox.confirm('是否确认删除角色名称为"' + str + '"的数据项？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await delRole(roleIds)
      ElMessage.success('操作成功!')
      renderTable()
    })
    .catch(() => {})
}
// 表格数据
let tableData = []
// 重置查询
const resetQuery = () => {
  formInline.status = undefined
  formInline.roleName = undefined
  formInline.roleKey = undefined
  dateRange.value = ''
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
const renderTable = () => {
  pageNum.value = 1
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let search = {
      ...formInline,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    let date = Array.isArray(dateRange.value) ? dateRange.value : []
    if (date.length > 0) {
      search['params'] = {
        beginTime: dateRange.value[0],
        endTime: dateRange.value[1]
      }
    }
    let { data } = await getRoleList(search)
    tableData = data.list
    total.value = data.total
    loading.value = false
  } catch (e) {
    console.log(e)
    loading.value = false
  }
}
</script>