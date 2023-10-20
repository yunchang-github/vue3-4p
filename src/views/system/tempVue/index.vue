<template>
  <!-- card 背景颜色  table-box 高度处理-->
  <div class="card table-box">
    <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
      <el-form-item label="菜单名称">
        <el-input v-model="formInline.menuName" placeholder="请输入" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="formInline.status" placeholder="请选择" clearable>
          <el-option
            v-for="item in commonStatus"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="renderTable">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <div class="table-header">
      <el-button type="primary" plain @click="addRow"><el-icon><Plus /></el-icon>新增</el-button>
      <el-button type="info" plain @click="toggleExpandAll"><el-icon><Sort /></el-icon>折叠/展开</el-button>
      <span style="float:right;">
        <el-button circle @click="showSearch = !showSearch"><el-icon><Search /></el-icon></el-button>
        <el-button circle @click="renderTable"><el-icon><Refresh /></el-icon></el-button>
      </span>
    </div>
    <el-table v-loading="loading" :header-cell-style="{ background: '#f5f7fa' }" :data="tableData" style="width: 100%" border>
      <el-table-column v-for="item in tableColumns" :key="item.prop" :prop="item.prop" :label="item.label" />
      <el-table-column fixed="right" label="操作">
        <template #default="{ row }">
          <el-button type="primary" plain @click="handleEdit(row)">Edit</el-button>
          <el-button type="danger" plain @click="handleDelete(row)">delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="float: right; margin-top: 10px"
      :current-page="pageNum"
      :page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      :small="pageComponentSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
  <!-- 新增编辑弹窗 -->
  <AddOrEdit @render-table="renderTable" ref="AddOrEditRef" :handle-type="handleType" :form-data="mainRow" />
</template>

<script lang="ts" setup>
import { getMenuList, deleteMenu } from "@/api/modules/system/menu";
import { commonStatus } from "@/utils/serviceDict";
import AddOrEdit from "./EditForm.vue";
import { ref, reactive, onBeforeMount, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
const loading = ref(false);
// 是否显示查询form
const showSearch=ref(true);
// 查询参数
const formInline = reactive({
  menuName: "",
  status: ""
});
const handleType = ref("add");
// 使用ref修改子组件的数据  子组件中一定要使用 defineExpose({ dialogFormVisible }); 将数据暴露出去
const AddOrEditRef = ref();

// 全局配置尺寸 处理分页组件的尺寸
import { useGlobalStore } from "@/stores/modules/global";
const globalStore = useGlobalStore();
const pageComponentSize = ref(false);
const assemblySize = computed(() => globalStore.assemblySize);
watch(assemblySize, newV => {
  pageComponentSize.value = newV == "small";
});

// 编辑参数 未处理成响应式
interface formDataInterface {
  id?: number;
  status: string;
  menuName: string;
}
let mainRow = ref<formDataInterface>({
  id: 0,
  status: "",
  menuName: ""
});
// 分页信息
const total = ref(0);
const pageSize = ref(100);
const pageNum = ref(1);
// 表格列
const tableColumns = [
  { prop: "menuName", label: "菜单名称" },
  { prop: "newSku", label: "NEW SKU" },
  { prop: "status", label: "SKU" }
];
// 表格数据
let tableData = [];
// 生命周期钩子 类似vue2中 created
onBeforeMount(async () => {
  renderTable();
});
// 方法
const addRow = () => {
  // $refs.AddOrEditRef <=> AddOrEditRef.value
  mainRow.value = {
    status: "",
    menuName: ""
  };
  handleType.value = "add";
  AddOrEditRef.value.dialogFormVisible = true;
};
// 重置查询
const resetQuery = () => {};
// 折叠/展开
const toggleExpandAll=()=>{};
// 编辑
const handleEdit = (row: formDataInterface) => {
  handleType.value = "edit";
  mainRow.value = {
    id: row.id,
    status: row.status,
    menuName: row.menuName
  };
  AddOrEditRef.value.dialogFormVisible = true;
};
// 删除
const handleDelete = (row: { id: number }) => {
  ElMessageBox.confirm("是否删除?", "Warning", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning"
  }).then(async () => {
    await deleteMenu({
      idList: String(row.id)
    });
    ElMessage.success("操作成功!");
    renderTable();
  });
};

// 刷新tabel
const renderTable = (type = 0) => {
  if (type === 0) {
    pageNum.value = 1;
  }
  getTableData();
};
// 获取表格数据
const getTableData = async () => {
  let _lastData = {
    ...formInline,
    pageSize: pageSize.value,
    pageNum: pageNum.value
  };
  loading.value = true;
  try {
    let { data } = await getMenuList(_lastData);
    tableData = data.list;
    total.value = data.total;
    loading.value = false;
  } catch (e) {
    loading.value = false;
  }
};
const handleSizeChange = (val: number) => {
  pageNum.value = 1;
  pageSize.value = val;
  getTableData();
};
const handleCurrentChange = (val: number) => {
  pageNum.value = val;
  getTableData();
};
</script>