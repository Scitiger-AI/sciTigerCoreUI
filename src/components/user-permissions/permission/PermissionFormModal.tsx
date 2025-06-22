"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, Switch, Spin, Select, Space, Radio, Tooltip } from 'antd';
import { createPermission, updatePermission, getPermissionDetail } from '@/services/permission';
import { Permission, PermissionCreateParams, PermissionUpdateParams } from '@/types/permission';
import { getTenants } from '@/services/tenant';
import { Tenant } from '@/types/tenant';
import { App } from 'antd';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { debounce } from 'lodash'; // 导入防抖函数
import { getAllServiceScopeOptions } from '@/services/serviceScope';
import { ServiceOption, ResourceOption, ActionOption } from '@/types/serviceScope';

interface PermissionFormModalProps {
  visible: boolean;
  permission: Permission | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

// 权限类型选项
const permissionTypeOptions = [
  { value: 'system', label: '系统级权限' },
  { value: 'tenant', label: '租户级权限' }
];

const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
  visible,
  permission,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { message: messageApi } = App.useApp();
  const isEditing = !!permission;
  
  // 租户相关状态
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  
  // 添加代码预览状态
  const [codePreview, setCodePreview] = useState<string>('生成的权限代码将显示在这里');

  // 权限类型状态
  const [permissionType, setPermissionType] = useState<string>('system');
  
  // 用于存储从后端获取的服务、资源、操作选项
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [resourceOptions, setResourceOptions] = useState<Record<string, { label: string; value: string }[]>>({});
  const [actionOptions, setActionOptions] = useState<{ label: string; value: string }[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [loadingServiceOptions, setLoadingServiceOptions] = useState<boolean>(false);
  
  // 获取当前选中服务的资源选项
  const currentServiceResourceOptions = selectedService ? (resourceOptions[selectedService] || []) : [];

  // 加载服务作用域选项
  useEffect(() => {
    const fetchServiceScopeOptions = async () => {
      if (visible) {
        try {
          setLoadingServiceOptions(true);
          const allOptions = await getAllServiceScopeOptions();
          
          // 转换服务选项
          const services = allOptions.services.map(service => ({
            label: service.name,
            value: service.code,
          }));
          setServiceOptions(services);
          
          // 转换操作选项
          const actions = allOptions.actions.map(action => ({
            label: action.name,
            value: action.code,
          }));
          setActionOptions(actions);
          
          // 转换资源选项
          const resources: Record<string, { label: string; value: string }[]> = {};
          Object.entries(allOptions.resources).forEach(([serviceCode, serviceResources]) => {
            resources[serviceCode] = serviceResources.map(resource => ({
              label: resource.name,
              value: resource.code,
            }));
          });
          setResourceOptions(resources);
          
          // 设置默认选中的服务
          if (services.length > 0) {
            setSelectedService(services[0].value);
            form.setFieldValue('service', services[0].value);
          }
        } catch (error: any) {
          messageApi.error('加载服务作用域选项失败: ' + (error.message || '未知错误'));
          console.error('加载服务作用域选项失败:', error);
        } finally {
          setLoadingServiceOptions(false);
        }
      }
    };
    
    fetchServiceScopeOptions();
  }, [visible, messageApi, form]);
  
  // 处理服务选择变更
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    // 清除已选择的资源，因为不同服务的资源不同
    form.setFieldValue('resource', undefined);
    // 更新代码预览
    updateCodePreview();
  };

  // 更新代码预览
  const updateCodePreview = () => {
    const service = form.getFieldValue('service');
    const resource = form.getFieldValue('resource');
    const action = form.getFieldValue('action');
    
    if (service && resource && action) {
      setCodePreview(`${service}:${resource}:${action}`);
    } else {
      setCodePreview('生成的权限代码将显示在这里');
    }
  };

