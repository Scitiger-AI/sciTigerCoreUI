import { ApiResponse } from './api';

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