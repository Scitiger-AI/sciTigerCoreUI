"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '@/types/notification';
import { NotificationParams } from '@/types/notification';
import { useAuth } from './AuthContext';
import { App } from 'antd';

// 通知上下文类型
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  selectedNotification: Notification | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  fetchNotifications: (params?: NotificationParams) => Promise<{
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
  } | undefined>;
  fetchMoreNotifications: () => Promise<void>;
  getNotificationDetail: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

// 创建上下文
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 通知提供者属性
interface NotificationProviderProps {
  children: ReactNode;
}

// 通知提供者组件
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { isLoggedIn } = useAuth();
  const { message } = App.useApp();

  // 注释: 暂不请求后端数据，以下方法仅返回模拟数据或空结果

  // 刷新未读通知数量
  const refreshUnreadCount = async (): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('刷新未读通知数量 - 暂不请求后端数据');
  };

  // 获取通知列表
  const fetchNotifications = async (params?: NotificationParams): Promise<{
    total: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    next: string | null;
    previous: string | null;
  } | undefined> => {
    // 注释: 暂不请求后端数据
    console.log('获取通知列表 - 暂不请求后端数据', params);
    
    return {
      total: 0,
      pageSize: 10,
      currentPage: 1,
      totalPages: 0,
      next: null,
      previous: null
    };
  };

  // 获取更多通知
  const fetchMoreNotifications = async (): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('加载更多通知 - 暂不请求后端数据');
  };

  // 获取通知详情
  const getNotificationDetail = async (id: number): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('获取通知详情 - 暂不请求后端数据', id);
  };

  // 标记为已读
  const markAsRead = async (id: number): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('标记通知为已读 - 暂不请求后端数据', id);
  };

  // 标记为未读
  const markAsUnread = async (id: number): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('标记通知为未读 - 暂不请求后端数据', id);
  };

  // 标记所有为已读
  const markAllAsRead = async (): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('标记所有通知为已读 - 暂不请求后端数据');
  };

  // 删除通知
  const deleteNotification = async (id: number): Promise<void> => {
    // 注释: 暂不请求后端数据
    console.log('删除通知 - 暂不请求后端数据', id);
  };

  // 上下文值
  const value = {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore,
    selectedNotification,
    activeTab,
    setActiveTab,
    fetchNotifications,
    fetchMoreNotifications,
    getNotificationDetail,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// 使用通知上下文的钩子
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 