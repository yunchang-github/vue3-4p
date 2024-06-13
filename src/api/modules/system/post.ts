import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface/index";
import http from "@/api";
import { Post } from "@/api/interface/system";
/**
 * @name 岗位模块
 */
function parseStrEmpty(str: any) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
// ReqPage & 
export const getList = (params: Post.ReqParams) => {
  return http.request<ResPage<Post.RuleForm>>({
    method: "get",
    url: PORT1 + `/systemPost/list`,
    params
  });
};

// 查询岗位详细
export const getDetail = (postId: any) => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemPost/` + parseStrEmpty(postId),
  });
};
// 新增用户
export const addFun = (data: Post.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/systemPost`,
    types: "json",
    data
  });
};
// 修改用户
export const editFun = (data: Post.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemPost`,
    types: "json",
    data
  });
}
// 删除
export const delFun = (postId: any) => {
  return http.request({
    method: "delete",
    url: PORT1 + `/systemPost/` + postId,
    isShowGlobelLoading:true
  });
}

// 导出
export const exportPostInfo = (fileName: string, params = {}, data = {}) => {
  return http.request({
    url: PORT1 + "/systemPost/export",
    method: "post",
    fileName,
    params,
    responseType: "blob",
    isShowGlobelLoading:true,
    types: "json",
    data
  });
};