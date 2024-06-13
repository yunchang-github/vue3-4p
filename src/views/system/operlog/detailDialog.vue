<template>
  <el-dialog title="操作日志详细" v-model="dialogFormVisible" width="700px" append-to-body>
    <el-form ref="form" :model="form" label-width="100px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="操作模块：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
          <el-form-item label="登录信息：">{{ form.operName }} / {{ form.operIp }}</el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
          <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="请求参数：">{{ form.operParam }}</el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作状态：">
            <div v-if="form.status === 0">正常</div>
            <div v-else-if="form.status === 1">失败</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="操作时间：">{{ form.addTime }}</el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="异常信息：" v-if="form.status === 1">{{
            form.errorMsg
          }}</el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="closeDialog">关 闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="detailDialog">
import { Operlog } from '@/api/interface/system'
import { reactive, ref, watch } from 'vue'
import { operLogTypeStatus } from '@/utils/serviceDict'

interface addOrEditProps {
  formData: Operlog.RuleForm
}
const dialogFormVisible = ref(false)
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {})
let form = reactive<Operlog.RuleForm>({
  title: '',
  operName: '',
  businessType: '',
  status: ''
})
// 处理显示的数据
watch(
  () => props.formData,
  () => {
    Object.assign(form, props.formData)
  }
)
// 操作日志类型字典翻译
const typeFormat = (row: Operlog.RuleForm) => {
  operLogTypeStatus.forEach((opt) => {
    if (opt.value == row.businessType) {
      return opt.label
    }
  })
}
// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  // resetFormData()
  dialogFormVisible.value = false
}
// setup中的内容默认使用ref获取不到  主动使用宏暴露出去
defineExpose({ dialogFormVisible })
</script>