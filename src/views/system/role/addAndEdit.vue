<template>
  <el-dialog
    v-model="dialogFormVisible"
    :title="handleType == 'add' ? '添加角色' : '编辑角色'"
    width="680px"
    :before-close="closeDialog"
    append-to-body
  >
    <el-form :model="form" ref="ruleFormRef" :rules="rules" label-width="100px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" clearable />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <template #label>
          <el-tooltip
            content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)"
            placement="top"
          >
            <el-icon><QuestionFilled /></el-icon>
          </el-tooltip>
          权限字符
        </template>
        <el-input v-model="form.roleKey" placeholder="请输入权限字符" clearable />
      </el-form-item>
      <el-form-item label="角色顺序" prop="orderTag">
        <el-input-number v-model="form.orderTag" :min="0" controls-position="right" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio v-for="dict in commonStatus" :key="dict.value" :label="dict.value">{{
            dict.label
          }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="菜单权限">
        <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand">展开/折叠</el-checkbox>
        <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll"
          >全选/全不选</el-checkbox
        >
        <el-checkbox v-model="form.menuCheckStrictly">父子联动</el-checkbox>
        <el-tree
          class="tree-border"
          style="width: 100%"
          :data="treeData"
          show-checkbox
          :default-expand-all="defaultExpandAll"
          ref="menuRef"
          node-key="id"
          multiple
          :check-strictly="!form.menuCheckStrictly"
          :props="defaultProps"
        ></el-tree>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容"></el-input>
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
<script lang="ts" setup name="roleEdit">
import { addFun, editFun } from '@/api/modules/system/role'
import { useAuthStore } from '@/stores/modules/auth'
import { commonStatus } from '@/utils/serviceDict'
import { Role } from '@/api/interface/system'
import { reactive, ref, watch, computed, nextTick } from 'vue'
import type { FormInstance, FormRules, ElTree } from 'element-plus'
import { ElMessage } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
// 传入的所有属性简单限制
// 表单接口限制类型
interface Tree {
  [key: string]: any
}
interface addOrEditProps {
  handleType: string
  formData: Role.RuleForm
  treeData: Tree[]
}
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {
  handleType: 'add'
})

const defaultProps = {
  children: 'children',
  label: 'label'
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
const rules = reactive<FormRules<Role.RuleForm>>({
  roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
  orderTag: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
})
const dialogFormVisible = ref(false)
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const defaultExpandAll = ref(false)
let allNodeIds = reactive([])

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<Role.RuleForm>({
  roleName: '',
  roleKey: '',
  orderTag: 0,
  status: '0',
  menuIds: [],
  menuCheckStrictly: true, // 父子联动
  remarks: ''
})
//
watch(() => props.formData, () => {
  if (props.handleType == 'edit' && dialogFormVisible.value) {
    // 处理初始选中
    Object.assign(form, props.formData)
    if (form?.menuIds) {
      form.menuIds.forEach((opt) => {
        nextTick(() => {
          menuRef.value!.setChecked(opt, true, false)
        })
      })
    }
  }
})
watch(
  () => props.treeData,
  () => {
    for (const node of props.treeData) {
      getAllNodeIds(node, allNodeIds)
    }
  }
)
const getAllNodeIds = (node, ids) => {
  ids.push(node.id)
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      getAllNodeIds(child, ids)
    }
  }
}

const menuRef = ref<InstanceType<typeof ElTree>>()
// 处理展开/折叠
const handleCheckedTreeExpand = () => {
  if(menuExpand.value){
    Object.values(menuRef.value!.store.nodesMap).forEach((v) => v.expand())
  }else{
    Object.values(menuRef.value!.store.nodesMap).forEach((v) => v.collapse())
  }
}
// 全选/全不选
const handleCheckedTreeNodeAll = () => {
  if (!menuNodeAll.value) {
    menuRef.value!.setCheckedNodes([], false)
  } else {
    menuRef.value!.setCheckedNodes(props.treeData as Node[], false)
  }
}
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  resetFormData()
  dialogFormVisible.value = false
}
const resetFormData=()=>{
  form.roleName= ''
  form.roleKey= ''
  form.orderTag= 0
  form.status= '0'
  form.menuIds= []
  form.menuCheckStrictly= true // 父子联动
  form.remarks= ''
}
// 提交表单
const saveDialog = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const isValid = await formEl.validate()
  if (isValid) {
    let res: any // 不太知道返回的类型就使用any
    let values = menuRef.value!.getCheckedNodes(false, false)
    if (props.handleType == 'add') {
      res = await addFun({
        ...form,
        companyId: companyId.value,
        menuIds: values.map((opt) => opt.id)
      })
    } else {
      res = await editFun({
        ...form,
        companyId: companyId.value,
        menuIds: values.map((opt) => opt.id)
      })
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