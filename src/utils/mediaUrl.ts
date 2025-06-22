"use client";

import { API_BASE_URL } from '@/constants/api';

/**
 * 获取媒体文件的完整URL
 * @param path 媒体文件路径
 * @returns 完整的媒体URL
 */
export const getMediaUrl = (path: string | undefined | null): string => {
  if (!path) return '/placeholder.png';
  
  // 如果是完整URL（以http或https开头），直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果是相对路径（以/开头），拼接API基础URL
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  
  // 否则，假定是相对于media的路径
  return `${API_BASE_URL}/media/${path}`;
}; 