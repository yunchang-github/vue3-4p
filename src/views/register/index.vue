<template>
  <div class="register">
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      class="register-form"
      :size="formSize"
      status-icon
    >
      <h3 class="title">后台管理系统Vue3</h3>
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          auto-complete="off"
          placeholder="账号"
          @blur="checkUserNameFun"
        >
          <template #prefix>
            <el-icon class="el-input__icon"><user /></el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          auto-complete="off"
          v-model="registerForm.password"
          show-password
          placeholder="密码"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          type="password"
          auto-complete="off"
          v-model="registerForm.confirmPassword"
          show-password
          placeholder="确认密码"
        >
          <template #prefix>
            <el-icon class="el-input__icon">
              <lock />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          round
          style="width: 100%"
          @click.prevent="handleRegister(registerFormRef)"
        >
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
      </el-form-item>
      <div style="float: right">
        <router-link class="link-type" to="/login">使用已有账户登录</router-link>
      </div>
    </el-form>
  </div>
</template>
<script lang="ts" setup>
import { register,checkUserName } from '@/api/modules/login'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
// 接口类型
import { Login } from "@/api/interface/index";
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
// 加密
import { encrypt } from "@/utils/jsencrypt";
const router = useRouter()

const formSize = ref('large')
const loading = ref(false)
const registerFormRef = ref<FormInstance>()
const registerForm = reactive<Login.registerFrom>({
  username: '',
  password: '',
  confirmPassword: ''
})
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入您的密码!'))
  } else {
    if (registerForm.confirmPassword !== '') {
      if (!registerFormRef.value) return
      registerFormRef.value.validateField('confirmPassword', () => null)
    }
    callback()
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入您的密码!'))
  } else if (value !== registerForm.password) {
    callback(new Error("2次密码不一致,请重新输入!"))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules<Login.registerFrom>>({
  username: [{ required: true, trigger: 'blur', message: '请输入您的账号!' }],
  password: [
    { validator: validatePass, trigger: 'blur' },
    {
      min: 5,
      max: 20,
      message: '用户密码长度必须介于 5 和 20 之间!',
      trigger: 'blur'
    }
  ],
  confirmPassword: [{ validator: validatePass2, trigger: 'blur' }]
})
// 查重
const checkUserNameFun = async () => {
  if(registerForm.username){
    await checkUserName(registerForm.username)
  }
}
const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (!valid) return
    // 处理注册接口
    loading.value = true
    try {
      const _data={
        username:registerForm.username,
        password: String(encrypt(registerForm.password))
      }
      await register(_data)
      ElMessage.success("注册成功");
      router.push("/login");
    } finally {
      loading.value = false
    }
  })
}
onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    e = (window.event as KeyboardEvent) || e
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value) return
      handleRegister(registerFormRef.value)
    }
  }
})
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('@/assets/images/login-background.jpg');
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}
.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 420px;
  padding: 30px;
  box-sizing: border-box;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
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
</style>
