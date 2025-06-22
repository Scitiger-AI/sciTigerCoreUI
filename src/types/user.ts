import { ApiResponse } from './api';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_admin: boolean;
  works_count?: number;
  likes_count?: number;
  favorites_count?: number;
  created_at?: string;
  updated_at?: string;
  avatar: string;
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_login?: string;
  date_joined?: string;
  bio?: string;
}

// 登录参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse extends ApiResponse<{
  access_token: string;
  refresh_token: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_admin: boolean;
  avatar: string;
  [key: string]: any;
}> {}

// 刷新令牌响应
export interface RefreshTokenResponse extends ApiResponse<{
  access_token: string;
  refresh_token: string;
}> {}

// 注册参数
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

// 注册结果
export interface RegisterResult {
  id: string;
  username: string;
  email: string;
}

// 注册响应
export interface RegisterResponse extends ApiResponse<RegisterResult> {}

// 用户信息响应
export interface UserInfoResponse extends ApiResponse<UserInfo> {}

// 用户设置
export interface UserSettings {
  theme: string;
  language: string;
  notification_enabled: boolean;
  email_notification: boolean;
}

// 用户设置响应
export interface UserSettingsResponse extends ApiResponse<UserSettings> {}

// 更新用户设置参数
export interface UpdateUserSettingsParams {
  theme?: string;
  language?: string;
  notification_enabled?: boolean;
  email_notification?: boolean;
}

// 用户列表项
export interface UserListItem {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  last_login?: string;
  date_joined?: string;
  bio?: string;
  avatar?: string;
  is_superuser?: boolean;
  roles?: {
    id: string;
    name: string;
    code: string;
  }[];
  tenants?: {
    id: string;
    name: string;
    slug: string;
    role: string;
    role_display: string;
  }[];
  current_tenant?: {
    id: string;
    name: string;
    slug: string;
    role: string;
    role_display: string;
  } | null;
}

// 用户列表响应
export interface UserListResponse extends ApiResponse<{
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
}> {}

// 用户查询参数
export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string[];
  is_active?: boolean;
  is_admin?: boolean;
  tenant_id?: string;
}

// 创建用户参数
export interface CreateUserParams {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  is_active?: boolean;
  is_admin?: boolean;
  roles?: string[];
  tenant_id?: string;
}

// 更新用户参数
export interface UpdateUserParams {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  is_active?: boolean;
  is_admin?: boolean;
  roles?: string[];
  tenant_id?: string;
}