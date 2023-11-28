import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
/**
 * @name 部门模块
 */
// 查询部门下拉树结构
export const treeselect = () => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemDept/selectTree`
  });
};

// 根据角色ID查询部门树结构
export const roleDeptTreeselect = (roleId:number) => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemDept/roleDeptTreeselect/`+ roleId
  });
};