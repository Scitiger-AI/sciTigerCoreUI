"use client";

import React, { useEffect } from 'react';
import { useError } from '@/contexts/ErrorContext';
import { handleApiError } from '@/utils/errorHandler';

export const ErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { handleError } = useError();

  useEffect(() => {
    // 全局错误处理函数
    const handleGlobalError = (error: unknown) => {
      handleError(error);
    };

    // 添加全局未捕获异常处理
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleGlobalError(event.reason);
      // 阻止默认处理
      event.preventDefault();
    };

    // 添加全局错误处理
    const handleGlobalErrorEvent = (event: ErrorEvent) => {
      handleGlobalError(event.error);
      // 阻止默认处理
      event.preventDefault();
    };

    // 注册事件监听器
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalErrorEvent);

    // 清理函数
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalErrorEvent);
    };
  }, [handleError]);

  return <>{children}</>;
};

export default ErrorHandler; 