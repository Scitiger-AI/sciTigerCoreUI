"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, App, Select, Spin } from 'antd';
import { createAction, updateAction } from '@/services/serviceScope';
import { Action, CreateActionParams, UpdateActionParams } from '@/types/serviceScope';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';

interface ActionFormModalProps {
  visible: boolean;
  action: Action | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ActionFormModal: React.FC<ActionFormModalProps> = ({
  visible,
  action,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [tenantOptions, setTenantOptions] = useState<{ label: string; value: string }[]>([]);
  const [isSystemAction, setIsSystemAction] = useState<boolean>(false);
  const isEditing = !!action;
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
    
    if (visible && !isSystemAction) {
      fetchTenants();
    }
  }, [visible, tenantId, isEditing, isSystemAction, message]);
  
  // 当编辑的操作变化时，设置表单初始值
  useEffect(() => {
    if (action) {
      const isSystem = action.is_system || false;
      setIsSystemAction(isSystem);
      
      // 获取租户ID
      let tenantValue: string | undefined = undefined;
      if (action.tenant) {
        if (typeof action.tenant === 'string') {
          tenantValue = action.tenant;
        } else if (typeof action.tenant === 'object' && 'id' in action.tenant) {
          tenantValue = action.tenant.id;
        }
      }
      
      form.setFieldsValue({
        code: action.code,
        name: action.name,
        description: action.description || '',
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
      setIsSystemAction(false);
    }
  }, [action, form, tenantId]);
  
  // 处理系统操作开关变化
  const handleSystemActionChange = (checked: boolean) => {
    setIsSystemAction(checked);
    if (checked) {
      // 如果选择了系统操作，清除租户选择
      form.setFieldValue('tenant_id', undefined);
    }
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEditing && action) {
        // 更新操作
        const updateParams: UpdateActionParams = {
          name: values.name,
          description: values.description,
          is_system: values.is_system
        };
        
        await updateAction(action.id, updateParams);
        message.success('操作更新成功');
      } else {
        // 创建操作
        const createParams: CreateActionParams = {
          code: values.code,
          name: values.name,
          description: values.description,
          is_system: values.is_system
        };
        
        // 如果不是系统操作，需要添加租户ID
        if (!values.is_system) {
          createParams.tenant_id = values.tenant_id || tenantId || undefined;
        }
        
        await createAction(createParams);
        message.success('操作创建成功');
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
      console.error('操作表单提交失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title={isEditing ? '编辑操作' : '创建操作'}
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
          label="操作代码"
          rules={[
            { required: true, message: '请输入操作代码' },
            { pattern: /^[a-z][a-z0-9_]*$/, message: '操作代码只能包含小写字母、数字和下划线，且必须以字母开头' }
          ]}
          tooltip="操作代码是唯一标识符，创建后不可修改"
          extra="示例: read, write, delete, execute"
        >
          <Input placeholder="输入操作代码" disabled={isEditing} />
        </Form.Item>
        
        <Form.Item
          name="name"
          label="操作名称"
          rules={[
            { required: true, message: '请输入操作名称' },
            { max: 50, message: '操作名称不能超过50个字符' }
          ]}
        >
          <Input placeholder="输入操作名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
          rules={[
            { max: 200, message: '描述不能超过200个字符' }
          ]}
        >
          <Input.TextArea 
            placeholder="输入操作描述（可选）" 
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>
        
  
      </Form>
    </Modal>
  );
};

export default ActionFormModal; 