"use client";

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Tabs, 
  Spin, 
  Descriptions, 
  Tag, 
  Avatar, 
  Button, 
  Space,
  Breadcrumb,
  Divider,
  App
} from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  DashboardOutlined, 
  TeamOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
  CalendarOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { useRouter } from 'next/navigation';
import { getTenantDetail } from '@/services/tenant';
import { Tenant } from '@/types/tenant';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface TenantDetailPageProps {
  tenantId: string;
}

const TenantDetailPage: React.FC<TenantDetailPageProps> = ({ tenantId }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { message } = App.useApp();

  // 获取租户详情
  useEffect(() => {
    const fetchTenantDetail = async () => {
      try {
        setLoading(true);
        const data = await getTenantDetail(tenantId);
        setTenant(data);
      } catch (error) {
        console.error('获取租户详情失败:', error);
        message.error('获取租户详情失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetail();
  }, [tenantId, message]);

  // 获取租户状态标签
  const getStatusTag = (isActive?: boolean) => {
    if (isActive === true) {
      return <Tag color="success">活跃</Tag>;
    } else {
      return <Tag color="default">未激活</Tag>;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 处理返回
  const handleBack = () => {
    router.push('/tenant-management');
  };

  // 处理编辑
  const handleEdit = () => {
    router.push(`/tenant-management/${tenantId}/settings`);
  };

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        className={css`
          margin-bottom: 16px;
        `}
        items={[
          {
            title: <Link href="/tenant-management">租户管理</Link>,
          },
          {
            title: tenant?.name || '租户详情',
          },
        ]}
      />

      {/* 加载状态 */}
      {loading ? (
        <div className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        `}>
          <Spin size="large" tip="加载中...">
            <div className={css`
              width: 200px;
              height: 200px;
              background: transparent;
            `} />
          </Spin>
        </div>
      ) : tenant ? (
        <>
          {/* 租户基本信息卡片 */}
          <Card
            className={css`
              margin-bottom: 24px;
            `}
            title={
              <div className={css`
                display: flex;
                align-items: center;
              `}>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  style={{ marginRight: 16 }}
                >
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>租户详情</Title>
              </div>
            }
            extra={
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑租户
              </Button>
            }
          >
            <div className={css`
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            `}>
              <Avatar
                size={80}
                src={tenant.logo}
                icon={<UserOutlined />}
                className={css`
                  margin-right: 24px;
                  background-color: #1677ff;
                `}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>{tenant.name}</Title>
                <Space size={12}>
                  <Text type="secondary"><CodeOutlined /> {tenant.code}</Text>
                  {getStatusTag(tenant.is_active)}
                </Space>
              </div>
            </div>

            <Divider />

            <Descriptions
              column={{ xs: 1, sm: 2, md: 3 }}
              styles={{ label: { fontWeight: 'bold' } }}
            >
              <Descriptions.Item label="租户ID">{tenant.id}</Descriptions.Item>
              <Descriptions.Item label="租户标识">{tenant.slug}</Descriptions.Item>
              {tenant.domain && (
                <Descriptions.Item label="自定义域名">
                  <Space>
                    <GlobalOutlined />
                    <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
                      {tenant.domain}
                    </a>
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="状态">{getStatusTag(tenant.is_active)}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                <Space>
                  <CalendarOutlined />
                  {formatDate(tenant.created_at)}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                <Space>
                  <CalendarOutlined />
                  {formatDate(tenant.updated_at)}
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {tenant.description && (
              <>
                <Divider orientation="left">租户描述</Divider>
                <Paragraph>{tenant.description}</Paragraph>
              </>
            )}
          </Card>

          {/* 功能导航卡片 */}
          <Card title="租户管理功能(租户仪表盘 和 租户设置 为预留功能，暂未测试，请勿使用) ">
            <div className={css`
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 24px;
              max-width: 900px;
              margin: 0 auto;
            `}>
              <Card
                hoverable
                className={css`
                  text-align: center;
                  cursor: pointer;
                  transition: all 0.3s;
                  width: 250px;
                  &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                  }
                `}
                onClick={() => router.push(`/tenant-management/${tenantId}/users`)}
              >
                <TeamOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 16 }} />
                <div>
                  <Title level={5}>用户管理</Title>
                  <Text type="secondary">管理租户用户和权限</Text>
                </div>
              </Card>
              
              <Card
                hoverable
                className={css`
                  text-align: center;
                  cursor: pointer;
                  transition: all 0.3s;
                  width: 250px;
                  &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                  }
                `}
                onClick={() => router.push(`/tenant-management/${tenantId}/dashboard`)}
              >
                <DashboardOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 16 }} />
                <div>
                  <Title level={5}>租户仪表盘</Title>
                  <Text type="secondary">查看租户使用统计和性能指标</Text>
                </div>
              </Card>


              <Card
                hoverable
                className={css`
                  text-align: center;
                  cursor: pointer;
                  transition: all 0.3s;
                  width: 250px;
                  &:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                  }
                `}
                onClick={() => router.push(`/tenant-management/${tenantId}/settings`)}
              >
                <SettingOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 16 }} />
                <div>
                  <Title level={5}>租户设置</Title>
                  <Text type="secondary">配置租户参数和系统设置</Text>
                </div>
              </Card>
            </div>
          </Card>
        </>
      ) : (
        <Card>
          <div className={css`
            text-align: center;
            padding: 48px 0;
          `}>
            <Title level={4} type="danger">租户不存在或已被删除</Title>
            <Button
              type="primary"
              onClick={handleBack}
              style={{ marginTop: 16 }}
            >
              返回租户列表
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TenantDetailPage; 