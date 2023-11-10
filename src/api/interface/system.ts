// 菜单模块
export namespace Menu {
  // 请求参数
  export interface ReqParams {
    status: number | string;
    menuName: string;
  }
  // 返回参数
  export interface ResMenuList {
    menuId: number;
    menuName: string;
    perms: string;
    orderTag: number;
    parentId?: number;
    component: string;
    hasChildren?: boolean;
    status: number | string;
    addTime?: string;
    children?: ResMenuList[];
  }
  export interface RuleForm {
    menuId: number,
    parentId?: number,
    menuName: string,
    icon: string,
    menuType: string,
    path: string,
    orderTag: string,
    isFrame: string,
    isCache: string,
    visible: string,
    status: string,
  }
}

// 用户模块
export namespace User {
  // 请求参数
  export interface ReqParams {
    username?: string | undefined,
    phone?: string | undefined,
    status?: number | undefined
    deptId?: number | undefined,
    pageNum: number;
    pageSize: number;
  }
  // 返回参数
  export interface ResUserList {
    userId: number;
    username: string;
  }
  export interface RuleForm {
    userId?: string,
    nickName: string,
    deptId?: number,
    phone: string,
    email: string,
    username: string,
    password: string,
    sex?: string,
    status: string,
    postIds?: string[],
    roleIds?: string[],
  }
}

// 部门模块
export namespace Dept {
  // 请求参数
  export interface ReqParams {
    username?: string | undefined,
    phone?: string | undefined,
    status?: number | undefined
    deptId?: number | undefined,
    pageNum: number;
    pageSize: number;
  }
  // 部门树状
  export interface treeData {
    id: number;
    label:string;
    children?:treeData[]
  }
  // 返回参数
  export interface ResUserList {
    userId: number;
    username: string;
  }
  export interface RuleForm {
    userId?: string,
    nickName: string,
    deptId?: number | undefined,
    phone: string,
    email: string,
    username: string,
    password: string,
    sex?: string,
    status: string,
    postIds?: string[],
    roleIds?: string[],
  }
}
