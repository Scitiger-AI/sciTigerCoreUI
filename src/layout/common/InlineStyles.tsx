import React from 'react';

// 这个组件用于提供内联的关键CSS，防止FOUC
const InlineStyles: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      /* 基本布局样式 */
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background-color: #f0f2f5;
      }
      
      /* 基本布局结构 */
      .ant-layout {
        display: flex;
        width: 100%;
        min-height: 100vh;
      }
      
      .ant-layout-header {
        display: flex;
        align-items: center;
        padding: 0;
        background-color: #fff;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        height: 64px;
        position: sticky;
        top: 0;
        z-index: 100;
        width: 100%;
      }
      
      .ant-layout-sider {
        position: fixed;
        left: 0;
        height: 100vh;
        overflow: auto;
        z-index: 10;
      }
      
      .ant-layout-content {
        margin: 24px 16px;
        padding: 24px;
        background: #fff;
        min-height: 280px;
        border-radius: 6px;
      }
      
      /* 加载状态样式 */
      .loading-container {
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
      }
    ` }}
    />
  );
};

export default InlineStyles; 