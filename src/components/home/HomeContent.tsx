"use client";

import React from 'react';
import { css } from '@emotion/css';
import { Typography, Card, Space } from 'antd';

const { Title, Paragraph } = Typography;

export const HomeContent: React.FC = () => {
  return (
    <div className={css`
      width: 100%;
      padding: 24px;
    `}>
      <Card 
        className={css`
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        `}
      >
        <Space direction="vertical" size="large">
          <Title level={2}>欢迎使用科虎多租户应用基础服务管理平台</Title>
          <Paragraph>
            这是一个空白首页。通知中心和个人中心功能已保留但暂不请求后端数据。
          </Paragraph>
        </Space>
      </Card>
    </div>
  );
};

export default HomeContent; 