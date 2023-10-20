<template>
  <div class="login">
    <div class="login-ruleForm">
      <h2 style="text-align: center; margin: 20px 0">后台管理系统vue3</h2>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" :size="formSize" status-icon>
        <el-form-item prop="username">
          <el-input v-model="ruleForm.username" placeholder="账号">
            <template #prefix>
              <el-icon class="el-input__icon"><user /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="ruleForm.password" show-password placeholder="密码">
            <template #prefix>
              <el-icon class="el-input__icon">
                <lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="imageCode" v-if="captchaOnOff">
          <el-input
            v-model="ruleForm.imageCode"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
          >
            <template #prefix>
              <i class="el-icon el-input__icon">
                <SvgIcon name="validCode" style="height: 14px" />
              </i>
            </template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" @click="getCode" class="login-code-img" />
          </div>
        </el-form-item>
        <div style="height:28px;margin-top:-10px;margin-bottom:10px;">
          <el-checkbox v-model="ruleForm.rememberMe">记住密码</el-checkbox>
        </div>
        <div class="login-btn">
          <el-button :icon="CircleClose" round @click="resetForm(ruleFormRef)"> 重置 </el-button>
          <el-button
            :icon="UserFilled"
            round
            type="primary"
            @click="submitForm(ruleFormRef)"
            :loading="loading"
          >
            <span v-if="!loading"> 登录 </span>
            <span v-else>登录中...</span>
          </el-button>
        </div>

        <div style="float: right; margin-top: 20px" v-if="register">
          <router-link class="link-type" to="/register">立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Cookies from 'js-cookie'
import { reactive, ref, onBeforeMount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HOME_URL } from '@/config'
// 加密
import { decrypt, encrypt } from '@/utils/jsencrypt'
// 接口类型
import { Login } from '@/api/interface/index'
import type { FormInstance, FormRules } from 'element-plus'
import { ElNotification } from 'element-plus'
import { CircleClose, UserFilled } from '@element-plus/icons-vue'
import { loginApi, getCodeImg } from '@/api/modules/login'
import { useUserStore } from '@/stores/modules/user'
import { useTabsStore } from '@/stores/modules/tabs'
import { initDynamicRouter } from '@/routers/modules/dynamicRouter'
import { getTimeState } from '@/utils'
import { useKeepAliveStore } from '@/stores/modules/keepAlive'
import SvgIcon from '@/components/SvgIcon/index.vue'

// 重定向的路径
const router = useRouter()
const route = useRoute()
const redirectPath = route.query.redirect

const userStore = useUserStore()
const tabsStore = useTabsStore()
const keepAliveStore = useKeepAliveStore()

const loading = ref(false)
// 显示注册
const register = ref(true)
const captchaOnOff = ref(true)
// 验证码路径
const codeUrl = ref('')
// 设备ID 唯一值而已
const deviceId = ref('')
// 表单
const formSize = ref('large')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<Login.ReqLoginForm>({
  username: '',
  password: '',
  imageCode: '',
  rememberMe: true
})

const rules = reactive<FormRules<Login.ReqLoginForm>>({
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号' }],
  password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
  imageCode: [{ required: true, trigger: 'change', message: '请输入验证码' }]
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return
    // 处理登录接口-->获取登录用户对应角色的菜单-->处理路由并跳转到首页
    loading.value = true
    try {
      // 处理记住密码
      if (ruleForm.rememberMe) {
        Cookies.set('username', ruleForm.username, { expires: 30 })
        Cookies.set('password', encrypt(ruleForm.password), {
          expires: 30
        })
        Cookies.set('rememberMe', ruleForm.rememberMe, {
          expires: 30
        })
      } else {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      // 1,登录
      const _data={
        username:ruleForm.username,
        password: encrypt(ruleForm.password) || '',
        imageCode:ruleForm.imageCode
      }
      const res = await loginApi(_data,deviceId.value)
      //2,保存请求回来的token和用户名
      userStore.setToken(`bearer ${res.access_token}`)
      let expiresIn = new Date(new Date().getTime() + res.expires_in * 1000);
      Cookies.set("admin-Token", res.access_token, {expires: expiresIn});
      Cookies.set("admin-Refresh-Token", res.refresh_token, {expires: new Date(new Date().getTime() + 600000 * 1000)});
      Cookies.set("admin-Expires-In", expiresIn, {expires: expiresIn});

      //3, 请求路由及添加动态路由
      await initDynamicRouter()

      //4, 清空 tabs、keepAlive 数据
      tabsStore.closeMultipleTab()
      keepAliveStore.setKeepAliveName()

      // 5, 跳转有重定向则跳转到对应的页面 没有的直接到首页
      if (redirectPath) {
        window.open(redirectPath, '_blank')
      } else {
        router.push(HOME_URL)
      }
      ElNotification({
        title: getTimeState(),
        message: '欢迎登录 云畅后台管理系统',
        type: 'success',
        duration: 3000
      })
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
// 更新验证码
const getCode = async () => {
  if (captchaOnOff.value) {
    let res = await getCodeImg(deviceId.value)
    let blob = new Blob([res]) // 返回的文件流数据
    codeUrl.value = window.URL.createObjectURL(blob) // 将他转化为路径
  }
}
const getCookie = () => {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  ruleForm.username = username === undefined ? ruleForm.username : username
  ruleForm.password = username === undefined ? ruleForm.password : decrypt(password) || ''
  ruleForm.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
}
onBeforeMount(() => {
  // 处理设备ID 唯一值
  if (!sessionStorage.getItem('deviceId')) {
    deviceId.value = String(Math.random())
    sessionStorage.setItem('deviceId', deviceId.value)
  } else {
    deviceId.value = sessionStorage.getItem('deviceId') || ''
  }
  getCookie()
  getCode()
})
onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    e = (window.event as KeyboardEvent) || e
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value) return
      submitForm(ruleFormRef.value)
    }
  }
})
</script>
<style lang="scss" scoped>
.login {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/images/login-background.jpg');
  background-size: cover;
  .login-ruleForm {
    position: absolute;
    width: 420px;
    padding: 30px;
    box-sizing: border-box;
    background-color: var(--el-bg-color);
    border-radius: 10px;
    box-shadow: rgb(0 0 0 / 10%) 0 2px 10px 2px;
    .login-code {
      width: 33%;
      float: right;
      img {
        cursor: pointer;
        vertical-align: middle;
      }
    }
    .link-type,
    .link-type:focus {
      color: #337ab7;
      cursor: pointer;

      &:hover {
        color: rgb(32, 160, 255);
      }
    }
  }
  .login-btn {
    text-align: center;
    .el-button {
      width: 165px;
    }
  }
}
</style>