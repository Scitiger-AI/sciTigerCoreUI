// API基础URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

// WebSocket基础URL
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://127.0.0.1:8081';

// API端点
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/api/management/auth/login/',
    LOGOUT: '/api/management/auth/logout/',
    REFRESH_TOKEN: '/api/management/auth/refresh-token/',
    PROFILE: '/api/management/auth/profile/',
  },
  // 用户相关
  USER: {
    INFO: '/api/management/auth/profile/',
    LIST: '/api/management/auth/users/',
    DETAIL: (userId: number | string) => `/api/management/auth/users/${userId}/`,
    UPDATE: (userId: number | string) => `/api/management/auth/users/${userId}/`,
    SETTINGS: '/api/management/auth/settings/',
    UPDATE_SETTINGS: '/api/management/auth/settings/',
    BULK_ACTIVATE: '/api/management/auth/users/bulk_activate/',
    BULK_DEACTIVATE: '/api/management/auth/users/bulk_deactivate/',
    RESET_PASSWORD: (userId: number | string) => `/api/management/auth/users/${userId}/reset_password/`,
    ACTIVATE: (userId: number | string) => `/api/management/auth/users/${userId}/activate/`,
    DEACTIVATE: (userId: number | string) => `/api/management/auth/users/${userId}/deactivate/`,
    VERIFY_EMAIL: (userId: number | string) => `/api/management/auth/users/${userId}/verify_email/`,
  },
  // 角色相关
  ROLE: {
    LIST: '/api/management/auth/roles/',
    DETAIL: (roleId: string) => `/api/management/auth/roles/${roleId}/`,
    CREATE: '/api/management/auth/roles/',
    UPDATE: (roleId: string) => `/api/management/auth/roles/${roleId}/`,
    DELETE: (roleId: string) => `/api/management/auth/roles/${roleId}/`,
    USERS: (roleId: string) => `/api/management/auth/roles/${roleId}/users/`,
    ASSIGN_PERMISSIONS: (roleId: string) => `/api/management/auth/roles/${roleId}/assign_permissions/`,
    REMOVE_PERMISSIONS: (roleId: string) => `/api/management/auth/roles/${roleId}/remove_permissions/`,
    SET_DEFAULT: (roleId: string) => `/api/management/auth/roles/${roleId}/set_default/`,
    UNSET_DEFAULT: (roleId: string) => `/api/management/auth/roles/${roleId}/unset_default/`,
  },
  // 权限相关
  PERMISSION: {
    LIST: '/api/management/auth/permissions/',
    DETAIL: (permissionId: string) => `/api/management/auth/permissions/${permissionId}/`,
    CREATE: '/api/management/auth/permissions/',
    UPDATE: (permissionId: string) => `/api/management/auth/permissions/${permissionId}/`,
    DELETE: (permissionId: string) => `/api/management/auth/permissions/${permissionId}/`,
    IMPORT_DEFAULT: '/api/management/auth/permissions/import_default/',
  },
  // API密钥相关
  API_KEY: {
    LIST: '/api/management/auth/api-keys/',
    DETAIL: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/`,
    CREATE_SYSTEM_KEY: '/api/management/auth/api-keys/create_system_key/',
    CREATE_USER_KEY: '/api/management/auth/api-keys/create_user_key/',
    UPDATE: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/`,
    DELETE: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/`,
    ACTIVATE: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/activate/`,
    DEACTIVATE: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/deactivate/`,
    USAGE_LOGS: (apiKeyId: string) => `/api/management/auth/api-keys/${apiKeyId}/usage_logs/`,
    STATS: '/api/management/auth/api-keys/stats/',
    GET_KEY_HASH: '/api/management/auth/api-keys/get_key_hash/',
  },
  // 服务作用域相关
  SERVICE_SCOPE: {
    SERVICES: '/api/management/auth/service-scopes/services/',
    RESOURCES: '/api/management/auth/service-scopes/resources/',
    ACTIONS: '/api/management/auth/service-scopes/actions/',
    ALL: '/api/management/auth/service-scopes/all/',
  },
  // 服务管理
  SERVICE: {
    LIST: '/api/management/auth/services/',
    DETAIL: (serviceId: string) => `/api/management/auth/services/${serviceId}/`,
    CREATE: '/api/management/auth/services/',
    UPDATE: (serviceId: string) => `/api/management/auth/services/${serviceId}/`,
    DELETE: (serviceId: string) => `/api/management/auth/services/${serviceId}/`,
    IMPORT_DEFAULT: '/api/management/auth/services/import_default/',
  },
  // 资源管理
  RESOURCE: {
    LIST: '/api/management/auth/resources/',
    DETAIL: (resourceId: string) => `/api/management/auth/resources/${resourceId}/`,
    CREATE: '/api/management/auth/resources/',
    UPDATE: (resourceId: string) => `/api/management/auth/resources/${resourceId}/`,
    DELETE: (resourceId: string) => `/api/management/auth/resources/${resourceId}/`,
    BY_SERVICE: '/api/management/auth/resources/by_service/',
  },
  // 操作管理
  ACTION: {
    LIST: '/api/management/auth/actions/',
    DETAIL: (actionId: string) => `/api/management/auth/actions/${actionId}/`,
    CREATE: '/api/management/auth/actions/',
    UPDATE: (actionId: string) => `/api/management/auth/actions/${actionId}/`,
    DELETE: (actionId: string) => `/api/management/auth/actions/${actionId}/`,
  },
  // 租户相关
  TENANT: {
    LIST: '/api/management/tenants/tenants/',
    DETAIL: (tenantId: string) => `/api/management/tenants/tenants/${tenantId}/`,
    CREATE: '/api/management/tenants/tenants/',
    UPDATE: (tenantId: string) => `/api/management/tenants/tenants/${tenantId}/`,
    DELETE: (tenantId: string) => `/api/management/tenants/tenants/${tenantId}/`,
  },
  // 租户用户关联
  TENANT_USER: {
    LIST: '/api/management/tenants/tenant-users/',
    DETAIL: (tenantUserId: string) => `/api/management/tenants/tenant-users/${tenantUserId}/`,
    CREATE: '/api/management/tenants/tenant-users/',
    UPDATE: (tenantUserId: string) => `/api/management/tenants/tenant-users/${tenantUserId}/`,
    DELETE: (tenantUserId: string) => `/api/management/tenants/tenant-users/${tenantUserId}/`,
    BY_TENANT: (tenantId: string) => `/api/management/tenants/tenant-users/?tenant_id=${tenantId}`,
  },
  // 租户配额
  TENANT_QUOTA: {
    LIST: '/api/management/tenants/tenant-quotas/',
    DETAIL: (quotaId: string) => `/api/management/tenants/tenant-quotas/${quotaId}/`,
    BY_TENANT: '/api/management/tenants/tenant-quotas/by_tenant/',
    UPDATE: (quotaId: string) => `/api/management/tenants/tenant-quotas/${quotaId}/`,
    RESET_API_CALLS: (quotaId: string) => `/api/management/tenants/tenant-quotas/${quotaId}/reset_api_calls/`,
  },
  // 租户设置
  TENANT_SETTINGS: {
    LIST: '/api/management/tenants/tenant-settings/',
    DETAIL: (settingsId: string) => `/api/management/tenants/tenant-settings/${settingsId}/`,
    BY_TENANT: '/api/management/tenants/tenant-settings/by_tenant/',
    UPDATE: (settingsId: string) => `/api/management/tenants/tenant-settings/${settingsId}/`,
  },
};

// WebSocket端点
export const WS_ENDPOINTS = {
};

// 本地存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'scitiger_access_token',
  REFRESH_TOKEN: 'scitiger_refresh_token',
  USER_INFO: 'scitiger_user_info',
  SESSION_ID: 'scitiger_session_id',
}; 