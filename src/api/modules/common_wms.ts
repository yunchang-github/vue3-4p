import { PORT3 } from "@/api/config/servicePort";
import http from "@/api";

// 查询海外仓导出模板
export function selWMSDownTemplate(params) {
  return http.request({
    url: PORT3 + "/exportPublic/wmsExportTemplate/selExportTemplateList",
    method: "get",
    params,
  });
}

// 新增或编辑海外仓导出模板
export function updateWMSTemplate(data) {
  return http.request({
    url: PORT3 + "/exportPublic/wmsExportTemplate/saveOrUpdateExportTemplate",
    method: "post",
    data,
    types: 'json'
  });
}

// 删除海外仓导出模板
export function delWMSTemplate(params) {
  return http.request({
    url: PORT3 + "/exportPublic/wmsExportTemplate/delExportTemplate",
    method: "get",
    params,
  });
}

// /**
//  * @name 获取已有模板下拉
//  */
// export function downTemplateList(params) {
//   return http.request({
//     url: PORT3 + "/template/list",
//     method: "get",
//     params,
//   });
// }
// // 模板新增修改
// export const addOrEditTemplate = (data) => {
//   return http.request<Login.ResLogin>({
//     url: PORT3 + "/template/saveOrUpdate",
//     method: 'post',
//     data
//   })
// }