"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, App, Select, Spin } from 'antd';
import { createService, updateService } from '@/services/serviceScope';
import { Service, CreateServiceParams, UpdateServiceParams } from '@/types/serviceScope';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';

interface ServiceFormModalProps {
  visible: boolean;
  service: Service | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  visible,
  service,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [tenantOptions, setTenantOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSystemService, setIsSystemService] = useState<boolean>(false);
  const isEditing = !!service;
  const { message } = App.useApp();
  
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
    
    if (visible && !isSystemService) {
      fetchTenants();
    }
  }, [visible, tenantId, isEditing, isSystemService, message]);
  
  // 当编辑的服务变化时，设置表单初始值
  useEffect(() => {
    if (service) {
      const isSystem = service.is_system || false;
      setIsSystemService(isSystem);
      
      // 获取租户ID
      let tenantValue: string | undefined = undefined;
      if (service.tenant) {
        if (typeof service.tenant === 'string') {
          tenantValue = service.tenant;
        } else if (typeof service.tenant === 'object' && 'id' in service.tenant) {
          tenantValue = service.tenant.id;
        }
      }
      
      form.setFieldsValue({
        code: service.code,
        name: service.name,
        description: service.description || '',
        is_system: isSystem,
        tenant_id: tenantValue || tenantId || undefined
      });
    } else {
      form.resetFields();
      // 设置默认值
      form.setFieldsValue({
        is_system: false,
        tenant_id: tenantId
      });
      setIsSystemService(false);
    }
  }, [service, form, tenantId]);
  
  // 处理系统服务开关变化
  const handleSystemServiceChange = (checked: boolean) => {
    setIsSystemService(checked);
    if (checked) {
      // 如果选择了系统服务，清除租户选择
      form.setFieldValue('tenant_id', undefined);
    }
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEditing && service) {
        // 更新服务
        const updateParams: UpdateServiceParams = {
          name: values.name,
          description: values.description,
          is_system: values.is_system
        };
        
        await updateService(service.id, updateParams);
        message.success('服务更新成功');
      } else {
        // 创建服务
        const createParams: CreateServiceParams = {
          code: values.code,
          name: values.name,
          description: values.description,
          is_system: values.is_system
        };
        
        // 如果不是系统服务，需要添加租户ID
        if (!values.is_system) {
          createParams.tenant_id = values.tenant_id || tenantId || undefined;
        }
        
        await createService(createParams);
        message.success('服务创建成功');
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
      console.error('服务表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title={isEditing ? '编辑服务' : '创建服务'}
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
          name="code"
          label="服务代码"
          rules={[
            { required: true, message: '请输入服务代码' },
            { pattern: /^[a-z][a-z0-9_]*$/, message: '服务代码只能包含小写字母、数字和下划线，且必须以字母开头' }
          ]}
          tooltip="服务代码是唯一标识符，创建后不可修改"
          extra="示例: user_service, auth_service, file_service"
        >
          <Input placeholder="输入服务代码" disabled={isEditing} />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="服务名称"
          rules={[
            { required: true, message: '请输入服务名称' },
            { max: 50, message: '服务名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="输入服务名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
          rules={[
            { max: 200, message: '描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            placeholder="输入服务描述（可选）" 
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>
        
        <Form.Item
          name="is_system"
          label="系统服务"
          valuePropName="checked"
          tooltip="系统服务是预定义的服务，通常不应手动创建"
        >
          <Switch onChange={handleSystemServiceChange} />
        </Form.Item>
        
        {/* 当不是系统服务且没有指定租户ID时，显示租户选择 */}
        {!isSystemService && !isEditing && (
          <Form.Item
            name="tenant_id"
            label="所属租户"
            tooltip={tenantId ? "当前已选择特定租户，无法更改" : "选择服务所属的租户"}
            rules={[
              { required: !isSystemService && !tenantId, message: '非系统服务必须选择所属租户' }
            ]}
          >
            <Select
              placeholder="请选择租户"
              options={tenantOptions}
              loading={loadingTenants}
              disabled={!!tenantId}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              notFoundContent={loadingTenants ? <Spin size="small" /> : "没有可用的租户"}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default ServiceFormModal; 