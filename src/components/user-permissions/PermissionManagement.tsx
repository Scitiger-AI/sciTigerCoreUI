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
  Form,
  Select,
  Tooltip,
  Dropdown,
  Menu,
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
  SafetyOutlined,
  TeamOutlined,
  AppstoreOutlined,
  FilterOutlined,
  ImportOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { getPermissions, createPermission, updatePermission, deletePermission, importDefaultPermissions } from '@/services/permission';
import { Permission } from '@/types/permission';
import PermissionFormModal from './permission/PermissionFormModal';

interface PermissionManagementProps {
  tenantId?: string | null;
}

// 权限级别筛选选项
const permissionLevelOptions = [
  { value: 'all', label: '全部级别' },
  { value: 'system', label: '系统级' },
  { value: 'tenant', label: '租户级' }
];

const PermissionManagement: React.FC<PermissionManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [permissionLevel, setPermissionLevel] = useState<string>('all'); // 权限级别筛选状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [permissionFormVisible, setPermissionFormVisible] = useState<boolean>(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [importingPermissions, setImportingPermissions] = useState<boolean>(false);
  const { message: messageApi, modal } = App.useApp();
  
  // 获取权限列表
  const fetchPermissions = useCallback(async (params: any = {}, levelFilter?: string) => {
    setLoading(true);
    try {
      const queryParams: any = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加权限级别筛选
      // 优先使用传入的levelFilter参数，如果没有传入则使用状态中的permissionLevel
      const filterValue = levelFilter !== undefined ? levelFilter : permissionLevel;
      if (filterValue !== 'all') {
        queryParams.is_tenant_level = filterValue === 'tenant';
      }
      
      const data = await getPermissions(queryParams);
      setPermissions(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      messageApi.error('获取权限列表失败: ' + (error.message || '未知错误'));
      console.error('获取权限列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, messageApi, permissionLevel]);
  
  // 首次加载和参数变化时获取权限列表
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchPermissions({ page: 1 });
  };
  
  // 处理权限级别筛选变化
  const handlePermissionLevelChange = (value: string) => {
    // 先更新状态
    setPermissionLevel(value);
    
    // 直接使用新值发起请求，避免依赖状态变更
    setPagination({ ...pagination, current: 1 });
    fetchPermissions({ page: 1 }, value);
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchPermissions({ page: pagination.current });
  };
  
  // 显示创建权限表单
  const showCreatePermissionForm = () => {
    setEditingPermission(null);
    setPermissionFormVisible(true);
  };
  
  // 显示编辑权限表单
  const showEditPermissionForm = (record: Permission) => {
    setEditingPermission(record);
    setPermissionFormVisible(true);
  };
  
  // 关闭权限表单
  const handlePermissionFormCancel = () => {
    setPermissionFormVisible(false);
    setEditingPermission(null);
  };
  
  // 权限表单提交成功回调
  const handlePermissionFormSuccess = () => {
    setPermissionFormVisible(false);
    setEditingPermission(null);
    fetchPermissions();
  };
  
  // 处理删除权限
  const handleDeletePermission = async (record: Permission) => {
    // // 系统权限不能被删除
    // if (record.is_system) {
    //   messageApi.warning('系统权限不能被删除');
    //   return;
    // }
    
    try {
      await deletePermission(record.id);
      messageApi.success('权限已删除');
      fetchPermissions();
    } catch (error: any) {
      messageApi.error(`删除权限失败: ${error.message || '未知错误'}`);
      console.error('删除权限失败:', error);
    }
  };
  
  // 导入默认权限
  const handleImportDefaultPermissions = async () => {
    modal.confirm({
      title: '导入默认权限',
      content: '确定要导入系统预设的默认权限吗？已存在的权限将不会被覆盖。',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        setImportingPermissions(true);
        try {
          const result = await importDefaultPermissions();
          messageApi.success(`导入成功！新增权限: ${result.created}, 已存在: ${result.existed}, 失败: ${result.failed}`);
          fetchPermissions();
        } catch (error: any) {
          messageApi.error(`导入失败: ${error.message || '未知错误'}`);
          console.error('导入默认权限失败:', error);
        } finally {
          setImportingPermissions(false);
        }
      }
    });
  };
  
  // 格式化权限代码显示
  const formatPermissionCode = (code: string) => {
    const parts = code.split(':');
    if (parts.length === 3) {
      return (
        <Space>
          <Tag color="blue">{parts[0]}</Tag>
          <Tag color="green">{parts[1]}</Tag>
          <Tag color="orange">{parts[2]}</Tag>
        </Space>
      );
    }
    return code;
  };
  
  // 表格列定义
  const columns = [
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Permission) => (
        <div className={css`display: flex; align-items: center;`}>
          <span>
            {text}
            {record.is_system && (
              <Tag color="purple" style={{ marginLeft: 8 }}>
                系统预设
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => formatPermissionCode(text)
    },
    {
      title: '服务',
      dataIndex: 'service',
      key: 'service',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      render: (text: string) => <Tag color="green">{text}</Tag>
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'actionType',
      render: (text: string) => <Tag color="orange">{text}</Tag>
    },
    {
      title: '权限级别',
      key: 'level',
      render: (text: string, record: Permission) => (
        <span>
          {record.is_tenant_level ? 
            <Tag color="cyan">租户级</Tag> : 
            <Tag color="purple">系统级</Tag>
          }
        </span>
      )
    },
    {
      title: '所属租户',
      key: 'tenant',
      render: (text: string, record: Permission) => {
        // 如果有租户信息，且是对象类型
        if (record.tenant && typeof record.tenant === 'object') {
          // 使用类型断言，确保TypeScript知道这是一个对象
          const tenantObj = record.tenant as unknown as {
            id: string;
            name: string;
            slug?: string;
            subdomain?: string;
            description?: string;
            logo?: string;
            is_active?: boolean;
          };
          
          return (
            <Tooltip 
              title={
                <div>
                  <p><strong>租户名称:</strong> {tenantObj.name}</p>
                  <p><strong>租户标识:</strong> {tenantObj.slug || '-'}</p>
                  <p><strong>子域名:</strong> {tenantObj.subdomain || '-'}</p>
                  <p><strong>描述:</strong> {tenantObj.description || '-'}</p>
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
      title: '操作',
      key: 'action',
      render: (text: string, record: Permission) => {
        // 根据是否为系统权限动态生成操作菜单
        const menuItems: any[] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => showEditPermissionForm(record)
          },
          {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除权限 "${record.name}" 吗？此操作不可逆。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => handleDeletePermission(record)
              });
            }
          }
        ];
        
        // 非系统权限可以删除
        // if (!record.is_system) {
        //   menuItems.push({
        //     key: 'delete',
        //     icon: <DeleteOutlined />,
        //     label: '删除',
        //     danger: true,
        //     onClick: () => {
        //       modal.confirm({
        //         title: '确认删除',
        //         content: `确定要删除权限 "${record.name}" 吗？此操作不可逆。`,
        //         okText: '删除',
        //         okType: 'danger',
        //         cancelText: '取消',
        //         onOk: () => handleDeletePermission(record)
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
  
  // 是否显示创建权限按钮（只有超级管理员才能创建权限）
  const showCreateButton = !tenantId; // 只有在全局视图下才显示创建按钮
  
  return (
    <div>
      <div className={css`
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
      `}>
        <Space>
          {showCreateButton && (
            <Button
              type="primary"
              icon={<ImportOutlined />}
              onClick={handleImportDefaultPermissions}
              loading={importingPermissions}
            >
              导入默认权限
            </Button>
          )}
        </Space>
        
        <Space size="middle">
          {showCreateButton && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showCreatePermissionForm}
            >
              新建权限
            </Button>
          )}
          <Select
            placeholder="权限级别"
            value={permissionLevel}
            onChange={handlePermissionLevelChange}
            options={permissionLevelOptions}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          />
          <Input.Search
            placeholder="搜索权限名称或代码"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchPermissions()}
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
        dataSource={permissions}
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
      
      {/* 权限表单模态框 */}
      {permissionFormVisible && (
        <PermissionFormModal 
          visible={permissionFormVisible}
          permission={editingPermission}
          tenantId={tenantId}
          onCancel={handlePermissionFormCancel}
          onSuccess={handlePermissionFormSuccess}
        />
      )}
    </div>
  );
};

export default PermissionManagement; 