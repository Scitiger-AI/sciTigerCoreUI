"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { 
  Tenant, 
  TenantListResponse, 
  TenantDetailResponse, 
  CreateTenantParams, 
  UpdateTenantParams,
  TenantUser,
  TenantUserListResponse,
  TenantUserDetailResponse,
  CreateTenantUserParams,
  UpdateTenantUserParams,
  TenantQuota,
  TenantQuotaListResponse,
  TenantQuotaDetailResponse,
  UpdateTenantQuotaParams,
  TenantSettings,
  TenantSettingsListResponse,
  TenantSettingsDetailResponse,
  UpdateTenantSettingsParams
} from '@/types/tenant';

/**
 * 获取租户列表
 * @param params 查询参数
 * @returns 租户列表
 */
export const getTenants = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string[];
}): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: Tenant[];
}> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              queryParams.append(key, v);
            });
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.TENANT.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<TenantListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户列表失败');
    }
  } catch (error: any) {
    console.error('获取租户列表失败:', error);
    throw error;
  }
};

/**
 * 获取租户详情
 * @param tenantId 租户ID
 * @returns 租户详情
 */
export const getTenantDetail = async (tenantId: string): Promise<Tenant> => {
  try {
    const url = API_ENDPOINTS.TENANT.DETAIL(tenantId);
    const response = await http.get<TenantDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户详情失败');
    }
  } catch (error: any) {
    console.error('获取租户详情失败:', error);
    throw error;
  }
};

/**
 * 创建租户
 * @param data 租户数据
 * @returns 创建的租户
 */
export const createTenant = async (data: CreateTenantParams): Promise<Tenant> => {
  try {
    // 创建FormData对象用于文件上传
    const formData = new FormData();
    
    // 添加文本字段
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logo' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // 添加logo文件
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }
    
    const url = API_ENDPOINTS.TENANT.CREATE;
    const response = await http.post<ApiResponse<Tenant>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建租户失败');
    }
  } catch (error: any) {
    console.error('创建租户失败:', error);
    throw error;
  }
};

/**
 * 更新租户
 * @param tenantId 租户ID
 * @param data 更新的数据
 * @returns 更新后的租户
 */
export const updateTenant = async (tenantId: string, data: UpdateTenantParams): Promise<Tenant> => {
  try {
    // 创建FormData对象用于文件上传
    const formData = new FormData();
    
    // 添加文本字段
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'logo' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // 添加logo文件
    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }
    
    const url = API_ENDPOINTS.TENANT.UPDATE(tenantId);
    const response = await http.patch<ApiResponse<Tenant>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新租户失败');
    }
  } catch (error: any) {
    console.error('更新租户失败:', error);
    throw error;
  }
};

/**
 * 删除租户
 * @param tenantId 租户ID
 * @returns 是否成功
 */
export const deleteTenant = async (tenantId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.TENANT.DELETE(tenantId);
    const response = await http.delete<ApiResponse>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除租户失败');
    }
  } catch (error: any) {
    console.error('删除租户失败:', error);
    throw error;
  }
};

// ==================== 租户用户相关服务 ====================

/**
 * 获取租户用户列表
 * @param params 查询参数
 * @returns 租户用户列表
 */
export const getTenantUsers = async (params?: {
  page?: number;
  page_size?: number;
  tenant_id?: string;
}): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantUser[];
}> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.TENANT_USER.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<TenantUserListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户用户列表失败');
    }
  } catch (error: any) {
    console.error('获取租户用户列表失败:', error);
    throw error;
  }
};

/**
 * 获取特定租户的用户列表
 * @param tenantId 租户ID
 * @param params 查询参数
 * @returns 租户用户列表
 */
