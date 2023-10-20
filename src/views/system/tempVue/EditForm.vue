<template>
  <el-dialog v-model="dialogFormVisible" :title="handleType == 'add' ? '新增' : '编辑'">
    <el-form :model="form" ref="ruleFormRef" :rules="rules" :inline="true">
      <el-form-item label="shopName" label-width="12rem" prop="shopName">
        <el-input v-model="form.shopName" autocomplete="off" clearable />
      </el-form-item>
      <el-form-item label="sku" label-width="12rem" prop="sku">
        <el-input v-model="form.sku" autocomplete="off" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">Cancel</el-button>
        <el-button type="primary" @click="saveDialog(ruleFormRef)"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup name="financeSkuRelationDialog">
import { addFun, editFun } from "@/api/modules/system/menu";

import { reactive, ref, watch, defineEmits } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
// 传入form数据限制类型
interface formDataInterface {
  id?: number;
  sku: string;
  shopName: string;
}
// 传入的所有属性简单限制
type addOrEditProps = {
  handleType: string;
  formData: formDataInterface;
};
// 传入的prop  使用 props.key
const props = defineProps<addOrEditProps>();

// emit 可以单个也可以多个
// 简单的单个
// const emit = defineEmits(["update:iconValue"]);
// emit("update:iconValue", false)
// 多个
type FilterEmits = {
  // (e: "update:dialogShow", value: boolean): void;
  (e: "renderTable", value: number): void; // value 参数 没有返回值
};
const emit = defineEmits<FilterEmits>();

// 表单接口限制类型
interface RuleForm {
  id?: number; // ? 可选
  sku: string;
  shopName: string;
}
// 表单规则
const rules = reactive<FormRules<RuleForm>>({
  sku: [{ required: true, message: "请输入", trigger: "blur" }],
  shopName: [
    {
      required: true,
      message: "请输入",
      trigger: "blur"
    }
  ]
});
const dialogFormVisible = ref(false);

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>();
let form = reactive<RuleForm>({
  sku: "",
  shopName: ""
});
//
watch(
  () => props.formData,
  () => {
    handleInitFormData();
  }
);
// 初始化表格数据
const handleInitFormData = () => {
  form.id = props.formData.id;
  form.sku = props.formData.sku;
  form.shopName = props.formData.shopName;
  !form.id && delete form.id;
};

// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  dialogFormVisible.value = false;
};

// 提交表单
const saveDialog = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  const isValid = await formEl.validate();
  if (isValid) {
    let res: any; // 不太知道返回的类型就使用any
    let lastData = {
      ...form,
      returnQty: 1,
      trackingNumber: 20230629001,
      processingRules: 1,
      orderId: 20230629001,
      binningCode: 101245
    };
    if (props.handleType == "add") {
      res = await addFun(lastData);
    } else {
      res = await editFun(lastData);
    }
    ElMessage.success(res);
    // 关闭弹窗刷新表格
    closeDialog();
    emit("renderTable", props.handleType == "add" ? 0 : 1);
  }
};
// setup中的内容默认使用ref获取不到  主动使用宏暴露出去
defineExpose({ dialogFormVisible });
</script>
