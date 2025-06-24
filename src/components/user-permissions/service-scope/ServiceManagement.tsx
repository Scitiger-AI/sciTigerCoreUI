"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Switch,
  Popconfirm,
  Modal,
  Form,
  Select,
  Tooltip,
  Dropdown,
  Badge,
  App
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  AppstoreOutlined,
  ImportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { 
  getServices, 
  createService, 
  updateService, 
  deleteService,
  importDefaultServices
} from '@/services/serviceScope';
import { Service, ServiceQueryParams } from '@/types/serviceScope';
import ServiceFormModal from './ServiceFormModal';

interface ServiceManagementProps {
  tenantId?: string | null;
}

const ServiceManagement: React.FC<ServiceManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [serviceFormVisible, setServiceFormVisible] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [importingServices, setImportingServices] = useState<boolean>(false);
  const { message, modal } = App.useApp();
  
  // 获取服务列表
  const fetchServices = useCallback(async (params: ServiceQueryParams = {}, systemFilterValue?: string) => {
    setLoading(true);
    try {
      const queryParams: ServiceQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加系统服务筛选条件
      const filterValue = systemFilterValue !== undefined ? systemFilterValue : systemFilter;
      if (filterValue === 'system') {
        queryParams.is_system = true;
      } else if (filterValue === 'custom') {
        queryParams.is_system = false;
      }
      
      const data = await getServices(queryParams);
      setServices(data.results);
      setPagination({
        ...pagination,
        current: data.current_page || pagination.current,
        pageSize: data.page_size || pagination.pageSize,
        total: data.total || 0
      });
    } catch (error: any) {
      message.error('获取服务列表失败: ' + (error.message || '未知错误'));
      console.error('获取服务列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, systemFilter, message]);
  
  // 首次加载和参数变化时获取服务列表
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchServices({ page: 1 });
  };
  
  // 处理系统服务筛选变化
  const handleSystemFilterChange = (value: string) => {
    setSystemFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchServices({ page: 1 }, value);
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchServices({ page: pagination.current });
  };
  
  // 显示创建服务表单
  const showCreateServiceForm = () => {
    setEditingService(null);
    setServiceFormVisible(true);
  };
  
  // 显示编辑服务表单
  const showEditServiceForm = (record: Service) => {
    setEditingService(record);
    setServiceFormVisible(true);
  };
  
  // 关闭服务表单
  const handleServiceFormCancel = () => {
    setServiceFormVisible(false);
    setEditingService(null);
  };
  
  // 服务表单提交成功回调
  const handleServiceFormSuccess = () => {
    setServiceFormVisible(false);
    setEditingService(null);
    fetchServices();
  };
  
  // 处理删除服务
  const handleDeleteService = async (record: Service) => {
    // 系统服务不能被删除
    if (record.is_system) {
      message.warning('系统服务不能被删除');
      return;
    }
    
    try {
      await deleteService(record.id);
      message.success('服务已删除');
      fetchServices();
    } catch (error: any) {
      message.error(`删除服务失败: ${error.message || '未知错误'}`);
      console.error('删除服务失败:', error);
    }
  };
  
  // 导入默认服务
  const handleImportDefaultServices = async () => {
    modal.confirm({
      title: '导入默认服务',
      content: '确定要导入系统预设的默认服务、资源和操作吗？已存在的数据将不会被覆盖。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setImportingServices(true);
        try {
          const result = await importDefaultServices();
          message.success(`导入成功！新增服务: ${result.services.created}, 新增资源: ${result.resources.created}, 新增操作: ${result.actions.created}`);
          fetchServices();
        } catch (error: any) {
          message.error(`导入失败: ${error.message || '未知错误'}`);
          console.error('导入默认服务失败:', error);
        } finally {
          setImportingServices(false);
        }
      }
    });
  };
  
  // 表格列定义
  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Service) => (
        <div className={css`display: flex; align-items: center;`}>
          <AppstoreOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>
            {text}
            {record.is_system && (
              <Tag color="purple" style={{ marginLeft: 8 }}>
                系统服务
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '服务代码',
      dataIndex: 'code',
      key: 'code',
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
      render: (text: string, record: Service) => {
        // 如果有租户信息，且是对象类型
        if (record.tenant && typeof record.tenant === 'object') {
          const tenantObj = record.tenant as {
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
      render: (text: string, record: Service) => {
        // 根据是否为系统服务动态生成操作菜单
        const menuItems: any[] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => showEditServiceForm(record),
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
                content: `确定要删除服务 "${record.name}" 吗？此操作不可逆，并且会导致相关的资源和权限无法使用。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => handleDeleteService(record)
              });
            }
          }
        ];
        
        // // 非系统服务可以删除
        // if (!record.is_system) {
        //   menuItems.push({
        //     key: 'delete',
        //     icon: <DeleteOutlined />,
        //     label: '删除',
        //     danger: true,
        //     onClick: () => {
        //       modal.confirm({
        //         title: '确认删除',
        //         content: `确定要删除服务 "${record.name}" 吗？此操作不可逆，并且会导致相关的资源和权限无法使用。`,
        //         okText: '删除',
        //         okType: 'danger',
        //         cancelText: '取消',
        //         onOk: () => handleDeleteService(record)
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
        justify-content: space-between;
        margin-bottom: 16px;
      `}>
        <Space>
          <Button
            type="primary"
            icon={<ImportOutlined />}
            onClick={handleImportDefaultServices}
            loading={importingServices}
          >
            导入默认服务
          </Button>
        </Space>
        
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateServiceForm}
          >
            新建服务
          </Button>
          <Select
            placeholder="服务类型"
            style={{ width: 150 }}
            value={systemFilter}
            onChange={handleSystemFilterChange}
            options={[
              { value: 'all', label: '全部服务' },
              { value: 'system', label: '系统服务' },
              { value: 'custom', label: '自定义服务' }
            ]}
            suffixIcon={<FilterOutlined />}
          />
          <Input.Search
            placeholder="搜索服务名称或代码"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchServices()}
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
        dataSource={services}
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
      
      {/* 服务表单模态框 */}
      {serviceFormVisible && (
        <ServiceFormModal 
          visible={serviceFormVisible}
          service={editingService}
          tenantId={tenantId}
          onCancel={handleServiceFormCancel}
          onSuccess={handleServiceFormSuccess}
        />
      )}
    </div>
  );
};

export default ServiceManagement; 