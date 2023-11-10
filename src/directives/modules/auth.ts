/**
 * v-hasPermi
 * 按钮权限指令
 */
import { useAuthStore } from "@/stores/modules/auth";
import type { Directive, DirectiveBinding } from "vue";

const hasPermi: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding;
    const all_permission = "*:*:*";
    const authStore = useAuthStore();
    const permissions = authStore.authButtonListGet

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      const hasPermissions = permissions.some(permission => {
        return all_permission === permission || permissionFlag.includes(permission)
      })
      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`请设置操作权限标签值`)
    }
  }
};

export default hasPermi;
