import { createApp } from 'vue'

import App from './App.vue'
// reset style sheet
import "@/styles/reset.scss";
// CSS common style sheet
import "@/styles/common.scss";
// iconfont css
import "@/assets/iconfont/iconfont.scss";
// font css
import "@/assets/fonts/font.scss";
// custom directives
import directives from "@/directives/index";

import router from './routers'
// element plus
import ElementPlus from 'element-plus'

// element css
import "element-plus/dist/index.css";
// svg icons
import "virtual:svg-icons-register";
// element dark css
import "element-plus/theme-chalk/dark/css-vars.css";
// custom element dark css
import "@/styles/theme/element-dark.scss";
// custom element css
import "@/styles/element.scss";

import * as Icons from '@element-plus/icons-vue'

// vue i18n
import I18n from '@/languages/index'
// pinia store
import pinia from '@/stores'
// errorHandler
import errorHandler from '@/utils/errorHandler'
// 字典标签组件
import DictTag from '@/components/DictTag/index.vue'

const app = createApp(App)
// register the element Icons component
Object.keys(Icons).forEach(key => {
  app.component(key, Icons[key as keyof typeof Icons]);
});

app.component('DictTag', DictTag)

app.config.errorHandler = errorHandler;

app.use(ElementPlus).use(directives).use(router).use(I18n).use(pinia).mount("#app");
