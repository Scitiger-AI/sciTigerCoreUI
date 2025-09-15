"use client";

import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { css } from '@emotion/css';
import { useAuth } from '@/contexts/AuthContext';

interface LoadingScreenProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  const { isInitializing } = useAuth();

  useEffect(() => {
    // 设置最小延迟，确保页面样式加载完成
    const minDelayTimer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 150); // 减少最小延迟到150ms

    return () => clearTimeout(minDelayTimer);
  }, []);

  useEffect(() => {
    // 只有当最小延迟过去且AuthContext初始化完成时才隐藏加载屏幕
    if (minDelayPassed && !isInitializing) {
      setLoading(false);
    }
  }, [minDelayPassed, isInitializing]);

  return (
    <>
      {loading && (
        <div
          className={css`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 1;
            transition: opacity 0.3s ease-in-out;
          `}
        >
          <div
            className={css`
              text-align: center;
            `}
          >
            <Spin size="large" />
            <div
              className={css`
                margin-top: 16px;
                font-size: 16px;
                color: rgba(0, 0, 0, 0.65);
              `}
            >
              科虎多租户应用基础服务管理平台加载中...
            </div>
          </div>
        </div>
      )}
      <div
        className={css`
          visibility: ${loading ? 'hidden' : 'visible'};
          opacity: ${loading ? 0 : 1};
          transition: opacity 0.3s ease-in-out;
        `}
      >
        {children}
      </div>
    </>
  );
};

export default LoadingScreen; 