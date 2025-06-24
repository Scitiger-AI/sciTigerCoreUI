"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, Select, App, Spin } from 'antd';
import { createResource, updateResource, getServices } from '@/services/serviceScope';
import { Resource, CreateResourceParams, UpdateResourceParams, ServiceOption, Service } from '@/types/serviceScope';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';

interface ResourceFormModalProps {
  visible: boolean;
  resource: Resource | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  visible,
  resource,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string; code: string }[]>([]);
  const [tenantOptions, setTenantOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSystemResource, setIsSystemResource] = useState<boolean>(false);
  const isEditing = !!resource;
  const { message } = App.useApp();
  
  // 加载服务选项（包含ID和代码）
  useEffect(() => {
    const fetchServiceOptions = async () => {
      setLoadingServices(true);
      try {
        // 获取完整的服务列表，包含ID和代码
        const servicesData = await getServices({ page: 1, page_size: 100 });
        const options = servicesData.results.map(service => ({
          label: service.name,
          value: service.id, // 使用服务ID作为value
          code: service.code // 保存服务代码用于显示
        }));
        setServiceOptions(options);
      } catch (error: any) {
        message.error('获取服务选项失败: ' + (error.message || '未知错误'));
        console.error('获取服务选项失败:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchServiceOptions();
  }, [message]);
  
  // 加载租户列表
  useEffect(() => {
    const fetchTenants = async () => {
      // 如果有指定的租户ID或是编辑模式，不需要加载租户列表
      if (tenantId || isEditing) return;
      
      setLoadingTenants(true);
      try {
        const response = await getTenants({ page: 1, page_size: 50, status: ['active'] });
        const options = response.results.map(tenant => ({
          label: tenant.name,
          value: tenant.id
        }));
        setTenantOptions(options);
      } catch (error: any) {
        message.error('获取租户列表失败: ' + (error.message || '未知错误'));
        console.error('获取租户列表失败:', error);
      } finally {
        setLoadingTenants(false);
      }
    };
    
    if (visible && !isSystemResource) {
      fetchTenants();
    }
  }, [visible, tenantId, isEditing, isSystemResource, message]);
  
  // 当编辑的资源变化时，设置表单初始值
  useEffect(() => {
    if (resource) {
      const isSystem = resource.is_system || false;
      setIsSystemResource(isSystem);
      
      // 获取服务ID
      let serviceId = '';
      
      if (typeof resource.service === 'object' && resource.service) {
        serviceId = resource.service.id;
      }
      
      form.setFieldsValue({
        code: resource.code,
        name: resource.name,
        description: resource.description || '',
        service_id: serviceId,
        is_system: isSystem,
        tenant_id: resource.tenant_id || tenantId
      });
    } else {
      form.resetFields();
      // 设置默认值
      form.setFieldsValue({
        is_system: false,
        tenant_id: tenantId
      });
      setIsSystemResource(false);
    }
  }, [resource, form, tenantId, serviceOptions]);
  
  // 处理系统资源开关变化
  const handleSystemResourceChange = (checked: boolean) => {
    setIsSystemResource(checked);
    if (checked) {
      // 如果选择了系统资源，清除租户选择
      form.setFieldValue('tenant_id', undefined);
    }
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEditing && resource) {
        // 更新资源
        const updateParams: UpdateResourceParams = {
          name: values.name,
          description: values.description,
          is_system: values.is_system
        };
        
        await updateResource(resource.id, updateParams);
        message.success('资源更新成功');
      } else {
        // 创建资源
        const createParams: CreateResourceParams = {
          code: values.code,
          name: values.name,
          description: values.description,
          service_id: values.service_id, // 现在这是服务的UUID
          is_system: values.is_system
        };
        
        // 如果不是系统资源，需要添加租户ID
        if (!values.is_system) {
          createParams.tenant_id = values.tenant_id || tenantId || undefined;
        }
        
        await createResource(createParams);
        message.success('资源创建成功');
      }
      
      onSuccess();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      } else if (error.errorFields) {
        message.error('请检查表单字段');
      } else {
        message.error('提交失败，请重试');
      }
      console.error('资源表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 渲染服务选项的函数
  const renderServiceOption = (option: any) => {
    return (
      <div>
        <span>{option.label}</span>
        <span style={{ color: '#999', marginLeft: 8 }}>({option.data?.code})</span>
      </div>
    );
  };
  
  return (
    <Modal
      title={isEditing ? '编辑资源' : '创建资源'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      maskClosable={true}
      okText={isEditing ? '更新' : '创建'}
      cancelText="取消"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          is_system: false,
          tenant_id: tenantId
        }}
      >
        <Form.Item
          name="service_id"
          label="所属服务"
          rules={[
            { required: true, message: '请选择所属服务' }
          ]}
          tooltip="资源必须属于一个服务"
        >
          <Select
            placeholder="选择所属服务"
            options={serviceOptions}
            loading={loadingServices}
            disabled={isEditing} // 编辑时不允许修改所属服务
            showSearch
            optionLabelProp="label"
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
              (option?.code ?? '').toLowerCase().includes(input.toLowerCase())
            }
            optionRender={renderServiceOption}
          />
        </Form.Item>
        
        <Form.Item
          name="code"
          label="资源代码"
          rules={[
            { required: true, message: '请输入资源代码' },
            { pattern: /^[a-z][a-z0-9_]*$/, message: '资源代码只能包含小写字母、数字和下划线，且必须以字母开头' }
          ]}
          tooltip="资源代码是唯一标识符，创建后不可修改"
          extra="示例: user, role, file, document"
        >
          <Input placeholder="输入资源代码" disabled={isEditing} />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="资源名称"
          rules={[
            { required: true, message: '请输入资源名称' },
            { max: 50, message: '资源名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="输入资源名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
          rules={[
            { max: 200, message: '描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            placeholder="输入资源描述（可选）" 
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>
        
     
      </Form>
    </Modal>
  );
};

export default ResourceFormModal; 