<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="handleType == 'add' ? '添加用户' : '编辑用户'"
    width="680px"
    :before-close="closeDialog"
  >
    <el-form :model="form" ref="ruleFormRef" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="24" v-if="form.parentId !== 0">
          <el-form-item label="上级部门" prop="parentId">
            <el-tree-select
              node-key="deptId"
              v-model="form.parentId"
              :data="treeData"
              :check-strictly="true"
              :props="treeProps"
              :filter-node-method="filterNode"
              style="width: 100%"
              filterable
            >
              <template #default="{ data: { deptName, children } }">
                {{ deptName }}
                <span style="color: gray" v-if="children && children.length"
                  >({{ children.length }})</span
                >
              </template>
            </el-tree-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model="form.deptName" placeholder="请输入部门名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="orderTag">
            <el-input v-model="form.orderTag" v-number-input="{ min: 0 }" placeholder="" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="form.leader" placeholder="请输入负责人" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系号码" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态" prop="status">
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
      </el-row>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="saveDialog(ruleFormRef)"> 确 认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="editFormDialog">
import { addFun, editFun } from '@/api/modules/system/dept'
import { Dept } from '@/api/interface/system'
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
  formData: Dept.RuleForm
  treeData: Tree[]
}
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {
  handleType: 'add'
})
const treeProps = {
  children: 'children',
  label: 'deptName',
  value: 'deptId'
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
const rules = reactive<FormRules<Dept.RuleForm>>({
  parentId: [{ required: true, message: '请选择', trigger: 'blur' }],
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  orderTag: [{ required: true, message: '请输入', trigger: 'blur' }]
})
const dialogFormVisible = ref(false)

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<Dept.RuleForm>({
  deptId: undefined,
  parentId: undefined,
  deptName: '',
  orderTag: '',
  leader: '',
  phone: '',
  email: '',
  status: '0'
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
  form.deptId= undefined,
  form.parentId= undefined,
  form.deptName= '',
  form.orderTag= '',
  form.leader= '',
  form.phone= '',
  form.email= '',
  form.status= '0'
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
