import { defineStore } from "pinia";
// import auth from '@/plugins/auth'
import { AuthState } from "@/stores/interface";
import { getAuthButtonListApi, getAuthMenuListApi } from "@/api/modules/login";
import { getFlatMenuList, getShowMenuList, getAllBreadcrumbList, handleInitRoutes } from "@/utils";
// import { dynamicRoutes } from "@/routers/modules/staticRouter";

// 动态路由遍历，验证是否具备权限
// export function filterDynamicRoutes(routes) {
//   let res = []
//   routes.forEach(route => {
//     if (route.permissions) {
//       if (auth.hasPermiOr(route.permissions)) {
//         res.push(route)
//       }
//     } else if (route.roles) {
//       if (auth.hasRoleOr(route.roles)) {
//         res.push(route)
//       }
//     }
//   })
//   return res
// }
export const useAuthStore = defineStore({
  id: "4pbooks-auth",
  state: (): AuthState => ({
    // 刷新token
    refreshToken: "",
    // 过期时间
    expires_in: 0,
    // 头像
    avatar: "",
    // 角色
    roles: [],
    // 用户名
    userInfo: { name: "Geeker" },
    // 公司ID
    companyId: "",
    // 按钮权限列表
    authButtonList: [],
    // 菜单权限列表
    authMenuList: [],
    // 当前页面的 router name，用来做按钮权限筛选
    routeName: "",
  }),
  getters: {
    // 头像
    avatarGet: state => state.avatar,
    // 按钮权限列表
    authButtonListGet: state => state.authButtonList,
    // 菜单权限列表 ==> 这里的菜单没有经过任何处理
    authMenuListGet: state => state.authMenuList,
    // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHide == true
    showMenuListGet: state => getShowMenuList(state.authMenuList),
    // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
    flatMenuListGet: state => getFlatMenuList(state.authMenuList),
    // 递归处理后的所有面包屑导航列表
    breadcrumbListGet: state => getAllBreadcrumbList(state.authMenuList)
  },
  actions: {
    // Get AuthButtonList
    async getAuthButtonList() {
      const { data } = await getAuthButtonListApi();
      const avatarUrl = data.user.avatar;
      this.authButtonList = data.permissions;
      if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
        this.roles = data.roles
        this.authButtonList = data.permissions
      } else {
        this.roles = ['ROLE_DEFAULT']
      }
      this.companyId = data.user.companyId
      this.userInfo.name = data.user.username
      this.avatar = avatarUrl
    },
    // Get AuthMenuList
    async getAuthMenuList() {
      import.meta.env.VITE_API_URL as string
      const { data } = await getAuthMenuListApi(import.meta.env.VITE_APP_ISWMS as string);
      // 处理成当前框架需要的数据
      let tempData=handleInitRoutes(data);
      // 目前只处理2层
      tempData.forEach(opt=>{
        delete opt.parentPath;
        if(opt.children){
          delete opt.component;
          opt.redirect=opt.children[0].path
          opt.children.forEach(innerItem=>{
            delete opt.parentPath;
            if(innerItem.children){
              delete innerItem.component;
              innerItem.redirect=innerItem.children[0].path
            }
          })
        }
      })
      // 处理权限详情页面
      // const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
      // console.log('动态菜单',asyncRoutes)
      this.authMenuList = tempData
    },
    // Set RouteName
    async setRouteName(name: string) {
      this.routeName = name;
    },
  }
});
