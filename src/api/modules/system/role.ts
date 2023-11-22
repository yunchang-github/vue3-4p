import { PORT1 } from "@/api/config/servicePort";
import { ResPage } from "@/api/interface/index";
import http from "@/api";
import { Role } from "@/api/interface/system";

export const getRoleList = (params: Role.ReqParams) => {
  return http.request<ResPage<Role.ResRoleList>>({
    method: "get",
    url: PORT1 + `/systemRole/list`,
    isHideLoading: true,
    params
  });
};

export const addFun = (data:Role.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/systemRole`,
    types:"json",
    data
  });
};
export const editFun = (data:Role.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole`,
    types:"json",
    data
  });
};
// 数据权限
export const dataScope = (data:Role.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole/dataScope`,
    types:"json",
    data
  });
};
// 角色状态修改
export const changeRoleStatus = (roleId:number, status:string) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemRole/changeStatus`,
    isHideLoading: true,
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
    isHideLoading: true,
  });
};