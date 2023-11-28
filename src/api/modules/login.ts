import { Login } from "@/api/interface/index";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";
/**
 * @name 登录模块
 */
// 用户登录
export const loginApi = (data: Login.ReqLoginForm,deviceId:string) => {
  return http.request<Login.ResLogin>({
    url: PORT1 + `/authentication/form`,
    method: "post",
    params:data,
    isCancelUseToken:true,
    isShowGlobelLoading:true,
    headers: {
      deviceId,
      Authorization: "Basic eWM6c2VjcmV0"
    }
  });
};
// 注册方法
export const register = (data: Login.registerFrom) => {
  return http.request<Login.ResLogin>({
    url: PORT1 + "/system/register",
    isCancelUseToken:true,
    isShowGlobelLoading:true,
    method: 'post',
    data
  })
}
//校验用户名是否已经注册过
export const checkUserName = (name:string) => {
  return http.request({
    method: "get",
    url: PORT1 + `/system/checkUserName`,
    params: {name}
  });
};
// 获取按钮权限
export const getAuthButtonListApi = () => {
  return http.request<Login.AuthButtonList>({
    method: "get",
    url: PORT1 + `/system/selInfo`,
  });
};

// 获取菜单列表
export const getAuthMenuListApi = (domain:string) => {
  return http.request<Menu.MenuOptionsOld[]>({
    method: "get",
    url: PORT1 + `/system/selRouters`,
    params: {domain}
  });
};

// 获取验证码
export const getCodeImg = (deviceId:string) => {
  return http.request({
    method: "get",
    url: PORT1 + `/code/image`,
    timeout: 20000,
    headers: {
      deviceId,
    },
    isCancelUseToken:true,
    responseType: 'blob',
    isNotDownFile:true
  });
};