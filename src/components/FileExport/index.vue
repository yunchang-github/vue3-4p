<template>
  <el-dialog
    width="960px"
    title="导出字段设置"
    v-model="dialogVisible"
    :before-close="handleClose"
    class="importTemplate"
  >
    <div style="min-height: 30vh">
      <div style="margin-bottom: 20px">
        已有模板:
        <el-select
          filterable
          clearable
          @change="handleTemplateChange"
          v-model="templateName"
          placeholder="请选择导出模板"
          style="margin-left: 20px"
        >
          <el-option
            v-for="(item, i) in templateNameOptions"
            :key="i"
            :label="item.templateName"
            :value="item.templateName"
          ></el-option>
        </el-select>
      </div>
      <div style="display: flex">
        <el-checkbox
          style="margin-top: 5px"
          v-model="orderChecked"
          @change="checkedChange(orderList, orderChecked)"
          >全选</el-checkbox
        >
        <div style="margin-left: 10px">
          <span
            :class="[item.isChecked ? 'highStyle' : 'defaultStyle']"
            v-for="item in orderList"
            :key="item.label"
            @click="handleSelect(item)"
            >{{ item.label }}</span
          >
        </div>
      </div>
      <div class="leftLine">
        EXCEL导出的字段顺序
        <span class="empty" @click="addEmpty">加空白列</span>
      </div>
      <div style="margin-top: 10px">
        <span class="exists" v-for="(item, index) in selectedList" :key="index">
          <span class="existsNum">{{ handleNum(index) }}</span
          >{{ item.label }}
          <el-icon class="cancelBtn" @click="cancelFun(item, index)"><Close /></el-icon>
        </span>
      </div>
    </div>

    <div class="bottom">
      <el-dropdown>
        <el-button type="success" style="margin-right: 10px">
          保存为导出模板 <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="coverCurrentTemp" v-if="templateName"
              >覆盖当前模板</el-dropdown-item
            >
            <!-- <el-dropdown-item @click="delCurrentTemp" v-if="templateName"
                >删除当前模板</el-dropdown-item
              > -->
            <el-dropdown-item @click="saveNewTemp">另存为新模板</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button type="primary" @click="saveDialog">导出</el-button>
      <el-button type="" @click="handleClose">取消</el-button>
    </div>
  </el-dialog>
</template>
<script setup lang="ts" name="FileExport">
import { ref, watch } from 'vue'
import { downTemplateList, addOrEditTemplate } from '@/api/modules/common.ts'
// delWMSTemplate
import { selWMSDownTemplate, updateWMSTemplate } from '@/api/modules/common_wms.ts'
import { ElMessage, ElMessageBox } from 'element-plus'
interface columns {
  label: string
  value: string
  isChecked: boolean
}
interface selectedObj {
  label: string
  prop?: string
  value: string
  isChecked: boolean
}
interface options {
  id: string
  templateName: string
  field: string
  label: string
}
export interface ExcelParameterProps {
  isWMS: boolean // 区分wms的下载
  pageName: string
  columns: columns[]
}
// dialog状态
const dialogVisible = ref(false)
// 父组件传过来的参数
const parameter = ref<ExcelParameterProps>({
  isWMS: false,
  columns: [],
  pageName: ''
})
watch(dialogVisible, () => {
  if (dialogVisible.value) {
    getList()
  }
})
// 接收父组件参数
const acceptParams = (params: ExcelParameterProps) => {
  parameter.value = { ...params }
  dialogVisible.value = true
  orderList.value = JSON.parse(JSON.stringify(parameter.value.columns))
}
const templateName = ref('')
// 已有模板下拉
const templateNameOptions = ref<options[]>([])
// 半选
const isIndeterminate = ref(false)
// 全选
const checkAll = ref(false)
// 选择
const orderChecked = ref(false)
// 数据
const orderList = ref<columns[]>([])
// 选中的数据
const selectedList = ref<selectedObj[]>([])

// 获取模板下拉数据
const getList = async () => {
  let getListApi = parameter.value.isWMS ? selWMSDownTemplate : downTemplateList
  let res = await getListApi({
    pageName: parameter.value.pageName
  })
  templateNameOptions.value = res.data || []
}
const handleNum = (value: number) => {
  let temp = value + 1
  if (temp < 10) {
    return '0' + temp
  } else {
    return temp
  }
}

