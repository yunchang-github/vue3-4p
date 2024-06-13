// ? 系统全局字典

/**
 * @description：用户性别
 */
export const genderType = [
  { label: "男", value: 1, type: "", size: "default" },
  { label: "女", value: 2, type: "", size: "default" }
];

/**
 * @description：状态
 */
export const commonStatus = [
  { label: "正常", value: "0", type: "", size: "default" },
  { label: "停用", value: "1", type: "danger", size: "default" }
];

/**
 * @description：状态
 */
export const showStatus = [
  { label: "显示", value: "0", type: "", size: "default" },
  { label: "隐藏", value: "1", type: "danger", size: "default" }
];

/**
 * @description：操作日志中操作类型
 */
export const operLogTypeStatus = [
  { label: "新增", value: "1", type: "info", size: "default" },
  { label: "修改", value: "2", type: "info", size: "default" },
  { label: "删除", value: "3", type: "danger", size: "default" },
  { label: "授权", value: "4", type: "primary", size: "default" },
  { label: "导出", value: "5", type: "warning", size: "default" },
  { label: "导入", value: "6", type: "warning", size: "default" },
  { label: "强退", value: "7", type: "danger", size: "default" },
  { label: "生成代码", value: "8", type: "warning", size: "default" },
  { label: "清空数据", value: "9", type: "danger", size: "default" },
];
/**
 * @description：操作日志中状态
 */
export const operLogStatus = [
  { label: "成功", value: "0", type: "", size: "default" },
  { label: "失败", value: "1", type: "danger", size: "default" }
];