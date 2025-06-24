"use client";

import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { css } from '@emotion/css';
import { AppstoreOutlined, ApartmentOutlined, ToolOutlined } from '@ant-design/icons';
import ServiceManagement from './service-scope/ServiceManagement';
import ResourceManagement from './service-scope/ResourceManagement';
import ActionManagement from './service-scope/ActionManagement';

interface ServiceScopeManagementProps {
  tenantId?: string | null;
}

const ServiceScopeManagement: React.FC<ServiceScopeManagementProps> = ({ tenantId }) => {
  const [activeTab, setActiveTab] = useState<string>('services');
  
  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };
  
  // Tab项配置
  const tabItems = [
    {
      key: 'services',
      label: (
        <div>
          <AppstoreOutlined />
          服务管理
        </div>
      ),
      children: <ServiceManagement tenantId={tenantId} />
    },
    {
      key: 'resources',
      label: (
        <div>
          <ApartmentOutlined />
          资源管理
        </div>
      ),
      children: <ResourceManagement tenantId={tenantId} />
    },
    {
      key: 'actions',
      label: (
        <div>
          <ToolOutlined />
          操作管理
        </div>
      ),
      children: <ActionManagement tenantId={tenantId} />
    }
  ];
  
  return (
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        className={css`
          .ant-tabs-nav {
            margin-bottom: 16px;
          }
          .ant-tabs-tab {
            padding: 8px 16px;
          }
        `}
        items={tabItems}
      />
    </div>
  );
};

export default ServiceScopeManagement; 