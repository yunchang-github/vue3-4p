<template>
  <div class="main-box">
    <TreeFilter
      label="label"
      title=""
      :request-api="treeselect"
      :default-value="initParam.deptId"
      @change="changeTreeFilter"
    />
    <div class="table-box">
      <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
        <el-form-item label="">
          <el-input
            v-model="formInline.username"
            placeholder="用户名称"
            clearable
            style="width: 192px"
          />
        </el-form-item>
        <el-form-item label="">
          <el-input
            v-model="formInline.phone"
            placeholder="手机号码"
            clearable
            style="width: 192px"
          />
        </el-form-item>
        <el-form-item label="">
          <el-select
            v-model="formInline.status"
            placeholder="用户状态"
            clearable
            style="width: 192px"
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
        <el-button type="primary" plain @click="addRow" v-hasPermi="['system:user:add']"
          ><Plus style="width: 1em; height: 1em; margin-right: 8px" />新增</el-button
        >
        <!-- <el-button :icon="EditPen" type="success" plain v-hasPermi="['system:user:edit']">修改</el-button> -->
        <el-button
          type="danger"
          :disabled="multipleSelection.length == 0"
          plain
          @click="batchDelete"
          v-hasPermi="['system:user:remove']"
          ><Delete style="width: 1em; height: 1em; margin-right: 8px" />删除</el-button
        >
        <el-button type="info" plain @click="batchAdd" v-hasPermi="['system:user:import']"
          ><Upload style="width: 1em; height: 1em; margin-right: 8px" />导入</el-button
        >
        <el-button type="warning" @click="handleExport" plain v-hasPermi="['system:user:export']"
          ><Download style="width: 1em; height: 1em; margin-right: 8px" />导出</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        v-if="refreshTable"
        ref="multipleTableRef"
        row-key="menuId"
        :header-cell-style="{ background: '#f5f7fa' }"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column
          v-for="item in tableColumns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :min-width="item.width || 80"
        >
          <template #default="{ row }">
            <template v-if="item.prop == 'status'">
              <el-switch
                v-model="row.status"
                active-value="0"
                inactive-value="1"
                v-hasPermi="['system:user:edit']"
                @change="handleStatusChange(row)"
              />
            </template>
            <template v-else>
              {{ row[item.prop] }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button
              type="primary"
              text
              @click="handleEdit(row)"
              v-hasPermi="['system:user:edit']"
              ><el-icon><Tools /></el-icon>修改</el-button
            >
            <el-button
              type="primary"
              text
              @click="handleDelete(row)"
              v-hasPermi="['system:user:remove']"
              :disabled="row.userId == companyId"
              ><el-icon><Delete /></el-icon>删除</el-button
            >
            <el-dropdown
              @command="(command) => handleCommand(command, row)"
              v-hasPermi="['system:user:resetPwd', 'system:user:edit']"
            >
              <span class="el-dropdown-link">
                <el-button type="primary" text
                  ><el-icon><DArrowRight /></el-icon>更多</el-button
                >
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="handleResetPwd"
                    ><Setting
                      style="width: 1em; height: 1em; margin-right: 8px"
                    />重置密码</el-dropdown-item
                  >
                  <el-dropdown-item command="handleAuthRole" :disabled="row.userId == companyId"
                    ><CircleCheck
                      style="width: 1em; height: 1em; margin-right: 8px"
                    />分配角色</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
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
    <!-- 新增编辑弹窗 -->
    <AddOrEdit
      @render-table="renderTable"
      ref="AddOrEditRef"
      :handle-type="handleType"
      :form-data="mainRow"
      :tree-data="treeData"
      :post-options="postOptions"
      :role-options="roleOptions"
    />
    <!-- 导入组件 -->
    <ImportExcel ref="importRef" />
    <!-- 导出组件 -->
    <FileExport ref="fileExportRef" @saveExportDialog="saveExportDialog" />
  </div>
</template>

<script lang="ts" setup name="menu">
import ImportExcel from '@/components/ImportExcel/index.vue'
import FileExport from '@/components/FileExport/index.vue'
import TreeFilter from '@/components/TreeFilter/index.vue'
import AddOrEdit from './EditForm.vue'

import { treeselect } from '@/api/modules/system/dept'
import { User } from '@/api/interface/system'
import {
  getUserList,
  getUser,
  delUser,
  exportUserInfo,
  BatchAddUser,
  changeUserStatus,
  resetUserPwd
} from '@/api/modules/system/user'
import { encrypt } from '@/utils/jsencrypt'
import { ref, Ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { ElTable, ElMessageBox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
interface TreeData {
  id: number
  label: string
  children?: TreeData[]
}

const initParam = reactive({ deptId: 0 })
const statusOptions = [
  { label: '正常', value: 0 },
  { label: '停用', value: 1 }
]
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 时间范围
const lastDate=ref([])
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]
const loading = ref(false)
// 刷新
const refreshTable = ref(true)
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)

// 是否显示查询form
const showSearch = ref(true)
// 查询参数
const formInline = reactive({
  username: undefined,
  phone: undefined,
  status: undefined
})
let mainRow: Ref<User.ResUserList | {}> = ref({})
// 岗位选项
let postOptions = []
// 角色选项
let roleOptions = []

let treeData: TreeData[] = []
// 表格列`
const tableColumns = [
  { key: 1, label: `用户名称`, prop: 'username', visible: true,isChecked:false },
  { key: 2, label: `用户昵称`, prop: 'nickName', visible: true },
  { key: 3, label: `部门`, prop: 'deptName', visible: true },
  { key: 4, label: `手机号码`, prop: 'phone', visible: true },
  { key: 5, label: `状态`, prop: 'status', visible: true },
  { key: 6, label: `创建时间`, prop: 'addTime', visible: true }
]
interface Column {
  value: string;
  label: string;
  isChecked: boolean;
}
let column:Column[]=[]
onMounted(() => {
  column = tableColumns.map((opt) => {
    return {
      label: opt.label,
      value: opt.prop,
      isChecked: false
    } ;
  })
  renderTable()
  getPostOptions('')
})
// 勾选相关
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<User.RuleForm[]>([])
const handleSelectionChange = (val: User.RuleForm[]) => {
  multipleSelection.value = val
}
const router=useRouter()
// 上传下载
const importRef = ref()
const batchAdd = () => {
  let params = {
    title: '数据',
    tempApi: exportUserInfo, // 导出
    importApi: BatchAddUser // 导入
  }
  importRef.value.acceptParams(params)
}
// 下载内容
const fileExportRef = ref()
const handleExport = () => {
  fileExportRef.value.acceptParams({pageName:'user',columns:column, isWMS: false })
}
//导出数据
const saveExportDialog = (columnList) => {
  let _data = {
    ...formInline,
    // columnList,
    sortColumn: null,
    sortType: null,
  };
  let date = Array.isArray(lastDate.value) ? lastDate.value : []
    if (date.length > 0) {
      _data['params'] = {
        beginTime: lastDate.value[0],
        endTime: lastDate.value[1]
      }
    }
  exportUserInfo(
    `user_${new Date().getTime()}.xlsx`,
    _data,
    {
      columnList,
      idList: multipleSelection.value.map((opt) => opt.userId)
    }
  );
}
// 用户状态修改
const handleStatusChange = (row) => {
  let text = row.status === '0' ? '启用' : '停用'
  ElMessageBox.confirm('确认要"' + text + '""' + row.username + '"用户吗？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await changeUserStatus(row.userId, row.status)
      ElMessage.success('操作成功!')
    })
    .catch(() => {
      row.status = row.status === '0' ? '1' : '0'
    })
}
// 更多操作触发
const handleCommand = (command: string, row: User.RuleForm) => {
  switch (command) {
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleAuthRole':
      handleAuthRole(row)
      break
    default:
      break
  }
}
// 重置密码
const handleResetPwd = (row: User.RuleForm) => {
  ElMessageBox.prompt(`请输入"${row.username}"的新密码`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: '用户密码长度必须介于 5 和 20 之间'
  })
    .then(({ value }) => {
      // 确认提交
      resetUserPwd(row.userId, encrypt(value)).then(() => {
        ElMessage.success('操作成功! 新密码是' + value)
      })
    })
    .catch(() => {})
}
// 分配角色
const handleAuthRole = (row: User.RuleForm) => {
  router.push({path:"/system/user-auth/role",query:{userId:row.userId}});
}

