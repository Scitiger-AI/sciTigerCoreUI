"use client";

import React, { useEffect } from 'react';

// 这个组件用于预加载关键样式，防止FOUC
const StylePreloader: React.FC = () => {
  useEffect(() => {
    // 预加载Ant Design样式
    const preloadAntd = () => {
      // 检查是否已经存在相同的链接
      const existingLink = document.querySelector('link[href="/reset.min.css"]');
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/reset.min.css';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    };

    preloadAntd();
  }, []);

  return null; // 这个组件不渲染任何内容
};

export default StylePreloader; 