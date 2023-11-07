<template>
  <div>
      dataSource
    <el-button v-auth="'system:user:add'" type="primary"> 新增 </el-button>
    <!-- 权限是 && 关系 -->
  <el-button v-auth="['system:user:add', 'system:user:edit']" type="primary"> 新增1 </el-button>
  </div>
</template>

<script setup lang="ts" name="dataSource"></script>