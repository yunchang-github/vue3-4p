import { useAuthStore } from "@/stores/modules/auth";

function authPermission(permission: string): boolean {
  const authStore = useAuthStore();
  const all_permission = "*:*:*";
  const permissions = authStore?.authButtonListGet;
  if (permission && permission.length > 0) {
    return permissions.some(v => {
      return all_permission === v || v === permission
    })
  } else {
    return false
  }
}

function authRole(role: string): boolean {
  const authStore = useAuthStore();
  const super_admin = "admin";
  const roles = authStore?.roles || []
  if (role && role.length > 0) {
    return roles.some(v => {
      return super_admin === v || v === role
    })
  } else {
    return false
  }
}

function hasPermi(permission: string): boolean {
  return authPermission(permission);
}

function hasPermiOr<T>(permissions: T[]): boolean {
  return permissions.some(item => {
    return authPermission(item)
  })
}

function hasPermiAnd(permissions: string[]): boolean {
  return permissions.every(item => {
    return authPermission(item)
  })
}

function hasRole(role: string): boolean {
  return authRole(role);
}

function hasRoleOr<T>(roles: T[]): boolean {
  return roles.some(item => {
    return authRole(item)
  })
}

function hasRoleAnd(roles: string[]): boolean {
  return roles.every(item => {
    return authRole(item)
  })
}

export default {
  hasPermi,
  hasPermiOr,
  hasPermiAnd,
  hasRole,
  hasRoleOr,
  hasRoleAnd
}