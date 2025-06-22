"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Form, Input, Switch, Spin, Select, Divider, Space, Button } from 'antd';
import { createRole, updateRole, getRoleDetail } from '@/services/role';
import { getTenants } from '@/services/tenant';
import { Role } from '@/types/role';
import { Tenant } from '@/types/tenant';
import { App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';

interface RoleFormModalProps {
  visible: boolean;
  role: Role | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleFormModal: React.FC<RoleFormModalProps> = ({
  visible,
  role,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { message: messageApi } = App.useApp();
  const isEditing = !!role;
  
  // 租户相关状态
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [tenantPagination, setTenantPagination] = useState({
    page: 1,
    hasMore: true
  });
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantSearchText, setTenantSearchText] = useState<string>('');
  // 添加新状态存储当前角色的租户ID，避免循环依赖
  const [currentRoleTenantId, setCurrentRoleTenantId] = useState<string | null>(null);
  // 添加状态跟踪是否已经加载过租户列表
  const [tenantsInitialized, setTenantsInitialized] = useState<boolean>(false);

  // 加载租户列表 - 使用useCallback包装并优化加载逻辑
  const loadTenants = useCallback(async (isLoadMore = false, searchValue?: string) => {
    // 如果有指定的租户ID，不需要加载全部租户
    if (tenantId) return;
    
    // 如果正在加载或没有更多数据且是加载更多操作，直接返回
    if (loadingTenants || (!tenantPagination.hasMore && isLoadMore)) return;
    
    const page = isLoadMore ? tenantPagination.page + 1 : 1;
    
    setLoadingTenants(true);
    try {
      const response = await getTenants({
        page: page,
        page_size: 10,
        status: ['active'],
        search: searchValue || tenantSearchText
      });
      
      if (isLoadMore) {
        setTenants(prev => [...prev, ...response.results]);
      } else {
        setTenants(response.results);
      }
      
      // 更新分页信息，只有当返回结果数量等于页大小且当前页小于总页数时才有更多数据
      const hasMore = response.results.length === 10 && page < response.total_pages;
      setTenantPagination({
        page: page,
        hasMore: hasMore
      });
      
      // 标记已初始化
      if (!tenantsInitialized) {
        setTenantsInitialized(true);
      }
    } catch (error: any) {
      messageApi.error('加载租户列表失败: ' + (error.message || '未知错误'));
      console.error('加载租户列表失败:', error);
    } finally {
      setLoadingTenants(false);
    }
  }, [tenantId, loadingTenants, tenantPagination.page, tenantSearchText, messageApi, tenantsInitialized]);

  // 加载角色详情
  useEffect(() => {
    const loadRoleDetail = async () => {
      if (!isEditing || !role?.id) return;
      
      setLoading(true);
      try {
        const roleDetail = await getRoleDetail(role.id);
        form.setFieldsValue({
          name: roleDetail.name,
          code: roleDetail.code,
          description: roleDetail.description,
          is_default: roleDetail.is_default,
          is_system: roleDetail.is_system,
          tenant_id: roleDetail.tenant
        });
        
        // 如果有租户ID，设置currentRoleTenantId
        if (roleDetail.tenant) {
          setCurrentRoleTenantId(roleDetail.tenant);
        }
      } catch (error: any) {
        messageApi.error('加载角色详情失败: ' + (error.message || '未知错误'));
        console.error('加载角色详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (visible) {
      form.resetFields();
      
      // 如果有指定的租户ID，设置表单默认值
      if (tenantId) {
        form.setFieldValue('tenant_id', tenantId);
      }
      
      loadRoleDetail();
    }
  }, [visible, role, form, isEditing, messageApi, tenantId]);

  // 单独处理角色租户信息
  useEffect(() => {
    const findRoleTenant = async () => {
      if (!currentRoleTenantId) return;
      
      // 检查当前tenants中是否已有此租户
      const existingTenant = tenants.find(t => t.id === currentRoleTenantId);
      if (existingTenant) {
        setSelectedTenant(existingTenant);
        return;
      }
      
      // 如果没有，需要加载租户信息
      if (!loadingTenants && !tenantsInitialized) {
        await loadTenants();
      }
      
      // 再次检查是否加载到了需要的租户
      const tenant = tenants.find(t => t.id === currentRoleTenantId);
      if (tenant) {
        setSelectedTenant(tenant);
      }
    };
    
    if (visible && currentRoleTenantId) {
      findRoleTenant();
    }
  }, [visible, currentRoleTenantId, tenants, loadTenants, loadingTenants, tenantsInitialized]);

  // 首次加载租户列表，确保只加载一次
  useEffect(() => {
    if (visible && !tenantId && !tenantsInitialized && !loadingTenants) {
      loadTenants();
    }
  }, [visible, tenantId, loadTenants, tenantsInitialized, loadingTenants]);

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      
      if (isEditing && role?.id) {
        // 编辑角色
        await updateRole(role.id, {
          name: values.name,
          description: values.description,
          is_default: values.is_default
        });
        messageApi.success('角色更新成功');
      } else {
        // 创建角色
        await createRole({
          name: values.name,
          code: values.code,
          description: values.description,
          is_default: values.is_default,
          is_system: values.is_system,
          tenant: values.tenant_id || tenantId || undefined
        });
        messageApi.success('角色创建成功');
      }
      
      onSuccess();
    } catch (error: any) {
      messageApi.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('提交角色表单失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 使用debounce包装滚动加载函数，防止频繁触发
  const debouncedLoadMore = useCallback(
    debounce(() => {
      if (tenantPagination.hasMore && !loadingTenants) {
        loadTenants(true);
      }
    }, 300),
    [tenantPagination.hasMore, loadingTenants, loadTenants]
  );

  // 处理租户下拉加载更多
  const handleTenantPopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { currentTarget } = e;
    const { scrollTop, scrollHeight, clientHeight } = currentTarget;
    // 调整滚动阈值，当距离底部100px时开始加载
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom) {
      debouncedLoadMore();
    }
  };

  // 处理租户搜索
  const handleTenantSearch = (value: string) => {
    setTenantSearchText(value);
    // 重置分页并加载新的搜索结果
    setTenantPagination({
      page: 1,
      hasMore: true
    });
    loadTenants(false, value);
  };

  // 租户下拉选项
  const tenantOptions = tenants.map(tenant => ({
    label: tenant.name,
    value: tenant.id,
    tenant: tenant
  }));
  
  // 在组件卸载时清理防抖函数
  useEffect(() => {
    return () => {
      debouncedLoadMore.cancel();
    };
  }, [debouncedLoadMore]);

  return (
    <Modal
      title={isEditing ? '编辑角色' : '创建角色'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      maskClosable={true}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            is_default: false,
            is_system: false,
            tenant_id: tenantId || undefined
          }}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          
          {!isEditing && (
            <Form.Item
              name="code"
              label="角色代码"
              rules={[
                { required: true, message: '请输入角色代码' },
                { pattern: /^[a-z0-9_]+$/, message: '角色代码只能包含小写字母、数字和下划线' }
              ]}
              tooltip="角色代码一旦创建不可修改，只能包含小写字母、数字和下划线"
            >
              <Input placeholder="请输入角色代码，如 admin_role" />
            </Form.Item>
          )}
          
          <Form.Item
            name="description"
            label="角色描述"
          >
            <Input.TextArea 
              placeholder="请输入角色描述" 
              rows={4}
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          {!isEditing && (
            <>
              {/* 租户选择，当tenantId存在时禁用选择 */}
              <Form.Item
                name="tenant_id"
                label="所属租户"
                tooltip={tenantId ? "当前已选择特定租户，无法更改" : "选择角色所属的租户，不选则为全局角色"}
              >
                <Select
                  placeholder="请选择租户"
                  disabled={!!tenantId}
                  loading={loadingTenants}
                  allowClear
                  showSearch
                  options={tenantOptions}
                  onPopupScroll={handleTenantPopupScroll}
                  filterOption={false} // 禁用本地过滤，使用远程搜索
                  onSearch={handleTenantSearch}
                  notFoundContent={loadingTenants ? <Spin size="small" /> : "暂无数据"}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {tenantPagination.hasMore && (
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                          <Spin size="small" spinning={loadingTenants} />
                          {loadingTenants && <span style={{ marginLeft: 8 }}>加载中...</span>}
                        </div>
                      )}
                    </>
                  )}
                />
              </Form.Item>
              
            </>
          )}

            {/* 系统角色标志 */}
            <Form.Item
                name="is_system"
                label="系统角色"
                valuePropName="checked"
                tooltip="系统角色不可删除，谨慎选择"
              >
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
          
          <Form.Item
            name="is_default"
            label="默认角色"
            valuePropName="checked"
            tooltip="设置为默认角色后，新用户将自动分配此角色"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleFormModal; 