import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface/index";
import http from "@/api";
import { Role } from "@/api/interface/system";

export const getRoleList = (params: Role.ReqParams) => {
  return http.request<ResPage<Role.ResRoleList>>({
    method: "get",
    url: PORT1 + `/systemRole/list`,
    params
  });
};
// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return http.request({
    url: PORT1 + '/systemRole/authUser/allocatedList',
    method: 'get',
    params: query
  })
}
// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return http.request({
    url: PORT1 + '/systemRole/authUser/unallocatedList',
    method: 'get',
    params: query
  })
}
// 授权用户选择
export function authUserSelectAll(data) {
  return http.request({
    url: PORT1 + '/systemRole/authUser/selectAll',
    method: 'put',
    params: data,
    recordTitle:"授权用户选择"
  })
}
// 取消用户授权角色
export function authUserCancel(data) {
  return http.request({
    url: PORT1 + '/systemRole/authUser/cancel',
    method: 'put',
    data,
    recordTitle:"取消用户授权角色",
  })
}
// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return http.request({
    url: PORT1 + '/systemRole/authUser/cancelAll',
    method: 'put',
    params: data,
    recordTitle:"批量取消用户授权角色",
  })
}
export const addFun = (data:Role.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/systemRole`,
    types:"json",
    isShowGlobelLoading:true,
    data
  });
};
export const editFun = (data:Role.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole`,
    types:"json",
    isShowGlobelLoading:true,
    data
  });
};
// 数据权限
export const dataScope = (data:Role.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole/dataScope`,
    types:"json",
    isShowGlobelLoading:true,
    data
  });
};
// 角色状态修改
export const changeRoleStatus = (roleId:number, status:string) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole/changeStatus`,
    types:"json",
    data:{
      roleId,
      status
    }
  });
};
// 删除角色
export const delRole = (roleIds:string) => {
  return http.request({
    method: "delete",
    url: PORT1 + '/systemRole/' + roleIds,
  });
};
//数据下载
export const downRoleData = (fileName:string,params={},data={}) =>{
  return http.request({
    url: PORT1 +"/systemRole/export",
    method: "post",
    fileName,
    params,
    responseType: "blob",
    types:'json',
    isShowGlobelLoading:true,
    data
  });
}