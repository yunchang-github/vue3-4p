<template>
  <div class="card table-box">
    <el-form class="search-form" :inline="true" :model="formInline" v-show="showSearch">
      <el-form-item label="">
        <el-input
          v-model="formInline.customerName"
          placeholder="客户名称/编号"
          clearable
          style="width: 192px"
        />
      </el-form-item>
      <el-form-item label="">
        <el-select
          v-model="formInline.inStorageType"
          placeholder="业务类型"
          clearable
          style="width: 192px"
        >
          <el-option
            v-for="item in inStorageTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="">
        <el-select
          v-model="formInline.arrivalMethod"
          placeholder="到仓方式"
          clearable
          style="width: 192px"
        >
          <el-option
            v-for="item in arrivalMethodOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="renderTable"
          ><el-icon><Search /></el-icon>搜索</el-button
        >
        <el-button @click="resetQuery"
          ><el-icon><Refresh /></el-icon>重置</el-button
        >
      </el-form-item>
    </el-form>
    <el-table
      v-loading="loading"
      v-if="refreshTable"
      row-key="menuId"
      :header-cell-style="{ background: '#f5f7fa' }"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        v-for="item in tableColumns"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :min-width="item.width || 80"
      >
        <template #default="{ row }">
          <template v-if="item.prop == 'icon'">
            <el-icon :size="18" v-if="row.icon && row.icon != '#'">
              <component :is="row.icon" />
            </el-icon>
          </template>
          <template v-else-if="item.prop == 'inStorageType'">
            <dict-tag :options="commonStatus" :value="row.inStorageType" />
          </template>
          <template v-else>
            {{ row[item.prop] }}
          </template>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button text :icon="'Edit'" @click="handleDetail(row)">收货</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="float: right; margin-top: 10px"
      :current-page="pageNum"
      :page-size="pageSize"
      :page-sizes="[100, 200, 300, 400]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script lang="ts" setup name="menu">
const inStorageTypeOptions = [
  {
    label: '调拨入库上架',
    value: 1
  },
  {
    label: '调拨入库中转',
    value: 2
  },
  {
    label: '订单退货上架',
    value: 3
  },
  {
    label: '订单退货中转',
    value: 4
  },
  {
    label: 'FBA退仓上架',
    value: 5
  },
  {
    label: 'FBA退仓中转',
    value: 6
  }
]
const arrivalMethodOptions = [
  {
    label: '快递包裹',
    labelEn: 'Parcel',
    value: 1
  },
  {
    label: '箱',
    labelEn: 'Box',
    value: 2
  },
  {
    label: '托盘',
    labelEn: 'Pallet',
    value: 3
  },
  {
    label: '货柜',
    labelEn: 'Container',
    value: 4
  },
  {
    label: '其他',
    labelEn: 'Other',
    value: 5
  }
]
import { receipt } from "@/api/interface/overseasWarehouse";
import { getReceiptList } from '@/api/modules/overseasWarehouse/enterWarehouse/receipt'
import { commonStatus } from '@/utils/serviceDict'
import { ref, reactive } from 'vue'

const loading = ref(false)
// 刷新
const refreshTable = ref(true)
// 分页信息
const total = ref(0)
const pageSize = ref(100)
const pageNum = ref(1)

// 是否显示查询form
const showSearch = ref(true)
// 查询参数
const formInline = reactive({
  customerName: undefined,
  inStorageType: undefined,
  arrivalMethod: undefined
})

// 表格列
const tableColumns = [
  {
    label: '收货单号',
    prop: 'receivingNumber',
    width: 120
  },
  {
    label: '业务类型',
    prop: 'inStorageTypeStr',
    width: 100
  },
  {
    label: '货柜号/跟踪号/BOL',
    prop: 'trackingNumber',
    width: 180
  },
  {
    label: '到仓方式',
    prop: 'reachWay',
    width: 70
  },
  // {
  //     label: "收件人",
  //     prop: "address",
  // },
  {
    label: '状态',
    prop: 'statusStr'
  },
  {
    label: '预计到货日期',
    prop: 'expectDate',
    width: 118
  },

  {
    label: '客户',
    prop: 'customerName'
  },
  {
    label: '货物',
    prop: 'qty'
  },
  {
    label: '收货完成时间',
    prop: 'finishTime',
    width: 100
  },
  {
    label: '备注',
    prop: 'remarks',
    width: 100
  }
]
// 表格数据
let tableData = []
// 重置查询
const resetQuery = () => {
  formInline.customerName = undefined
  formInline.inStorageType = undefined
  formInline.arrivalMethod = undefined
}
const handleSizeChange = (val: number) => {
  pageNum.value = 1
  pageSize.value = val
  getTableData()
}
const handleCurrentChange = (val: number) => {
  pageNum.value = val
  getTableData()
}
// 跳转到详情页
const handleDetail=(row:receipt.ResReceiptList)=>{
  let url = `/receipt-data/detail?inStorageNumber=${row.inStorageNumber}&type=1&reachWay=${row.reachWay}&customerName=${row.customerName}`;
  console.log(url)
  // window.open(url, "_blank");
}
// 刷新tabel
const renderTable = () => {
  pageNum.value = 1
  getTableData()
}
// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    let { data } = await getReceiptList({
      ...formInline,
      pageNum:pageNum.value,
      pageSize:pageSize.value,
    })
    tableData=data.list
    total.value=data.total
    loading.value = false
  } catch (e) {
    loading.value = false
  }
}
</script>