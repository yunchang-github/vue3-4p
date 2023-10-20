<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.value)">
        <span
          v-if="item.type=='default'"
          :key="item.value"
          :index="index"
          :class="item.raw.cssClass"
          >{{ item.label }}</span
        >
        <el-tag
          v-else
          :disable-transitions="true"
          :key="item.value"
          :index="index"
          :type="item.type"
        >
          {{ item.label }}
        </el-tag>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts" name="DictTag">
import {computed } from "vue";
import { commonStatus } from "@/utils/serviceDict";
interface SelectDictTagProps {
  options: typeof commonStatus;
  value: string | number;
}

const props = withDefaults(defineProps<SelectDictTagProps>(), {
  options:()=>[],
  value: "",
});
const values = computed(() => {
  if (props.value !== null && typeof props.value !== 'undefined') {
      return Array.isArray(props.value) ? props.value : [String(props.value)];
    } else {
      return [];
    }
});
</script>
<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>