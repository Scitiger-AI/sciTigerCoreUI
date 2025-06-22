import { ApiResponse, PaginatedData } from './api';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  service: string;
  resource: string;
  action: string;
  is_system: boolean;
  is_tenant_level: boolean;
  tenant: string | null;
  created_at: string;
  updated_at: string;
}

export interface PermissionResponse extends ApiResponse<Permission> {}

export interface PermissionListResponse extends ApiResponse<PaginatedData<Permission>> {}

export interface PermissionCreateParams {
  name: string;
  service: string;
  resource: string;
  action: string;
  description?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
  tenant?: string;
}

export interface PermissionUpdateParams {
  name: string;
  description?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
}

export interface PermissionQueryParams {
  name?: string;
  code?: string;
  service?: string;
  resource?: string;
  action?: string;
  is_system?: boolean;
  is_tenant_level?: boolean;
  tenant_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
} 