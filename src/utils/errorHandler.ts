"use client";

import { AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';

// 错误类型枚举
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  UNKNOWN = 'unknown',
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode?: number;
  isInactive?: boolean;
}

/**
 * 处理API错误
 * @param error 错误对象
 * @returns 格式化的错误信息
 */
export const handleApiError = (error: any): ErrorInfo => {
  // 处理 HTTP 拦截器返回的错误对象（新格式）
  if (error.isHttpError && error.data) {
    const statusCode = error.status;
    const message = error.data.message || error.message || '请求失败，请稍后重试';
    const isInactive = error.inactive || error.data.inactive || false;
    
    // 根据状态码确定错误类型
    let type = ErrorType.UNKNOWN;
    if (statusCode) {
      if (statusCode === 400) type = ErrorType.VALIDATION;
      else if (statusCode === 401) type = ErrorType.AUTHENTICATION;
      else if (statusCode === 403) type = ErrorType.AUTHORIZATION;
      else if (statusCode === 404) type = ErrorType.NOT_FOUND;
      else if (statusCode >= 500) type = ErrorType.SERVER_ERROR;
    }
    
    return {
      type,
      message,
      details: error.data,
      statusCode,
      isInactive,
    };
  }
  
  // 处理旧格式的增强错误对象（向后兼容）
  if (error.data && !error.isHttpError) {
    const statusCode = error.status;
    const message = error.data.message || '请求失败，请稍后重试';
    const isInactive = error.data.inactive || false;
    
    // 根据状态码确定错误类型
    let type = ErrorType.UNKNOWN;
    if (statusCode) {
      if (statusCode === 400) type = ErrorType.VALIDATION;
      else if (statusCode === 401) type = ErrorType.AUTHENTICATION;
      else if (statusCode === 403) type = ErrorType.AUTHORIZATION;
      else if (statusCode === 404) type = ErrorType.NOT_FOUND;
      else if (statusCode >= 500) type = ErrorType.SERVER_ERROR;
    }
    
    return {
      type,
      message,
      details: error.data,
      statusCode,
      isInactive,
    };
  }
  
  // 处理Axios错误
  if (error instanceof AxiosError) {
    const response = error.response as { data?: ApiResponse; status?: number };
    const statusCode = response?.status;
    const message = response?.data?.message || error.message || '网络请求失败';
    
    // 根据状态码确定错误类型
    let type = ErrorType.NETWORK_ERROR;
    if (statusCode) {
      if (statusCode === 400) type = ErrorType.VALIDATION;
      else if (statusCode === 401) type = ErrorType.AUTHENTICATION;
      else if (statusCode === 403) type = ErrorType.AUTHORIZATION;
      else if (statusCode === 404) type = ErrorType.NOT_FOUND;
      else if (statusCode >= 500) type = ErrorType.SERVER_ERROR;
    }
    
    return {
      type,
      message,
      details: response?.data,
      statusCode,
    };
  }
  
  // 处理普通Error对象
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      details: error,
    };
  }
  
  // 处理其他类型错误
  return {
    type: ErrorType.UNKNOWN,
    message: '发生未知错误',
    details: error,
  };
};

/**
 * 获取用户友好的错误消息
 * @param errorInfo 错误信息
 * @returns 用户友好的错误消息
 */
export const getFriendlyErrorMessage = (errorInfo: ErrorInfo): string => {
  switch (errorInfo.type) {
    case ErrorType.VALIDATION:
      return errorInfo.message || '输入数据无效，请检查并重试';
    case ErrorType.AUTHENTICATION:
      return errorInfo.message || '身份验证失败，请重新登录';
    case ErrorType.AUTHORIZATION:
      return errorInfo.message || '您没有权限执行此操作';
    case ErrorType.NOT_FOUND:
      return errorInfo.message || '请求的资源不存在';
    case ErrorType.SERVER_ERROR:
      return errorInfo.message || '服务器错误，请稍后重试';
    case ErrorType.NETWORK_ERROR:
      return errorInfo.message || '网络连接错误，请检查您的网络连接';
    default:
      return errorInfo.message || '发生未知错误，请稍后重试';
  }
}; 