  // 加载权限详情
  useEffect(() => {
    const loadPermissionDetail = async () => {
      if (!isEditing || !permission?.id) return;
      
      setLoading(true);
      try {
        const permissionDetail = await getPermissionDetail(permission.id);
        
        // 根据is_tenant_level决定权限类型
        // 租户级权限：is_tenant_level为true
        // 系统级权限：is_tenant_level为false
        const permType = permissionDetail.is_tenant_level ? 'tenant' : 'system';
        
        // 设置权限类型状态
        setPermissionType(permType);
        
        // 设置选中的服务
        if (permissionDetail.service) {
          setSelectedService(permissionDetail.service);
        }
        
        form.setFieldsValue({
          name: permissionDetail.name,
          code: permissionDetail.code,
          description: permissionDetail.description,
          service: permissionDetail.service,
          resource: permissionDetail.resource,
          action: permissionDetail.action,
          permission_type: permType,
          tenant_id: permissionDetail.tenant
        });
        // 更新权限代码预览
        updateCodePreview();
      } catch (error: any) {
        messageApi.error('加载权限详情失败: ' + (error.message || '未知错误'));
        console.error('加载权限详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (visible) {
      form.resetFields();
      
      // 如果有指定的租户ID，设置表单默认值
      if (tenantId) {
        form.setFieldValue('tenant_id', tenantId);
        // 如果有租户ID，默认为租户级权限
        form.setFieldValue('permission_type', 'tenant');
        setPermissionType('tenant');
      } else {
        // 否则默认为系统级权限
        form.setFieldValue('permission_type', 'system');
        setPermissionType('system');
      }
      
      loadPermissionDetail();
    }
  }, [visible, permission, form, isEditing, messageApi, tenantId]);

  // 加载租户列表
  useEffect(() => {
    const loadTenants = async () => {
      // 如果有指定的租户ID或编辑模式下不允许修改租户，不需要加载租户列表
      if (tenantId || isEditing) return;
      
      setLoadingTenants(true);
      try {
        const response = await getTenants({ page: 1, page_size: 50, status: ['active'] });
        setTenants(response.results);
      } catch (error: any) {
        messageApi.error('加载租户列表失败: ' + (error.message || '未知错误'));
        console.error('加载租户列表失败:', error);
      } finally {
        setLoadingTenants(false);
      }
    };
    
    if (visible && !tenantId && !isEditing) {
      loadTenants();
    }
  }, [visible, tenantId, isEditing, messageApi]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      const isTenantLevel = values.permission_type === 'tenant';
      const isSystemLevel = values.permission_type === 'system';
      
      if (isEditing && permission?.id) {
        // 编辑权限
        const updateData: PermissionUpdateParams = {
          name: values.name,
          description: values.description,
          is_system: isSystemLevel, // 系统级权限时is_system为true
          is_tenant_level: isTenantLevel
        };
        
        await updatePermission(permission.id, updateData);
        messageApi.success('权限更新成功');
      } else {
        // 创建权限
        const createData: PermissionCreateParams = {
          name: values.name,
          service: values.service,
          resource: values.resource,
          action: values.action,
          description: values.description,
          is_system: isSystemLevel, // 系统级权限时is_system为true
          is_tenant_level: isTenantLevel,
          tenant: isTenantLevel ? (values.tenant_id || tenantId || undefined) : undefined
        };
        
        await createPermission(createData);
        messageApi.success('权限创建成功');
      }
      
      onSuccess();
    } catch (error: any) {
      messageApi.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('提交权限表单失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 表单字段值变化时的回调
  const handleValuesChange = (changedValues: any) => {
    // 当服务、资源或操作字段发生变化时，更新代码预览
    if ('service' in changedValues || 'resource' in changedValues || 'action' in changedValues) {
      updateCodePreview();
    }
    
    // 当权限类型变化时，更新相关状态
    if ('permission_type' in changedValues) {
      const newType = changedValues.permission_type;
      setPermissionType(newType);
      
      // 如果切换到系统级权限，清除租户选择
      if (newType === 'system' && !tenantId) {
        form.setFieldValue('tenant_id', undefined);
      }
    }
  };

  // 租户下拉选项
  const tenantOptions = tenants.map(tenant => ({
    label: tenant.name,
    value: tenant.id
  }));

  return (
    <Modal
      title={isEditing ? (
        <Space>
          <span>编辑权限</span>
          {loading && <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />}
        </Space>
      ) : '创建权限'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting || loadingServiceOptions}
      maskClosable={true}
      destroyOnClose
      width={600}
    >
      <Spin spinning={loading || (loadingServiceOptions && !isEditing)}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            permission_type: 'system', // 默认为系统级权限
            tenant_id: tenantId || undefined
          }}
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          
          {!isEditing && loadingServiceOptions ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Spin>
                <div style={{ padding: '30px', textAlign: 'center' }}>
                  <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>正在加载服务作用域选项...</div>
                </div>
              </Spin>
            </div>
          ) : !isEditing && (
            <>
              <Form.Item
                name="service"
                label="服务"
                rules={[{ required: true, message: '请选择服务' }]}
              >
                <Select
                  placeholder={loadingServiceOptions ? "加载服务中..." : "请选择服务"}
                  options={serviceOptions}
                  onChange={handleServiceChange}
                  loading={loadingServiceOptions}
                  disabled={loadingServiceOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={loadingServiceOptions ? <Spin size="small" /> : "没有可用的服务"}
                />
              </Form.Item>
              
              <Form.Item
                name="resource"
                label="资源"
                rules={[{ required: true, message: '请选择资源' }]}
              >
                <Select
                  placeholder={selectedService ? "选择资源" : "请先选择服务"}
                  options={currentServiceResourceOptions}
                  disabled={!selectedService || loadingServiceOptions}
                  loading={loadingServiceOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={loadingServiceOptions ? <Spin size="small" /> : (selectedService ? "此服务下没有资源" : "请先选择服务")}
                  onChange={() => updateCodePreview()}
                />
              </Form.Item>
              
              <Form.Item
                name="action"
                label="操作"
                rules={[{ required: true, message: '请选择操作' }]}
              >
                <Select
                  placeholder={loadingServiceOptions ? "加载操作中..." : "请选择操作"}
                  options={actionOptions}
                  disabled={loadingServiceOptions}
                  loading={loadingServiceOptions}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={loadingServiceOptions ? <Spin size="small" /> : "没有可用的操作"}
                  onChange={() => updateCodePreview()}
                />
              </Form.Item>
              
              <Form.Item label="权限代码预览">
                <div
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px',
                    backgroundColor: '#f5f5f5',
                    color: '#000000d9',
                    fontFamily: 'monospace'
                  }}
                >
                  {codePreview}
                </div>
              </Form.Item>
            </>
          )}
          
          <Form.Item
            name="description"
            label="权限描述"
          >
            <Input.TextArea 
              placeholder="请输入权限描述" 
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="permission_type"
            label="权限级别"
            tooltip={{
              title: "系统级权限适用于整个系统且不可删除；租户级权限只能被分配给特定租户的用户",
              placement: "topLeft"
            }}
            rules={[{ required: true, message: '请选择权限级别' }]}
          >
            <Radio.Group 
              options={permissionTypeOptions} 
              optionType="button" 
              buttonStyle="solid"
              disabled={!!tenantId} // 如果有指定租户ID，则禁用选择
            />
          </Form.Item>
          
          {permissionType === 'tenant' && !isEditing && (
            <Form.Item
              name="tenant_id"
              label="所属租户"
              tooltip={tenantId ? "当前已选择特定租户，无法更改" : "选择权限所属的租户"}
              rules={[{ 
                required: true, 
                message: '租户级权限必须选择所属租户' 
              }]}
            >
              <Select
                placeholder="请选择租户"
                disabled={!!tenantId}
                loading={loadingTenants}
                options={tenantOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          )}
        </Form>
      </Spin>
    </Modal>
  );
};

export default PermissionFormModal; 