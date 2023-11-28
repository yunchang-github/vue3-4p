<template>
  <el-dialog
    v-model="dialogFormVisible"
    title="选择用户"
    width="720px"
    :before-close="closeDialog"
    append-to-body
  >
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="用户名称" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名称"
          clearable
          style="width:160px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号码"
          clearable
          style="width:160px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery" icon="Refresh">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row>
      <el-table
        @row-click="clickRow"
        ref="multipleTableRef"
        :data="userList"
        @selection-change="handleSelectionChange"
        height="260px"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column label="用户名称" prop="username" :show-overflow-tooltip="true" />
        <el-table-column label="用户昵称" prop="nickName" :show-overflow-tooltip="true" />
        <el-table-column label="邮箱" prop="email" :show-overflow-tooltip="true" />
        <el-table-column label="手机" prop="phone" :show-overflow-tooltip="true" />
        <el-table-column label="状态" align="center" prop="delFlag"></el-table-column>
        <el-table-column label="创建时间" align="center" prop="addTime" width="180">
        </el-table-column>
      </el-table>
    </el-row>
    <div style="overflow: hidden">
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
    </div>
    <template #footer>
      <div style="text-align: right">
        <el-button type="primary" @click="handleSelectUser">确 定</el-button>
        <el-button @click="closeDialog">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup name="selectUser">
import { unallocatedUserList,authUserSelectAll } from '@/api/modules/system/role'
import { ElMessage } from 'element-plus'
import { ref, reactive,computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { ElTable } from 'element-plus'
const dialogFormVisible = ref(false)
const queryParams = reactive({
  username: '',
  phone: ''
})
interface tableRow {
  userId?:string;
  username: string
  nickName: string
  addTime: string
}
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
const roleId = ref('')
// 未授权用户数据
let userList = ref([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<tableRow[]>([])
// 查询
const handleQuery = () => {
  pageNum.value = 1
  getTableData()
}
const getTableData = () => {
  console.log()
  unallocatedUserList({
    ...queryParams,
    pageSize: pageSize.value,
    pageNum: pageNum.value,
    roleId: roleId.value
  }).then((res) => {
    userList.value = res.data.list
    total.value = res.data.total
  })
}
// 重置
const resetQuery = () => {
  queryParams.username = ''
  queryParams.phone = ''
}
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)
type FilterEmits = {
  // (e: "update:dialogShow", value: boolean): void;
  (e: "renderTable"): void; // value 参数 没有返回值
};
const emit = defineEmits<FilterEmits>();
// 当行点击
const clickRow = (row) => {
   multipleTableRef.value!.toggleRowSelection(row, undefined)
}
// 多选
const handleSelectionChange = (val: tableRow[]) => {
   multipleSelection.value = val
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
// 保存弹窗
const handleSelectUser = () => {
  const userIds = multipleSelection.value.map(opt=>opt.userId).join(",");
  if (userIds === "") {
    ElMessage.warning("请选择要分配的用户")
    return;
  }
  authUserSelectAll({ roleId: roleId.value, userIds,companyId:companyId.value }).then(res => {
    ElMessage.success(res.msg)
    dialogFormVisible.value = false
    emit("renderTable");
  });
}
// 取消
const closeDialog = () => {
  dialogFormVisible.value = false
  resetQuery()
}
defineExpose({ dialogFormVisible, handleQuery, roleId })
</script>
