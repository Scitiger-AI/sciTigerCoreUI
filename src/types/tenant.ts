import { ApiResponse } from './api';

// 租户类型
export interface Tenant {
  id: string;
  name: string;
  code: string;
  slug?: string;
  subdomain?: string;
  logo?: string;
  description?: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  owner_user?: {
    id: string;
    username: string;
    email: string;
  };
  user_count?: number;
  subscription_plan?: string;
  subscription_status?: string;
  subscription_end_date?: string | null;
  primary_color?: string;
  secondary_color?: string;
}

// 租户列表响应
export interface TenantListResponse extends ApiResponse<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: Tenant[];
}> {}

// 租户详情响应
export interface TenantDetailResponse extends ApiResponse<Tenant> {}

// 创建租户参数
export interface CreateTenantParams {
  name: string;
  slug: string;
  subdomain: string;
  contact_email: string;
  description?: string;
  logo?: File;
  owner_user_id?: string;
  primary_color?: string;
  secondary_color?: string;
  is_active?: boolean;
}

// 更新租户参数
export interface UpdateTenantParams {
  name?: string;
  description?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  is_active?: boolean;
  logo?: File;
}

// 租户用户关联类型
export interface TenantUser {
  id: string;
  avatar: string;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  tenant: string;
  role: 'owner' | 'admin' | 'member';
  role_display?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// 租户用户列表响应
export interface TenantUserListResponse extends ApiResponse<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantUser[];
}> {}

// 租户用户详情响应
export interface TenantUserDetailResponse extends ApiResponse<TenantUser> {}

// 创建租户用户关联参数
export interface CreateTenantUserParams {
  tenant_id: string;
  user_id: string;
  role?: 'admin' | 'member';
  is_active?: boolean;
}

// 更新租户用户关联参数
export interface UpdateTenantUserParams {
  role?: 'admin' | 'member';
  is_active?: boolean;
}

// 租户配额类型
export interface TenantQuota {
  id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string;
  };
  max_users: number;
  current_users?: number;
  max_storage_gb: number;
  current_storage_gb?: number;
  max_api_keys: number;
  current_api_keys?: number;
  max_api_requests_per_day: number;
  current_api_calls_today: number;
  current_api_calls_this_month: number;
  max_log_retention_days: number;
  max_notifications_per_day: number;
  current_notifications_today?: number;
  created_at: string;
  updated_at: string;
}

// 租户配额列表响应
export interface TenantQuotaListResponse extends ApiResponse<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantQuota[];
}> {}

// 租户配额详情响应
export interface TenantQuotaDetailResponse extends ApiResponse<TenantQuota> {}

// 更新租户配额参数
export interface UpdateTenantQuotaParams {
  max_users?: number;
  max_storage_gb?: number;
  max_api_keys?: number;
  max_api_requests_per_day?: number;
  max_log_retention_days?: number;
  max_notifications_per_day?: number;
}

// 租户设置类型
export interface TenantSettings {
  id: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain?: string;
  };
  timezone: string;
  date_format: string;
  time_format: string;
  language: string;
  theme: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  password_policy?: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_number: boolean;
    require_special_char: boolean;
    password_expiry_days: number;
  };
  notification_settings?: {
    email_notifications: boolean;
    system_notifications: boolean;
    marketing_emails: boolean;
  };
  created_at: string;
  updated_at: string;
}

// 租户设置列表响应
export interface TenantSettingsListResponse extends ApiResponse<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: TenantSettings[];
}> {}

// 租户设置详情响应
export interface TenantSettingsDetailResponse extends ApiResponse<TenantSettings> {}

// 更新租户设置参数
export interface UpdateTenantSettingsParams {
  timezone?: string;
  date_format?: string;
  time_format?: string;
  language?: string;
  theme?: string;
  allow_registration?: boolean;
  require_email_verification?: boolean;
  session_timeout_minutes?: number;
  password_policy?: {
    min_length?: number;
    require_uppercase?: boolean;
    require_lowercase?: boolean;
    require_number?: boolean;
    require_special_char?: boolean;
    password_expiry_days?: number;
  };
  notification_settings?: {
    email_notifications?: boolean;
    system_notifications?: boolean;
    marketing_emails?: boolean;
  };
} 