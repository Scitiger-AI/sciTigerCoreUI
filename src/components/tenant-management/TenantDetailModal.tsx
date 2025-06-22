"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Button, Tag, Spin, Avatar, Divider, Typography, Space } from 'antd';
import { Tenant } from '@/types/tenant';
import { getTenantDetail } from '@/services/tenant';
import { css } from '@emotion/css';
import { 
  UserOutlined, 
  CalendarOutlined, 
  GlobalOutlined,
  CodeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

interface TenantDetailModalProps {
  visible: boolean;
  tenant: Tenant;
  onCancel: () => void;
}

const { Title, Text, Paragraph } = Typography;

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  visible,
  tenant,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [tenantDetail, setTenantDetail] = useState<Tenant | null>(null);

  // 获取租户详细信息
  useEffect(() => {
    if (visible && tenant) {
      const fetchTenantDetail = async () => {
        try {
          setLoading(true);
          const data = await getTenantDetail(tenant.id);
          setTenantDetail(data);
        } catch (error) {
          console.error('获取租户详情失败:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchTenantDetail();
    }
  }, [visible, tenant]);

  // 获取状态标签
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

  return (
    <Modal
      title="租户详情"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>,
      ]}
      maskClosable={true}
    >
      {loading ? (
        <div className={css`
          display: flex;
          justify-content: center;
          align-items: center;
          height: 300px;
        `}>
          <Spin size="large">
            <div style={{ padding: '50px', textAlign: 'center' }}>
              <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>加载中...</div>
            </div>
          </Spin>
        </div>
      ) : tenantDetail ? (
        <div>
          <div className={css`
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          `}>
            <Avatar
              size={64}
              src={tenantDetail.logo}
              icon={<UserOutlined />}
              className={css`
                margin-right: 16px;
                background-color: #1677ff;
              `}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>{tenantDetail.name}</Title>
              <Space size={8}>
                <Text type="secondary"><CodeOutlined /> {tenantDetail.code}</Text>
                {getStatusTag(tenantDetail.is_active)}
              </Space>
            </div>
          </div>
          
          <Divider />
          
          <Descriptions
            bordered
            column={1}
            styles={{ label: { fontWeight: 'bold', width: '120px' } }}
          >
            <Descriptions.Item label="租户ID">{tenantDetail.id}</Descriptions.Item>
            <Descriptions.Item label="租户名称">{tenantDetail.name}</Descriptions.Item>
            <Descriptions.Item label="租户标识(slug)">{tenantDetail.slug || tenantDetail.code}</Descriptions.Item>
            <Descriptions.Item label="子域名">{tenantDetail.subdomain}</Descriptions.Item>
            {tenantDetail.domain && (
              <Descriptions.Item label="自定义域名">
                <Space>
                  <GlobalOutlined />
                  <a href={`https://${tenantDetail.domain}`} target="_blank" rel="noopener noreferrer">
                    {tenantDetail.domain}
                  </a>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="状态">
              {getStatusTag(tenantDetail.is_active)}
            </Descriptions.Item>
            {tenantDetail.primary_color && (
              <Descriptions.Item label="主色调">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: tenantDetail.primary_color,
                    marginRight: '8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px'
                  }} />
                  {tenantDetail.primary_color}
                </div>
              </Descriptions.Item>
            )}
            {tenantDetail.secondary_color && (
              <Descriptions.Item label="辅助色调">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: tenantDetail.secondary_color,
                    marginRight: '8px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px'
                  }} />
                  {tenantDetail.secondary_color}
                </div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">
              <Space>
                <CalendarOutlined />
                {formatDate(tenantDetail.created_at)}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              <Space>
                <CalendarOutlined />
                {formatDate(tenantDetail.updated_at)}
              </Space>
            </Descriptions.Item>
          </Descriptions>
          
          {tenantDetail.description && (
            <>
              <Divider orientation="left">租户描述</Divider>
              <div className={css`
                background-color: #f5f5f5;
                padding: 16px;
                border-radius: 4px;
              `}>
                <Paragraph>
                  <InfoCircleOutlined style={{ marginRight: 8 }} />
                  {tenantDetail.description}
                </Paragraph>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className={css`
          text-align: center;
          padding: 24px;
        `}>
          <Text type="danger">无法加载租户详情</Text>
        </div>
      )}
    </Modal>
  );
};

export default TenantDetailModal; 