import { ApiResponse, PaginatedData } from './api';

// 服务选项
export interface ServiceOption {
  code: string;
  name: string;
  description: string;
}

// 资源选项
export interface ResourceOption {
  code: string;
  name: string;
}

// 操作选项
export interface ActionOption {
  code: string;
  name: string;
}

// 所有选项信息
export interface AllServiceScopeOptions {
  services: ServiceOption[];
  resources: Record<string, ResourceOption[]>;
  actions: ActionOption[];
}

// 服务选项响应
export interface ServiceOptionsResponse extends ApiResponse<ServiceOption[]> {}

// 资源选项响应
export interface ResourceOptionsResponse extends ApiResponse<ResourceOption[]> {}

// 所有资源选项响应
export interface AllResourceOptionsResponse extends ApiResponse<Record<string, ResourceOption[]>> {}

// 操作选项响应
export interface ActionOptionsResponse extends ApiResponse<ActionOption[]> {}

// 所有选项信息响应
export interface AllServiceScopeOptionsResponse extends ApiResponse<AllServiceScopeOptions> {}

// 服务实体
export interface Service {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  tenant?: string | {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
  };
  created_at: string;
  updated_at: string;
}

// 资源实体
export interface Resource {
  id: string;
  code: string;
  name: string;
  description: string;
  service: string | {
    id: string;
    code: string;
    name: string;
    description: string;
    is_system: boolean;
    created_at: string;
    updated_at: string;
    tenant?: string | {
      id: string;
      name: string;
      description?: string;
      is_active?: boolean;
    };
  };
  service_code?: string;
  is_system: boolean;
  tenant_id?: string | null;
  tenant_name?: string | null;
  created_at: string;
  updated_at: string;
}

// 操作实体
export interface Action {
  id: string;
  code: string;
  name: string;
  description: string;
  is_system: boolean;
  tenant?: string | {
    id: string;
    name: string;
    description?: string;
    is_active?: boolean;
  };
  created_at: string;
  updated_at: string;
}

// 服务查询参数
export interface ServiceQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  code?: string;
  name?: string;
  description?: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 资源查询参数
export interface ResourceQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  code?: string;
  name?: string;
  description?: string;
  service_id?: string;
  service_code?: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 操作查询参数
export interface ActionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  code?: string;
  name?: string;
  description?: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 创建服务参数
export interface CreateServiceParams {
  code: string;
  name: string;
  description?: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 更新服务参数
export interface UpdateServiceParams {
  name?: string;
  description?: string;
  is_system?: boolean;
}

// 创建资源参数
export interface CreateResourceParams {
  code: string;
  name: string;
  description?: string;
  service_id: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 更新资源参数
export interface UpdateResourceParams {
  name?: string;
  description?: string;
  is_system?: boolean;
}

// 创建操作参数
export interface CreateActionParams {
  code: string;
  name: string;
  description?: string;
  is_system?: boolean;
  tenant_id?: string;
}

// 更新操作参数
export interface UpdateActionParams {
  name?: string;
  description?: string;
  is_system?: boolean;
}

// 导入默认服务响应
export interface ImportDefaultResponse {
  services: {
    created: number;
    existed: number;
    failed: number;
  };
  resources: {
    created: number;
    existed: number;
    failed: number;
  };
  actions: {
    created: number;
    existed: number;
    failed: number;
  };
}

// 分页服务响应
export interface PaginatedServiceResponse extends ApiResponse<PaginatedData<Service>> {}

// 分页资源响应
export interface PaginatedResourceResponse extends ApiResponse<PaginatedData<Resource>> {}

// 分页操作响应
export interface PaginatedActionResponse extends ApiResponse<PaginatedData<Action>> {}

// 单个服务响应
export interface ServiceResponse extends ApiResponse<Service> {}

// 单个资源响应
export interface ResourceResponse extends ApiResponse<Resource> {}

// 单个操作响应
export interface ActionResponse extends ApiResponse<Action> {}

// 导入默认服务响应
export interface ImportDefaultServiceResponse extends ApiResponse<ImportDefaultResponse> {}

// 按服务获取资源响应
export interface ResourcesByServiceResponse extends ApiResponse<Resource[]> {} 