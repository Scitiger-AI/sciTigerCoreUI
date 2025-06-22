"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse, PaginatedData } from '@/types/api';
import { 
  Role, 
  RoleDetail, 
  RoleCreateParams, 
  RoleUpdateParams, 
  RoleQueryParams,
  AssignPermissionsParams,
  RemovePermissionsParams
} from '@/types/role';
import { UserListItem } from '@/types/user';

/**
 * 获取角色列表
 * @param params 查询参数
 * @returns 角色列表数据
 */
export const getRoles = async (params?: RoleQueryParams): Promise<PaginatedData<Role>> => {
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
    const url = `${API_ENDPOINTS.ROLE.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiResponse<PaginatedData<Role>>>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取角色列表失败');
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
};

/**
 * 获取角色详情
 * @param roleId 角色ID
 * @returns 角色详情
 */
export const getRoleDetail = async (roleId: string): Promise<RoleDetail> => {
  try {
    const response = await http.get<ApiResponse<RoleDetail>>(API_ENDPOINTS.ROLE.DETAIL(roleId));
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取角色详情失败');
    }
  } catch (error: any) {
    console.error('获取角色详情失败:', error);
    throw error;
  }
};

/**
 * 创建角色
 * @param data 角色数据
 * @returns 创建的角色信息
 */
export const createRole = async (data: RoleCreateParams): Promise<RoleDetail> => {
  try {
    const response = await http.post<ApiResponse<RoleDetail>>(API_ENDPOINTS.ROLE.CREATE, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建角色失败');
    }
  } catch (error: any) {
    console.error('创建角色失败:', error);
    throw error;
  }
};

/**
 * 更新角色
 * @param roleId 角色ID
 * @param data 更新的角色数据
 * @returns 更新后的角色信息
 */
export const updateRole = async (roleId: string, data: RoleUpdateParams): Promise<RoleDetail> => {
  try {
    const response = await http.put<ApiResponse<RoleDetail>>(API_ENDPOINTS.ROLE.UPDATE(roleId), data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新角色失败');
    }
  } catch (error: any) {
    console.error('更新角色失败:', error);
    throw error;
  }
};

/**
 * 部分更新角色
 * @param roleId 角色ID
 * @param data 部分更新的角色数据
 * @returns 更新后的角色信息
 */
export const partialUpdateRole = async (roleId: string, data: Partial<RoleUpdateParams>): Promise<RoleDetail> => {
  try {
    const response = await http.patch<ApiResponse<RoleDetail>>(API_ENDPOINTS.ROLE.UPDATE(roleId), data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新角色失败');
    }
  } catch (error: any) {
    console.error('更新角色失败:', error);
    throw error;
  }
};

/**
 * 删除角色
 * @param roleId 角色ID
 * @returns 是否成功
 */
export const deleteRole = async (roleId: string): Promise<boolean> => {
  try {
    const response = await http.delete<ApiResponse<any>>(API_ENDPOINTS.ROLE.DELETE(roleId));
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除角色失败');
    }
  } catch (error: any) {
    console.error('删除角色失败:', error);
    throw error;
  }
};

/**
 * 获取拥有此角色的用户列表
 * @param roleId 角色ID
 * @param params 查询参数
 * @returns 用户列表
 */
export const getRoleUsers = async (
  roleId: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }
): Promise<PaginatedData<UserListItem>> => {
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
    const url = `${API_ENDPOINTS.ROLE.USERS(roleId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiResponse<PaginatedData<UserListItem>>>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取角色用户列表失败');
    }
  } catch (error: any) {
    console.error('获取角色用户列表失败:', error);
    throw error;
  }
};

/**
 * 为角色分配权限
 * @param roleId 角色ID
 * @param data 权限ID列表
 * @returns 是否成功
 */
export const assignPermissionsToRole = async (roleId: string, data: AssignPermissionsParams): Promise<boolean> => {
  try {
    const response = await http.post<ApiResponse<any>>(API_ENDPOINTS.ROLE.ASSIGN_PERMISSIONS(roleId), data);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '分配权限失败');
    }
  } catch (error: any) {
    console.error('分配权限失败:', error);
    throw error;
  }
};

/**
 * 从角色中移除权限
 * @param roleId 角色ID
 * @param data 权限ID列表
 * @returns 是否成功
 */
export const removePermissionsFromRole = async (roleId: string, data: RemovePermissionsParams): Promise<boolean> => {
  try {
    const response = await http.post<ApiResponse<any>>(API_ENDPOINTS.ROLE.REMOVE_PERMISSIONS(roleId), data);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '移除权限失败');
    }
  } catch (error: any) {
    console.error('移除权限失败:', error);
    throw error;
  }
};

/**
 * 设置为默认角色
 * @param roleId 角色ID
 * @returns 是否成功
 */
export const setDefaultRole = async (roleId: string): Promise<boolean> => {
  try {
    const response = await http.post<ApiResponse<any>>(API_ENDPOINTS.ROLE.SET_DEFAULT(roleId), {});
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '设置默认角色失败');
    }
  } catch (error: any) {
    console.error('设置默认角色失败:', error);
    throw error;
  }
};

/**
 * 取消默认角色设置
 * @param roleId 角色ID
 * @returns 是否成功
 */
export const unsetDefaultRole = async (roleId: string): Promise<boolean> => {
  try {
    const response = await http.post<ApiResponse<any>>(API_ENDPOINTS.ROLE.UNSET_DEFAULT(roleId), {});
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '取消默认角色设置失败');
    }
  } catch (error: any) {
    console.error('取消默认角色设置失败:', error);
    throw error;
  }
}; 