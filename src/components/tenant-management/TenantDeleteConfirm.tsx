"use client";

import React, { useState } from 'react';
import { Modal, Typography, Input, Button, Space, App } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Tenant } from '@/types/tenant';
import { deleteTenant } from '@/services/tenant';
import { css } from '@emotion/css';

interface TenantDeleteConfirmProps {
  visible: boolean;
  tenant: Tenant;
  onCancel: () => void;
  onSuccess: () => void;
}

const { Text, Paragraph } = Typography;

const TenantDeleteConfirm: React.FC<TenantDeleteConfirmProps> = ({
  visible,
  tenant,
  onCancel,
  onSuccess,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();
  
  // 确认文本是否匹配
  const isConfirmTextMatched = confirmText === tenant.name;
  
  // 处理删除
  const handleDelete = async () => {
    if (!isConfirmTextMatched) {
      message.error('请输入正确的租户名称以确认删除');
      return;
    }
    
    try {
      setLoading(true);
      await deleteTenant(tenant.id);
      message.success('租户删除成功');
      setConfirmText('');
      onSuccess();
    } catch (error: any) {
      console.error('删除租户失败:', error);
      message.error(error.message || '删除租户失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    setConfirmText('');
    onCancel();
  };
  
  // 二次确认
  const showSecondConfirm = () => {
    modal.confirm({
      title: '确定要删除此租户吗？',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            删除操作不可逆，将会同时删除与该租户关联的所有数据，包括：
          </Paragraph>
          <ul>
            <li>用户关联信息</li>
            <li>租户配置和设置</li>
            <li>租户资源配额</li>
            <li>所有业务数据</li>
          </ul>
          <Paragraph type="danger" strong>
            此操作不可恢复，请谨慎操作！
          </Paragraph>
        </div>
      ),
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: handleDelete,
    });
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>删除租户</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          disabled={!isConfirmTextMatched}
          onClick={showSecondConfirm}
        >
          删除
        </Button>,
      ]}
      maskClosable={false}
      destroyOnClose
    >
      <div className={css`
        background-color: #fff2f0;
        border: 1px solid #ffccc7;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
      `}>
        <Paragraph strong type="danger">
          警告：此操作将永久删除租户 "{tenant.name}" 及其所有相关数据，且无法恢复！
        </Paragraph>
      </div>
      
      <Paragraph>
        请输入租户名称 <Text strong>"{tenant.name}"</Text> 以确认删除：
      </Paragraph>
      
      <Input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={`请输入: ${tenant.name}`}
        status={confirmText && !isConfirmTextMatched ? 'error' : ''}
      />
      
      {confirmText && !isConfirmTextMatched && (
        <Text type="danger" className={css`display: block; margin-top: 8px;`}>
          输入的租户名称不匹配
        </Text>
      )}
    </Modal>
  );
};

export default TenantDeleteConfirm; 