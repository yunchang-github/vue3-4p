import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { showFullScreenLoading, tryHideFullScreenLoading } from "@/config/serviceLoading";
import { LOGIN_URL } from "@/config";
import { ElMessage } from "element-plus";
import { ResultData } from "@/api/interface";
import { ResultEnum,ContentTypeEnum } from "@/enums/httpEnum";
import { checkStatus } from "./helper/checkStatus";
import { useUserStore } from "@/stores/modules/user";
import router from "@/routers";
import qs from "qs";

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isShowGlobelLoading?: boolean;
}

function tansParams(params: any) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    let part = encodeURIComponent(propName) + "=";
    if (value !== null && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== "undefined") {
            let params = propName + "[" + key + "]";
            let subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result;
}

const config = {
  // 默认地址请求地址，可在 .env.** 文件中修改
  baseURL: import.meta.env.VITE_API_URL as string,
  // 设置超时时间
  timeout: ResultEnum.TIMEOUT as number,
  // 跨域时候允许携带凭证
  withCredentials: true
};

class RequestHttp {
  service: AxiosInstance;
  public constructor(config: AxiosRequestConfig) {
    // instantiation
    this.service = axios.create(config);
    /**
     * @description 请求拦截器
     * 客户端发送请求 -> [请求拦截器] -> 服务器
     * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
     */
    this.service.interceptors.request.use(
      (config: CustomAxiosRequestConfig) => {
        const userStore = useUserStore();
        // 不加token的 注册 登录
        const isCancelUseToken=config?.isCancelUseToken ? true: false
        // 当前请求需要显示 loading，在 api 服务中通过指定的第三个参数: { isShowGlobelLoading: true } 来控制
        config.isShowGlobelLoading && showFullScreenLoading();
        // 处理需要请求的接口
        if (!isCancelUseToken) {
          config.headers.set("Authorization", userStore.token);
        }
        // 处理请求参数
        const { params, data, method } = config;
        if (params) {
          let url = config.url + "?" + tansParams(params);
          url = url.slice(0, -1);
          config.params = {};
          config.url = url;
        }
        // 处理参数 json的
        if (config?.types == "json") {
          config["data"] = JSON.stringify(data);
          config.headers["Content-Type"] = ContentTypeEnum.JSON;
        } else {
          // 非文件的
          if ((method === "post" || method === "POST") && config?.types !== "file") {
            config["data"] = qs.stringify(data, { indices: false });
          }
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    /**
     * @description 响应拦截器
     *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
     */
    this.service.interceptors.response.use(
      (response: AxiosResponse) => {
        const { data } = response;
        const userStore = useUserStore();
        tryHideFullScreenLoading();
        // 登陆失效
        if (data.code == ResultEnum.OVERDUE) {
          userStore.setToken("");
          let path = window.location.href;
          if (path.indexOf("login") !== -1) {
            router.replace(LOGIN_URL);
          } else {
            location.href = `/login?redirect=${path}`;
          }
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }
        // 处理文件下载
        if (response.config?.responseType == "blob") {
          // 返回流
          if(response.config?.isNotDownFile){
            return response.data;
          }else{
            // 文件下载
            let downFileName = response.config?.fileName || "新建文件";
            let tempStr = response.headers["content-disposition"];
            if (!response.config?.fileName && tempStr) {
              downFileName = decodeURIComponent(tempStr);
            }
            let blob = new Blob([response.data], { type: "application/msexcel;charset=utf-8" });
            // 兼容ie11
            if (window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(blob, downFileName);
            } else {
              let downloadElement = document.createElement("a");
              //创建下载的链接
              let href = window.URL.createObjectURL(blob);
              downloadElement.href = href;
              //下载后文件名
              downloadElement.download = downFileName;
              document.body.appendChild(downloadElement);
              //点击下载
              downloadElement.click();
              //下载完成移除元素
              document.body.removeChild(downloadElement);
              //释放掉blob对象
              window.URL.revokeObjectURL(href);
            }
          }
        }
        // 全局错误信息拦截（防止下载文件的时候返回数据流，没有 code 直接报错）
        if (data.code && data.code !== ResultEnum.SUCCESS) {
          ElMessage.error(data.msg);
          return Promise.reject(data);
        }
        return data;
      },
      async (error: AxiosError) => {
        const { response } = error;
        tryHideFullScreenLoading();
        // 请求超时 && 网络错误单独判断，没有 response
        if (error.message.indexOf("timeout") !== -1) ElMessage.error("请求超时！请您稍后重试");
        if (error.message.indexOf("Network Error") !== -1) ElMessage.error("网络错误！请您稍后重试");
        // 根据服务器响应的错误状态码，做不同的处理
        if (response) checkStatus(response.status);
        // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
        if (!window.navigator.onLine) router.replace("/500");
        return Promise.reject(error);
      }
    );
  }

  /**
   * @description 常用请求方法封装
   */
  request<T>(configInfo: object): Promise<ResultData<T>> {
    return this.service(configInfo);
  }
}

export default new RequestHttp(config);
