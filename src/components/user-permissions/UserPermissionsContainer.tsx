"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography, Spin } from 'antd';
import { css } from '@emotion/css';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';
import ApiKeyManagement from './ApiKeyManagement';
import ServiceScopeManagement from './ServiceScopeManagement';
import { TeamOutlined, IdcardOutlined, SafetyOutlined, KeyOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

interface UserPermissionsContainerProps {
  tenantId?: string | null;
}

const UserPermissionsContainer: React.FC<UserPermissionsContainerProps> = ({ tenantId }) => {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('users');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  
  // 从URL查询参数中获取当前激活的标签页
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['users', 'roles', 'permissions', 'apikeys', 'servicescopes'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);
  
  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // 如果有tenantId参数，在URL中保留
    if (tenantId) {
      router.push(`/user-permissions?tenant=${tenantId}&tab=${key}`);
    } else {
      router.push(`/user-permissions?tab=${key}`);
    }
  };
  
  // Tab项配置
  const tabItems = [
    {
      key: 'users',
      label: (
        <div>
          <TeamOutlined />
          用户管理
        </div>
      ),
      children: <UserManagement tenantId={tenantId} />
    },
    {
      key: 'roles',
      label: (
        <div>
          <IdcardOutlined />
          角色管理
        </div>
      ),
      children: <RoleManagement tenantId={tenantId} />
    },
    {
      key: 'permissions',
      label: (
        <div>
          <SafetyOutlined />
          权限管理
        </div>
      ),
      children: <PermissionManagement tenantId={tenantId} />
    },
    {
      key: 'apikeys',
      label: (
        <div>
          <KeyOutlined />
          API密钥管理
        </div>
      ),
      children: <ApiKeyManagement tenantId={tenantId} />
    },
    {
      key: 'servicescopes',
      label: (
        <div>
          <AppstoreOutlined />
          服务范围管理
        </div>
      ),
      children: <ServiceScopeManagement tenantId={tenantId} />
    }
  ];
  
  return (
    <div className={css`padding: 24px;`}>
      <Card
        variant="borderless"
        className={css`
          min-height: 500px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        `}
      >
        {loading ? (
          <div className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            height: 400px;
          `}>
            <Spin size="large" />
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            type="card"
            className={css`
              .ant-tabs-nav {
                margin-bottom: 24px;
              }
              .ant-tabs-tab {
                padding: 12px 16px;
              }
            `}
            items={tabItems}
          />
        )}
      </Card>
    </div>
  );
};

export default UserPermissionsContainer; 