"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Tooltip, 
  Dropdown, 
  Empty, 
  Spin,
  Badge,
  App
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  MoreOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  TeamOutlined,
  DashboardOutlined,
  ReloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';
import TenantCreateModal from './TenantCreateModal';
import TenantEditModal from './TenantEditModal';
import TenantDetailModal from './TenantDetailModal';
import TenantDeleteConfirm from './TenantDeleteConfirm';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;
const { Search } = Input;

const TenantManagementContent: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { message } = App.useApp();
  
  // 加载租户列表数据
  const loadTenants = useCallback(async (pageNum = 1, replace = true) => {
    try {
      setLoading(true);
      const params = {
        page: pageNum,
        page_size: 12,
        search: searchText,
        is_active: statusFilter.length > 0 ? statusFilter.includes('active') : undefined
      };
      
      const data = await getTenants(params);
      
      if (replace) {
        setTenants(data.results);
      } else {
        setTenants(prev => [...prev, ...data.results]);
      }
      
      setHasMore(data.current_page < data.total_pages);
      setPage(data.current_page);
    } catch (error) {
      console.error('获取租户列表失败:', error);
      message.error('获取租户列表失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter, message]);

  // 初始加载
  useEffect(() => {
    loadTenants(1, true);
  }, [loadTenants]);

  // 设置交叉观察器，用于无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadTenants(page + 1, false);
        }
      },
      { threshold: 0.5 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loading, loadTenants, page]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
    loadTenants(1, true);
  };

  // 处理状态筛选
  const handleStatusFilter = (status: string[]) => {
    setStatusFilter(status);
    setPage(1);
    loadTenants(1, true);
  };

  // 处理创建租户
  const handleCreateTenant = () => {
    setCreateModalVisible(true);
  };

  // 处理编辑租户
  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditModalVisible(true);
  };

  // 处理查看租户详情
  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDetailModalVisible(true);
  };

  // 处理删除租户
  const handleDeleteTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteConfirmVisible(true);
  };

  // 处理刷新列表
  const handleRefresh = () => {
    loadTenants(1, true);
  };

  // 获取租户状态标签
  const getStatusTag = (tenant: Tenant) => {
    if (tenant.is_active) {
      return <Tag color="success">活跃</Tag>;
    } else {
      return <Tag color="default">未激活</Tag>;
    }
  };

  // 租户操作菜单
  const getActionMenu = (tenant: Tenant): MenuProps['items'] => [
    {
      key: 'manage',
      label: '租户管理',
      icon: <DashboardOutlined />,
      onClick: () => router.push(`/tenant-management/${tenant.id}`),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除租户',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteTenant(tenant),
    },
  ];

  // 状态筛选菜单
  const statusFilterMenu: MenuProps['items'] = [
    {
      key: 'all',
      label: '全部状态',
      onClick: () => handleStatusFilter([]),
    },
    {
      key: 'active',
      label: '活跃',
      onClick: () => handleStatusFilter(['active']),
    },
    {
      key: 'inactive',
      label: '未激活',
      onClick: () => handleStatusFilter(['inactive']),
    }
  ];

  return (
    <div>
      {/* 页面标题和操作区 */}
      <div className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      `}>
        {/* <Title level={2}>租户管理</Title> */}
        <div></div> {/* 空div占位，保持右对齐 */}
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateTenant}
          >
            创建租户
          </Button>
          <Search
            placeholder="搜索租户名称或代码"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Dropdown menu={{ items: statusFilterMenu }} placement="bottomRight">
            <Button icon={<FilterOutlined />}>
              {statusFilter.length > 0 ? `已筛选 (${statusFilter.length})` : '状态筛选'}
            </Button>
          </Dropdown>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          >
            刷新
          </Button>
        </Space>
      </div>

      {/* 租户卡片列表 */}
      {loading && tenants.length === 0 ? (
        <div className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          height: 300px;
        `}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: 'rgba(0, 0, 0, 0.45)' }}>加载中...</div>
        </div>
      ) : tenants.length > 0 ? (
        <Row gutter={[16, 16]}>
          {tenants.map(tenant => (
            <Col xs={24} sm={12} md={8} lg={6} key={tenant.id}>
              <Badge.Ribbon 
                text={tenant.is_active ? '活跃' : '未激活'} 
                color={tenant.is_active ? 'green' : 'blue'}
              >
                <Card
                  hoverable
                  className={css`
                    height: 100%;
                    border-radius: 8px;
                    transition: all 0.3s;
                    
                    &:hover {
                      transform: translateY(-5px);
                      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                    }
                  `}
                  cover={
                    <div className={css`
                      height: 120px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                      border-top-left-radius: 8px;
                      border-top-right-radius: 8px;
                      overflow: hidden;
                    `}>
                      {tenant.logo ? (
                        <img 
                          src={tenant.logo} 
                          alt={tenant.name}
                          className={css`
                            max-width: 80%;
                            max-height: 80%;
                            object-fit: contain;
                          `}
                        />
                      ) : (
                        <Text 
                          strong
                          className={css`
                            font-size: 36px;
                            color: #1677ff;
                          `}
                        >
                          {tenant.name.substring(0, 2).toUpperCase()}
                        </Text>
                      )}
                    </div>
                  }
                  actions={[
                    <Tooltip title="查看详情" key="view">
                      <EyeOutlined onClick={() => handleViewTenant(tenant)} />
                    </Tooltip>,
                    <Tooltip title="编辑" key="edit">
                      <EditOutlined onClick={() => handleEditTenant(tenant)} />
                    </Tooltip>,
                    <Dropdown 
                      key="more" 
                      menu={{ items: getActionMenu(tenant) }} 
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <MoreOutlined />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div className={css`
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      `}>
                        <Tooltip title={tenant.name}>
                          <Text 
                            strong 
                            ellipsis={{ tooltip: tenant.name }}
                            className={css`max-width: 150px;`}
                          >
                            {tenant.name}
                          </Text>
                        </Tooltip>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={4} className={css`width: 100%;`}>
                        <Text type="secondary" ellipsis={{ tooltip: tenant.slug || tenant.code }}>
                          标识: {tenant.slug || tenant.code}
                        </Text>
                        <Text type="secondary" ellipsis={{ tooltip: tenant.subdomain }}>
                          子域名: {tenant.subdomain}
                        </Text>
                        <Text type="secondary">
                          创建于: {new Date(tenant.created_at).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description="暂无租户数据" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* 加载更多指示器 */}
      {hasMore && (
        <div 
          ref={observerRef} 
          className={css`
            text-align: center;
            margin-top: 20px;
            padding: 10px 0;
            height: 40px;
          `}
        >
          {loading && tenants.length > 0 && (
            <div>
              <Spin />
              <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>加载更多...</div>
            </div>
          )}
        </div>
      )}

      {/* 创建租户模态框 */}
      <TenantCreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={() => {
          setCreateModalVisible(false);
          loadTenants(1, true);
          message.success('租户创建成功');
        }}
      />

      {/* 编辑租户模态框 */}
      {selectedTenant && (
        <TenantEditModal
          visible={editModalVisible}
          tenant={selectedTenant}
          onCancel={() => setEditModalVisible(false)}
          onSuccess={() => {
            setEditModalVisible(false);
            loadTenants(1, true);
            // message.success('租户更新成功');
          }}
        />
      )}

      {/* 租户详情模态框 */}
      {selectedTenant && (
        <TenantDetailModal
          visible={detailModalVisible}
          tenant={selectedTenant}
          onCancel={() => setDetailModalVisible(false)}
        />
      )}

      {/* 删除确认对话框 */}
      {selectedTenant && (
        <TenantDeleteConfirm
          visible={deleteConfirmVisible}
          tenant={selectedTenant}
          onCancel={() => setDeleteConfirmVisible(false)}
          onSuccess={() => {
            setDeleteConfirmVisible(false);
            loadTenants(1, true);
            // message.success('租户删除成功');
          }}
        />
      )}
    </div>
  );
};

export default TenantManagementContent; 