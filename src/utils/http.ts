"use client";

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearAuthStorage } from './storage';
import { ApiResponse } from '@/types/api';
import { RefreshTokenResponse } from '@/types/user';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 是否正在刷新token
let isRefreshing = false;
// 等待刷新token的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];
// 标记是否正在重定向到登录页
let isRedirectingToLogin = false;

/**
 * 将请求添加到等待队列
 * @param callback 回调函数
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * 执行等待队列中的请求
 * @param token 新的访问令牌
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * 刷新访问令牌
 * @returns 新的访问令牌
 */
const refreshToken = async (): Promise<string> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('刷新令牌不存在');
    }

    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refresh: refreshToken }
    );

    const { success, results } = response.data;
    if (success && results) {
      setAccessToken(results.access_token);
      setRefreshToken(results.refresh_token);
      return results.access_token;
    } else {
      throw new Error('刷新令牌失败');
    }
  } catch (error) {
    console.error('刷新令牌失败，清除认证状态:', error);
    clearAuthStorage();
    // 设置标记，表示需要重新登录
    document.cookie = 'auth_need_login=true;path=/;max-age=60;SameSite=Lax';
    
    // 使用重定向标志防止多次重定向
    if (!isRedirectingToLogin && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      isRedirectingToLogin = true;
      // 保存当前URL，以便登录后重定向回来
      const currentPath = window.location.pathname + window.location.search;
      console.log('正在重定向到登录页...');
      
      // 使用setTimeout确保重定向代码可以完成执行
      setTimeout(() => {
        window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
      }, 100);
    }
    throw error;
  }
};

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 记录所有请求的路径和数据
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      console.log('=====================HTTP POST 请求开始=====================');
      console.log(`请求URL: ${config.baseURL}${config.url}`);
      
      // 区分FormData和普通JSON数据
      if (config.data instanceof FormData) {
        console.log('请求数据: [FormData对象]');
        // 对于FormData请求，移除Content-Type，让浏览器自动设置带有boundary的正确值
        if (config.headers) {
          delete config.headers['Content-Type'];
        }
      } else {
        console.log('请求数据:', JSON.stringify(config.data, null, 2));
      }
      
      console.log('请求头:', JSON.stringify(config.headers, null, 2));
      console.log('=====================HTTP POST 请求结束=====================');
    }
    
    // 获取访问令牌
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    
    // 处理401错误（未授权）或403错误（禁止访问）
    if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
      console.log(`收到${status}错误，URL: ${originalRequest.url}`);
      
      // 跳过登录相关的API，避免循环
      const isLoginRequest = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/register');
      
      if (!isLoginRequest && !isRedirectingToLogin && window.location.pathname !== '/login') {
        console.log(`尝试刷新token...`);
        
        if (!isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const newToken = await refreshToken();
            isRefreshing = false;
            onTokenRefreshed(newToken);

            // 重试原始请求
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return http(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = []; // 清空等待队列
            
            clearAuthStorage(); // 恢复清除认证状态的调用
            
            console.error('刷新token失败，需要重新登录:', refreshError);
            
            // 如果不是登录页面，则重定向到登录页面
            if (!isRedirectingToLogin && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              isRedirectingToLogin = true;
              // 保存当前URL，以便登录后重定向回来
              const currentPath = window.location.pathname + window.location.search;
              console.log('正在重定向到登录页...');
              
              // 使用setTimeout确保重定向代码可以完成执行
              setTimeout(() => {
                window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
              }, 100);
            }
            
            return Promise.reject(refreshError);
          }
        } else {
          // 等待token刷新完成后重试请求
          console.log('等待其他请求刷新token完成...');
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(http(originalRequest));
            });
          });
        }
      } else if (isLoginRequest) {
        console.log('登录请求失败，不尝试刷新token');
      } else if (isRedirectingToLogin) {
        console.log('已经在重定向到登录页面，跳过重复处理');
      }
    }

    // 获取错误响应数据
    const errorResponse = error.response?.data;
    const errorMessage = errorResponse?.message || '请求失败，请稍后重试';
    
    // 统一的错误处理：为所有HTTP错误创建普通对象而不是Error实例，避免控制台错误
    const errorObj: {
      message: string;
      response?: typeof error.response;
      status?: number;
      data?: typeof errorResponse;
      isHttpError: boolean;
      inactive?: boolean;
      results?: any;
      connectionError?: string;
    } = {
      message: errorMessage,
      response: error.response,
      status: status,
      data: errorResponse,
      isHttpError: true
    };
    
    // 处理特殊情况，如数据源连接错误、账号未激活等
    if (errorResponse && typeof errorResponse === 'object') {
      // 添加特殊标记，如账号未激活
      if ('inactive' in errorResponse) {
        errorObj.inactive = !!errorResponse.inactive;
      }
      
      // 处理数据源相关错误
      if ('results' in errorResponse && errorResponse.results) {
        errorObj.results = errorResponse.results;
        
        // 数据源连接错误
        if (typeof errorResponse.results === 'object' && 'connection_error' in errorResponse.results) {
          errorObj.connectionError = errorResponse.results.connection_error;
        }
      }
    }
    
    // 记录错误信息但不使用console.error，避免在控制台显示错误堆栈
    console.log(`请求返回${status}错误:`, errorObj.message);
    
    return Promise.reject(errorObj);
  }
);

export default http; 