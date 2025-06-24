"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse, PaginatedData } from '@/types/api';
import { Permission, PermissionCreateParams, PermissionUpdateParams, ImportDefaultPermissionResponse, ImportDefaultResponse } from '@/types/permission';

interface PermissionQueryParams {
  name?: string;
  code?: string;
  service?: string;
  resource?: string;
  action?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

/**
 * 获取权限列表
 * @param params 查询参数
 * @returns 权限列表数据
 */
export const getPermissions = async (params?: PermissionQueryParams): Promise<PaginatedData<Permission>> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'boolean') {
            queryParams.append(key, value ? 'true' : 'false');
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    // 发送请求
    const url = `${API_ENDPOINTS.PERMISSION.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiResponse<PaginatedData<Permission>>>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取权限列表失败');
    }
  } catch (error: any) {
    console.error('获取权限列表失败:', error);
    throw error;
  }
};

/**
 * 获取权限详情
 * @param permissionId 权限ID
 * @returns 权限详情
 */
export const getPermissionDetail = async (permissionId: string): Promise<Permission> => {
  try {
    const response = await http.get<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSION.DETAIL(permissionId));
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取权限详情失败');
    }
  } catch (error: any) {
    console.error('获取权限详情失败:', error);
    throw error;
  }
};

/**
 * 创建权限
 * @param data 权限数据
 * @returns 创建的权限信息
 */
export const createPermission = async (data: {
  name: string;
  service: string;
  resource: string;
  action: string;
  description?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
  tenant_id?: string;
}): Promise<Permission> => {
  try {
    const response = await http.post<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSION.CREATE, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建权限失败');
    }
  } catch (error: any) {
    console.error('创建权限失败:', error);
    throw error;
  }
};

/**
 * 更新权限
 * @param permissionId 权限ID
 * @param data 更新的权限数据
 * @returns 更新后的权限信息
 */
export const updatePermission = async (permissionId: string, data: {
  name?: string;
  description?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
}): Promise<Permission> => {
  try {
    const response = await http.put<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSION.UPDATE(permissionId), data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新权限失败');
    }
  } catch (error: any) {
    console.error('更新权限失败:', error);
    throw error;
  }
};

/**
 * 部分更新权限
 * @param permissionId 权限ID
 * @param data 部分更新的权限数据
 * @returns 更新后的权限信息
 */
export const partialUpdatePermission = async (permissionId: string, data: {
  name?: string;
  description?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
}): Promise<Permission> => {
  try {
    const response = await http.patch<ApiResponse<Permission>>(API_ENDPOINTS.PERMISSION.UPDATE(permissionId), data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新权限失败');
    }
  } catch (error: any) {
    console.error('更新权限失败:', error);
    throw error;
  }
};

/**
 * 删除权限
 * @param permissionId 权限ID
 * @returns 是否成功
 */
export const deletePermission = async (permissionId: string): Promise<boolean> => {
  try {
    const response = await http.delete<ApiResponse<any>>(API_ENDPOINTS.PERMISSION.DELETE(permissionId));
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除权限失败');
    }
  } catch (error: any) {
    console.error('删除权限失败:', error);
    throw error;
  }
};

/**
 * 导入默认权限
 * @returns 导入结果
 */
export const importDefaultPermissions = async (): Promise<ImportDefaultResponse> => {
  try {
    const url = API_ENDPOINTS.PERMISSION.IMPORT_DEFAULT;
    const response = await http.post<ImportDefaultPermissionResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '导入默认权限失败');
    }
  } catch (error: any) {
    console.error('导入默认权限失败:', error);
    throw error;
  }
}; 