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
  AllServiceScopeOptionsResponse
} from '@/types/serviceScope';

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