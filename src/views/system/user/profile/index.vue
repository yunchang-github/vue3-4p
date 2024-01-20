<template>
  <div class="profile">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="list-avatar">头像</div>
          <div v-for="item in userInfo" :key="item.icon" class="list-group">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            {{ item.label }}
            <div class="pull-right">{{ item.value }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-tabs v-model="activeTab" class="demo-tabs">
          <el-tab-pane label="基本资料" name="userinfo">基本资料</el-tab-pane>
          <el-tab-pane label="修改密码" name="resetPwd">修改密码</el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup name="profile">
import { ref, reactive, onMounted } from 'vue'
import { getUserProfile } from '@/api/modules/system/user'
const activeTab = ref('userinfo')
let userInfo = reactive([
  { icon: 'Avatar', label: '用户名称', prop: 'username', value: '' },
  { icon: 'Iphone', label: '手机号码', prop: 'phone', value: '' },
  { icon: 'Message', label: '用户邮箱', prop: 'email', value: '' },
  { icon: 'Postcard', label: '所属部门', prop: 'deptName', value: '' },
  { icon: 'Paperclip', label: '所属角色', prop: 'roleGroup', value: '' },
  { icon: 'Calendar', label: '创建日期', prop: 'addTime', value: '' }
])
onMounted(() => {
  // 获取用户信息
  getUserProfile().then((res) => {
    let { data } = res
    userInfo.forEach((opt) => {
      if (opt.prop == 'deptName') {
        opt.value = data.roleGroup
      } else if (opt.prop == 'roleGroup') {
        opt.value = data.user.dept.deptName + '/' + data.postGroup
      } else {
        opt.value = data.user[opt.prop]
      }
    })
    // 单独处理部门和角色
  })
})
</script>

<style lang="scss" scoped>
.profile {
  .list-avatar {
    text-align: center;
    border-bottom: 1px solid #eee;
  }
  .list-group {
    border-bottom: 1px solid #eee;
    padding: 4px 0;
    font-size: 14px;
  }
  .pull-right {
    float: right;
  }
}
</style>