<template>
  <el-dialog v-model="dialogFormVisible" title="分配数据权限" width="680px" append-to-body>
    <el-form :model="form" ref="ruleFormRef" label-width="100px">
      <el-form-item label="角色名称">
        <el-input v-model="form.roleName" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限字符">
        <el-input v-model="form.roleKey" :disabled="true" />
      </el-form-item>
      <el-form-item label="权限范围">
        <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
          <el-option
            v-for="item in dataScopeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="数据权限" v-show="form.dataScope == 2">
        <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')"
          >展开/折叠</el-checkbox
        >
        <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')"
          >全选/全不选</el-checkbox
        >
        <el-checkbox
          v-model="form.deptCheckStrictly"
          @change="handleCheckedTreeConnect($event, 'dept')"
          >父子联动</el-checkbox
        >
        <el-tree
          class="tree-border"
          style="width: 100%"
          :data="treeData"
          show-checkbox
          :default-expand-all="defaultExpandAll"
          ref="deptRef"
          node-key="id"
          multiple
          :check-strictly="!form.deptCheckStrictly"
          :props="defaultProps"
        ></el-tree>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog"> Cancel </el-button>
        <el-button type="primary" @click="saveDialog(ruleFormRef)"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup name="roleEdit">
import { dataScope } from '@/api/modules/system/role'
import { useAuthStore } from '@/stores/modules/auth'
import { Role } from '@/api/interface/system'
import { reactive, ref, watch, computed, nextTick } from 'vue'
import type { FormInstance, ElTree } from 'element-plus'
import { ElMessage } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
// 传入的所有属性简单限制
// 表单接口限制类型
interface Tree {
  [key: string]: any
}
interface addOrEditProps {
  formData: Role.RuleForm
  treeData: Tree[]
}
// 传入的prop  使用 props.key
const props = defineProps<addOrEditProps>()

const defaultProps = {
  children: 'children',
  label: 'label'
}
const dataScopeOptions = [
  // {
  //   value: "1",
  //   label: "全部数据权限",
  // },
  {
    value: '2',
    label: '本公司权限'
  },
  {
    value: '3',
    label: '本部门数据权限'
  },
  {
    value: '4',
    label: '自身权限'
  }
]
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

const dialogFormVisible = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const defaultExpandAll = ref(true)
let allNodeIds = reactive([])

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<Role.RuleForm>({
  roleName: '',
  roleKey: '',
  orderTag: 0,
  status: '0',
  deptIds: [],
  deptCheckStrictly: true, // 父子联动
  dataScope: '', // 权限范围
  remarks: ''
})
//
watch(
  () => props.formData,
  () => {
    if (dialogFormVisible.value && props.formData) {
      // 处理初始选中
      Object.assign(form, props.formData)
      if (form?.deptIds) {
        form.deptIds.forEach((opt) => {
          nextTick(() => {
            deptRef.value!.setChecked(opt, true, false)
          })
        })
      }
    }
  }
)
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

/** 选择角色权限范围触发 */
const dataScopeSelectChange = () => {
  if (form.dataScope !== '2') {
    nextTick(()=>{
      deptRef.value!.setCheckedNodes([], false)
    })
  }
}
const deptRef = ref<InstanceType<typeof ElTree>>()
// 处理展开/折叠
const handleCheckedTreeExpand = () => {
  if (deptExpand.value) {
    Object.values(deptRef.value!.store.nodesMap).forEach((v) => v.expand())
  } else {
    Object.values(deptRef.value!.store.nodesMap).forEach((v) => v.collapse())
  }
}
// 全选/全不选
const handleCheckedTreeNodeAll = () => {
  if (!deptNodeAll.value) {
    deptRef.value!.setCheckedNodes([], false)
  } else {
    deptRef.value!.setCheckedNodes(props.treeData as Node[], false)
  }
}
const authStore = useAuthStore()
const companyId = computed(() => authStore.companyId)
// 关闭弹窗
const closeDialog = () => {
  // 清除数据
  dialogFormVisible.value = false
}
// 提交表单
const saveDialog = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  const isValid = await formEl.validate()
  if (isValid) {
    let res: any // 不太知道返回的类型就使用any
    let values = deptRef.value!.getCheckedNodes(false, false)
    res = await dataScope({
      ...form,
      companyId: companyId.value,
      deptIds: values.map((opt) => opt.id)
    })
    ElMessage.success(res)
    // 关闭弹窗刷新表格
    closeDialog()
    emit('renderTable', 1)
  }
}
// setup中的内容默认使用ref获取不到  主动使用宏暴露出去
defineExpose({ dialogFormVisible })
</script>
