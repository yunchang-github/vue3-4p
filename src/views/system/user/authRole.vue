<template>
  <div class="app-container">
    <h4 class="form-header h4">基本信息</h4>
    <el-form ref="formLine" :model="form" label-width="80px">
      <el-row>
        <el-col :span="8" :offset="2">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="form.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8" :offset="2">
          <el-form-item label="登录账号" prop="username">
            <el-input v-model="form.username" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <h4 class="form-header h4">角色信息</h4>
    <el-table
      v-loading="loading"
      :row-key="getRowKey"
      @row-click="clickRow"
      ref="multipleTableRef"
      :header-cell-style="{ background: '#f5f7fa' }"
      @selection-change="handleSelectionChange"
      :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
    >
      <el-table-column label="序号" type="index" align="center" width="60">
        <template #default="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column type="selection" :reserve-selection="true" width="55"></el-table-column>
      <el-table-column label="角色编号" align="center" prop="roleId" />
      <el-table-column label="角色名称" align="center" prop="roleName" />
      <el-table-column label="权限字符" align="center" prop="roleKey" />
      <el-table-column label="创建时间" align="center" prop="addTime" width="180"></el-table-column>
    </el-table>
    <el-pagination
      style="float: right; margin-top: 10px"
      :current-page="pageNum"
      :page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      small
      v-show="total > 0"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <div style="text-align: center; margin-top: 30px">
      <el-button type="primary" @click="submitForm()">提交</el-button>
      <el-button @click="close()">返回</el-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="authRole">
import { getAuthRole, updateAuthRole } from '@/api/modules/system/user'
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'
import { useTabsStore } from "@/stores/modules/tabs";
import { useRoute,useRouter } from 'vue-router'
import { ElTable } from 'element-plus'
import { User } from '@/api/interface/system'
import { ElMessage } from 'element-plus'
// 查询参数
let form = reactive<User.authRoleList>({
  nickName: '',
  username: '',
  userId: ''
})
const tabStore = useTabsStore();
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
const loading = ref(false)
// 选中的角色编号
let roleIds = ref<number[]>([])
// 角色信息
let roles = ref<string[]>([])
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
// 保存选中的数据编号
const getRowKey = (row) => {
  return row.roleId
}
const route = useRoute()
const router = useRouter()
const userId = computed(() => route.query.userId)
onMounted(() => {
  getTableData()
})
/** 单击选中行数据 */
const clickRow = (row) => {
  multipleTableRef.value!.toggleRowSelection(row,undefined)
}
// 多选框选中数据
const handleSelectionChange = (selection) => {
  roleIds.value = selection.map((item) => item.roleId)
}
const getTableData = () => {
  if (userId.value) {
    loading.value = true
    getAuthRole(userId.value).then((response) => {
      let { data } = response
      form.nickName = data.user.nickName
      form.username = data.user.username
      form.userId = data.user.userId
      roles.value = data.roles
      total.value = roles.value.length
      nextTick(() => {
        roles.value.forEach((row) => {
          if (row.flag) {
            multipleTableRef.value!.toggleRowSelection(row, undefined)
          }
        })
      })
      loading.value = false
    })
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
// 提交
const submitForm = () => {
  const userId = form.userId
  const roleIdList = roleIds.value.join(',')
  updateAuthRole({ userId, roleIds:roleIdList, companyId: companyId.value }).then(() => {
    ElMessage.success("授权成功")
    close();
  })
}
// 关闭弹窗
const close = () => {
  tabStore.removeTabs(route.fullPath);
  router.push("/system/user");
}
</script>