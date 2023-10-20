<template>
  <!-- card 背景颜色  table-box 高度处理-->
  <div class="card table-box">
    <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
      <el-form-item label="菜单名称">
        <el-input v-model="formInline.menuName" placeholder="请输入" clearable style="width:192px;"/>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="formInline.status" placeholder="请选择" clearable style="width:192px;">
          <el-option
            v-for="item in commonStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="renderTable"><el-icon><Search /></el-icon>搜索</el-button>
        <el-button @click="resetQuery"><el-icon><Refresh /></el-icon>重置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-header">
      <el-button type="primary" plain @click="addRow"
        ><el-icon><Plus /></el-icon>新增</el-button
      >
      <el-button type="info" plain @click="toggleExpandAll"
        ><el-icon><Sort /></el-icon>折叠/展开</el-button
      >
      <span style="float: right">
        <el-button circle @click="showSearch = !showSearch"
          ><el-icon><Search /></el-icon
        ></el-button>
        <el-button circle @click="renderTable"
          ><el-icon><Refresh /></el-icon
        ></el-button>
      </span>
    </div>
    <el-table
      v-loading="loading"
      v-if="refreshTable"
      row-key="menuId"
      :header-cell-style="{ background: '#f5f7fa' }"
      :data="tableData"
      style="width: 100%"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column
        v-for="item in tableColumns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width || 80"
      >
        <template #default="{ row }">
          <template v-if="item.prop=='icon'">
            <el-icon :size="18" v-if="row.icon && row.icon!='#'">
              <component :is="row.icon" />
            </el-icon>
          </template>
          <template v-else-if="item.prop=='status'">
           <dict-tag :options="commonStatus" :value="row.status"/>
          </template>
          <template v-else>
            {{row[item.prop]}}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button type="text" :icon="'Edit'" @click="handleEdit(row)">修改</el-button>
          <el-button type="text" :icon="'Plus'" @click="handleEdit(row)">新增</el-button>
          <el-button type="text" :icon="'Delete'" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- 新增编辑弹窗 -->
  <AddOrEdit
    @render-table="renderTable"
    ref="AddOrEditRef"
    :handle-type="handleType"
    :form-data="mainRow"
    :tree-data="treeData"
  />
</template>

<script lang="ts" setup name="Menu">
import { getMenuList, deleteMenu } from '@/api/modules/system/menu'
import { commonStatus } from '@/utils/serviceDict'
import { Menu } from "@/api/interface/system";
import AddOrEdit from './EditForm.vue'
import { ref, reactive, onBeforeMount, computed, watch,nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
// 折叠展开
const isExpandAll = ref(false)
// 刷新
const refreshTable = ref(true)

// 是否显示查询form
const showSearch = ref(true)
// 查询参数
const formInline = reactive({
  menuName: '',
  status: ''
})
const handleType = ref('add')
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref()

// 全局配置尺寸 处理分页组件的尺寸
import { useGlobalStore } from '@/stores/modules/global'
const globalStore = useGlobalStore()
const pageComponentSize = ref(false)
const assemblySize = computed(() => globalStore.assemblySize)
watch(assemblySize, (newV) => {
  pageComponentSize.value = newV == 'small'
})

// 编辑参数 未处理成响应式
interface formDataInterface {
  menuId: number;
  parentId: number;
  status: string
  menuName: string
}
let mainRow = ref<formDataInterface>({
  menuId: 0,
  parentId:0,
  status: '',
  menuName: ''
})
// 表格列
const tableColumns = [
  { prop: 'menuName', label: '菜单名称' },
  { prop: 'icon', label: '图标',width:70 },
  { prop: 'orderTag', label: '排序',width:70 },
  { prop: 'perms', label: '权限标识' },
  { prop: 'component', label: '组件路径',width:130 },
  { prop: 'status', label: '状态',width:70 },
  { prop: 'addTime', label: '创建时间' },
]
// 表格数据
let tableData = []

let treeData=[]
// 生命周期钩子 类似vue2中 created
onBeforeMount(async () => {
  renderTable()
})
// 方法
const addRow = () => {
  // $refs.AddOrEditRef <=> AddOrEditRef.value
  mainRow.value = {
    menuId:0,
    parentId:0,
    status: '',
    menuName: ''
  }
  handleType.value = 'add'
  AddOrEditRef.value.dialogFormVisible = true
}
// 重置查询
const resetQuery = () => {
  formInline.menuName= ''
  formInline.status= ''
}
// 折叠/展开
const toggleExpandAll = () => {
  refreshTable.value=false
  isExpandAll.value=!isExpandAll.value
  nextTick(() => {
    refreshTable.value = true;
  });
}
// 编辑
const handleEdit = (row: formDataInterface) => {
  handleType.value = 'edit'
  mainRow.value = {
    menuId: row.menuId,
    parentId:row.menuId,
    status: row.status,
    menuName: row.menuName
  }
  AddOrEditRef.value.dialogFormVisible = true
}
// 删除
const handleDelete = (row: { id: number }) => {
  ElMessageBox.confirm('是否删除?', 'Warning', {
    confirmButtonText: 'OK',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    await deleteMenu(String(row.id))
    ElMessage.success('操作成功!')
    renderTable()
  })
}

// 刷新tabel
const renderTable = () => {
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let { data } = await getMenuList(formInline)
    tableData =handleTree(data)
    treeData=[
      {
        menuId: 0,
        menuName: '主类目', 
        children:tableData
      }
    ]
    console.log("树状数",treeData)
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
const handleTree = (menuItems: Menu.ResMenuList[]) => {
  const menuMap = new Map<number, Menu.ResMenuList>()
  // 构建菜单项的映射，以menuId作为键
  menuItems.forEach((item) => {
    if (!menuMap.has(item.menuId)) {
      menuMap.set(item.menuId, { ...item, children: [] })
    }
  })

  // 构建树状结构
  const tree: Menu.ResMenuList[] = []
  menuItems.forEach((item) => {
    const menuItem = menuMap.get(item.menuId)
    if (menuItem) {
      if (item.parentId === 0) {
        tree.push(menuItem)
      } else {
        const parentItem = menuMap.get(item.parentId)
        if (parentItem) {
          parentItem.children.push(menuItem)
        }
      }
    }
  })
  return tree
}
</script>