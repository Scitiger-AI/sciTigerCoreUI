"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse, PaginatedData } from '@/types/api';
import { 
  UserInfo, 
  UserInfoResponse, 
  UserSettings, 
  UserSettingsResponse, 
  UpdateUserSettingsParams, 
  UserListItem, 
  UserListResponse, 
  UserQueryParams,
  CreateUserParams,
  UpdateUserParams
} from '@/types/user';

/**
 * 获取用户详细信息
 * @returns 用户信息
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await http.get<UserInfoResponse>(API_ENDPOINTS.USER.INFO);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取用户信息失败');
    }
  } catch (error: any) {
    throw error;
  }
};

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param data 更新的数据，可以包含昵称和头像文件
 * @returns 更新后的用户信息
 */
export const updateUserInfo = async (
  userId: number,
  data: {
    nickname?: string;
    bio?: string;
    avatar?: File;
  }
): Promise<UserInfo> => {
  try {
    // 创建FormData对象用于文件上传
    const formData = new FormData();
    
    // 添加昵称
    if (data.nickname !== undefined) {
      formData.append('nickname', data.nickname);
    }
    
    // 添加个人简介
    if (data.bio !== undefined) {
      formData.append('bio', data.bio);
    }
    
    // 添加头像文件
    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }
    
    // 发送PATCH请求，使用formData作为请求体
    const response = await http.patch<ApiResponse<UserInfo>>(
      API_ENDPOINTS.USER.UPDATE(userId),
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
      throw new Error(message || '更新用户信息失败');
    }
  } catch (error: any) {
    console.error('更新用户信息出错:', error);
    throw error;
  }
};

/**
 * 通用获取用户列表数据函数
 * @param endpoint API端点
 * @param params 查询参数
 * @param errorMsg 错误信息
 * @returns 分页数据
 */
const fetchUserListData = async <T>(
  endpoint: string,
  params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string[];
    is_public?: boolean;
    agent?: number;
  },
  errorMsg: string = '获取列表失败'
): Promise<PaginatedData<T>> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    
    if (params?.page_size) {
      queryParams.append('page_size', params.page_size.toString());
    }
    
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    
    // 添加状态筛选
    if (params?.status && params.status.length > 0) {
      params.status.forEach(status => {
        queryParams.append('status', status);
      });
    }
    
    // 添加是否公开筛选条件
    if (params?.is_public !== undefined) {
      queryParams.append('is_public', params.is_public.toString());
    }
    
    // 添加Agent筛选
    if (params?.agent !== undefined) {
      queryParams.append('agent', params.agent.toString());
    }
    
    // 发送请求
    const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || errorMsg);
    }
  } catch (error: any) {
    console.error(errorMsg, error);
    throw error;
  }
};

/**
 * 获取用户设置
 * @returns 用户设置
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await http.get<UserSettingsResponse>(API_ENDPOINTS.USER.SETTINGS);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取用户设置失败');
    }
  } catch (error: any) {
    console.error('获取用户设置失败:', error);
    throw error;
  }
};

/**
 * 更新用户设置
 * @param settings 更新的设置
 * @returns 更新后的用户设置
 */
export const updateUserSettings = async (settings: UpdateUserSettingsParams): Promise<UserSettings> => {
  try {
    const response = await http.patch<UserSettingsResponse>(
      API_ENDPOINTS.USER.UPDATE_SETTINGS,
      settings
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新用户设置失败');
    }
  } catch (error: any) {
    console.error('更新用户设置失败:', error);
    throw error;
  }
};

/**
 * 获取用户列表
 * @param params 查询参数
 * @returns 用户列表数据
 */
export const getUserList = async (params?: UserQueryParams): Promise<{
  count?: number;
  next?: string | null;
  previous?: string | null;
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: UserListItem[];
  links?: {
    next: string | null;
    previous: string | null;
  };
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
    const url = `${API_ENDPOINTS.USER.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<UserListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取用户列表失败');
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

/**
 * 激活用户
 * @param userId 用户ID
 * @returns 是否成功
 */
export const activateUser = async (userId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.ACTIVATE(userId);
    const response = await http.post<ApiResponse>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '激活用户失败');
    }
  } catch (error: any) {
    console.error('激活用户失败:', error);
    throw error;
  }
};

/**
 * 禁用用户
 * @param userId 用户ID
 * @returns 是否成功
 */
export const deactivateUser = async (userId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.DEACTIVATE(userId);
    const response = await http.post<ApiResponse>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '禁用用户失败');
    }
  } catch (error: any) {
    console.error('禁用用户失败:', error);
    throw error;
  }
};

/**
 * 删除用户
 * @param userId 用户ID
 * @returns 是否成功
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.DETAIL(userId);
    const response = await http.delete<ApiResponse>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除用户失败');
    }
  } catch (error: any) {
    console.error('删除用户失败:', error);
    throw error;
  }
};

/**
 * 批量删除用户
 * @param userIds 用户ID数组
 * @returns 是否成功
 */
export const bulkDeleteUsers = async (userIds: string[]): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.USER.LIST}bulk_delete/`;
    const response = await http.post<ApiResponse>(url, { ids: userIds });
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '批量删除用户失败');
    }
  } catch (error: any) {
    console.error('批量删除用户失败:', error);
    throw error;
  }
};