// 全选
const checkedChange = (key: Array<columns>, checked: boolean) => {
  key.forEach((item) => {
    item.isChecked = checked
    if (checked) {
      // 判断是否已经存在 存在则添加否则忽略
      if (!selectedList.value.some((opt) => opt.label == item.label)) {
        selectedList.value.push(item)
      }
    } else {
      // 判断是否存在 存在则删除
      if (selectedList.value.some((opt) => opt.label == item.label)) {
        selectedList.value = selectedList.value.filter((opt) => opt.label !== item.label)
      }
    }
  })
  handleMainShow()
}
// 单个点击
const handleSelect = (opt: columns) => {
  opt.isChecked = !opt.isChecked
  if (opt.isChecked) {
    selectedList.value.push(opt)
  } else {
    selectedList.value = selectedList.value.filter((item) => opt.label !== item.label)
  }
  handleMainShow()
}
// 处理主的全选与半选
const handleMainShow = () => {
  // 处理主的全选 半选
  checkAll.value = orderList.value.every((item) => item.isChecked)
  isIndeterminate.value = !checkAll.value && orderList.value.some((item) => item.isChecked)
  // 处理子数据的全选
  orderChecked.value = orderList.value.every((item) => item.isChecked)
  orderChecked.value = orderList.value.every((item) => item.isChecked)
}
// 添加空白列
const addEmpty = () => {
  selectedList.value.push({
    label: '空白列',
    value: 'blank',
    isChecked: true
  })
}
// 删除
const cancelFun = (item: columns, index: number) => {
  selectedList.value = selectedList.value.filter((opt, i) => index !== i)
  // 处理其他数据中的高亮
  orderList.value.forEach((opt) => {
    if (opt.label == item.label) {
      opt.isChecked = false
    }
  })
}
// 覆盖当前模板
const coverCurrentTemp = () => {
  // 过滤掉空的 至少要有一条
  if (!selectedList.value.some((item) => item.label !== '空白列')) {
    ElMessage.warning('至少选择一个字段!')
    return false
  }
  let id = ''
  templateNameOptions.value.forEach((item) => {
    if (item.templateName == templateName.value) {
      id = item.id
    }
  })
  let _data = {
    id,
    field: selectedList.value,
    pageName: parameter.value.pageName,
    templateName: templateName.value
  }
  let updateApi = parameter.value.isWMS ? updateWMSTemplate : addOrEditTemplate
  updateApi(_data).then(() => {
    handleClose()
    ElMessage.success('操作成功!')
  })
}
// 另存为新模板
const saveNewTemp = () => {
  if (!selectedList.value.some((item) => item.label !== '空白列')) {
    ElMessage.warning('至少选择一个字段!')
    return
  }
  ElMessageBox.prompt('请输入模板名称', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
    inputErrorMessage: '请输入模板名称'
  })
    .then(({ value }) => {
      let tempName = value.trim()
      if (null == tempName) {
        ElMessage.warning('模板名称不能为空!')
        return
      }
      if (value.length > 50) {
        ElMessage.warning('模板名称长度不能超过50个字符!')
        return
      }
      let _data = {
        pageName: parameter.value.pageName,
        templateName: tempName,
        field: selectedList.value
      }
      let updateApi = parameter.value.isWMS ? updateWMSTemplate : addOrEditTemplate
      updateApi(_data).then(() => {
        getList()
        templateName.value = tempName
        ElMessage.success('操作成功!')
      })
    })
    .catch(() => {})
}
// 删除模板
// const delCurrentTemp = () => {
//   // 过滤掉空的 至少要有一条
//   if (!selectedList.value.some((item) => item.label !== '空白列')) {
//     ElMessage.warning('至少选择一个字段!')
//     return
//   }
//   let id = ''
//   templateNameOptions.value.forEach((item) => {
//     if (item.templateName == templateName.value) {
//       id = item.id
//     }
//   })
//   delExportFormWork({ id }).then(() => {
//     clearFun()
//     ElMessage.success('删除成功!')
//   })
// }
type FilterEmits = {
  // (e: "update:dialogShow", value: boolean): void;
  (e: 'saveExportDialog',value:columns[]): void // value 参数 没有返回值
}
const emit = defineEmits<FilterEmits>()
//导出
const saveDialog = () => {
  // 关闭弹窗
  if (selectedList.value.filter((item) => item.lable !== '空白列').length > 0) {
    // 处理空白列
    let tempData:columns[] = selectedList.value.map((item) => {
      return {
        ...item,
        label: item.label === '空白列' ? '' : item.label
      }
    })
    emit('saveExportDialog',tempData)
    handleClose()
  } else {
    ElMessage.warning('请选择模板或数据!')
  }
}
// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false
  clearFun()
}
// 选择已有的模板
const handleTemplateChange = () => {
  let oldData: columns[] = []
  templateNameOptions.value.forEach((item) => {
    if (item.templateName == templateName.value) {
      oldData = item.field
    }
  })
  if (oldData && oldData.length > 0) {
    orderList.value.forEach((item) => {
      item.isChecked = false
    })
    oldData.forEach((oldItem) => {
      orderList.value.forEach((item) => {
        if (item.label == oldItem.label) {
          item.isChecked = true
        }
      })
    })
    selectedList.value = oldData
    handleMainShow()
  } else {
    clearFun()
  }
}
const clearFun = () => {
  isIndeterminate.value = false
  checkAll.value = false
  orderChecked.value = false
  selectedList.value = []
  orderList.value = []
  templateName.value=''
}
defineExpose({
  acceptParams
})
</script>

<style lang="scss" scoped>
.importTemplate {
  .highStyle {
    background-color: #409eff;
    margin-right: 10px;
    color: #fff;
    border: 1px solid #409eff;
    padding: 4px 6px;
    border-radius: 4px;
    margin-bottom: 10px;
    display: inline-block;
    cursor: pointer;
  }
  .defaultStyle {
    display: inline-block;
    margin-right: 10px;
    border: 1px solid #eee;
    padding: 4px 6px;
    border-radius: 4px;
    margin-bottom: 10px;
    background-color: #eee;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
  .bottom {
    text-align: center;
    margin-top: 20px;
  }
  .leftLine {
    border-left: 1px solid rgb(116, 115, 115);
    padding-left: 6px;
  }
  .empty {
    display: inline-block;
    border: 1px solid #eee;
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
    &:hover {
      color: #409eff;
    }
  }
  .exists {
    display: inline-block;
    border: 1px solid #eee;
    padding: 4px 6px;
    border-radius: 4px;
    margin: 0 10px 10px 0;
    background-color: #eee;
    .existsNum {
      font-size: 12px;
      background-color: #b4bbc5;
      border-radius: 50%;
      color: #fff;
      margin-right: 6px;
      padding: 2px 4px;
      box-sizing: border-box;
    }
  }
  .cancelBtn {
    cursor: pointer;
    vertical-align: middle;
    &:hover {
      color: red;
    }
  }
}
</style>
