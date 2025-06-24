"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import {
  ServiceOption,
  ResourceOption,
  ActionOption,
  AllServiceScopeOptions,
  ServiceOptionsResponse,
  ResourceOptionsResponse,
  AllResourceOptionsResponse,
  ActionOptionsResponse,
  AllServiceScopeOptionsResponse,
  Service,
  Resource,
  Action,
  ServiceQueryParams,
  ResourceQueryParams,
  ActionQueryParams,
  CreateServiceParams,
  UpdateServiceParams,
  CreateResourceParams,
  UpdateResourceParams,
  CreateActionParams,
  UpdateActionParams,
  PaginatedServiceResponse,
  PaginatedResourceResponse,
  PaginatedActionResponse,
  ServiceResponse,
  ResourceResponse,
  ActionResponse,
  ImportDefaultServiceResponse,
  ResourcesByServiceResponse
} from '@/types/serviceScope';
import { PaginatedData } from '@/types/api';

/**
 * 获取服务选项列表
 * @returns 服务选项列表
 */
export const getServiceOptions = async (): Promise<ServiceOption[]> => {
  try {
    const url = API_ENDPOINTS.SERVICE_SCOPE.SERVICES;
    const response = await http.get<ServiceOptionsResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取服务选项列表失败');
    }
  } catch (error: any) {
    console.error('获取服务选项列表失败:', error);
    throw error;
  }
};

/**
 * 获取资源选项列表
 * @param service 可选的服务代码，用于过滤特定服务的资源
 * @returns 资源选项列表
 */
export const getResourceOptions = async (service?: string): Promise<ResourceOption[] | Record<string, ResourceOption[]>> => {
  try {
    let url = API_ENDPOINTS.SERVICE_SCOPE.RESOURCES;
    
    // 如果指定了服务，添加查询参数
    if (service) {
      url = `${url}?service=${encodeURIComponent(service)}`;
    }
    
    const response = await http.get<ResourceOptionsResponse | AllResourceOptionsResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取资源选项列表失败');
    }
  } catch (error: any) {
    console.error('获取资源选项列表失败:', error);
    throw error;
  }
};

/**
 * 获取操作选项列表
 * @returns 操作选项列表
 */
export const getActionOptions = async (): Promise<ActionOption[]> => {
  try {
    const url = API_ENDPOINTS.SERVICE_SCOPE.ACTIONS;
    const response = await http.get<ActionOptionsResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取操作选项列表失败');
    }
  } catch (error: any) {
    console.error('获取操作选项列表失败:', error);
    throw error;
  }
};

/**
 * 获取所有服务作用域选项信息
 * @returns 所有服务、资源和操作选项信息
 */
export const getAllServiceScopeOptions = async (): Promise<AllServiceScopeOptions> => {
  try {
    const url = API_ENDPOINTS.SERVICE_SCOPE.ALL;
    const response = await http.get<AllServiceScopeOptionsResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取所有服务作用域选项信息失败');
    }
  } catch (error: any) {
    console.error('获取所有服务作用域选项信息失败:', error);
    throw error;
  }
};

/**
 * 获取服务列表
 * @param params 查询参数
 * @returns 分页的服务列表
 */
export const getServices = async (params: ServiceQueryParams = {}): Promise<PaginatedData<Service>> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.code) queryParams.append('code', params.code);
    if (params.name) queryParams.append('name', params.name);
    if (params.description) queryParams.append('description', params.description);
    if (params.is_system !== undefined) queryParams.append('is_system', params.is_system.toString());
    if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
    
    // 发送请求
    const url = `${API_ENDPOINTS.SERVICE.LIST}?${queryParams.toString()}`;
    const response = await http.get<PaginatedServiceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取服务列表失败');
    }
  } catch (error: any) {
    console.error('获取服务列表失败:', error);
    throw error;
  }
};

/**
 * 获取服务详情
 * @param id 服务ID
 * @returns 服务详情
 */
