"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Upload, Switch, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Tenant, UpdateTenantParams } from '@/types/tenant';
import { updateTenant } from '@/services/tenant';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

interface TenantEditModalProps {
  visible: boolean;
  tenant: Tenant;
  onCancel: () => void;
  onSuccess: () => void;
}

const TenantEditModal: React.FC<TenantEditModalProps> = ({
  visible,
  tenant,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message } = App.useApp();

  // 当租户数据变化时，重置表单
  useEffect(() => {
    if (visible && tenant) {
      form.setFieldsValue({
        name: tenant.name,
        description: tenant.description || '',
        is_active: tenant.status === 'active',
      });
      
      // 如果有logo，设置文件列表
      if (tenant.logo) {
        setFileList([
          {
            uid: '-1',
            name: 'logo.png',
            status: 'done',
            url: tenant.logo,
          },
        ]);
      } else {
        setFileList([]);
      }
    }
  }, [visible, tenant, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 构建提交数据
      const formData: UpdateTenantParams = {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
      };
      
      // 如果有上传的新logo，添加到表单数据
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.logo = fileList[0].originFileObj as File;
      }
      
      // 提交更新请求
      await updateTenant(tenant.id, formData);
      message.success('租户更新成功');
      onSuccess();
    } catch (error: any) {
      console.error('更新租户失败:', error);
      message.error(error.message || '更新租户失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 上传前校验文件
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    
    return false; // 阻止自动上传
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Modal
      title="编辑租户"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          保存
        </Button>,
      ]}
      maskClosable={true}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
      >
        <Form.Item
          name="name"
          label="租户名称"
          rules={[{ required: true, message: '请输入租户名称' }]}
        >
          <Input placeholder="请输入租户名称" />
        </Form.Item>
        
        <Form.Item
          label="租户标识(slug)"
        >
          <Input value={tenant?.slug || tenant?.code} disabled />
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
            租户标识创建后不可修改
          </div>
        </Form.Item>
        
        <Form.Item
          label="子域名"
        >
          <Input value={tenant?.subdomain} disabled />
          <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
            子域名创建后不可修改
          </div>
        </Form.Item>
        
        <Form.Item
          name="description"
          label="租户描述"
        >
          <Input.TextArea rows={4} placeholder="请输入租户描述（可选）" />
        </Form.Item>
        
        <Form.Item
          name="is_active"
          label="租户状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="活跃" unCheckedChildren="未激活" />
        </Form.Item>
        
        <Form.Item
          name="logo"
          label="租户Logo"
        >
          <Upload
            listType="picture"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TenantEditModal; 