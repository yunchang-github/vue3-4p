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
