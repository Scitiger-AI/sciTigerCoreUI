"use client";

import React, { useState } from 'react';
import { Layout, Button, Space, Dropdown, Avatar, Menu, Tooltip, Typography, Spin } from 'antd';
import { 
  UserOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  HomeOutlined,
  SyncOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileProtectOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { getMediaUrl } from '@/utils/mediaUrl';
import NotificationIcon from '@/components/notification/NotificationIcon';
import { css } from '@emotion/css';
import LogoTitle from '@/components/ui/LogoTitle';
import LogoIcon from '@/components/ui/LogoIcon';
import { useRouter, usePathname } from 'next/navigation';
import { App } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
const { Header: AntHeader } = Layout;
const { Title } = Typography;

interface HeaderProps {
  collapsed: boolean;
  toggleCollapsed: () => void;
}

// 定义标题动画过渡效果
const titleAnimation = css`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes glowPulse {
    0% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
    50% {
      text-shadow: 0 0 20px rgba(22, 119, 255, 0.3), 0 0 30px rgba(22, 119, 255, 0.2);
    }
    100% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
  }
`;

export const Header: React.FC<HeaderProps> = ({ collapsed, toggleCollapsed }) => {
  const { user, isLoggedIn, logout, refreshUserInfo, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { message } = App.useApp();
  const isHomePage = pathname === '/' || pathname?.startsWith('/tenant-management');
  const [syncLoading, setSyncLoading] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login'); // 登出后跳转到登录页
    } catch (error) {
      message.error('退出登录失败，请重试');
      console.error('登出错误:', error);
    }
  };

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleSyncUserInfo = async () => {
    if (syncLoading) return;
    
    setSyncLoading(true);
    try {
      await refreshUserInfo();
      message.success('用户状态已同步');
    } catch (error) {
      message.error('同步状态失败，请重新登录');
    } finally {
      setSyncLoading(false);
    }
  };

  const userMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人中心',
          onClick: () => router.push('/user-center'),
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '设置',
          onClick: () => router.push('/settings'),
        },
        {
          key: 'sync',
          icon: <SyncOutlined spin={syncLoading} />,
          label: '同步状态',
          onClick: handleSyncUserInfo,
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: handleLogout,
        },
      ]}
    />
  );

  // 导航菜单项
  const navItems = (
    <Space size={16} className={css`display: flex;`}>
      <Tooltip title="首页">
        <Button 
          type={isActive('/') ? "primary" : "text"}
          icon={<HomeOutlined />}
          onClick={() => handleNavClick('/')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/') ? 'bold' : 'normal'};
          `}
        >
          首页
        </Button>
      </Tooltip>
      
      <Tooltip title="租户管理">
        <Button 
          type={isActive('/tenant-management') ? "primary" : "text"}
          icon={<AppstoreOutlined />}
          onClick={() => handleNavClick('/tenant-management')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/tenant-management') ? 'bold' : 'normal'};
          `}
        >
          租户管理
        </Button>
      </Tooltip>
      
      <Tooltip title="用户权限管理">
        <Button 
          type={isActive('/user-permissions') ? "primary" : "text"}
          icon={<TeamOutlined />}
          onClick={() => handleNavClick('/user-permissions')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/user-permissions') ? 'bold' : 'normal'};
          `}
        >
          用户权限管理
        </Button>
      </Tooltip>
      
      <Tooltip title="审计日志管理">
        <Button 
          type={isActive('/audit-logs') ? "primary" : "text"}
          icon={<FileProtectOutlined />}
          onClick={() => handleNavClick('/audit-logs')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/audit-logs') ? 'bold' : 'normal'};
          `}
        >
          审计日志管理
        </Button>
      </Tooltip>
      
      <Tooltip title="通知中心管理">
        <Button 
          type={isActive('/notification-management') ? "primary" : "text"}
          icon={<BellOutlined />}
          onClick={() => handleNavClick('/notification-management')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/notification-management') ? 'bold' : 'normal'};
          `}
        >
          通知中心管理
        </Button>
      </Tooltip>
      
      <Tooltip title="订单订阅管理">
        <Button 
          type={isActive('/order-subscription') ? "primary" : "text"}
          icon={<ShoppingCartOutlined />}
          onClick={() => handleNavClick('/order-subscription')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/order-subscription') ? 'bold' : 'normal'};
          `}
        >
          订单订阅管理
        </Button>
      </Tooltip>
      
      <Tooltip title="微服务管理">
        <Button 
          type={isActive('/microservices') ? "primary" : "text"}
          icon={<CloudServerOutlined />}
          onClick={() => handleNavClick('/microservices')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/microservices') ? 'bold' : 'normal'};
          `}
        >
          微服务管理
        </Button>
      </Tooltip>
      
      <Tooltip title="工作流管理">
        <Button 
          type={isActive('/workflow') ? "primary" : "text"}
          icon={<DeploymentUnitOutlined />}
          onClick={() => handleNavClick('/workflow')}
          className={css`
            height: 40px;
            padding: 0 16px;
            font-weight: ${isActive('/workflow') ? 'bold' : 'normal'};
          `}
        >
          工作流管理
        </Button>
      </Tooltip>
    </Space>
  );

  // 渲染用户区域
  const renderUserArea = () => {
    if (isLoading) {
      return (
        <div className={css`
          display: flex;
          align-items: center;
          padding: 0 12px;
        `}>
          <Spin size="small" />
          <span className={css`margin-left: 8px;`}>加载中...</span>
        </div>
      );
    }
    
    if (isLoggedIn) {
      return (
        <>
          <NotificationIcon 
            className={css`
              margin-right: 16px;
            `}
          />
          <Dropdown dropdownRender={() => userMenu} placement="bottomRight">
            <div
              className={css`
                display: flex;
                align-items: center;
                cursor: pointer;
                padding: 0 12px;
              `}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                src={getMediaUrl(user?.avatar)}
                className={css`
                  margin-right: 8px;
                  background-color: #1677ff;
                `}
              />
              <span>{user?.username}</span>
            </div>
          </Dropdown>
        </>
      );
    }
    
    return (
      <Space>
        <Link href="/login" passHref>
          <Button type="primary" icon={<UserOutlined />}>
            登录
          </Button>
        </Link>
        <Link href="/register" passHref>
          <Button>注册</Button>
        </Link>
      </Space>
    );
  };

  return (
    <AntHeader
      className={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0;
        background-color: #fff;
        box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
        height: 64px;
        position: sticky;
        top: 0;
        z-index: 100;
        width: 100%;
        margin-left: 0;
      `}
    >
      {isHomePage ? (
        // 首页模式下的布局 - 显示Logo和居中导航
        <>
          <div className={css`
            display: flex;
            align-items: center;
            width: 280px;
            padding-left: 16px;
            ${titleAnimation}
          `}>
            <div className={css`
              height: 64px;
              width: 64px;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              // padding-top: 1px;
            `}>
              <LogoIcon />
            </div>
            <Title
              level={3}
              className={css`
                margin-top: 12px;
                background: linear-gradient(to right, #1677ff, #06f);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                letter-spacing: 1px;
                animation: glowPulse 3s infinite;
                white-space: nowrap;
              `}
            >
              科虎基础服务管理
            </Title>
          </div>
          
          <div className={css`
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          `}>
            {navItems}
          </div>
          
          <div className={css`
            margin-right: 24px;
            display: flex;
            align-items: center;
            width: 220px;
            justify-content: flex-end;
          `}>
            {renderUserArea()}
          </div>
        </>
      ) : (
        // 非首页模式下的布局 - 现在也使用居中导航
        <>
          <div className={css`
            display: flex;
            align-items: center;
            width: 280px;
            padding-left: 16px;
          `}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              className={css`
                font-size: 16px;
                width: 64px;
                height: 64px;
              `}
            />
            <Title
              level={3}
              className={css`
                margin-top: 12px;
                margin-right: 12px;
                background: linear-gradient(to right, #1677ff, #06f);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                letter-spacing: 1px;
                animation: glowPulse 3s infinite;
                white-space: nowrap;
              `}
            >
              科虎基础服务管理
            </Title>
          </div>
          
          <div className={css`
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
          `}>
            {navItems}
          </div>
          
          <div
            className={css`
              margin-right: 24px;
              display: flex;
              align-items: center;
              width: 220px;
              justify-content: flex-end;
            `}
          >
            {renderUserArea()}
          </div>
        </>
      )}
    </AntHeader>
  );
};

export default Header; 