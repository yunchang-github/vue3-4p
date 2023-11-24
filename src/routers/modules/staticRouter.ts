import { RouteRecordRaw } from "vue-router";
import { HOME_URL, LOGIN_URL } from "@/config";

/**
 * staticRouter (静态路由)
 */
export const staticRouter: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: HOME_URL
  },
  {
    path: LOGIN_URL,
    name: "login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录"
    }
  },
  {
    path: '/register',
    name:"register",
    component: () => import('@/views/register/index.vue'),
    meta: {
      title: "注册"
    }
  },
  {
    path: "/layout",
    name: "layout",
    component: () => import("@/layouts/index.vue"),
    // component: () => import("@/layouts/indexAsync.vue"),
    redirect: HOME_URL,
    children: []
  }
];
// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/system/user-auth',
    component: () => import("@/layouts/index.vue"),
    hidden: true,
    permissions: ['system:user:edit'],
    children: [
      {
        path: 'role/:userId(\\d+)',
        component: () => import('@/views/system/user/authRole'),
        name: 'AuthRole',
        meta: { title: '分配角色', activeMenu: '/system/user' }
      }
    ]
  },
  // {
  //   path: '/system/role-auth',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['system:role:edit'],
  //   children: [
  //     {
  //       path: 'user/:roleId(\\d+)',
  //       component: () => import('@/views/system/role/authUser'),
  //       name: 'AuthUser',
  //       meta: { title: '分配用户', activeMenu: '/system/role' }
  //     }
  //   ]
  // },
  // {
  //   path: '/system/dict-data',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['system:dict:list'],
  //   children: [
  //     {
  //       path: 'index/:dictId(\\d+)',
  //       component: () => import('@/views/system/dict/data'),
  //       name: 'Data',
  //       meta: { title: '字典数据', activeMenu: '/system/dict' }
  //     }
  //   ]
  // },
  // // 透明标签退回审核  
  // {
  //   path: '/otherFunctions/transparentLabels-examine',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['otherFunctions:transparentLabels:list'],
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/otherFunctions/transparentLabels/labelBackExamine'),
  //       name: 'LabelBackExamine',
  //       meta: { title: '透明标签退回审核', activeMenu: '/otherFunctions/transparentLabels' }
  //     }
  //   ]
  // },
  // {
  //   // 收货单明细
  //   path: '/receipt-data',
  //   component: Layout,
  //   hidden: true,
  //   permissions: ['enterWarehouse:receipt:detail'],
  //   children: [
  //     {
  //       path: 'detail',
  //       component: () => import('@/views/overseasWarehouse/enterWarehouse/receipt/detail'),
  //       name: 'bulkShipment',
  //       meta: { title: '收货', icon: '' }
  //     }
  //   ]
  // },
];
/**
 * errorRouter (错误页面路由)
 */
export const errorRouter = [
  {
    path: "/403",
    name: "403",
    component: () => import("@/components/ErrorMessage/403.vue"),
    meta: {
      title: "403页面"
    }
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/components/ErrorMessage/404.vue"),
    meta: {
      title: "404页面"
    }
  },
  {
    path: "/500",
    name: "500",
    component: () => import("@/components/ErrorMessage/500.vue"),
    meta: {
      title: "500页面"
    }
  },
  // Resolve refresh page, route warnings
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/ErrorMessage/404.vue")
  }
];
