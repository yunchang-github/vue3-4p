<template>
  <el-dialog v-model="dialogFormVisible" :title="handleType == 'add' ? '添加菜单' : '编辑菜单'" width="680px">
    <el-form :model="form" ref="ruleFormRef" :rules="rules" label-width="100px">
      <el-row>
        <el-col :span="24">
          <el-form-item label="上级菜单" prop="parentId">
            <el-tree-select node-key="menuId" v-model="form.parentId" :default-expanded-keys="[0]" :check-strictly="true" :data="treeData" :props="treeProps" :filter-node-method="filterNode" style="width:100%" filterable>
              <template #default="{ data: { menuName,children } }">
                {{ menuName }}<span style="color: gray" v-if="children.length">({{children.length}})</span></template
              >
            </el-tree-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="菜单类型" prop="menuType">
            <el-radio-group v-model="form.menuType">
              <el-radio label="M">目录</el-radio>
              <el-radio label="C">菜单</el-radio>
              <el-radio label="F">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="菜单图标" prop="icon">
            <el-popover
              placement="bottom-start"
              width="540"
              trigger="click"
            >
              <!-- <IconSelect ref="iconSelect" @selected="selected" />-->
              <SelectIcon v-model:icon-value="form.icon"/>
              <template #reference>
                <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                   <template #prefix>
                    <component :is="form.icon" style="width:18px;"></component>
                  </template>
                </el-input> 
              </template>
            </el-popover>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="菜单名称" prop="menuName">
            <el-input v-model="form.menuName" placeholder="请输入菜单名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="显示排序" prop="orderTag">
            <el-input-number v-model="form.orderTag" controls-position="right" :min="0" />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType !== 'F'">
          <el-form-item label="是否外链" prop="isFrame">
            <template #label>
              <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              <span style="display:inline-block;">是否外链</span>
            </template>
            <el-radio-group v-model="form.isFrame">
              <el-radio label="0">是</el-radio>
              <el-radio label="1">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType !== 'F'">
          <el-form-item label="路由地址" prop="path">
            <template #label>
              <el-tooltip
                content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              路由地址
            </template>
            <el-input v-model="form.path" placeholder="请输入路由地址" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType === 'C'">
          <el-form-item label="组件路径" prop="component">
            <template #label>
              <el-tooltip
                content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              组件路径
            </template>
            <el-input v-model="form.component" placeholder="请输入组件路径" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType !== 'M'">
          <el-form-item label="权限字符" prop="perms">
            <template #label>
              <el-tooltip
                content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              权限字符
            </template>
            <el-input v-model="form.perms" placeholder="请输入权限标识" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType === 'C'">
          <el-form-item label="路由参数" prop="query">
            <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255" />
            <template #label>
              <el-tooltip
                content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              路由参数
            </template>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType === 'C'">
          <el-form-item label="是否缓存" prop="isCache">
            <template #label>
              <el-tooltip
                content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              是否缓存
            </template>
            <el-radio-group v-model="form.isCache">
              <el-radio label="0">缓存</el-radio>
              <el-radio label="1">不缓存</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType !== 'F'">
          <el-form-item label="显示状态" prop="visible">
            <template #label>
              <el-tooltip
                content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                placement="top"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              显示状态
            </template>
            <el-radio-group v-model="form.visible">
              <el-radio
                v-for="dict in showStatus"
                :key="dict.value"
                :label="dict.value"
                >{{ dict.label }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.menuType !== 'F'">
          <el-form-item label="菜单状态" prop="status">
            <template #label>
              <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
              菜单状态
            </template>
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="dict in commonStatus"
                :key="dict.value"
                :label="dict.value"
                >{{ dict.label }}</el-radio
              >
            </el-radio-group>
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

<script lang="ts" setup name="financeSkuRelationDialog">
import { addFun, editFun } from '@/api/modules/system/menu'
import { commonStatus,showStatus } from '@/utils/serviceDict'
import SelectIcon from '@/components/SelectIcon/index.vue'
import { Menu } from "@/api/interface/system";
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
// 传入的所有属性简单限制
// 表单接口限制类型
interface Tree {
  [key: string]: any
}
interface addOrEditProps {
  handleType: string;
  formData: Menu.RuleForm;
  treeData:Tree[]
}
// 传入的prop  使用 props.key
const props = withDefaults(defineProps<addOrEditProps>(), {
  handleType: 'add',
})
const treeProps = {
  children: 'children',
  label: 'menuName',
  value: 'menuId'
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
const rules = reactive<FormRules<Menu.RuleForm>>({
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  orderTag: [
    {
      required: true,
      message: '请输入排序',
      trigger: 'blur'
    }
  ],
  path: [
    {
      required: true,
      message: '请输入路由地址',
      trigger: 'blur'
    }
  ],
})
const dialogFormVisible = ref(false)

// 表单限制 elementui
const ruleFormRef = ref<FormInstance>()
let form = reactive<Menu.RuleForm>({
    menuId: 0,
    parentId: 0,
    menuName: "",
    icon: "",
    menuType: "M",
    orderTag: "",
    isFrame: "1",
    path:"",
    isCache: "",
    visible: "0",
    status: "0",
})
//
watch(
  () => props.formData,
  () => {
    handleInitFormData()
  }
)

const filterNode = (value: string, data: Tree) => {
  if (!value) return true
  return data.menuName.includes(value)
}
// 初始化表格数据
const handleInitFormData = () => {
  // 编辑初始化数据
  if(props.handleType=='edit'){
    // form.id = props.formData.menuId
    // form.sku = props.formData.sku
    // form.shopName = props.formData.shopName
    // !form.id && delete form.id
  }
}

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
.el-overlay-dialog .el-form-item__label .el-icon{
  top:8px;
  right:3px;
}
</style>