export const getServiceDetail = async (id: string): Promise<Service> => {
  try {
    const url = API_ENDPOINTS.SERVICE.DETAIL(id);
    const response = await http.get<ServiceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取服务详情失败');
    }
  } catch (error: any) {
    console.error('获取服务详情失败:', error);
    throw error;
  }
};

/**
 * 创建服务
 * @param data 创建服务的参数
 * @returns 创建的服务
 */
export const createService = async (data: CreateServiceParams): Promise<Service> => {
  try {
    const url = API_ENDPOINTS.SERVICE.CREATE;
    const response = await http.post<ServiceResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建服务失败');
    }
  } catch (error: any) {
    console.error('创建服务失败:', error);
    throw error;
  }
};

/**
 * 更新服务
 * @param id 服务ID
 * @param data 更新服务的参数
 * @returns 更新后的服务
 */
export const updateService = async (id: string, data: UpdateServiceParams): Promise<Service> => {
  try {
    const url = API_ENDPOINTS.SERVICE.UPDATE(id);
    const response = await http.patch<ServiceResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新服务失败');
    }
  } catch (error: any) {
    console.error('更新服务失败:', error);
    throw error;
  }
};

/**
 * 删除服务
 * @param id 服务ID
 */
export const deleteService = async (id: string): Promise<void> => {
  try {
    const url = API_ENDPOINTS.SERVICE.DELETE(id);
    const response = await http.delete(url);
    const { success, message } = response.data;
    
    if (!success) {
      throw new Error(message || '删除服务失败');
    }
  } catch (error: any) {
    console.error('删除服务失败:', error);
    throw error;
  }
};

/**
 * 导入默认服务
 * @returns 导入结果
 */
export const importDefaultServices = async () => {
  try {
    const url = API_ENDPOINTS.SERVICE.IMPORT_DEFAULT;
    const response = await http.post<ImportDefaultServiceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '导入默认服务失败');
    }
  } catch (error: any) {
    console.error('导入默认服务失败:', error);
    throw error;
  }
};

/**
 * 获取资源列表
 * @param params 查询参数
 * @returns 分页的资源列表
 */
export const getResources = async (params: ResourceQueryParams = {}): Promise<PaginatedData<Resource>> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.code) queryParams.append('code', params.code);
    if (params.name) queryParams.append('name', params.name);
    if (params.description) queryParams.append('description', params.description);
    if (params.service_id) queryParams.append('service_id', params.service_id);
    if (params.service_code) queryParams.append('service_code', params.service_code);
    if (params.is_system !== undefined) queryParams.append('is_system', params.is_system.toString());
    if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
    
    // 发送请求
    const url = `${API_ENDPOINTS.RESOURCE.LIST}?${queryParams.toString()}`;
    const response = await http.get<PaginatedResourceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取资源列表失败');
    }
  } catch (error: any) {
    console.error('获取资源列表失败:', error);
    throw error;
  }
};

/**
 * 获取资源详情
 * @param id 资源ID
 * @returns 资源详情
 */
export const getResourceDetail = async (id: string): Promise<Resource> => {
  try {
    const url = API_ENDPOINTS.RESOURCE.DETAIL(id);
    const response = await http.get<ResourceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取资源详情失败');
    }
  } catch (error: any) {
    console.error('获取资源详情失败:', error);
    throw error;
  }
};

/**
 * 创建资源
 * @param data 创建资源的参数
 * @returns 创建的资源
 */
export const createResource = async (data: CreateResourceParams): Promise<Resource> => {
  try {
    const url = API_ENDPOINTS.RESOURCE.CREATE;
    const response = await http.post<ResourceResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建资源失败');
    }
  } catch (error: any) {
    console.error('创建资源失败:', error);
    throw error;
  }
};

/**
 * 更新资源
 * @param id 资源ID
 * @param data 更新资源的参数
 * @returns 更新后的资源
 */
export const updateResource = async (id: string, data: UpdateResourceParams): Promise<Resource> => {
  try {
    const url = API_ENDPOINTS.RESOURCE.UPDATE(id);
    const response = await http.patch<ResourceResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新资源失败');
    }
  } catch (error: any) {
    console.error('更新资源失败:', error);
    throw error;
  }
};

