import { ApiResponse, PaginatedData } from './api';

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  is_system: boolean;
  is_default: boolean;
  tenant: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleDetail extends Role {
  permissions: Permission[];
  users_count: number;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  service: string;
  resource: string;
  action: string;
}

export interface RoleResponse extends ApiResponse<Role> {}

export interface RoleDetailResponse extends ApiResponse<RoleDetail> {}

export interface RoleListResponse extends ApiResponse<PaginatedData<Role>> {}

export interface RoleCreateParams {
  name: string;
  code: string;
  description?: string;
  is_system?: boolean;
  is_default?: boolean;
  tenant?: string;
  permissions?: string[];
}

export interface RoleUpdateParams {
  name: string;
  description?: string;
  is_default?: boolean;
  permissions?: string[];
}

export interface RoleQueryParams {
  name?: string;
  code?: string;
  is_system?: boolean;
  is_default?: boolean;
  is_global?: boolean;
  tenant_id?: string;
  has_permission?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface AssignPermissionsParams {
  permission_ids: string[];
}

export interface RemovePermissionsParams {
  permission_ids: string[];
} 