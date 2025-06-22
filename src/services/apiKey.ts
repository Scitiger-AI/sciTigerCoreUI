"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { 
  ApiKey, 
  ApiKeyStats, 
  ApiKeyUsageLog,
  ApiKeyQueryParams,
  CreateSystemKeyParams,
  CreateUserKeyParams,
  UpdateApiKeyParams,
  ApiKeyListResponse,
  ApiKeyDetailResponse,
  ApiKeyUsageLogResponse,
  ApiKeyStatsResponse,
  CreateApiKeyResponse
} from '@/types/apiKey';
import { ApiResponse, PaginatedData } from '@/types/api';

/**
 * 获取API密钥列表
 * @param params 查询参数
 * @returns API密钥分页数据
 */
export const getApiKeys = async (params?: ApiKeyQueryParams): Promise<PaginatedData<ApiKey>> => {
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
    const url = `${API_ENDPOINTS.API_KEY.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiKeyListResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取API密钥列表失败');
    }
  } catch (error: any) {
    console.error('获取API密钥列表失败:', error);
    throw error;
  }
};

/**
 * 获取API密钥详情
 * @param apiKeyId API密钥ID
 * @returns API密钥详情
 */
export const getApiKeyDetail = async (apiKeyId: string): Promise<ApiKey> => {
  try {
    const url = API_ENDPOINTS.API_KEY.DETAIL(apiKeyId);
    const response = await http.get<ApiKeyDetailResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取API密钥详情失败');
    }
  } catch (error: any) {
    console.error('获取API密钥详情失败:', error);
    throw error;
  }
};

/**
 * 创建系统级API密钥
 * @param params 创建参数
 * @returns 创建结果，包含完整的API密钥和明文密钥
 */
export const createSystemApiKey = async (params: CreateSystemKeyParams): Promise<{
  api_key: ApiKey;
  key: string;
}> => {
  try {
    const url = API_ENDPOINTS.API_KEY.CREATE_SYSTEM_KEY;
    const response = await http.post<CreateApiKeyResponse>(url, params);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建系统级API密钥失败');
    }
  } catch (error: any) {
    console.error('创建系统级API密钥失败:', error);
    throw error;
  }
};

/**
 * 创建用户级API密钥
 * @param params 创建参数
 * @returns 创建结果，包含完整的API密钥和明文密钥
 */
export const createUserApiKey = async (params: CreateUserKeyParams): Promise<{
  api_key: ApiKey;
  key: string;
}> => {
  try {
    const url = API_ENDPOINTS.API_KEY.CREATE_USER_KEY;
    const response = await http.post<CreateApiKeyResponse>(url, params);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建用户级API密钥失败');
    }
  } catch (error: any) {
    console.error('创建用户级API密钥失败:', error);
    throw error;
  }
};

/**
 * 更新API密钥
 * @param apiKeyId API密钥ID
 * @param params 更新参数
 * @returns 更新后的API密钥
 */
export const updateApiKey = async (
  apiKeyId: string,
  params: UpdateApiKeyParams
): Promise<ApiKey> => {
  try {
    const url = API_ENDPOINTS.API_KEY.UPDATE(apiKeyId);
    const response = await http.patch<ApiKeyDetailResponse>(url, params);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新API密钥失败');
    }
  } catch (error: any) {
    console.error('更新API密钥失败:', error);
    throw error;
  }
};

/**
 * 删除API密钥
 * @param apiKeyId API密钥ID
 * @returns 是否成功
 */
export const deleteApiKey = async (apiKeyId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.API_KEY.DELETE(apiKeyId);
    const response = await http.delete<ApiResponse<null>>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '删除API密钥失败');
    }
  } catch (error: any) {
    console.error('删除API密钥失败:', error);
    throw error;
  }
};

/**
 * 激活API密钥
 * @param apiKeyId API密钥ID
 * @returns 是否成功
 */
export const activateApiKey = async (apiKeyId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.API_KEY.ACTIVATE(apiKeyId);
    const response = await http.post<ApiResponse<null>>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '激活API密钥失败');
    }
  } catch (error: any) {
    console.error('激活API密钥失败:', error);
    throw error;
  }
};

/**
 * 禁用API密钥
 * @param apiKeyId API密钥ID
 * @returns 是否成功
 */
export const deactivateApiKey = async (apiKeyId: string): Promise<boolean> => {
  try {
    const url = API_ENDPOINTS.API_KEY.DEACTIVATE(apiKeyId);
    const response = await http.post<ApiResponse<null>>(url);
    const { success, message } = response.data;
    
    if (success) {
      return true;
    } else {
      throw new Error(message || '禁用API密钥失败');
    }
  } catch (error: any) {
    console.error('禁用API密钥失败:', error);
    throw error;
  }
};

/**
 * 获取API密钥使用日志
 * @param apiKeyId API密钥ID
 * @param params 查询参数
 * @returns 使用日志分页数据
 */
export const getApiKeyUsageLogs = async (
  apiKeyId: string,
  params?: {
    page?: number;
    page_size?: number;
    ordering?: string;
  }
): Promise<PaginatedData<ApiKeyUsageLog>> => {
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
    const baseUrl = API_ENDPOINTS.API_KEY.USAGE_LOGS(apiKeyId);
    const url = `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<ApiKeyUsageLogResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取API密钥使用日志失败');
    }
  } catch (error: any) {
    console.error('获取API密钥使用日志失败:', error);
    throw error;
  }
};

/**
 * 获取API密钥统计信息
 * @returns API密钥统计信息
 */
export const getApiKeyStats = async (): Promise<ApiKeyStats> => {
  try {
    const url = API_ENDPOINTS.API_KEY.STATS;
    const response = await http.get<ApiKeyStatsResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取API密钥统计信息失败');
    }
  } catch (error: any) {
    console.error('获取API密钥统计信息失败:', error);
    throw error;
  }
};

/**
 * 获取API密钥哈希
 * @param apiKeyId API密钥ID
 * @param password 用户密码
 * @returns API密钥哈希信息
 */
export const getApiKeyHash = async (
  apiKeyId: string,
  password: string
): Promise<{ id: string; name: string; key_hash: string; prefix: string }> => {
  try {
    const url = API_ENDPOINTS.API_KEY.GET_KEY_HASH;
    const response = await http.post<ApiResponse<{
      id: string;
      name: string;
      key_hash: string;
      prefix: string;
    }>>(url, {
      api_key_id: apiKeyId,
      password
    });
    
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取API密钥哈希失败');
    }
  } catch (error: any) {
    console.error('获取API密钥哈希失败:', error);
    throw error;
  }
};