// 处理下拉数据
const getPostOptions = (userId: any) => {
  treeselect().then((res) => {
    treeData = res.data
  })
  getUser(userId).then((response) => {
    let { data: res } = response
    postOptions = res.posts
    roleOptions = res.roles
  })
}
const handleType = ref('add')
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref()
// 新增
const addRow = () => {
  handleType.value = 'add'
  AddOrEditRef.value.dialogFormVisible = true
}
// 编辑
const handleEdit = (row: User.RuleForm) => {
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
// 批量删除
const batchDelete = () => {
  handleDelete(null)
}
// 删除
const handleDelete = (row: User.RuleForm | null) => {
  let userIds = ''
  let str = ''
  if (row && row.userId) {
    str = row.username
    userIds = row.userId
  } else {
    str = multipleSelection.value.map((opt) => opt.username).join()
    userIds = multipleSelection.value.map((opt) => opt.userId).join()
  }
  ElMessageBox.confirm('是否确认删除用户名称为"' + str + '"的数据项？', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  })
    .then(async () => {
      await delUser(userIds)
      ElMessage.success('操作成功!')
      renderTable()
      // getList();
    })
    .catch(() => {})
}
// 树形筛选切换
const changeTreeFilter = (val: number) => {
  pageNum.value = 1
  initParam.deptId = val
  renderTable()
}
// 表格数据
let tableData = []
// 重置查询
const resetQuery = () => {
  formInline.username = undefined
  formInline.phone = undefined
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
const renderTable = () => {
  pageNum.value = 1
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let _data={
       ...formInline,
      deptId: initParam.deptId,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    }
    let date = Array.isArray(lastDate.value) ? lastDate.value : []
    if (date.length > 0) {
      _data['params'] = {
        beginTime: lastDate.value[0],
        endTime: lastDate.value[1]
      }
    }
    let { data } = await getUserList(_data)
    tableData = data.list
    total.value = data.total
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
</script>