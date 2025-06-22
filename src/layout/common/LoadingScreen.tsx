"use client";

import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { css } from '@emotion/css';

interface LoadingScreenProps {
  children: React.ReactNode;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 在组件挂载后，设置一个短暂的延迟，然后隐藏加载屏幕
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300); // 300ms 通常足够让样式加载完成

    return () => clearTimeout(timer);
  }, []);

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