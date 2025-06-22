"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { App } from 'antd';
import { ErrorInfo, handleApiError, getFriendlyErrorMessage } from '@/utils/errorHandler';

// 错误上下文接口
interface ErrorContextType {
  error: ErrorInfo | null;
  setError: (error: Error | any) => void;
  clearError: () => void;
  handleError: (error: Error | any) => void;
}

// 创建错误上下文
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// 错误提供者属性接口
interface ErrorProviderProps {
  children: ReactNode;
}

// 错误提供者组件
export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setErrorState] = useState<ErrorInfo | null>(null);
  const { message, notification } = App.useApp();

  // 设置错误
  const setError = (err: Error | any) => {
    const errorInfo = handleApiError(err);
    setErrorState(errorInfo);
    return errorInfo;
  };

  // 清除错误
  const clearError = () => {
    setErrorState(null);
  };

  // 处理错误
  const handleError = (err: Error | any) => {
    const errorInfo = setError(err);
    const friendlyMessage = getFriendlyErrorMessage(errorInfo);

    // 根据错误类型选择不同的显示方式
    switch (errorInfo.type) {
      case 'authentication':
        // 身份验证错误，使用通知
        notification.error({
          message: '身份验证失败',
          description: friendlyMessage,
          duration: 4.5,
        });
        break;
      case 'authorization':
        // 授权错误，使用通知
        notification.error({
          message: '权限不足',
          description: friendlyMessage,
          duration: 4.5,
        });
        break;
      case 'server_error':
        // 服务器错误，使用通知
        notification.error({
          message: '服务器错误',
          description: friendlyMessage,
          duration: 4.5,
        });
        break;
      default:
        // 其他错误，使用消息提示
        message.error(friendlyMessage);
        break;
    }

    return errorInfo;
  };

  // 上下文值
  const value = {
    error,
    setError,
    clearError,
    handleError,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

// 使用错误上下文的钩子
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}; 