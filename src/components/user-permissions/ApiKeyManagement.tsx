"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Card, 
  Tag, 
  Switch,
  Popconfirm,
  Modal,
  Tooltip,
  Dropdown,
  Badge,
  Select,
  Statistic,
  Row,
  Col,
  Avatar
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  EyeOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  LineChartOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  StopOutlined,
  UserOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { 
  getApiKeys, 
  activateApiKey, 
  deactivateApiKey, 
  deleteApiKey,
  getApiKeyStats
} from '@/services/apiKey';
import { ApiKey, ApiKeyStats, ApiKeyQueryParams } from '@/types/apiKey';
import { App } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import ApiKeyFormModal from './api-key/ApiKeyFormModal';
import ApiKeyUsageLogsModal from './api-key/ApiKeyUsageLogsModal';
import ApiKeyHashModal from './api-key/ApiKeyHashModal';
import { getMediaUrl } from '@/utils/mediaUrl';

// 配置dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

interface ApiKeyManagementProps {
  tenantId?: string | null;
}

const ApiKeyManagement: React.FC<ApiKeyManagementProps> = ({ tenantId }) => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [keyTypeFilter, setKeyTypeFilter] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 统计信息
  const [stats, setStats] = useState<ApiKeyStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  
  // 模态框状态
  const [apiKeyFormVisible, setApiKeyFormVisible] = useState<boolean>(false);
  const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);
  const [usageLogsVisible, setUsageLogsVisible] = useState<boolean>(false);
  const [currentApiKeyId, setCurrentApiKeyId] = useState<string>('');
  const [currentApiKeyName, setCurrentApiKeyName] = useState<string>('');
  
  // 查看密钥哈希相关状态
  const [viewHashModalVisible, setViewHashModalVisible] = useState<boolean>(false);
  const [viewHashApiKeyId, setViewHashApiKeyId] = useState<string>('');
  const [viewHashApiKeyName, setViewHashApiKeyName] = useState<string>('');
  
  // 获取API密钥列表
  const fetchApiKeys = useCallback(async (params: ApiKeyQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: ApiKeyQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加密钥类型筛选
      if (keyTypeFilter === 'system') {
        queryParams.key_type = 'system';
      } else if (keyTypeFilter === 'user') {
        queryParams.key_type = 'user';
      }
      
      const data = await getApiKeys(queryParams);
      setApiKeys(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      message.error('获取API密钥列表失败: ' + (error.message || '未知错误'));
      console.error('获取API密钥列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, keyTypeFilter, message]);
  
  // 获取API密钥统计信息
  const fetchApiKeyStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await getApiKeyStats();
      setStats(stats);
    } catch (error: any) {
      console.error('获取API密钥统计信息失败:', error);
    } finally {
      setLoadingStats(false);
    }
  };
  
  // 首次加载和参数变化时获取API密钥列表和统计信息
  useEffect(() => {
    fetchApiKeys();
    fetchApiKeyStats();
  }, [fetchApiKeys]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchApiKeys({ page: 1 });
  };
  
  // 处理密钥类型筛选
  const handleKeyTypeFilterChange = (value: string) => {
    setKeyTypeFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchApiKeys({ page: 1, key_type: value === 'all' ? undefined : value as 'system' | 'user' });
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchApiKeys({ page: pagination.current });
  };
  
  // 显示创建API密钥表单
  const showCreateApiKeyForm = () => {
    setEditingApiKey(null);
    setApiKeyFormVisible(true);
  };
  
  // 显示编辑API密钥表单
  const showEditApiKeyForm = (record: ApiKey) => {
    setEditingApiKey(record);
    setApiKeyFormVisible(true);
  };
  
  // 关闭API密钥表单
  const handleApiKeyFormCancel = () => {
    setApiKeyFormVisible(false);
    setEditingApiKey(null);
  };
  
  // API密钥表单提交成功回调
  const handleApiKeyFormSuccess = (apiKey: ApiKey, plainTextKey?: string) => {
    setApiKeyFormVisible(false);
    setEditingApiKey(null);
    fetchApiKeys();
    fetchApiKeyStats();
  };
  
  // 处理激活/禁用API密钥
  const handleToggleStatus = async (record: ApiKey) => {
    try {
      // 检查是否过期
      const isExpired = record.expires_at ? dayjs().isAfter(dayjs(record.expires_at)) : false;
      
      if (isExpired) {
        message.warning('已过期的API密钥无法激活，请先更新过期时间');
        return;
      }
      
      if (record.is_active) {
        modal.confirm({
          title: '确认禁用',
          content: `确定要禁用API密钥 "${record.name}" 吗？禁用后，使用此密钥的应用程序将无法访问API。`,
          okText: '禁用',
          okType: 'primary',
          cancelText: '取消',
          onOk: async () => {
            try {
              await deactivateApiKey(record.id);
              message.success('API密钥已禁用');
              fetchApiKeys();
              fetchApiKeyStats();
            } catch (error: any) {
              message.error(`禁用API密钥失败: ${error.message || '未知错误'}`);
              console.error('禁用API密钥失败:', error);
            }
          }
        });
      } else {
        modal.confirm({
          title: '确认激活',
          content: `确定要激活API密钥 "${record.name}" 吗？激活后，使用此密钥的应用程序将能够访问API。`,
          okText: '激活',
          okType: 'primary',
          cancelText: '取消',
          onOk: async () => {
            try {
              await activateApiKey(record.id);
              message.success('API密钥已激活');
              fetchApiKeys();
              fetchApiKeyStats();
            } catch (error: any) {
              message.error(`激活API密钥失败: ${error.message || '未知错误'}`);
              console.error('激活API密钥失败:', error);
            }
          }
        });
      }
    } catch (error: any) {
      message.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('操作API密钥状态失败:', error);
    }
  };
  
  // 处理删除API密钥
  const handleDeleteApiKey = async (record: ApiKey) => {
    try {
      await deleteApiKey(record.id);
      message.success('API密钥已删除');
      fetchApiKeys();
      fetchApiKeyStats();
    } catch (error: any) {
      message.error(`删除API密钥失败: ${error.message || '未知错误'}`);
      console.error('删除API密钥失败:', error);
    }
  };
  
  // 显示使用日志模态框
  const showUsageLogs = (record: ApiKey) => {
    setCurrentApiKeyId(record.id);
    setCurrentApiKeyName(record.name);
    setUsageLogsVisible(true);
  };
  
  // 关闭使用日志模态框
  const handleUsageLogsCancel = () => {
    setUsageLogsVisible(false);
    setCurrentApiKeyId('');
    setCurrentApiKeyName('');
  };
  
  // 复制API密钥前缀
  const copyApiKeyPrefix = (prefix: string) => {
    navigator.clipboard.writeText(prefix)
      .then(() => {
        message.success('已复制API密钥前缀到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };
  
  // 显示查看密钥哈希模态框
  const showViewHashModal = (record: ApiKey) => {
    setViewHashApiKeyId(record.id);
    setViewHashApiKeyName(record.name);
    setViewHashModalVisible(true);
  };
  
  // 关闭查看密钥哈希模态框
  const handleViewHashCancel = () => {
    setViewHashModalVisible(false);
    setViewHashApiKeyId('');
    setViewHashApiKeyName('');
  };
  
  // 获取租户名称
  const getTenantName = (tenant: string | { id: string; name: string; description?: string; is_active?: boolean }) => {
    if (typeof tenant === 'object' && tenant.name) {
      return tenant.name;
    }
    return typeof tenant === 'string' ? tenant : '-';
  };
  
  // 获取用户名称
  const getUserName = (user: string | { id: string; username: string; email: string } | null) => {
    if (!user) return '-';
    if (typeof user === 'object' && user.username) {
      return `${user.username}${user.email ? ` (${user.email})` : ''}`;
    }
    return typeof user === 'string' ? user : '-';
  };
  
  // 表格列定义
  const columns = [
    {
      title: '密钥名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ApiKey) => (
        <div className={css`display: flex; align-items: center;`}>
          <KeyOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>{text}</span>
        </div>
      )
    },
    {
      title: '密钥前缀',
      dataIndex: 'prefix',
      key: 'prefix',
      render: (text: string, record: ApiKey) => (
        <Space>
          <Tag color="blue">{text}</Tag>
          <Tooltip title="复制密钥前缀">
            <Button 
              type="text" 
              icon={<CopyOutlined />} 
              size="small"
              onClick={() => copyApiKeyPrefix(text)}
            />
          </Tooltip>
          <Tooltip title="查看完整密钥">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => showViewHashModal(record)}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'key_type',
      key: 'key_type',
      render: (text: 'system' | 'user') => (
        <Tag color={text === 'system' ? 'purple' : 'green'}>
          {text === 'system' ? '系统级' : '用户级'}
        </Tag>
      )
    },
    {
      title: '所属租户',
      key: 'tenant',
      // render: (text: string, record: ApiKey) => (
      //   <span>{getTenantName(record.tenant)}</span>
      // )
      render: (text: string, record: ApiKey) => {
        // 如果有租户信息，且是对象类型
        if (record.tenant && typeof record.tenant === 'object') {
          // 使用类型断言，确保TypeScript知道这是一个对象
          const tenantObj = record.tenant as unknown as {
            id: string;
            name: string;
            description?: string;
            is_active?: boolean;
          };
          
          return (
            <Tooltip 
              title={
                <div>
                  <p><strong>租户名称:</strong> {tenantObj.name}</p>
                  <p><strong>租户描述:</strong> {tenantObj.description || '-'}</p>
                  {tenantObj.is_active !== undefined && (
                    <p><strong>状态:</strong> {tenantObj.is_active ? '激活' : '禁用'}</p>
                  )}
                </div>
              }
            >
              <Space>
                <span>{tenantObj.name}</span>
                {tenantObj.is_active !== undefined && (
                  <Tag color={tenantObj.is_active ? "green" : "red"}>
                    {tenantObj.is_active ? "正常" : "禁用"}
                  </Tag>
                )}
              </Space>
            </Tooltip>
          );
        } 
        // 如果有租户ID但不是对象（字符串ID）
        else if (record.tenant && typeof record.tenant === 'string') {
          return <Tag color="green">租户ID: {record.tenant}</Tag>;
        }
        // 如果没有租户信息
        return <Tag>无租户</Tag>;
      }
    },
    {
      title: '所属用户',
      key: 'user',
      // render: (text: string, record: ApiKey) => (
      //   <span>{getUserName(record.user)}</span>
      // )
      render: (text: string, record: ApiKey) => (
        <div className={css`display: flex; align-items: center;`}>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={record.user && typeof record.user === 'object' && record.user.avatar ? getMediaUrl(record.user.avatar) : undefined}
            className={css`margin-right: 8px;`}
          />
          <span>
            {record.user ? (typeof record.user === 'object' ? record.user.username : record.user) : '-'}
            {record.user && typeof record.user === 'object' && record.user.is_superuser && (
              <Tag color="gold" style={{ marginLeft: 8 }}>
                超级管理员
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '应用名称',
      dataIndex: 'application_name',
      key: 'application_name',
      render: (text: string) => text || '-'
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (text: string | null) => {
        if (!text) {
          return <Tag color="green">永不过期</Tag>;
        }
        
        const expiryDate = dayjs(text);
        const now = dayjs();
        const isExpired = now.isAfter(expiryDate);
        
        return (
          <Tooltip title={expiryDate.format('YYYY-MM-DD HH:mm:ss')}>
            <Tag color={isExpired ? 'red' : (expiryDate.diff(now, 'day') < 30 ? 'orange' : 'blue')}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {isExpired ? '已过期' : expiryDate.fromNow()}
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: '最后使用',
      dataIndex: 'last_used_at',
      key: 'last_used_at',
      render: (text: string | null) => {
        if (!text) {
          return <span>-</span>;
        }
        
        return (
          <Tooltip title={dayjs(text).format('YYYY-MM-DD HH:mm:ss')}>
            <span>{dayjs(text).fromNow()}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '状态',
      key: 'status',
      render: (text: string, record: ApiKey) => {
        // 检查是否过期
        const isExpired = record.expires_at ? dayjs().isAfter(dayjs(record.expires_at)) : false;
        
        return (
          <Space>
            {isExpired ? (
              <Tooltip title="此API密钥已过期，请更新过期时间">
                <Tag color="red" icon={<ClockCircleOutlined />}>已过期</Tag>
              </Tooltip>
            ) : (
              <Switch
                checked={record.is_active}
                onChange={() => handleToggleStatus(record)}
                disabled={isExpired}
                checkedChildren="启用"
                unCheckedChildren="禁用"
              />
            )}
            {record.is_active && !isExpired && (
              <Tag color="green" icon={<CheckCircleOutlined />}>正常</Tag>
            )}
            {!record.is_active && !isExpired && (
              <Tag color="orange" icon={<StopOutlined />}>已禁用</Tag>
            )}
          </Space>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ApiKey) => {
        // 检查是否过期
        const isExpired = record.expires_at ? dayjs().isAfter(dayjs(record.expires_at)) : false;
        
        // 定义菜单项类型
        type MenuItem = {
          key: string;
          label: string;
          icon: React.ReactNode;
          onClick: () => void;
          danger?: boolean;
        };
        
        const menuItems: MenuItem[] = [
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => showEditApiKeyForm(record)
          },
          {
            key: 'logs',
            label: '使用日志',
            icon: <LineChartOutlined />,
            onClick: () => showUsageLogs(record)
          }
        ];
        
        // 添加激活/禁用选项（如果未过期）
        if (!isExpired) {
          if (record.is_active) {
            menuItems.push({
              key: 'deactivate',
              label: '禁用',
              icon: <StopOutlined />,
              onClick: () => handleToggleStatus(record)
            });
          } else {
            menuItems.push({
              key: 'activate',
              label: '激活',
              icon: <CheckCircleOutlined />,
              onClick: () => handleToggleStatus(record)
            });
          }
        }
        
        // 添加删除选项
        menuItems.push({
          key: 'delete',
          label: '删除',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            modal.confirm({
              title: '确认删除',
              content: `确定要删除API密钥 "${record.name}" 吗？此操作不可逆，并且会立即使相关应用程序无法访问API。`,
              okText: '删除',
              okType: 'danger',
              cancelText: '取消',
              onOk: () => handleDeleteApiKey(record)
            });
          }
        });
        
        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      }
    }
  ];
  
  return (
    <div>
      {stats && (
        <Card 
          variant="borderless"
          title="API密钥统计"
          styles={{ body: { padding: '24px' } }}
          className={css`
            margin-bottom: 24px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
          `}
        >
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Statistic
                title="总密钥数"
                value={stats.total_keys}
                loading={loadingStats}
                prefix={<KeyOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="系统级密钥"
                value={stats.system_keys}
                loading={loadingStats}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="用户级密钥"
                value={stats.user_keys}
                loading={loadingStats}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="活跃密钥"
                value={stats.active_keys}
                loading={loadingStats}
                valueStyle={{ color: '#1890ff' }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="禁用密钥"
                value={stats.inactive_keys}
                loading={loadingStats}
                valueStyle={{ color: '#faad14' }}
                prefix={<StopOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="过期密钥"
                value={stats.expired_keys}
                loading={loadingStats}
                valueStyle={{ color: '#f5222d' }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="最近新增"
                value={stats.recent_keys}
                loading={loadingStats}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总请求次数"
                value={stats.recent_usage}
                loading={loadingStats}
                prefix={<LineChartOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}
      
      <div className={css`
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      `}>
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateApiKeyForm}
          >
            新建API密钥
          </Button>
          <Select
            placeholder="密钥类型"
            style={{ width: 150 }}
            value={keyTypeFilter}
            onChange={handleKeyTypeFilterChange}
            options={[
              { value: 'all', label: '全部类型' },
              { value: 'system', label: '系统级' },
              { value: 'user', label: '用户级' }
            ]}
          />
          <Input.Search
            placeholder="搜索密钥名称"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchApiKeys();
              fetchApiKeyStats();
            }}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      </div>
      
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={apiKeys}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        onChange={handleTableChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys
        }}
      />
      
      {/* API密钥表单模态框 */}
      {apiKeyFormVisible && (
        <ApiKeyFormModal 
          visible={apiKeyFormVisible}
          apiKey={editingApiKey}
          tenantId={tenantId}
          onCancel={handleApiKeyFormCancel}
          onSuccess={handleApiKeyFormSuccess}
        />
      )}
      
      {/* API密钥使用日志模态框 */}
      {usageLogsVisible && (
        <ApiKeyUsageLogsModal
          visible={usageLogsVisible}
          apiKeyId={currentApiKeyId}
          apiKeyName={currentApiKeyName}
          onCancel={handleUsageLogsCancel}
        />
      )}
      
      {/* 查看API密钥哈希模态框 */}
      <ApiKeyHashModal
        visible={viewHashModalVisible}
        apiKeyId={viewHashApiKeyId}
        apiKeyName={viewHashApiKeyName}
        onCancel={handleViewHashCancel}
      />
    </div>
  );
};

export default ApiKeyManagement; 