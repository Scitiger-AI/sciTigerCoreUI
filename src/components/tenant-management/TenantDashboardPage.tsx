"use client";

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Button, 
  Space, 
  Breadcrumb,
  Divider,
  Spin,
  Alert,
  Tabs,
  App
} from 'antd';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  ApiOutlined, 
  DatabaseOutlined,
  KeyOutlined,
  BellOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { useRouter } from 'next/navigation';
import { getTenantDetail } from '@/services/tenant';
import { getTenantQuotaByTenant, resetTenantQuotaApiCalls } from '@/services/tenant';
import { Tenant, TenantQuota } from '@/types/tenant';
import Link from 'next/link';
import type { TabsProps } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface TenantDashboardPageProps {
  tenantId: string;
}

const TenantDashboardPage: React.FC<TenantDashboardPageProps> = ({ tenantId }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [quota, setQuota] = useState<TenantQuota | null>(null);
  const [loadingTenant, setLoadingTenant] = useState<boolean>(true);
  const [loadingQuota, setLoadingQuota] = useState<boolean>(true);
  const [resettingApiCalls, setResettingApiCalls] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const router = useRouter();
  const { message, modal } = App.useApp();

  // 获取租户详情和配额
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoadingTenant(true);
        const tenantData = await getTenantDetail(tenantId);
        setTenant(tenantData);
      } catch (error) {
        console.error('获取租户详情失败:', error);
        message.error('获取租户详情失败，请重试');
      } finally {
        setLoadingTenant(false);
      }
    };

    const fetchQuotaData = async () => {
      try {
        setLoadingQuota(true);
        const quotaData = await getTenantQuotaByTenant(tenantId);
        setQuota(quotaData);
      } catch (error) {
        console.error('获取租户配额失败:', error);
        message.error('获取租户配额失败，请重试');
      } finally {
        setLoadingQuota(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
      fetchQuotaData();
    }
  }, [tenantId, message]);

  // 处理返回
  const handleBack = () => {
    router.push(`/tenant-management/${tenantId}`);
  };

  // 处理刷新
  const handleRefresh = async () => {
    try {
      setLoadingQuota(true);
      const quotaData = await getTenantQuotaByTenant(tenantId);
      setQuota(quotaData);
      message.success('数据已刷新');
    } catch (error) {
      console.error('刷新数据失败:', error);
      message.error('刷新数据失败，请重试');
    } finally {
      setLoadingQuota(false);
    }
  };

  // 处理重置API调用计数
  const handleResetApiCalls = async () => {
    if (!quota) return;
    
    modal.confirm({
      title: '重置API调用计数',
      content: '确定要重置API调用计数吗？这将把当天和当月的API调用次数清零。',
      onOk: async () => {
        try {
          setResettingApiCalls(true);
          await resetTenantQuotaApiCalls(quota.id);
          const updatedQuota = await getTenantQuotaByTenant(tenantId);
          setQuota(updatedQuota);
          message.success('API调用计数已重置');
        } catch (error) {
          console.error('重置API调用计数失败:', error);
          message.error('重置API调用计数失败，请重试');
        } finally {
          setResettingApiCalls(false);
        }
      },
    });
  };

  // 计算百分比
  const calculatePercentage = (current: number, max: number) => {
    if (max <= 0) return 0;
    return Math.min(Math.round((current / max) * 100), 100);
  };

  // 获取进度条状态
  const getProgressStatus = (percentage: number) => {
    if (percentage >= 90) return 'exception';
    if (percentage >= 70) return 'normal';
    return 'normal';
  };

  // 标签页配置
  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: (
        <span>
          <DatabaseOutlined />
          概览
        </span>
      ),
      children: (
        <Spin spinning={loadingQuota}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="用户数"
                  value={quota?.current_users || 0}
                  suffix={`/ ${quota?.max_users || 0}`}
                  prefix={<UserOutlined />}
                />
                <Progress 
                  percent={calculatePercentage(quota?.current_users || 0, quota?.max_users || 1)} 
                  status={getProgressStatus(calculatePercentage(quota?.current_users || 0, quota?.max_users || 1))}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="存储空间 (GB)"
                  value={quota?.current_storage_gb || 0}
                  precision={1}
                  suffix={`/ ${quota?.max_storage_gb || 0}`}
                  prefix={<DatabaseOutlined />}
                />
                <Progress 
                  percent={calculatePercentage(quota?.current_storage_gb || 0, quota?.max_storage_gb || 1)} 
                  status={getProgressStatus(calculatePercentage(quota?.current_storage_gb || 0, quota?.max_storage_gb || 1))}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="API密钥"
                  value={quota?.current_api_keys || 0}
                  suffix={`/ ${quota?.max_api_keys || 0}`}
                  prefix={<KeyOutlined />}
                />
                <Progress 
                  percent={calculatePercentage(quota?.current_api_keys || 0, quota?.max_api_keys || 1)} 
                  status={getProgressStatus(calculatePercentage(quota?.current_api_keys || 0, quota?.max_api_keys || 1))}
                  size="small"
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Statistic
                  title="日志保留天数"
                  value={quota?.max_log_retention_days || 0}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          API调用统计
        </span>
      ),
      children: (
        <Spin spinning={loadingQuota}>
          <div className={css`
            margin-bottom: 16px;
          `}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleResetApiCalls}
              loading={resettingApiCalls}
            >
              重置API调用计数
            </Button>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="今日API调用">
                <Statistic
                  value={quota?.current_api_calls_today || 0}
                  suffix={`/ ${quota?.max_api_requests_per_day || 0}`}
                  valueStyle={{ color: quota?.current_api_calls_today && quota?.max_api_requests_per_day && 
                    quota.current_api_calls_today > quota.max_api_requests_per_day * 0.9 ? '#cf1322' : '#3f8600' }}
                />
                <Progress 
                  percent={calculatePercentage(quota?.current_api_calls_today || 0, quota?.max_api_requests_per_day || 1)} 
                  status={getProgressStatus(calculatePercentage(quota?.current_api_calls_today || 0, quota?.max_api_requests_per_day || 1))}
                  style={{ marginTop: 16 }}
                />
                {quota?.current_api_calls_today && quota?.max_api_requests_per_day && 
                  quota.current_api_calls_today > quota.max_api_requests_per_day * 0.9 && (
                  <Alert
                    message="API调用次数接近限制"
                    description="今日API调用次数已接近或超过限制，可能会影响服务正常使用。"
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="本月API调用">
                <Statistic
                  value={quota?.current_api_calls_this_month || 0}
                  valueStyle={{ color: '#3f8600' }}
                />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">本月累计API调用次数，无限制。</Text>
                </div>
              </Card>
            </Col>
          </Row>
          
          <Card title="API使用说明" style={{ marginTop: 16 }}>
            <Paragraph>
              API调用次数限制是按照每日计算的，每天零点会自动重置当日的API调用计数。
              如果当日API调用次数达到限制，API请求将会被拒绝，直到下一个计数周期或手动重置计数。
            </Paragraph>
            <Paragraph>
              <ul>
                <li>每日API调用限制: <Text strong>{quota?.max_api_requests_per_day || 0}</Text> 次</li>
                <li>当前已使用: <Text strong>{quota?.current_api_calls_today || 0}</Text> 次</li>
                <li>本月累计使用: <Text strong>{quota?.current_api_calls_this_month || 0}</Text> 次</li>
              </ul>
            </Paragraph>
          </Card>
        </Spin>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          通知统计
        </span>
      ),
      children: (
        <Spin spinning={loadingQuota}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card title="通知使用情况">
                <Statistic
                  title="今日已发送通知"
                  value={quota?.current_notifications_today || 0}
                  suffix={`/ ${quota?.max_notifications_per_day || 0}`}
                />
                <Progress 
                  percent={calculatePercentage(quota?.current_notifications_today || 0, quota?.max_notifications_per_day || 1)} 
                  status={getProgressStatus(calculatePercentage(quota?.current_notifications_today || 0, quota?.max_notifications_per_day || 1))}
                  style={{ marginTop: 16 }}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title="通知使用说明" style={{ marginTop: 16 }}>
            <Paragraph>
              通知次数限制是按照每日计算的，每天零点会自动重置当日的通知计数。
              通知包括系统通知、邮件通知等各种类型的通知。
            </Paragraph>
            <Paragraph>
              <ul>
                <li>每日通知限制: <Text strong>{quota?.max_notifications_per_day || 0}</Text> 次</li>
                <li>当前已使用: <Text strong>{quota?.current_notifications_today || 0}</Text> 次</li>
              </ul>
            </Paragraph>
          </Card>
        </Spin>
      ),
    },
  ];

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
            title: <Link href={`/tenant-management/${tenantId}`}>{tenant?.name || '租户详情'}</Link>,
          },
          {
            title: '租户仪表盘',
          },
        ]}
      />

      {/* 页面标题 */}
      <div className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      `}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {tenant ? `${tenant.name} - 租户仪表盘` : '租户仪表盘'}
          </Title>
        </Space>
        
        <Button 
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          刷新数据
        </Button>
      </div>

      {/* 租户基本信息卡片 */}
      <Card 
        loading={loadingTenant}
        className={css`
          margin-bottom: 24px;
        `}
      >
        <Row gutter={16}>
          <Col xs={24} md={6}>
            <Statistic
              title="租户状态"
              value={tenant?.is_active ? '活跃' : '未激活'}
              valueStyle={{
                color: tenant?.is_active ? '#3f8600' : '#1677ff'
              }}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="用户总数"
              value={tenant?.user_count || 0}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="订阅计划"
              value={tenant?.subscription_plan || '免费版'}
            />
          </Col>
          <Col xs={24} md={6}>
            <Statistic
              title="订阅状态"
              value={tenant?.subscription_status || '活跃'}
              valueStyle={{ 
                color: tenant?.subscription_status === 'active' ? '#3f8600' : '#cf1322'
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* 标签页 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        type="card"
        items={tabItems}
      />
    </div>
  );
};

export default TenantDashboardPage; 