import { PORT1 } from "@/api/config/servicePort";
import { ResPage,ReqPage } from "@/api/interface/index";
import http from "@/api";
import { User } from "@/api/interface/system";
/**
 * @name 用户模块
 */
function parseStrEmpty(str:any) {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
export const getUserList = (params: ReqPage & User.ReqParams) => {
  return http.request<ResPage<User.ResUserList>>({
    method: "get",
    url: PORT1 + `/user/list`,
    isHideLoading: true,
    params
  });
};
// 查询用户详细
export const getUser = (userId:any) => {
  return http.request({
    method: "get",
    url: PORT1 + `/user/`+parseStrEmpty(userId),
    isHideLoading: true,
  });
};
// 用户状态修改
export const changeUserStatus=(userId:string, status:string) =>{
  const data = {
    userId,
    status
  }
  return http.request({
    url: PORT1 + '/user/changeStatus',
    method: 'put',
    data
  })
}
// 用户密码重置
export const resetUserPwd=(userId:string | undefined, password:string)=> {
  const data = {
    userId,
    password
  }
  return http.request({
    url:  PORT1 + '/user/resetPwd',
    method: 'put',
    data
  })
}
// 新增用户
export const addFun = (data:User.RuleForm) => {
  return http.request({
    method: "post",
    url: PORT1 + `/user`,
    isHideLoading: true,
    types:"json",
    data
  });
};
// 修改用户
export function editFun(data:User.RuleForm) {
  return http.request({
    method: "put",
    url: PORT1 + `/user`,
    isHideLoading: true,
    types:"json",
    data
  });
}
// 删除
export function delUser(userId:any) {
  return http.request({
    method: "delete",
    url: PORT1 + `/user/`+userId,
  });
}

// 导出
export const exportUserInfo = (fileName:string) => {
  return http.request({
    url: PORT1 +"/user/export",
    method: "post",
    fileName,
    // params,
    responseType: "blob",
    // data
  });
};

// 导入
export const BatchAddUser = (data: FormData) => {
  return http.request({
    url: PORT1 +"/user/import",
    method: "post",
    types:"file",
    data
  });
};