// import { ResultData } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
// import { Dept } from "@/api/interface/system";
import http from "@/api";
/**
 * @name 部门模块
 */
// 查询部门下拉树结构
export const treeselect = () => {
  return http.request({
    method: "get",
    url: PORT1 + `/systemDept/selectTree`,
    isHideLoading: true,
  });
};