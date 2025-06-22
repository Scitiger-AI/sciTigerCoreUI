"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo, LoginParams } from '@/types/user';
import { getUserInfo, isAuthenticated, setUserInfo, getAccessToken, setAccessToken } from '@/utils/storage';
import { useRouter } from 'next/navigation';
import { App } from 'antd';
import { STORAGE_KEYS } from '@/constants/api';
import { login as apiLogin, getProfile } from '@/services/auth';

// 认证上下文接口
interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  updateUserInfo: (userInfo: UserInfo) => void;
  refreshUserInfo: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者属性接口
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 从cookie中读取access_token
 * @returns cookie中的access_token或null
 */
const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(STORAGE_KEYS.ACCESS_TOKEN + '=')) {
      return cookie.substring(STORAGE_KEYS.ACCESS_TOKEN.length + 1);
    }
  }
  return null;
};

/**
 * 检查是否需要同步认证状态
 * @returns 是否需要同步
 */
const isAuthSyncNeeded = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('auth_sync_needed=true')) {
      // 找到后立即清除该cookie
      document.cookie = 'auth_sync_needed=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
      return true;
    }
  }
  return false;
};

// 认证提供者组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { message } = App.useApp();

  // 从服务器获取用户信息
  const refreshUserInfo = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // 调用API获取用户信息
      const userInfo = await getProfile();
      // 更新状态和本地存储
      setUser(userInfo);
      setUserInfo(userInfo);
      console.log('用户信息已刷新', userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果获取失败，尝试从本地存储恢复
      const localUserInfo = getUserInfo();
      if (localUserInfo) {
        setUser(localUserInfo);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 立即从本地存储恢复用户信息（同步操作）
  const restoreUserFromStorage = (): boolean => {
    try {
      // 检查是否已认证
      if (isAuthenticated()) {
        const userInfo = getUserInfo();
        if (userInfo) {
          setUser(userInfo);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('恢复用户信息失败:', error);
      return false;
    }
  };

  // 检查用户是否已登录，同时处理localStorage和Cookie不一致的情况
  useEffect(() => {
    // 首先尝试同步恢复用户状态
    const hasRestoredUser = restoreUserFromStorage();
    
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // 标准的认证检查
        if (isAuthenticated()) {
          // 如果标记需要同步，或者从首页重定向过来，则刷新用户信息
          if (isAuthSyncNeeded() || !hasRestoredUser) {
            console.log('检测到同步标记或需要刷新，刷新用户信息...');
            try {
              await refreshUserInfo();
            } catch (error) {
              console.error('同步用户信息失败:', error);
            }
          }
          
          setIsLoading(false);
          return;
        }
        
        // 处理Cookie和localStorage不一致的情况
        const tokenFromCookie = getTokenFromCookie();
        const tokenFromLocalStorage = getAccessToken();
        
        // 如果Cookie中有token但localStorage中没有，或者没有用户信息
        if (tokenFromCookie && (!tokenFromLocalStorage || !getUserInfo())) {
          console.log('检测到认证状态不一致，尝试同步状态...');
          
          // 将Cookie中的token同步到localStorage
          if (tokenFromCookie && !tokenFromLocalStorage) {
            setAccessToken(tokenFromCookie);
          }
          
          // 尝试从服务器获取用户信息
          try {
            await refreshUserInfo();
          } catch (error) {
            console.error('自动同步用户信息失败:', error);
          }
        }
      } catch (error) {
        console.error('检查认证状态时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 如果没有恢复用户状态，则执行异步检查
    if (!hasRestoredUser) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
    
    // 添加事件监听器，在页面加载和用户从其他页面返回时重新检查认证状态
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 清理函数
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 登录方法
  const login = async (params: LoginParams): Promise<void> => {
    setIsLoading(true);
    try {
      // 调用真实API
      const userInfo = await apiLogin(params);
      setUser(userInfo);
      message.success('登录成功', 1);
      
      // 获取URL参数中的重定向路径
      const searchParams = new URLSearchParams(window.location.search);
      const redirectTo = searchParams.get('from') || '/';
      
      // 使用router进行跳转
      setTimeout(() => {
        router.push(redirectTo);
      }, 500);
    } catch (error) {
      // 将错误向上抛出，由组件处理
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注销方法
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // 注释: 暂不请求后端，直接清除本地存储
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      
      // 清除cookie
      document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      
      setUser(null);
      message.success('已安全退出');
      router.push('/login');
    } catch (error) {
      console.error('注销失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户信息方法
  const updateUserInfo = (newUserInfo: UserInfo) => {
    setUser(newUserInfo);
    setUserInfo(newUserInfo); // 更新本地存储
  };

  // 上下文值
  const value = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    logout,
    updateUserInfo,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 使用认证上下文的钩子
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 