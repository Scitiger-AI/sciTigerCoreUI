"use client";

import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CreateTenantParams } from '@/types/tenant';
import { createTenant } from '@/services/tenant';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

interface TenantCreateModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const TenantCreateModal: React.FC<TenantCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 构建提交数据
      const formData: CreateTenantParams = {
        name: values.name,
        slug: values.slug,
        subdomain: values.subdomain,
        contact_email: values.contact_email,
        description: values.description,
      };
      
      // 如果有上传的logo，添加到表单数据
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.logo = fileList[0].originFileObj as File;
      }
      
      // 提交创建请求
      await createTenant(formData);
      message.success('租户创建成功');
      form.resetFields();
      setFileList([]);
      onSuccess();
    } catch (error: any) {
      console.error('创建租户失败:', error);
      message.error(error.message || '创建租户失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onCancel();
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
      title="创建新租户"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          创建
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
          name="slug"
          label="租户标识(slug)"
          rules={[
            { required: true, message: '请输入租户标识' },
            { pattern: /^[a-z0-9-]+$/, message: '租户标识只能包含小写字母、数字和连字符' },
          ]}
          tooltip="租户标识用于URL路径，创建后不可修改"
        >
          <Input placeholder="请输入租户标识" />
        </Form.Item>
        
        <Form.Item
          name="subdomain"
          label="子域名"
          rules={[
            { required: true, message: '请输入子域名' },
            { pattern: /^[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z0-9][-a-zA-Z0-9]{0,61}[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/, message: '请输入有效的域名格式，如 service.scitiger.cn' },
          ]}
          tooltip="子域名将用于访问租户系统，创建后不可修改，格式如：service.scitiger.cn"
        >
          <Input placeholder="请输入完整子域名，例如：service.scitiger.cn" />
        </Form.Item>
        
        <Form.Item
          name="contact_email"
          label="联系邮箱"
          rules={[
            { required: true, message: '请输入联系邮箱' },
            { type: 'email', message: '请输入有效的邮箱格式' },
          ]}
        >
          <Input placeholder="请输入联系邮箱" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="租户描述"
        >
          <Input.TextArea rows={4} placeholder="请输入租户描述（可选）" />
        </Form.Item>
        
        <Form.Item
          name="logo"
          label="租户Logo"
          tooltip="只能上传JPG/PNG等图片文件，且大小不超过2MB"
        >
          <Upload
            listType="picture"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>选择图片</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TenantCreateModal; 