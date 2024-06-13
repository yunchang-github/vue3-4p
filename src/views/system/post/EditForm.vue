<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="handleType == 'add' ? '添加岗位' : '编辑岗位'"
    width="680px"
    :before-close="closeDialog"
  >
    <el-form :model="form" ref="ruleFormRef" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="岗位名称" prop="postName">
            <el-input v-model="form.postName" placeholder="请输入岗位名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位编码" prop="postCode">
            <el-input v-model="form.postCode" placeholder="请输入岗位编码" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="岗位顺序" prop="orderTag">
            <el-input
              v-model="form.orderTag"
              v-number-input="{ min: 0 }"
              placeholder="请输入岗位顺序"
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部门状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio v-for="dict in showStatus" :key="dict.value" :label="dict.value">{{
                dict.label
              }}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks">
            <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
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
import { addFun, editFun } from '@/api/modules/system/post'
import { Post } from '@/api/interface/system'
import { reactive, ref, watch, computed } from 'vue'
import { showStatus } from '@/utils/serviceDict'
import type { FormInstance, FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
import { ElMessage } from 'element-plus'

interface addOrEditProps {
  handleType: string
  formData: Post.RuleForm
}
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {
  handleType: 'add'
})
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
const rules = reactive<FormRules<Post.RuleForm>>({
  postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
  postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
  orderTag: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }]
})
const dialogFormVisible = ref(false)
// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<Post.RuleForm>({
  postId: '',
  postCode: '',
  postName: '',
  orderTag: '',
  status: '0',
  remarks: ''
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
// 处理公司Id
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  resetFormData()
  dialogFormVisible.value = false
}
// 重置表单数据
const resetFormData = () => {
  form.postId = ''
  form.postCode = ''
  form.orderTag = ''
  form.postName = ''
  form.status = '0'
  form.remarks = ''
}

// 提交表单
const saveDialog = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const isValid = await formEl.validate()
  if (isValid) {
    let res: any // 不太知道返回的类型就使用any
    let _data = {
      ...form,
      companyId: companyId.value
    }
    if (props.handleType == 'add') {
      res = await addFun(_data)
      console.log('新增提交后的数据', res)
    } else {
      res = await editFun(_data)
    }
    ElMessage.success(res.msg)
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
