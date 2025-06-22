"use client";

import { STORAGE_KEYS } from '@/constants/api';
import { UserInfo } from '@/types/user';

/**
 * 存储访问令牌到本地存储和Cookie
 * @param token 访问令牌
 */
export const setAccessToken = (token: string): void => {
  // 存储到localStorage
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  
  // 同时存储到cookie，有效期7天，确保使用与STORAGE_KEYS相同的键名
  if (typeof document !== 'undefined') {
    const d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${token};${expires};path=/;SameSite=Lax`;
  }
};

/**
 * 从本地存储获取访问令牌
 * @returns 访问令牌或null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * 存储刷新令牌到本地存储和Cookie
 * @param token 刷新令牌
 */
export const setRefreshToken = (token: string): void => {
  // 存储到localStorage
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  
  // 同时存储到cookie，有效期30天，确保使用与STORAGE_KEYS相同的键名
  if (typeof document !== 'undefined') {
    const d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=${token};${expires};path=/;SameSite=Lax`;
  }
};

/**
 * 从本地存储获取刷新令牌
 * @returns 刷新令牌或null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * 存储用户信息到本地存储
 * @param userInfo 用户信息对象
 */
export const setUserInfo = (userInfo: UserInfo): void => {
  if (!userInfo || typeof userInfo !== 'object' || !userInfo.id || !userInfo.username) {
    console.error('尝试存储无效的用户信息:', userInfo);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
};

/**
 * 从本地存储获取用户信息
 * @returns 用户信息对象或null
 */
export const getUserInfo = (): UserInfo | null => {
  const userInfoStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  if (!userInfoStr || userInfoStr === "undefined") return null;
  
  try {
    const parsed = JSON.parse(userInfoStr);
    // 额外验证解析后的对象是否符合UserInfo基本结构
    if (!parsed || typeof parsed !== 'object' || !parsed.id || !parsed.username) {
      console.error('存储的用户信息不完整:', parsed);
      return null;
    }
    return parsed as UserInfo;
  } catch (error) {
    console.error('解析用户信息失败:', error);
    // 清除损坏的数据
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    return null;
  }
};

/**
 * 存储会话ID到本地存储
 * @param sessionId 会话ID
 */
export const setSessionId = (sessionId: string): void => {
  localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
};

/**
 * 从本地存储获取会话ID
 * @returns 会话ID或null
 */
export const getSessionId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.SESSION_ID);
};

/**
 * 清除所有认证相关的本地存储
 */
export const clearAuthStorage = (): void => {
  // 清除localStorage中的认证数据
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.SESSION_ID);
  
  // 清除cookies中的认证数据，使用与STORAGE_KEYS相同的键名
  if (typeof document !== 'undefined') {
    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    document.cookie = `${STORAGE_KEYS.REFRESH_TOKEN}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
    // 同时清除旧的键名，确保兼容性
    document.cookie = 'access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
    document.cookie = 'refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax';
  }
};

/**
 * 从cookie获取访问令牌
 * @returns cookie中的访问令牌或null
 */
export const getAccessTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${STORAGE_KEYS.ACCESS_TOKEN}=`)) {
      return cookie.substring(STORAGE_KEYS.ACCESS_TOKEN.length + 1);
    }
    // 兼容旧版本
    if (cookie.startsWith('access_token=')) {
      return cookie.substring('access_token='.length);
    }
  }
  return null;
};

/**
 * 从cookie获取刷新令牌
 * @returns cookie中的刷新令牌或null
 */
export const getRefreshTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(`${STORAGE_KEYS.REFRESH_TOKEN}=`)) {
      return cookie.substring(STORAGE_KEYS.REFRESH_TOKEN.length + 1);
    }
    // 兼容旧版本
    if (cookie.startsWith('refresh_token=')) {
      return cookie.substring('refresh_token='.length);
    }
  }
  return null;
};

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const isAuthenticated = (): boolean => {
  // 同时检查localStorage和cookie中的token
  const localStorageToken = getAccessToken();
  const cookieToken = getAccessTokenFromCookie();
  const userInfo = getUserInfo();
  
  return !!(localStorageToken || cookieToken) && !!userInfo;
};

/**
 * 从 cookies 获取会话ID
 * @returns 会话ID或null
 */
export const getSessionIdFromCookies = (): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('sessionId=')) {
      return cookie.substring('sessionId='.length);
    }
  }
  return null;
};

/**
 * 将会话ID保存到cookies
 * @param sessionId 会话ID
 * @param expiresInDays cookie过期天数，默认为1天
 */
export const setSessionIdInCookies = (sessionId: string, expiresInDays = 1): void => {
  if (typeof document === 'undefined') return;
  
  const d = new Date();
  d.setTime(d.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
  const expires = `expires=${d.toUTCString()}`;
  document.cookie = `sessionId=${sessionId};${expires};path=/;SameSite=Strict`;
};

/**
 * 从cookies中清除会话ID
 */
export const clearSessionIdFromCookies = (): void => {
  if (typeof document === 'undefined') return;
  
  // 设置过期时间为过去，使cookie立即失效
  document.cookie = 'sessionId=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict';
}; 