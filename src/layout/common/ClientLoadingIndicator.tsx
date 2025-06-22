"use client";

import React, { useEffect } from 'react';

const ClientLoadingIndicator: React.FC = () => {
  useEffect(() => {
    // 在客户端加载完成后移除初始加载指示器
    const removeInitialLoader = () => {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
          if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
          }
        }, 300);
      }
    };

    // 在组件挂载后移除加载指示器
    removeInitialLoader();
  }, []);

  return null; // 这个组件不渲染任何内容
};

export default ClientLoadingIndicator; 