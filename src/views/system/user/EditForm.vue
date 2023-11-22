<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="handleType == 'add' ? '添加用户' : '编辑用户'"
    width="680px"
    :before-close="closeDialog"
  >
    <el-form :model="form" ref="ruleFormRef" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="用户昵称" prop="nickName">
            <el-input v-model="form.nickName" placeholder="请输入用户昵称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="归属部门" prop="deptId">
            <el-tree-select
              node-key="id"
              v-model="form.deptId"
              :check-strictly="true"
              :data="treeData"
              :props="treeProps"
              :filter-node-method="filterNode"
              style="width: 100%"
              filterable
            >
              <template #default="{ data: { label, children } }">
                {{ label }}
                <span style="color: gray" v-if="children && children.length"
                  >({{ children.length }})</span
                >
              </template>
            </el-tree-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.userId === undefined">
          <el-form-item label="用户名称" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名称"
              maxlength="30"
              autocomplete="off"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.userId === undefined">
          <el-form-item label="用户密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入用户密码"
              type="password"
              maxlength="20"
              show-password
              autocomplete="off"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户性别" prop="sex">
            <el-select v-model="form.sex" placeholder="请选择性别" clearable>
              <el-option
                v-for="dict in sexOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示状态" prop="status">
            <el-radio-group
              v-model="form.status"
              :disabled="form.userId == companyId && handleType == 'edit'"
            >
              <el-radio v-for="dict in showStatus" :key="dict.value" :label="dict.value">{{
                dict.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位">
            <el-select v-model="form.postIds" multiple placeholder="请选择岗位">
              <el-option
                v-for="item in postOptions"
                :key="item.postId"
                :label="item.postName"
                :value="item.postId"
                :disabled="item.status === '1'"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色">
            <el-select
              :disabled="form.userId == companyId && handleType == 'edit'"
              v-model="form.roleIds"
              multiple
              placeholder="请选择角色"
            >
              <el-option
                v-for="item in roleOptions"
                :key="item.roleId"
                :label="item.roleName"
                :value="item.roleId"
                :disabled="item.status === '1'"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">Cancel</el-button>
        <el-button type="primary" @click="saveDialog(ruleFormRef)"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="editFormDialog">
import { addFun, editFun } from '@/api/modules/system/user'
import { User } from '@/api/interface/system'
import { reactive, ref, watch, computed } from 'vue'
import { showStatus } from '@/utils/serviceDict'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
// 传入的所有属性简单限制
// 表单接口限制类型
interface Tree {
  [key: string]: any
}

interface addOrEditProps {
  handleType: string
  formData: User.RuleForm
  treeData: Tree[]
  postOptions: []
  roleOptions: []
}

const sexOptions = [
  { label: '男', value: '1' },
  { label: '女', value: '2' },
  { label: '未知', value: '3' }
]
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {
  handleType: 'add'
})
const treeProps = {
  children: 'children',
  label: 'label',
  value: 'id'
}

// emit 可以单个也可以多个
// 简单的单个
// const emit = defineEmits(["update:iconValue"]);
// emit("update:iconValue", false)
// 多个
type FilterEmits = {
  // (e: "update:dialogShow", value: boolean): void;
  (e: 'renderTable', value: number): void // value 参数 没有返回值
}
const emit = defineEmits<FilterEmits>()

// 表单规则
const rules = reactive<FormRules<User.RuleForm>>({
  username: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    {
      min: 2,
      max: 20,
      message: '用户名称长度必须介于 2 和 20 之间',
      trigger: 'blur'
    }
  ],
  nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度必须介于 5 和 20 之间',
      trigger: 'blur'
    }
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  phone: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
})
const dialogFormVisible = ref(false)

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<User.RuleForm>({
  userId: undefined,
  deptId: undefined,
  username: '',
  nickName: '',
  password: '',
  phone: '',
  email: '',
  sex: '',
  status: '0',
  postIds: [],
  roleIds: []
})
//
watch(
  () => props.formData,
  () => {
    if (props.handleType == 'edit') {
      Object.assign(form, props.formData)
    }
  }
)
const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.label.includes(value)
}

// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  resetFormData()
  dialogFormVisible.value = false
}
// 重置表单数据
const resetFormData = () => {
  form.userId = undefined
  form.deptId = undefined
  form.username = ''
  form.nickName = ''
  form.password = ''
  form.phone = ''
  form.email = ''
  form.sex = ''
  form.status = '0'
  form.postIds = []
  form.roleIds = []
}

// 提交表单
const saveDialog = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const isValid = await formEl.validate()
  if (isValid) {
    let res: any // 不太知道返回的类型就使用any
    if (props.handleType == 'add') {
      res = await addFun(form)
    } else {
      res = await editFun(form)
    }
    ElMessage.success(res)
    // 关闭弹窗刷新表格
    closeDialog()
    emit('renderTable', props.handleType == 'add' ? 0 : 1)
  }
}
// setup中的内容默认使用ref获取不到  主动使用宏暴露出去
defineExpose({ dialogFormVisible })
</script>
<style scoped>
.el-overlay-dialog .el-form-item__label .el-icon {
  top: 8px;
  right: 3px;
}
</style>
