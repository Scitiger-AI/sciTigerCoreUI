import { ApiResponse } from './api';

// 通知类型
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';

// 通知状态
export type NotificationStatus = 'read' | 'unread';

// 通知对象
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  created_at: string;
  target_url?: string;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
}

// 通知参数
export interface NotificationParams {
  page?: number;
  page_size?: number;
  type?: NotificationType[];
  status?: NotificationStatus;
}

// 通知列表响应
export interface NotificationListResponse extends ApiResponse<{
  total: number;
  page_size: number;
  current_page: number;
  total_pages: number;
  results: Notification[];
}> {}

// 通知统计响应
export interface NotificationStatsResponse extends ApiResponse<{
  unread_count: number;
  total_count: number;
}> {}
