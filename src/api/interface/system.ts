// 菜单模块
export namespace Menu {
  // 请求参数
  export interface ReqParams {
    status: number | string;
    menuName:string;
  }
  // 返回参数
  export interface ResMenuList {
    menuId: number;
    menuName: string;
    perms:string;
    orderTag: number;
    parentId?: number;
    component:string;
    hasChildren?: boolean;
    status: number | string;
    addTime?:string;
    children?: ResMenuList[];
  }
  export interface RuleForm {
    menuId: number,
    parentId?: number,
    menuName: string,
    icon: string,
    menuType: string,
    path:string,
    orderTag: string,
    isFrame: string,
    isCache: string,
    visible: string,
    status: string,
}
}