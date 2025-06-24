"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Select,
  Tooltip,
  Dropdown,
  App
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  ApartmentOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { 
  getResources, 
  createResource, 
  updateResource, 
  deleteResource,
  getServiceOptions
} from '@/services/serviceScope';
import { Resource, ResourceQueryParams, ServiceOption } from '@/types/serviceScope';
import ResourceFormModal from './ResourceFormModal';

interface ResourceManagementProps {
  tenantId?: string | null;
}

const ResourceManagement: React.FC<ResourceManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [loadingServices, setLoadingServices] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [resourceFormVisible, setResourceFormVisible] = useState<boolean>(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { message, modal } = App.useApp();
  
  // 加载服务选项
  useEffect(() => {
    const fetchServiceOptions = async () => {
      setLoadingServices(true);
      try {
        const services = await getServiceOptions();
        const options = services.map(service => ({
          label: service.name,
          value: service.code
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
  
  // 获取资源列表
  const fetchResources = useCallback(async (params: ResourceQueryParams = {}, systemFilterValue?: string, serviceFilterValue?: string) => {
    setLoading(true);
    try {
      const queryParams: ResourceQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加系统资源筛选条件
      const sysFilter = systemFilterValue !== undefined ? systemFilterValue : systemFilter;
      if (sysFilter === 'system') {
        queryParams.is_system = true;
      } else if (sysFilter === 'custom') {
        queryParams.is_system = false;
      }
      
      // 添加服务筛选条件
      const svcFilter = serviceFilterValue !== undefined ? serviceFilterValue : serviceFilter;
      if (svcFilter) {
        queryParams.service_code = svcFilter;
      }
      
      const data = await getResources(queryParams);
      setResources(data.results);
      setPagination({
        ...pagination,
        current: data.current_page || pagination.current,
        pageSize: data.page_size || pagination.pageSize,
        total: data.total || 0
      });
    } catch (error: any) {
      message.error('获取资源列表失败: ' + (error.message || '未知错误'));
      console.error('获取资源列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, systemFilter, serviceFilter, message]);
  
  // 首次加载和参数变化时获取资源列表
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchResources({ page: 1 });
  };
  
  // 处理系统资源筛选变化
  const handleSystemFilterChange = (value: string) => {
    setSystemFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchResources({ page: 1 }, value);
  };
  
  // 处理服务筛选变化
  const handleServiceFilterChange = (value: string) => {
    setServiceFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchResources({ page: 1 }, undefined, value);
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchResources({ page: pagination.current });
  };
  
  // 显示创建资源表单
  const showCreateResourceForm = () => {
    setEditingResource(null);
    setResourceFormVisible(true);
  };
  
  // 显示编辑资源表单
  const showEditResourceForm = (record: Resource) => {
    setEditingResource(record);
    setResourceFormVisible(true);
  };
  
  // 关闭资源表单
  const handleResourceFormCancel = () => {
    setResourceFormVisible(false);
    setEditingResource(null);
  };
  
  // 资源表单提交成功回调
  const handleResourceFormSuccess = () => {
    setResourceFormVisible(false);
    setEditingResource(null);
    fetchResources();
  };
  
  // 处理删除资源
  const handleDeleteResource = async (record: Resource) => {
    // 系统资源不能被删除
    if (record.is_system) {
      message.warning('系统资源不能被删除');
      return;
    }
    
    try {
      await deleteResource(record.id);
      message.success('资源已删除');
      fetchResources();
    } catch (error: any) {
      message.error(`删除资源失败: ${error.message || '未知错误'}`);
      console.error('删除资源失败:', error);
    }
  };
  
  // 获取服务名称
  const getServiceName = (record: Resource) => {
    if (typeof record.service === 'object' && record.service) {
      return record.service.name;
    } else if (record.service_code) {
      const service = serviceOptions.find(option => option.value === record.service_code);
      return service ? service.label : record.service_code;
    } else if (typeof record.service === 'string') {
      const service = serviceOptions.find(option => option.value === record.service);
      return service ? service.label : record.service;
    }
    return '-';
  };
  
  // 表格列定义
  const columns = [
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Resource) => (
        <div className={css`display: flex; align-items: center;`}>
          <ApartmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>
            {text}
            {record.is_system && (
              <Tag color="purple" style={{ marginLeft: 8 }}>
                系统资源
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '资源代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '所属服务',
      key: 'service',
      render: (text: string, record: Resource) => (
        <Tag color="blue">{getServiceName(record)}</Tag>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: '所属租户',
      key: 'tenant',
      render: (text: string, record: Resource) => {
        // 如果有租户信息，且是对象类型
        if (typeof record.service === 'object' && record.service && record.service.tenant && typeof record.service.tenant === 'object') {
          const tenantObj = record.service.tenant as {
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
        else if (typeof record.service === 'object' && record.service && record.service.tenant && typeof record.service.tenant === 'string') {
          return <Tag color="green">租户ID: {record.service.tenant}</Tag>;
        }
        // 如果没有租户信息
        return <Tag>全局服务</Tag>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Resource) => {
        // 根据是否为系统资源动态生成操作菜单
        const menuItems: any[] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => showEditResourceForm(record),
            // disabled: record.is_system
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除资源 "${record.name}" 吗？此操作不可逆，并且会导致相关的权限无法使用。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => handleDeleteResource(record)
              });
            }
          }
        ];
        
        // // 非系统资源可以删除
        // if (!record.is_system) {
        //   menuItems.push({
        //     key: 'delete',
        //     icon: <DeleteOutlined />,
        //     label: '删除',
        //     danger: true,
        //     onClick: () => {
        //       modal.confirm({
        //         title: '确认删除',
        //         content: `确定要删除资源 "${record.name}" 吗？此操作不可逆，并且会导致相关的权限无法使用。`,
        //         okText: '删除',
        //         okType: 'danger',
        //         cancelText: '取消',
        //         onOk: () => handleDeleteResource(record)
        //       });
        //     }
        //   });
        // }
        
        return (
          <Dropdown 
            menu={{ items: menuItems }}
            trigger={['click']}
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      }
    }
  ];
  
  return (
    <div>
      <div className={css`
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      `}>
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateResourceForm}
          >
            新建资源
          </Button>
          <Select
            placeholder="资源类型"
            style={{ width: 150 }}
            value={systemFilter}
            onChange={handleSystemFilterChange}
            options={[
              { value: 'all', label: '全部资源' },
              { value: 'system', label: '系统资源' },
              { value: 'custom', label: '自定义资源' }
            ]}
            suffixIcon={<FilterOutlined />}
          />
          <Select
            placeholder="所属服务"
            style={{ width: 180 }}
            value={serviceFilter}
            onChange={handleServiceFilterChange}
            options={[
              { value: '', label: '全部服务' },
              ...serviceOptions
            ]}
            loading={loadingServices}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          <Input.Search
            placeholder="搜索资源名称或代码"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchResources()}
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
        dataSource={resources}
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
      
      {/* 资源表单模态框 */}
      {resourceFormVisible && (
        <ResourceFormModal 
          visible={resourceFormVisible}
          resource={editingResource}
          tenantId={tenantId}
          onCancel={handleResourceFormCancel}
          onSuccess={handleResourceFormSuccess}
        />
      )}
    </div>
  );
};

export default ResourceManagement; 