/**
 * 删除资源
 * @param id 资源ID
 */
export const deleteResource = async (id: string): Promise<void> => {
  try {
    const url = API_ENDPOINTS.RESOURCE.DELETE(id);
    const response = await http.delete(url);
    const { success, message } = response.data;
    
    if (!success) {
      throw new Error(message || '删除资源失败');
    }
  } catch (error: any) {
    console.error('删除资源失败:', error);
    throw error;
  }
};

/**
 * 按服务获取资源
 * @param serviceCode 服务代码
 * @param tenantId 可选的租户ID
 * @returns 资源列表
 */
export const getResourcesByService = async (serviceCode: string, tenantId?: string): Promise<Resource[]> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('service_code', serviceCode);
    if (tenantId) queryParams.append('tenant_id', tenantId);
    
    // 发送请求
    const url = `${API_ENDPOINTS.RESOURCE.BY_SERVICE}?${queryParams.toString()}`;
    const response = await http.get<ResourcesByServiceResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '按服务获取资源失败');
    }
  } catch (error: any) {
    console.error('按服务获取资源失败:', error);
    throw error;
  }
};

/**
 * 获取操作列表
 * @param params 查询参数
 * @returns 分页的操作列表
 */
export const getActions = async (params: ActionQueryParams = {}): Promise<PaginatedData<Action>> => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);
    if (params.code) queryParams.append('code', params.code);
    if (params.name) queryParams.append('name', params.name);
    if (params.description) queryParams.append('description', params.description);
    if (params.is_system !== undefined) queryParams.append('is_system', params.is_system.toString());
    if (params.tenant_id) queryParams.append('tenant_id', params.tenant_id);
    
    // 发送请求
    const url = `${API_ENDPOINTS.ACTION.LIST}?${queryParams.toString()}`;
    const response = await http.get<PaginatedActionResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取操作列表失败');
    }
  } catch (error: any) {
    console.error('获取操作列表失败:', error);
    throw error;
  }
};

/**
 * 获取操作详情
 * @param id 操作ID
 * @returns 操作详情
 */
export const getActionDetail = async (id: string): Promise<Action> => {
  try {
    const url = API_ENDPOINTS.ACTION.DETAIL(id);
    const response = await http.get<ActionResponse>(url);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '获取操作详情失败');
    }
  } catch (error: any) {
    console.error('获取操作详情失败:', error);
    throw error;
  }
};

/**
 * 创建操作
 * @param data 创建操作的参数
 * @returns 创建的操作
 */
export const createAction = async (data: CreateActionParams): Promise<Action> => {
  try {
    const url = API_ENDPOINTS.ACTION.CREATE;
    const response = await http.post<ActionResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '创建操作失败');
    }
  } catch (error: any) {
    console.error('创建操作失败:', error);
    throw error;
  }
};

/**
 * 更新操作
 * @param id 操作ID
 * @param data 更新操作的参数
 * @returns 更新后的操作
 */
export const updateAction = async (id: string, data: UpdateActionParams): Promise<Action> => {
  try {
    const url = API_ENDPOINTS.ACTION.UPDATE(id);
    const response = await http.patch<ActionResponse>(url, data);
    const { success, results, message } = response.data;
    
    if (success && results) {
      return results;
    } else {
      throw new Error(message || '更新操作失败');
    }
  } catch (error: any) {
    console.error('更新操作失败:', error);
    throw error;
  }
};

/**
 * 删除操作
 * @param id 操作ID
 */
export const deleteAction = async (id: string): Promise<void> => {
  try {
    const url = API_ENDPOINTS.ACTION.DELETE(id);
    const response = await http.delete(url);
    const { success, message } = response.data;
    
    if (!success) {
      throw new Error(message || '删除操作失败');
    }
  } catch (error: any) {
    console.error('删除操作失败:', error);
    throw error;
  }
}; 