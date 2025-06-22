"use client";

import React, { useState } from 'react';
import { Modal, Form, Select, AutoComplete, Avatar, Spin, App } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserList } from '@/services/user';
import { getMediaUrl } from '@/utils/mediaUrl';
import { createTenantUser } from '@/services/tenant';

interface AssignUserModalProps {
  visible: boolean;
  tenantId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const AssignUserModal: React.FC<AssignUserModalProps> = ({
  visible,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { message } = App.useApp();
  
  // 搜索用户
  const handleUserSearch = async (value: string) => {
    if (value.length < 2) {
      setUserOptions([]);
      return;
    }
    
    setUserSearchLoading(true);
    
    try {
      const { results } = await getUserList({ search: value, page: 1, page_size: 10 });
      
      const options = results.map(user => ({
        value: user.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              src={user.avatar ? getMediaUrl(user.avatar) : undefined}
              style={{ marginRight: 8 }}
            />
            <div>
              <div>{user.username}</div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{user.email}</div>
            </div>
          </div>
        ),
        user: user
      }));
      
      setUserOptions(options);
    } catch (error) {
      console.error('搜索用户失败:', error);
      message.error('搜索用户失败，请重试');
    } finally {
      setUserSearchLoading(false);
    }
  };

  // 选择用户
  const handleUserSelect = (value: string, option: any) => {
    form.setFieldsValue({ user_id: value });
  };

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      // 调用分配用户到租户的API
      await createTenantUser({
        tenant_id: tenantId,
        user_id: values.user_id,
        role: values.role,
        is_active: values.is_active,
      });
      
      message.success('用户分配成功');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      console.error('分配用户失败:', error);
      message.error(error.message || '分配用户失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 取消时重置表单
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="分配用户到租户"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={submitting}
      maskClosable={true}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="user_id"
          label="用户"
          rules={[{ required: true, message: '请选择用户' }]}
        >
          <AutoComplete
            options={userOptions}
            onSearch={handleUserSearch}
            onSelect={handleUserSelect}
            placeholder="搜索用户名或邮箱"
            notFoundContent={
              userSearchLoading ? (
                <div style={{ textAlign: 'center', padding: '5px 0' }}>
                  <Spin size="small" /> <span style={{ marginLeft: 8 }}>搜索中...</span>
                </div>
              ) : '未找到匹配用户'
            }
          />
        </Form.Item>
        
        <Form.Item
          name="role"
          label="用户角色"
          initialValue="member"
          rules={[{ required: true, message: '请选择用户角色' }]}
        >
          <Select>
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="member">成员</Select.Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="is_active"
          label="是否激活"
          initialValue={true}
        >
          <Select>
            <Select.Option value={true}>是</Select.Option>
            <Select.Option value={false}>否</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignUserModal; 