export const getTenantUsersByTenant = async (
  tenantId: string,
  params?: {
    page?: number;
    page_size?: number;
  }
): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantUser[];
}> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('tenant_id', tenantId);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.TENANT_USER.LIST}?${queryParams.toString()}`;
    const response = await http.get<TenantUserListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户用户列表失败');
    }
  } catch (error: any) {
    console.error('获取租户用户列表失败:', error);
    throw error;
  }
};

/**
 * 获取租户用户详情
 * @param tenantUserId 租户用户ID
 * @returns 租户用户详情
 */
export const getTenantUserDetail = async (tenantUserId: string): Promise<TenantUser> => {
  try {
    const url = API_ENDPOINTS.TENANT_USER.DETAIL(tenantUserId);
    const response = await http.get<TenantUserDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户用户详情失败');
    }
  } catch (error: any) {
    console.error('获取租户用户详情失败:', error);
    throw error;
  }
};

/**
 * 创建租户用户关联
 * @param data 租户用户数据
 * @returns 创建的租户用户关联
 */
export const createTenantUser = async (data: CreateTenantUserParams): Promise<TenantUser> => {
  try {
    const url = API_ENDPOINTS.TENANT_USER.CREATE;
    const response = await http.post<ApiResponse<TenantUser>>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建租户用户关联失败');
    }
  } catch (error: any) {
    console.error('创建租户用户关联失败:', error);
    throw error;
  }
};

/**
 * 更新租户用户关联
 * @param tenantUserId 租户用户ID
 * @param data 更新的数据
 * @returns 更新后的租户用户关联
 */
export const updateTenantUser = async (tenantUserId: string, data: UpdateTenantUserParams): Promise<TenantUser> => {
  try {
    const url = API_ENDPOINTS.TENANT_USER.UPDATE(tenantUserId);
    const response = await http.patch<ApiResponse<TenantUser>>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新租户用户关联失败');
    }
  } catch (error: any) {
    console.error('更新租户用户关联失败:', error);
    throw error;
  }
};

/**
 * 删除租户用户关联
 * @param tenantUserId 租户用户ID
 * @returns 是否成功
 */
export const deleteTenantUser = async (tenantUserId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.TENANT_USER.DELETE(tenantUserId);
    const response = await http.delete<ApiResponse>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除租户用户关联失败');
    }
  } catch (error: any) {
    console.error('删除租户用户关联失败:', error);
    throw error;
  }
};

// ==================== 租户配额相关服务 ====================

/**
 * 获取租户配额列表
 * @param params 查询参数
 * @returns 租户配额列表
 */
export const getTenantQuotas = async (params?: {
  page?: number;
  page_size?: number;
  tenant_id?: string;
}): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantQuota[];
}> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.TENANT_QUOTA.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<TenantQuotaListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户配额列表失败');
    }
  } catch (error: any) {
    console.error('获取租户配额列表失败:', error);
    throw error;
  }
};

/**
 * 获取租户配额详情
 * @param quotaId 配额ID
 * @returns 租户配额详情
 */
export const getTenantQuotaDetail = async (quotaId: string): Promise<TenantQuota> => {
  try {
    const url = API_ENDPOINTS.TENANT_QUOTA.DETAIL(quotaId);
    const response = await http.get<TenantQuotaDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户配额详情失败');
    }
  } catch (error: any) {
    console.error('获取租户配额详情失败:', error);
    throw error;
  }
};

/**
 * 根据租户ID获取配额
 * @param tenantId 租户ID
 * @returns 租户配额详情
 */
export const getTenantQuotaByTenant = async (tenantId: string): Promise<TenantQuota> => {
  try {
    const url = `${API_ENDPOINTS.TENANT_QUOTA.BY_TENANT}?tenant_id=${tenantId}`;
    const response = await http.get<TenantQuotaDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户配额详情失败');
    }
  } catch (error: any) {
    console.error('获取租户配额详情失败:', error);
    throw error;
  }
};

/**
 * 更新租户配额
 * @param quotaId 配额ID
 * @param data 更新的数据
 * @returns 更新后的租户配额
 */
export const updateTenantQuota = async (quotaId: string, data: UpdateTenantQuotaParams): Promise<TenantQuota> => {
  try {
    const url = API_ENDPOINTS.TENANT_QUOTA.UPDATE(quotaId);
    const response = await http.patch<ApiResponse<TenantQuota>>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新租户配额失败');
    }
  } catch (error: any) {
    console.error('更新租户配额失败:', error);
    throw error;
  }
};

/**
 * 重置API调用计数
 * @param quotaId 配额ID
 * @returns 更新后的租户配额
 */
export const resetTenantQuotaApiCalls = async (quotaId: string): Promise<TenantQuota> => {
  try {
    const url = API_ENDPOINTS.TENANT_QUOTA.RESET_API_CALLS(quotaId);
    const response = await http.post<ApiResponse<TenantQuota>>(url, {});
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '重置API调用计数失败');
    }
  } catch (error: any) {
    console.error('重置API调用计数失败:', error);
    throw error;
  }
};

// ==================== 租户设置相关服务 ====================

/**
 * 获取租户设置列表
 * @param params 查询参数
 * @returns 租户设置列表
 */
export const getTenantSettings = async (params?: {
  page?: number;
  page_size?: number;
  tenant_id?: string;
}): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantSettings[];
}> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.TENANT_SETTINGS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<TenantSettingsListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户设置列表失败');
    }
  } catch (error: any) {
    console.error('获取租户设置列表失败:', error);
    throw error;
  }
};

/**
 * 获取租户设置详情
 * @param settingsId 设置ID
 * @returns 租户设置详情
 */
export const getTenantSettingsDetail = async (settingsId: string): Promise<TenantSettings> => {
  try {
    const url = API_ENDPOINTS.TENANT_SETTINGS.DETAIL(settingsId);
    const response = await http.get<TenantSettingsDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户设置详情失败');
    }
  } catch (error: any) {
    console.error('获取租户设置详情失败:', error);
    throw error;
  }
};

/**
 * 根据租户ID获取设置
 * @param tenantId 租户ID
 * @returns 租户设置详情
 */
export const getTenantSettingsByTenant = async (tenantId: string): Promise<TenantSettings> => {
  try {
    const url = `${API_ENDPOINTS.TENANT_SETTINGS.BY_TENANT}?tenant_id=${tenantId}`;
    const response = await http.get<TenantSettingsDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取租户设置详情失败');
    }
  } catch (error: any) {
    console.error('获取租户设置详情失败:', error);
    throw error;
  }
};

/**
 * 更新租户设置
 * @param settingsId 设置ID
 * @param data 更新的数据
 * @returns 更新后的租户设置
 */
export const updateTenantSettings = async (settingsId: string, data: UpdateTenantSettingsParams): Promise<TenantSettings> => {
  try {
    const url = API_ENDPOINTS.TENANT_SETTINGS.UPDATE(settingsId);
    const response = await http.patch<ApiResponse<TenantSettings>>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新租户设置失败');
    }
  } catch (error: any) {
    console.error('更新租户设置失败:', error);
    throw error;
  }
}; 