"use client";

import http from '@/utils/http';
import { API_ENDPOINTS } from '@/constants/api';
import { ApiResponse } from '@/types/api';
import { LoginParams, LoginResponse, UserInfo, RegisterParams, RegisterResponse, RegisterResult } from '@/types/user';
import { setAccessToken, setRefreshToken, setUserInfo, clearAuthStorage } from '@/utils/storage';

/**
 * 用户登录
 * @param params 登录参数
 * @returns 登录响应
 */
export const login = async (params: LoginParams): Promise<UserInfo> => {
  try {
    console.log('开始登录请求，参数：', params.username);
    const response = await http.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, params);
    const { success, results, message } = response.data;
    
    if (success && results) {
      console.log('登录成功，保存认证信息');
      // 存储认证信息
      setAccessToken(results.access_token);
      setRefreshToken(results.refresh_token);
      
      // 提取用户信息（不含令牌）
      const { user } = results;
      
      // 确保有id字段
      const userInfo: UserInfo = {
        id: user.id || '1', // 确保有id，如果没有则使用默认值
        username: user.username,
        email: user.email,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_admin: user.is_admin,
        avatar: user.avatar || '',
      };
      
      // 存储用户信息
      console.log('存储用户信息:', userInfo);
      setUserInfo(userInfo);
      
      // 设置同步标记，确保其他标签页也能感知登录状态
      document.cookie = 'auth_sync_needed=true;path=/;max-age=60;SameSite=Lax';
      
      return userInfo;
    } else {
      console.error('登录失败:', message);
      throw new Error(message || '登录失败');
    }
  } catch (error: any) {
    console.error('登录请求异常:', error);
    throw error;
  }
};



/**
 * 用户注销
 */
export const logout = async (): Promise<void> => {
  try {
    await http.post(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    console.error('注销失败:', error);
  } finally {
    // 无论是否成功都清除本地存储
    clearAuthStorage();
  }
};

/**
 * 获取用户个人资料
 * @returns 用户信息
 */
export const getProfile = async (): Promise<UserInfo> => {
  console.log('开始获取用户个人资料');
  try {
    const response = await http.get<ApiResponse<UserInfo>>(API_ENDPOINTS.AUTH.PROFILE);
    const { success, results, message } = response.data;
    
    if (success && results) {
      console.log('获取个人资料成功:', results);
      // 更新本地存储的用户信息
      setUserInfo(results);
      return results;
    } else {
      console.error('获取个人资料失败:', message);
      throw new Error(message || '获取个人资料失败');
    }
  } catch (error) {
    console.error('获取个人资料请求异常:', error);
    throw error;
  }
};