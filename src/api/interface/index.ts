// 请求响应参数（不包含data）
export interface Result {
  code: string;
  msg: string;
}
// 请求响应参数（包含data）
export interface ResultData<T = any> extends Result {
  total?: number;
  list?: any[];
  data: T;
}

// 分页响应参数
export interface ResPage<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
}

// 分页请求参数
export interface ReqPage {
  pageNum: number;
  pageSize: number;
}

// 文件上传模块
export namespace Upload {
  export interface ResFileUrl {
    fileUrl: string;
  }
}

// 登录模块
export namespace Login {
  export interface ReqLoginForm {
    username: string;
    password: string;
    imageCode?: string;
    rememberMe?: boolean;
  }
  export interface ResLogin {
    accessToken: string;
    // refresh_token:string;
    // realName:string;
    expiredIn:number;
  }
  export interface AuthButtonList {
    permissions: string[];
    roles:string[] | null;
    user:{
      avatar:string,
      username:string,
      companyId:string
    }
  }
  // 注册
  export interface registerFrom {
    username: string;
    password: string;
    confirmPassword?:string;
    imageCode?:string;
  }
  export interface ResAuthButtons {
    [key: string]: string[];
  }
}