/**
 * 批量激活用户
 * @param userIds 用户ID数组
 * @returns 是否成功
 */
export const bulkActivateUsers = async (userIds: string[]): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.BULK_ACTIVATE;
    const response = await http.post<ApiResponse>(url, { ids: userIds });
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '批量激活用户失败');
    }
  } catch (error: any) {
    console.error('批量激活用户失败:', error);
    throw error;
  }
};

/**
 * 批量禁用用户
 * @param userIds 用户ID数组
 * @returns 是否成功
 */
export const bulkDeactivateUsers = async (userIds: string[]): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.BULK_DEACTIVATE;
    const response = await http.post<ApiResponse>(url, { ids: userIds });
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '批量禁用用户失败');
    }
  } catch (error: any) {
    console.error('批量禁用用户失败:', error);
    throw error;
  }
};

/**
 * 修改用户密码
 * @param userId 用户ID
 * @param oldPassword 旧密码
 * @param newPassword 新密码
 * @param confirmPassword 确认密码
 * @returns 是否成功
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<boolean> => {
  try {
    const url = `${API_ENDPOINTS.USER.DETAIL(userId)}change_password/`;
    const response = await http.post<ApiResponse>(url, {
      old_password: oldPassword,
      new_password: newPassword,
      password_confirm: confirmPassword
    });
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '修改密码失败');
    }
  } catch (error: any) {
    console.error('修改密码失败:', error);
    throw error;
  }
};

/**
 * 创建用户
 * @param userData 用户数据或FormData
 * @returns 创建的用户信息
 */
export const createUser = async (userData: CreateUserParams | FormData): Promise<UserListItem> => {
  try {
    const headers: Record<string, string> = {};
    
    // 如果是FormData，设置正确的Content-Type
    if (userData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    
    const response = await http.post<ApiResponse<UserListItem>>(
      API_ENDPOINTS.USER.LIST,
      userData,
      { headers }
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建用户失败');
    }
  } catch (error: any) {
    console.error('创建用户失败:', error);
    throw error;
  }
};

/**
 * 更新用户完整信息
 * @param userId 用户ID
 * @param userData 用户数据或FormData
 * @returns 更新后的用户信息
 */
export const updateUserComplete = async (
  userId: string,
  userData: UpdateUserParams | FormData
): Promise<UserListItem> => {
  try {
    const headers: Record<string, string> = {};
    
    // 如果是FormData，设置正确的Content-Type
    if (userData instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    
    const response = await http.put<ApiResponse<UserListItem>>(
      API_ENDPOINTS.USER.DETAIL(userId),
      userData,
      { headers }
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新用户信息失败');
    }
  } catch (error: any) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
};

/**
 * 获取单个用户详情
 * @param userId 用户ID
 * @returns 用户信息
 */
export const getUserDetail = async (userId: string): Promise<UserListItem> => {
  try {
    const response = await http.get<ApiResponse<UserListItem>>(
      API_ENDPOINTS.USER.DETAIL(userId)
    );
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取用户详情失败');
    }
  } catch (error: any) {
    console.error('获取用户详情失败:', error);
    throw error;
  }
};

/**
 * 重置用户密码
 * @param userId 用户ID
 * @returns 重置结果，包含新密码
 */
export const resetPassword = async (userId: string): Promise<{ new_password: string }> => {
  try {
    const url = API_ENDPOINTS.USER.RESET_PASSWORD(userId);
    const response = await http.post<ApiResponse<{ new_password: string }>>(url);
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '重置密码失败');
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    throw error;
  }
};

/**
 * 使用自定义新密码重置用户密码
 * @param userId 用户ID
 * @param newPassword 新密码
 * @returns 是否成功
 */
export const resetPasswordWithNewPassword = async (
  userId: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.USER.RESET_PASSWORD(userId);
    const response = await http.post<ApiResponse>(url, {
      new_password: newPassword
    });
    
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '重置密码失败');
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    throw error;
  }
};

/**
 * 获取可分配给指定角色的用户列表
 * @param roleId 角色ID
 * @param params 查询参数
 * @returns 用户列表
 */
export const getAssignableUsers = async (
  roleId: string,
  params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }
): Promise<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: UserListItem[];
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
    
    // 添加角色ID参数
    queryParams.append('not_in_role', roleId.toString());
    
    // 发送请求
    const url = `${API_ENDPOINTS.USER.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<UserListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取可分配用户列表失败');
    }
  } catch (error: any) {
    console.error('获取可分配用户列表失败:', error);
    throw error;
  }
}; 