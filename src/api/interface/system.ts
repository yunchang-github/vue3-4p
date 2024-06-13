export interface ObjectLimit {
  [key: string]: string[];
}
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
    menuId: number;
    parentId?: number;
    menuName: string;
    icon: string;
    menuType: string;
    path: string;
    orderTag: string;
    isFrame: string;
    isCache: string;
    visible: string;
    status: string;
  }
}

// 用户模块
export namespace User {
  // 请求参数
  export interface ReqParams {
    username?: string | undefined;
    phone?: string | undefined;
    status?: number | undefined
    deptId?: number | undefined;
    pageNum: number;
    pageSize: number;
  }
  // 返回参数
  export interface ResUserList {
    userId: number;
    username: string;
  }
  // 返回参数
  export interface authRoleList {
    userId: string;
    username: string;
    nickName: string;
  }
  export interface RuleForm {
    userId?: string;
    nickName: string;
    deptId?: number;
    phone: string;
    email: string;
    username: string;
    password: string;
    sex?: string;
    status: string;
    postIds?: string[];
    roleIds?: string[];
  }
}

// 部门模块
export namespace Dept {
  // 请求参数
  export interface ReqParams {
    deptName?: string | undefined;
    status?: number | undefined
  }
  // 部门树状
  export interface treeData {
    id: number;
    label: string;
    children?: treeData[]
  }
  // 返回参数
  export interface ResUserList {
    userId: number;
    username: string;
  }
  export interface ResDeptList {
    deptId: number;
    deptName: string;
    companyId: string;
    parentId: number;
    hasChildren?: boolean;
    status: number | string;
    orderTag?: number;
    addTime?: string;
    children?: ResDeptList[];
  }
  export interface RuleForm {
    deptName: string;
    deptId: number | undefined;
    parentId: number | undefined;
    status: string;
    orderTag?: string;
    leader: string;
    phone: string;
    email: string;
  }
}

// 角色模块
export namespace Role {
  // 请求参数
  export interface ReqParams {
    roleName?: string | undefined;
    roleKey?: string | undefined;
    status?: number | undefined;
    params?: ObjectLimit | undefined;
    pageNum: number;
    pageSize: number;
  }
  // 树状
  export interface treeData {
    id: number;
    label: string;
    children?: treeData[]
  }
  // 新增编辑数据
  export interface RuleForm {
    roleName: string;
    roleKey: string;
    orderTag: number;
    status: string;
    remarks: string;
    dataScope?: string;
    menuIds?: string[];
    deptIds?: string[];
    menuCheckStrictly?: boolean;
    deptCheckStrictly?: boolean;
    companyId?: string;
  }
  export interface ResRoleList {
    roleId: number;
    roleName: string;
    roleKey: undefined | string;
    orderTag: number;
    status: string;
    dataScope?: string;
    menuIds?: string[];
    deptIds?: string[];
    menuCheckStrictly?: boolean;
    deptCheckStrictly?: boolean;
    remarks: string;
  }
  export interface roleAuth {
    roleId: string,
    username: string,
    phone: string
  }
}

// 岗位模块
export namespace Post {
  // 请求参数
  export interface ReqParams {
    postCode?: string | undefined;
    postName?: string | undefined;
    status?: number | undefined;
    pageNum: number;
    pageSize: number;
  }
  export interface RuleForm {
    postId?: string;
    postCode?: string;
    postName: string;
    orderTag: number | string;
    addTime?: string;
    status: string;
    remarks?: string;
    companyId?: string | number
  }
}
// 操作日志
export namespace Operlog {
  // 请求参数
  export interface ReqParams {
    title?: string | undefined;
    operName?: string | undefined;
    businessType?: number | undefined;
    status?: string | undefined;
    pageNum: number;
    pageSize: number;
  }
  export interface RuleForm {
    operId?: number;
    title?: string;
    operName: string;
    requestMethod?: string;
    operIp?: string;
    businessType: number | string;
    status: string | number;
    operatorType?: number;
  }
}
