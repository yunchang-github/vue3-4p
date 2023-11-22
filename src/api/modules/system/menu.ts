// import { ResPage,ReqPage } from "@/api/interface/index";
import { Menu } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
/**
 * @name 菜单模块
 */
export const getMenuList = (params: Menu.ReqParams) => {
  return http.request<Menu.ResMenuList[]>({
    method: "get",
    url: PORT1 + `/menu/list`,
    isHideLoading: true,
    params
  });
};
// 查询菜单下拉树结构
export const treeselect = () => {
  return http.request({
    method: "get",
    url: PORT1 + `/menu/treeselect`,
    isHideLoading: true
  });
};

export const deleteMenu = (menuId:string) => {
  return http.request({
    method: "delete",
    url: PORT1 + '/menu/' + menuId,
    isHideLoading: true,
  });
};

export const editFun = (data:Menu.RuleForm) => {
  return http.request({
    method: "put",
    url: PORT1 + `/menu`,
    isHideLoading: true,
    data
  });
};

export const addFun = (data:Menu.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/menu`,
    isHideLoading: true,
    types:"json",
    data
  });
};

// 根据角色ID查询菜单下拉树结构
export const roleMenuTreeselect = (roleId:string) => {
  return http.request({
    method: "get",
    url: PORT1 + `/menu/roleMenuTreeselect/` + roleId,
    isHideLoading: true
  });
};
