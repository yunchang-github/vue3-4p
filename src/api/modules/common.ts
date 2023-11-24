import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 获取已有模板下拉
 */
export function downTemplateList(params) {
  return http.request({
    url: PORT1 + "/template/list",
    method: "get",
    params,
  });
}

// 模板新增修改
export const addOrEditTemplate = (data) => {
  return http.request({
    url: PORT1 + "/template/saveOrUpdate",
    method: 'post',
    types:"json",
    data
  })
}