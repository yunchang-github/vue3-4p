import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
import { Dept } from '@/api/interface/system'
import { ResPage } from "@/api/interface/index";
/**
 * @name 部门模块
 */
// 查询部门列表
export const listDept = (params: Dept.ReqParams) => {
  return http.request<ResPage<Dept.ResDeptList[]>>({
    method: "get",
    url: PORT1 + `/systemDept/list`,
    params
  });
}

// 查询部门下拉树结构
export const treeselect = () => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemDept/selectTree`
  });
};

// 根据角色ID查询部门树结构
export const roleDeptTreeselect = (roleId: number) => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemDept/roleDeptTreeselect/` + roleId
  });
};
// 新增
export const addFun = (data: Dept.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/menu`,
    types: "json",
    data
  });
};

// 编辑
export const editFun = (data: Dept.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/systemDept`,
    types: "json",
    data
  });
};