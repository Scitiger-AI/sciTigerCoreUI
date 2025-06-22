"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Divider, theme, Typography, Space, Spin, Avatar } from 'antd';
import { css } from '@emotion/css';
import {
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileProtectOutlined,
  BellOutlined,
  ShoppingCartOutlined,
  CloudServerOutlined,
  DeploymentUnitOutlined,
  UserOutlined,
  SettingOutlined,
  ApiOutlined,
  CloudUploadOutlined,
  FileSearchOutlined,
  AuditOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  InteractionOutlined,
  MobileOutlined,
  EyeOutlined,
  PieChartOutlined,
  FileTextOutlined,
  WarningOutlined,
  RobotOutlined,
  FundProjectionScreenOutlined,
  KeyOutlined,
  MonitorOutlined,
  ApiOutlined as Api2Outlined,
  LockOutlined,
  SolutionOutlined,
  ClusterOutlined,
  DollarOutlined,
  ContainerOutlined,
  FundOutlined,
  FolderOutlined,
  GlobalOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import LogoIcon from '@/components/ui/LogoIcon';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';
import { App } from 'antd';
import { getMediaUrl } from '@/utils/mediaUrl';

const { Sider } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

interface SidebarProps {
  collapsed: boolean;
}

// 创建菜单项
function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { message } = App.useApp();
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['home']);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const { token } = theme.useToken();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  
  // 获取当前的主模块路径
  const getCurrentModule = (): string => {
    if (pathname?.startsWith('/user-center')) return 'user-center';
    if (pathname?.startsWith('/notification-center')) return 'notification-center';
    if (pathname?.startsWith('/settings')) return 'settings';
    if (pathname?.startsWith('/tenant-management')) return 'tenant-management';
    if (pathname?.startsWith('/user-permissions')) return 'user-permissions';
    if (pathname?.startsWith('/audit-logs')) return 'audit-logs';
    if (pathname?.startsWith('/notification-management')) return 'notification-management';
    if (pathname?.startsWith('/order-subscription')) return 'order-subscription';
    if (pathname?.startsWith('/microservices')) return 'microservices';
    if (pathname?.startsWith('/workflow')) return 'workflow';
    return 'home';
  };
  
  // 加载租户列表
  useEffect(() => {
    const loadTenants = async () => {
      // 只有在用户权限管理模块才加载租户
      if (getCurrentModule() !== 'user-permissions') return;
      
      setLoadingTenants(true);
      try {
        const response = await getTenants({ page: 1, page_size: 10, status: ['active'] });
        setTenants(response.results);
      } catch (error: any) {
        console.error('加载租户列表失败:', error);
      } finally {
        setLoadingTenants(false);
      }
    };
    
    loadTenants();
  }, [pathname]);
  
  // 根据当前路径和查询参数更新选中的菜单项
  useEffect(() => {
    const pathParts = pathname?.split('/') || [];
    const tenantId = searchParams.get('tenant');
    const module = getCurrentModule();
    
    if (pathname === '/') {
      setSelectedKeys(['home']);
    } else if (module === 'user-permissions' && tenantId) {
      // 如果是用户权限管理页面且有租户ID参数，选中对应的租户菜单项
      setSelectedKeys([`tenant-${tenantId}`]);
    } else {
      // 如果路径包含子路径，选中子菜单项
      if (pathParts.length > 2) {
        setSelectedKeys([pathParts[pathParts.length - 1]]);
        setOpenKeys([pathParts[1]]);
      } else {
        setSelectedKeys([pathParts[1]]);
      }
    }
  }, [pathname, searchParams]);

  // 处理菜单项点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const module = getCurrentModule();
    
    if (key === 'home') {
      router.push('/');
    } else if (['user-center', 'notification-center', 'settings'].includes(key as string)) {
      // 直接跳转到对应页面
      router.push(`/${key}`);
    } else if (key === 'user-permissions') {
      // 跳转到用户权限管理主页
      router.push('/user-permissions');
    } else if (key.toString().startsWith('tenant-')) {
      // 处理租户子菜单项点击，提取租户ID
      const tenantId = key.toString().replace('tenant-', '');
      router.push(`/user-permissions?tenant=${tenantId}`);
    } else if (module === 'home') {
      router.push(`/${key}`);
    } else {
      // 处理子菜单项点击
      router.push(`/${module}/${key}`);
    }
  };

  // 获取模块子标题
  const getModuleSubtitle = () => {
    const module = getCurrentModule();
    
    switch (module) {
      case 'user-center':
        return 'User Center';
      case 'notification-center':
        return 'Notification Center';
      case 'settings':
        return 'Settings';
      case 'tenant-management':
        return 'Tenant Management';
      case 'user-permissions':
        return 'User Permissions';
      case 'audit-logs':
        return 'Audit Logs';
      case 'notification-management':
        return 'Notification Management';
      case 'order-subscription':
        return 'Order & Subscription';
      case 'microservices':
        return 'Microservices';
      case 'workflow':
        return 'Workflow';
      default:
        return 'Web UI';
    }
  };

  // 租户管理子菜单
  const getTenantManagementMenuItems = (): MenuItem[] => [
    getItem('租户列表', 'tenant-list', <AppstoreOutlined />),
    getItem('租户分类', 'tenant-categories', <FolderOutlined />),
    getItem('租户发布', 'tenant-publish', <CloudUploadOutlined />),
    getItem('租户集成', 'tenant-integration', <ApiOutlined />),
    getItem('租户监控', 'tenant-monitoring', <MonitorOutlined />),
  ];

  // 用户权限管理子菜单
  const getUserPermissionsMenuItems = (): MenuItem[] => {
    // 基础菜单项
    const baseItems: MenuItem[] = [
      getItem('所有租户', 'user-permissions', <GlobalOutlined />)
    ];
    
    // 如果正在加载租户，显示加载中
    if (loadingTenants) {
      baseItems.push(
        getItem(
          <span>
            <LoadingOutlined style={{ marginRight: 8 }} />
            加载租户中...
          </span>,
          'loading-tenants'
        )
      );
      return baseItems;
    }
    
    // 添加租户子菜单项
    tenants.forEach(tenant => {
      // 创建租户图标：如果有Logo则使用Logo，否则使用GlobalOutlined图标
      const tenantIcon = tenant.logo ? (
        <Avatar 
          src={getMediaUrl(tenant.logo)} 
          size={18} 
          style={{ marginRight: 0 }}
          icon={<GlobalOutlined />} // 图片加载失败时的备选图标
        />
      ) : (
        <GlobalOutlined />
      );
      
      baseItems.push(
        getItem(tenant.name, `tenant-${tenant.id}`, tenantIcon)
      );
    });
    
    return baseItems;
  };

  // 审计日志管理子菜单
  const getAuditLogsMenuItems = (): MenuItem[] => [
    getItem('操作日志', 'operation-logs', <FileProtectOutlined />),
    getItem('安全审计', 'security-logs', <FileSearchOutlined />),
    getItem('系统日志', 'system-logs', <AuditOutlined />),
    getItem('日志分析', 'log-analysis', <AreaChartOutlined />),
  ];

  // 通知中心管理子菜单
  const getNotificationManagementMenuItems = (): MenuItem[] => [
    getItem('通知模板', 'notification-templates', <FileTextOutlined />),
    getItem('通知渠道', 'notification-channels', <BellOutlined />),
    getItem('通知规则', 'notification-rules', <WarningOutlined />),
    getItem('通知历史', 'notification-history', <FileSearchOutlined />),
  ];

  // 订单订阅管理子菜单
  const getOrderSubscriptionMenuItems = (): MenuItem[] => [
    getItem('订单管理', 'orders', <ShoppingCartOutlined />),
    getItem('订阅管理', 'subscriptions', <DollarOutlined />),
    getItem('计费规则', 'billing-rules', <FundOutlined />),
    getItem('支付配置', 'payment-config', <SettingOutlined />),
  ];

  // 微服务管理子菜单
  const getMicroservicesMenuItems = (): MenuItem[] => [
    getItem('服务列表', 'service-list', <CloudServerOutlined />),
    getItem('服务注册', 'service-registry', <CloudUploadOutlined />),
    getItem('服务配置', 'service-config', <SettingOutlined />),
    getItem('服务监控', 'service-monitoring', <MonitorOutlined />),
    getItem('API网关', 'api-gateway', <ApiOutlined />),
  ];

  // 工作流管理子菜单
  const getWorkflowMenuItems = (): MenuItem[] => [
    getItem('流程定义', 'workflow-definitions', <DeploymentUnitOutlined />),
    getItem('流程实例', 'workflow-instances', <ContainerOutlined />),
    getItem('任务管理', 'workflow-tasks', <FileTextOutlined />),
    getItem('流程设计器', 'workflow-designer', <FundProjectionScreenOutlined />),
  ];

  // 用户相关页面菜单
  const getUserRelatedMenuItems = (): MenuItem[] => [
    getItem('个人中心', 'user-center', <UserOutlined />),
    getItem('通知中心', 'notification-center', <BellOutlined />),
    getItem('系统设置', 'settings', <SettingOutlined />),
  ];

  // 根据当前模块获取对应的子菜单
  const getMenuItemsByModule = (): MenuItem[] => {
    const module = getCurrentModule();
    
    switch (module) {
      case 'user-center':
      case 'notification-center':
      case 'settings':
        return getUserRelatedMenuItems();
      case 'tenant-management':
        return getTenantManagementMenuItems();
      case 'user-permissions':
        return getUserPermissionsMenuItems();
      case 'audit-logs':
        return getAuditLogsMenuItems();
      case 'notification-management':
        return getNotificationManagementMenuItems();
      case 'order-subscription':
        return getOrderSubscriptionMenuItems();
      case 'microservices':
        return getMicroservicesMenuItems();
      case 'workflow':
        return getWorkflowMenuItems();
      default:
        return [getItem('首页', 'home', <HomeOutlined />)];
    }
  };

  // 获取模块图标
  const getModuleIcon = () => {
    const module = getCurrentModule();
    
    switch (module) {
      case 'user-center':
        return <UserOutlined />;
      case 'notification-center':
        return <BellOutlined />;
      case 'settings':
        return <SettingOutlined />;
      case 'tenant-management':
        return <AppstoreOutlined />;
      case 'user-permissions':
        return <TeamOutlined />;
      case 'audit-logs':
        return <FileProtectOutlined />;
      case 'notification-management':
        return <BellOutlined />;
      case 'order-subscription':
        return <ShoppingCartOutlined />;
      case 'microservices':
        return <CloudServerOutlined />;
      case 'workflow':
        return <DeploymentUnitOutlined />;
      default:
        return <HomeOutlined />;
    }
  };

  // 获取模块标题
  const getModuleTitle = () => {
    const module = getCurrentModule();
    
    switch (module) {
      case 'user-center':
        return '个人中心';
      case 'notification-center':
        return '通知中心';
      case 'settings':
        return '系统设置';
      case 'tenant-management':
        return '租户管理';
      case 'user-permissions':
        return '用户权限管理';
      case 'audit-logs':
        return '审计日志管理';
      case 'notification-management':
        return '通知中心管理';
      case 'order-subscription':
        return '订单订阅管理';
      case 'microservices':
        return '微服务管理';
      case 'workflow':
        return '工作流管理';
      default:
        return '首页';
    }
  };

  // 菜单样式
  const menuStyle = css`
    border-right: 0;
    flex: 1;
    padding: 8px;
    background: transparent;
    
    .ant-menu-item {
      margin: 4px 0;
      border-radius: 8px;
      height: 50px;
      display: flex;
      align-items: center;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
      }
      
      &.ant-menu-item-selected {
        background-color: ${token.colorPrimaryBg};
        font-weight: 500;
        
        .anticon {
          color: ${token.colorPrimary};
        }
      }
    }
    
    .ant-menu-item .ant-menu-item-icon {
      font-size: 18px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ant-menu-item .ant-avatar {
      margin-right: 0;
      font-size: 18px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .ant-menu-title-content {
      margin-left: 10px;
      font-size: 14px;
    }
  `;

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={css`
        height: 100vh;
        background: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
      `}
    >
      <div className={css`
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
      `}>
        <LogoIcon />
      </div>
      <Divider style={{ margin: '0 0 8px 0' }} />
      
      {!collapsed && (
        <div className={css`
          padding: 16px 16px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
        `}>
          <div className={css`
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${token.colorBgContainer};
            border: 1px solid ${token.colorBorderSecondary};
            border-radius: 8px;
            width: 100%;
            padding: 12px;
          `}>
            <div className={css`
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 36px;
              border-radius: 8px;
              background-color: ${token.colorPrimaryBg};
              margin-right: 12px;
            `}>
              {getModuleIcon()}
            </div>
            <div className={css`
              display: flex;
              flex-direction: column;
            `}>
              <Text strong>{getModuleTitle()}</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getModuleSubtitle()}
              </Text>
            </div>
          </div>
        </div>
      )}
      
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        onClick={handleMenuClick}
        items={getMenuItemsByModule()}
        className={menuStyle}
      />
    </Sider>
  );
}; 