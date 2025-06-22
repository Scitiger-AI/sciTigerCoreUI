import { ApiResponse, PaginatedData } from './api';

export interface ApiKeyScope {
  id: string;
  service: string;
  resource: string;
  action: string;
}

export interface ApiKey {
  id: string;
  key_type: 'system' | 'user';
  prefix: string;
  name: string;
  tenant: string | {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
  };
  user: string | {
    id: string;
    avatar: string;
    is_superuser: boolean;
    username: string;
    email: string;
  } | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  application_name: string | null;
  created_by_key_name: string | null;
  metadata?: Record<string, any>;
  scopes?: ApiKeyScope[];
}

export interface ApiKeyUsageLog {
  id: string;
  api_key: string;
  api_key_name: string;
  tenant: string;
  request_path: string;
  request_method: string;
  response_status: number;
  timestamp: string;
  client_ip: string;
  request_id: string;
}

export interface ApiKeyStats {
  total_keys: number;
  system_keys: number;
  user_keys: number;
  active_keys: number;
  inactive_keys: number;
  expired_keys: number;
  recent_keys: number;
  recent_usage: number;
  status_stats: Record<string, number>;
}

// 查询参数
export interface ApiKeyQueryParams {
  page?: number;
  page_size?: number;
  key_type?: 'system' | 'user';
  user_id?: string;
  tenant_id?: string;
  is_active?: boolean;
  search?: string;
  ordering?: string;
}

// 创建系统密钥参数
export interface CreateSystemKeyParams {
  name: string;
  tenant: string;
  application_name?: string;
  expires_in_days?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
  scopes?: Omit<ApiKeyScope, 'id'>[];
}

// 创建用户密钥参数
export interface CreateUserKeyParams {
  name: string;
  user: string;
  tenant?: string;
  created_by_key_id?: string;
  expires_in_days?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
  scopes?: Omit<ApiKeyScope, 'id'>[];
}

// 更新密钥参数
export interface UpdateApiKeyParams {
  name?: string;
  is_active?: boolean;
  expires_at?: string | null;
  application_name?: string | null;
  tenant?: string;
  metadata?: Record<string, any>;
  scopes?: Omit<ApiKeyScope, 'id'>[];
}

// 创建密钥响应
export interface CreateApiKeyResponse extends ApiResponse<{
  api_key: ApiKey;
  key: string;
}> {}

// API密钥列表响应
export interface ApiKeyListResponse extends ApiResponse<PaginatedData<ApiKey>> {}

// API密钥详情响应
export interface ApiKeyDetailResponse extends ApiResponse<ApiKey> {}

// API密钥使用日志响应
export interface ApiKeyUsageLogResponse extends ApiResponse<PaginatedData<ApiKeyUsageLog>> {}

// API密钥统计响应
export interface ApiKeyStatsResponse extends ApiResponse<ApiKeyStats> {}
