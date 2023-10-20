// 因为返回值的类型限定 数据统一返回data这一层 需要的数据可以解构出来

// url: PORT1 +'/pc/shop/shop/getPageList', // POST1  POST2前缀
// method: 'get',//  get/post/delete/put
// isHideLoading:true, // 去掉全屏loading
// params: query,,// 批量查询数据量很大的情况下 建议使用POST请求  get参数限制问题
// timeout:180000,// 限制超时 单位毫秒
// isNeedToken:false,// 是否需要token 默认需要登录注册的不要
// 类型限制
// types:"json", // json格式数据   types:"file" 文件上传
// 下载中的参数
// responseType: "blob",// 类型
// fileName: "文件模板.xlsx", // 文件名


// 获取列表 需要分页的加 ReqPage ResPage
// export const getMenuList = (params: ReqPage & Menu.ReqParams) => {
//   return http.request<ResPage<Menu.ResMenuList[]>>({
//     method: "get",
//     url: PORT1 + `/menu/list`,
//     isHideLoading: true,
//     params
//   });
// };