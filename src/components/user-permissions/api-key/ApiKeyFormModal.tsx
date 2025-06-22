"use client";

import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  DatePicker, 
  Space, 
  Button,
  Divider,
  Card,
  Tag,
  InputNumber,
  Radio,
  Tooltip,
  Spin,
  theme
} from 'antd';
import { 
  InfoCircleOutlined, 
  PlusOutlined, 
  MinusCircleOutlined,
  QuestionCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { App } from 'antd';
import { css } from '@emotion/css';
import dayjs from 'dayjs';
import { 
  ApiKey, 
  CreateSystemKeyParams, 
  CreateUserKeyParams 
} from '@/types/apiKey';
import { createSystemApiKey, createUserApiKey, updateApiKey, getApiKeyDetail } from '@/services/apiKey';
import { getUserList } from '@/services/user';
import { getTenants } from '@/services/tenant';
import { UserListItem } from '@/types/user';
import { Tenant } from '@/types/tenant';
import { getAllServiceScopeOptions, getResourceOptions } from '@/services/serviceScope';
import { ServiceOption, ResourceOption, ActionOption } from '@/types/serviceScope';

interface ApiKeyFormModalProps {
  visible: boolean;
  apiKey: ApiKey | null;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: (apiKey: ApiKey, plainTextKey?: string) => void;
}

const ApiKeyFormModal: React.FC<ApiKeyFormModalProps> = ({
  visible,
  apiKey,
  tenantId,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { message, modal } = App.useApp();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [apiKeyDetail, setApiKeyDetail] = useState<ApiKey | null>(null);
  const [keyType, setKeyType] = useState<'system' | 'user'>(apiKey?.key_type || 'system');
  const [expiryType, setExpiryType] = useState<'never' | 'date' | 'days'>(
    apiKey?.expires_at ? 'date' : 'never'
  );
  const [selectedService, setSelectedService] = useState<string>('');
  const [userOptions, setUserOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(tenantId || undefined);
  const [tenantOptions, setTenantOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  
  // 新增状态 - 服务作用域选项
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [resourceOptions, setResourceOptions] = useState<Record<string, { label: string; value: string }[]>>({});
  const [actionOptions, setActionOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingServiceOptions, setLoadingServiceOptions] = useState<boolean>(false);
  const [loadingResourceOptions, setLoadingResourceOptions] = useState<boolean>(false);
  
  // 判断是否是特定租户视图（左侧菜单选择的是特定租户）
  const isSpecificTenantView = !!tenantId;
  
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
          }
        } catch (error) {
          console.error('加载服务作用域选项失败:', error);
          message.error('加载服务作用域选项失败');
        } finally {
          setLoadingServiceOptions(false);
        }
      }
    };
    
    fetchServiceScopeOptions();
  }, [visible, message]);
  
  // 加载租户列表（当为全局视图时）
  useEffect(() => {
    const fetchTenants = async () => {
      if (!isSpecificTenantView && visible) {
        try {
          setLoadingTenants(true);
          const response = await getTenants({ page_size: 100, status: ['active'] });
          const options = response.results.map((tenant: Tenant) => ({
            label: tenant.name,
            value: tenant.id,
          }));
          setTenantOptions(options);
        } catch (error) {
          console.error('加载租户列表失败:', error);
          message.error('加载租户列表失败');
        } finally {
          setLoadingTenants(false);
        }
      }
    };
    fetchTenants();
  }, [visible, isSpecificTenantView, message]);
  
  // 加载用户列表（用于用户级API密钥选择）
  useEffect(() => {
    const fetchUsers = async () => {
      if (keyType === 'user' && visible) {
        try {
          setLoadingUsers(true);
          const params: any = { page_size: 100 };
          
          // 如果选择了租户或者是特定租户视图，添加租户ID到查询参数
          if (selectedTenantId) {
            params.tenant_id = selectedTenantId;
          }
          
          const userData = await getUserList(params);
          const options = userData.results.map((user: UserListItem) => ({
            label: `${user.username}${user.email ? ` (${user.email})` : ''}`,
            value: user.id,
          }));
          setUserOptions(options);
        } catch (error) {
          console.error('加载用户列表失败:', error);
          message.error('加载用户列表失败');
        } finally {
          setLoadingUsers(false);
        }
      }
    };
    fetchUsers();
  }, [keyType, visible, selectedTenantId, message]);
  
  // 根据ID获取租户名称
  const getTenantName = (id: string): string => {
    const tenant = tenantOptions.find(option => option.value === id);
    return tenant?.label || '当前';
  };
  
  // 处理租户选择变更
  const handleTenantChange = (value: string) => {
    setSelectedTenantId(value);
    // 如果是用户级密钥，改变租户后需要重置用户选择
    if (keyType === 'user') {
      form.setFieldValue('user_id', undefined);
      
      if (apiKey) {
        // 编辑模式下更改租户
        message.warning('更改租户后，请重新选择用户');
      } else {
        // 创建模式下更改租户
        message.info('已更新可选用户列表');
      }
    }
  };
  
  // 获取API密钥详情
  const fetchApiKeyDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const detail = await getApiKeyDetail(id);
      setApiKeyDetail(detail);
      
      // 设置表单初始值
      const initialValues = {
        name: detail.name,
        is_active: detail.is_active,
        application_name: detail.application_name || undefined,
        key_type: detail.key_type,
        user_id: typeof detail.user === 'object' ? detail.user?.id : detail.user,
        tenant_id: typeof detail.tenant === 'object' ? detail.tenant?.id : detail.tenant || tenantId,
        expires_at: detail.expires_at ? dayjs(detail.expires_at) : undefined,
        metadata: detail.metadata ? JSON.stringify(detail.metadata, null, 2) : undefined,
        scopes: detail.scopes?.map(scope => ({
          service: scope.service,
          resource: scope.resource,
          action: scope.action,
        })) || [],
      };
      
      form.setFieldsValue(initialValues);
      setKeyType(detail.key_type);
      
      // 设置过期类型
      if (detail.expires_at) {
        setExpiryType('date');
      } else {
        setExpiryType('never');
      }
      
      // 设置选中的租户ID
      if (typeof detail.tenant === 'object') {
        setSelectedTenantId(detail.tenant?.id);
      } else if (typeof detail.tenant === 'string') {
        setSelectedTenantId(detail.tenant);
      } else {
        setSelectedTenantId(tenantId || undefined);
      }
      
      // 如果有作用域，设置选中的服务
      if (detail.scopes && detail.scopes.length > 0) {
        setSelectedService(detail.scopes[0].service);
      }
    } catch (error: any) {
      console.error('获取API密钥详情失败:', error);
      message.error(`获取API密钥详情失败: ${error.message || '未知错误'}`);
    } finally {
      setDetailLoading(false);
    }
  };
  
  // 在编辑模式下获取API密钥详情
  useEffect(() => {
    if (visible && apiKey) {
      fetchApiKeyDetail(apiKey.id);
    }
  }, [visible, apiKey]);
  
  // 处理密钥类型变更
  const handleKeyTypeChange = (value: 'system' | 'user') => {
    setKeyType(value);
    // 根据密钥类型设置不同的默认值
    if (value === 'system') {
      form.setFieldValue('user_id', undefined);
    }
  };
  
  // 处理到期类型变更
  const handleExpiryTypeChange = (e: any) => {
    const value = e.target.value;
    setExpiryType(value);
    
    if (value === 'never') {
      form.setFieldsValue({
        expires_at: undefined,
        expires_in_days: undefined,
      });
    } else if (value === 'days') {
      form.setFieldsValue({
        expires_at: undefined,
        expires_in_days: 365,
      });
    } else if (value === 'date') {
      form.setFieldsValue({
        expires_in_days: undefined,
        expires_at: dayjs().add(1, 'year'),
      });
    }
  };
  
  // 处理服务选择变更，用于筛选资源和操作选项
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
  };
  
  // 表单验证规则
  const getFormRules = () => {
    const rules = {
      tenant_id: [{ required: keyType === 'system' || isSpecificTenantView, message: '请选择租户' }],
      user_id: [{ required: keyType === 'user', message: '请选择用户' }]
    };
    
    return rules;
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setLoading(true);
      
      let result;
      
      // 处理元数据JSON
      if (values.metadata) {
        try {
          values.metadata = JSON.parse(values.metadata);
        } catch (e) {
          message.error('元数据JSON格式无效');
          setLoading(false);
          return;
        }
      }
      
      if (apiKey) {
        // 更新现有API密钥
        const updateData = {
          name: values.name,
          is_active: values.is_active,
          application_name: values.application_name,
          tenant: values.tenant_id,
          expires_at: values.expires_at ? values.expires_at.toISOString() : null,
          metadata: values.metadata,
          scopes: values.scopes,
        };
        
        result = await updateApiKey(apiKey.id, updateData);
        message.success('API密钥更新成功');
        onSuccess(result);
      } else {
        // 创建新API密钥
        if (keyType === 'system') {
          // 创建系统级API密钥
          const createData: CreateSystemKeyParams = {
            name: values.name,
            tenant: values.tenant_id || tenantId,
            application_name: values.application_name,
            is_active: values.is_active,
            scopes: values.scopes,
            metadata: values.metadata,
          };
          
          // 设置过期时间
          if (expiryType === 'days' && values.expires_in_days) {
            createData.expires_in_days = values.expires_in_days;
          }
          
          result = await createSystemApiKey(createData);
          modal.success({
            title: '系统级API密钥创建成功',
            content: (
              <div>
                <p>请妥善保存以下API密钥，它只会显示一次：</p>
                <p>
                  <code className={css`
                    background-color: #f5f5f5;
                    padding: 8px;
                    border-radius: 4px;
                    word-break: break-all;
                    display: block;
                  `}>{result.key}</code>
                </p>
                <p>密钥前缀: <strong>{result.api_key.prefix}</strong></p>
              </div>
            ),
            okText: '我已保存',
          });
          onSuccess(result.api_key, result.key);
        } else {
          // 创建用户级API密钥
          const createData: CreateUserKeyParams = {
            name: values.name,
            user: values.user_id,
            tenant: values.tenant_id || tenantId,
            is_active: values.is_active,
            scopes: values.scopes,
            metadata: values.metadata,
          };
          
          // 设置过期时间
          if (expiryType === 'days' && values.expires_in_days) {
            createData.expires_in_days = values.expires_in_days;
          }
          
          result = await createUserApiKey(createData);
          modal.success({
            title: '用户级API密钥创建成功',
            content: (
              <div>
                <p>请妥善保存以下API密钥，它只会显示一次：</p>
                <p>
                  <code className={css`
                    background-color: #f5f5f5;
                    padding: 8px;
                    border-radius: 4px;
                    word-break: break-all;
                    display: block;
                  `}>{result.key}</code>
                </p>
                <p>密钥前缀: <strong>{result.api_key.prefix}</strong></p>
              </div>
            ),
            okText: '我已保存',
          });
          onSuccess(result.api_key, result.key);
        }
      }
    } catch (error: any) {
      console.error('提交API密钥表单失败:', error);
      message.error(`操作失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // 生成租户表单项
  const renderTenantFormItem = () => {
    const rules = getFormRules();
    
    if (isSpecificTenantView) {
      // 特定租户视图，不允许修改租户
      return (
        <Form.Item
          name="tenant_id"
          label="所属租户"
          initialValue={tenantId}
          rules={rules.tenant_id}
        >
          <Input disabled value={tenantId || ''} />
        </Form.Item>
      );
    } else {
      // 全局视图，允许选择租户(包括创建和编辑模式)
      return (
        <Form.Item
          name="tenant_id"
          label="所属租户"
          rules={rules.tenant_id}
          tooltip={keyType === 'system' ? "系统级密钥必须关联租户" : "选择租户可以筛选该租户下的用户，不选择则可从所有用户中选择"}
        >
          <Select
            showSearch
            placeholder="选择租户"
            loading={loadingTenants}
            options={tenantOptions}
            onChange={handleTenantChange}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            notFoundContent={loadingTenants ? <Spin size="small" /> : null}
          />
        </Form.Item>
      );
    }
  };
  
  // 设置创建模式的初始值
  useEffect(() => {
    if (visible && !apiKey) {
      // 创建模式
      form.resetFields();
      const initialValues = {
        key_type: 'system',
        is_active: true,
        tenant_id: tenantId,
        expires_in_days: 365,
        scopes: selectedService ? [{ service: selectedService, resource: '', action: '' }] : [],
      };
      form.setFieldsValue(initialValues);
      setKeyType('system');
      setExpiryType('days');
      setSelectedTenantId(tenantId || undefined);
    }
  }, [visible, apiKey, form, tenantId, selectedService]);
  
  return (
    <Modal
      title={apiKey ? (
        <Space>
          <span>编辑API密钥</span>
          {detailLoading && <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />}
        </Space>
      ) : '创建API密钥'}
      open={visible}
      width={720}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading || detailLoading || loadingServiceOptions}
          onClick={handleSubmit}
          disabled={detailLoading || loadingServiceOptions}
        >
          {apiKey ? '更新' : '创建'}
        </Button>,
      ]}
      maskClosable={true}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {(detailLoading || loadingServiceOptions) && apiKey ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Spin>
              <div style={{ padding: '30px', textAlign: 'center' }}>
                <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>加载中...</div>
              </div>
            </Spin>
          </div>
        ) : (
          <>
            {!apiKey && (
              <Form.Item
                name="key_type"
                label="密钥类型"
                rules={[{ required: true, message: '请选择密钥类型' }]}
              >
                <Radio.Group 
                  onChange={(e) => handleKeyTypeChange(e.target.value)}
                  value={keyType}
                >
                  <Radio.Button value="system">系统级密钥</Radio.Button>
                  <Radio.Button value="user">用户级密钥</Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}
            
            <Form.Item
              name="name"
              label="密钥名称"
              rules={[{ required: true, message: '请输入密钥名称' }]}
            >
              <Input placeholder="输入密钥名称" />
            </Form.Item>
            
            {/* 租户选择 */}
            {renderTenantFormItem()}
            
            {keyType === 'system' && (
              <Form.Item
                name="application_name"
                label="应用名称"
                tooltip="此密钥将用于哪个应用或系统"
              >
                <Input placeholder="输入应用名称（可选）" />
              </Form.Item>
            )}
            
            {keyType === 'user' && (
              <Form.Item
                name="user_id"
                label="所属用户"
                rules={getFormRules().user_id}
                tooltip={selectedTenantId ? "显示当前租户下的用户" : "显示所有用户"}
              >
                <Select
                  showSearch
                  placeholder={loadingUsers ? "加载用户中..." : (selectedTenantId ? `加载${getTenantName(selectedTenantId)}租户下的用户...` : "选择用户（所有用户）")}
                  loading={loadingUsers}
                  options={userOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent={loadingUsers ? <Spin size="small" /> : (selectedTenantId ? "当前租户下没有用户" : "没有找到用户")}
                />
              </Form.Item>
            )}
            
            <Form.Item
              name="is_active"
              label="状态"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="启用" 
                unCheckedChildren="禁用"
                defaultChecked
              />
            </Form.Item>
            
            {!apiKey && (
              <Form.Item label="过期时间">
                <Radio.Group onChange={handleExpiryTypeChange} value={expiryType}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="never">永不过期</Radio>
                    <Radio value="days">
                      指定天数后过期
                      {expiryType === 'days' && (
                        <Form.Item 
                          name="expires_in_days"
                          noStyle
                        >
                          <InputNumber 
                            min={1} 
                            max={3650}
                            addonAfter="天" 
                            style={{ width: '200px', marginLeft: '12px' }}
                          />
                        </Form.Item>
                      )}
                    </Radio>
                    <Radio value="date">
                      指定日期过期
                      {expiryType === 'date' && (
                        <Form.Item 
                          name="expires_at"
                          noStyle
                        >
                          <DatePicker 
                            showTime 
                            style={{ width: '300px', marginLeft: '12px' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                          />
                        </Form.Item>
                      )}
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            )}
            
            {apiKey && apiKeyDetail?.expires_at && (
              <Form.Item
                name="expires_at"
                label="过期时间"
              >
                <DatePicker 
                  showTime 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            )}
            
            <Divider orientation="left">密钥作用域</Divider>
            
            <Form.List name="scopes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card 
                      key={key} 
                      size="small" 
                      title={`作用域 #${name + 1}`}
                      styles={{ body: { padding: '16px' } }}
                      extra={
                        <Button 
                          type="text" 
                          danger 
                          icon={<MinusCircleOutlined />} 
                          onClick={() => remove(name)}
                        />
                      }
                      className={css`margin-bottom: 16px;`}
                    >
                      <div className={css`
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        
                        @media (max-width: 768px) {
                          flex-direction: column;
                        }
                      `}>
                        <Form.Item
                          {...restField}
                          name={[name, 'service']}
                          label="服务"
                          rules={[{ required: true, message: '请选择服务' }]}
                          className={css`
                            margin-bottom: 0;
                            flex: 1;
                            min-width: 200px;
                          `}
                        >
                          <Select
                            placeholder="选择服务"
                            options={serviceOptions}
                            onChange={(value) => handleServiceChange(value)}
                            loading={loadingServiceOptions}
                            notFoundContent={loadingServiceOptions ? <Spin size="small" /> : "没有可用的服务"}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'resource']}
                          label="资源"
                          rules={[{ required: true, message: '请选择资源' }]}
                          className={css`
                            margin-bottom: 0;
                            flex: 1;
                            min-width: 200px;
                          `}
                        >
                          <Select
                            placeholder={selectedService ? "选择资源" : "请先选择服务"}
                            options={resourceOptions[selectedService] || []}
                            disabled={!selectedService || loadingServiceOptions}
                            notFoundContent={loadingServiceOptions ? <Spin size="small" /> : "没有可用的资源"}
                          />
                        </Form.Item>
                        
                        <Form.Item
                          {...restField}
                          name={[name, 'action']}
                          label="操作"
                          rules={[{ required: true, message: '请选择操作' }]}
                          className={css`
                            margin-bottom: 0;
                            flex: 1;
                            min-width: 200px;
                          `}
                        >
                          <Select
                            placeholder="选择操作"
                            options={actionOptions}
                            disabled={loadingServiceOptions}
                            notFoundContent={loadingServiceOptions ? <Spin size="small" /> : "没有可用的操作"}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ service: selectedService, resource: '', action: '' })}
                      block
                      icon={<PlusOutlined />}
                      className={css`
                        margin-bottom: 16px;
                        &:hover {
                          color: ${token.colorPrimary};
                          border-color: ${token.colorPrimary};
                        }
                      `}
                      disabled={loadingServiceOptions}
                    >
                      添加作用域
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            
            <Divider orientation="left">高级设置</Divider>
            
            <Form.Item
              name="metadata"
              label={
                <span>
                  元数据
                  <Tooltip title="JSON格式的额外信息，如备注、标签等">
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </Tooltip>
                </span>
              }
            >
              <Input.TextArea
                placeholder='{"description": "API密钥描述", "created_by": "admin"}'
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ApiKeyFormModal; 