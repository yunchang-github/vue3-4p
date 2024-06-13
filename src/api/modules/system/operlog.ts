import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface/index";
import http from "@/api";
import { Operlog } from "@/api/interface/system";
/**
 * @name 操作日志模块
 */
function parseStrEmpty(str: any) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
export const getList = (params: Operlog.ReqParams) => {
  return http.request<ResPage<Operlog.RuleForm>>({
    method: "get",
    url: PORT1 + `/systemOperLog/list`,
    params
  });
};

// 删除
export const delFun = (operId: any) => {
  return http.request({
    method: "delete",
    url: PORT1 + `/systemOperLog/` + parseStrEmpty(operId),
    isShowGlobelLoading: true
  });
}

// cleanOperlog
export const cleanOperlog = () => {
  return http.request({
    method: "delete",
    url: PORT1 + `/systemOperLog/clean`,
    isShowGlobelLoading: true
  });
}

// 导出
export const exportInfo = (fileName: string, params = {}, data = {}) => {
  return http.request({
    url: PORT1 + "/systemOperLog/export",
    method: "post",
    fileName,
    params,
    responseType: "blob",
    isShowGlobelLoading: true,
    types: "json",
    data
  });
};