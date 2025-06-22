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
  Divider,
  Badge
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
  StarOutlined,
  StarFilled
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { 
  getRoles, 
  getRoleDetail, 
  createRole, 
  updateRole, 
  deleteRole, 
  getRoleUsers,
  setDefaultRole,
  unsetDefaultRole,
  assignPermissionsToRole,
  removePermissionsFromRole
} from '@/services/role';
import { Role, RoleDetail, RoleQueryParams } from '@/types/role';
import { App } from 'antd';
import RoleFormModal from './role/RoleFormModal';
import RolePermissionsModal from './role/RolePermissionsModal';
import RoleUsersModal from './role/RoleUsersModal';

interface RoleManagementProps {
  tenantId?: string | null;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [roleFormVisible, setRoleFormVisible] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { message: messageApi, modal } = App.useApp();
  
  // 系统角色筛选状态
  const [isSystemFilter, setIsSystemFilter] = useState<boolean | undefined>(undefined);
  
  // 权限管理相关状态
  const [permissionsModalVisible, setPermissionsModalVisible] = useState<boolean>(false);
  const [currentRoleId, setCurrentRoleId] = useState<string>('');
  const [currentRoleName, setCurrentRoleName] = useState<string>('');
  
  // 查看用户相关状态
  const [usersModalVisible, setUsersModalVisible] = useState<boolean>(false);
  
  // 添加状态来保存当前角色的租户ID
  const [currentRoleTenantId, setCurrentRoleTenantId] = useState<string | null>(null);
  
  // 获取角色列表
  const fetchRoles = useCallback(async (params: RoleQueryParams = {}, systemFilter?: boolean | undefined) => {
    setLoading(true);
    try {
      const queryParams: RoleQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加系统角色筛选条件
      // 优先使用传入的systemFilter参数，如果没有传入则使用状态中的isSystemFilter
      const filterValue = systemFilter !== undefined ? systemFilter : isSystemFilter;
      if (filterValue !== undefined) {
        queryParams.is_system = filterValue;
      }
      
      const data = await getRoles(queryParams);
      setRoles(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      messageApi.error('获取角色列表失败: ' + (error.message || '未知错误'));
      console.error('获取角色列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, messageApi, isSystemFilter]);
  
  // 首次加载时获取角色列表
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchRoles({ page: 1 });
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchRoles({ page: pagination.current });
  };
  
  // 显示创建角色表单
  const showCreateRoleForm = () => {
    setEditingRole(null);
    setRoleFormVisible(true);
  };
  
  // 显示编辑角色表单
  const showEditRoleForm = (record: Role) => {
    setEditingRole(record);
    setRoleFormVisible(true);
  };
  
  // 关闭角色表单
  const handleRoleFormCancel = () => {
    setRoleFormVisible(false);
    setEditingRole(null);
  };
  
  // 角色表单提交成功回调
  const handleRoleFormSuccess = () => {
    setRoleFormVisible(false);
    setEditingRole(null);
    fetchRoles();
  };
  
  // 处理删除角色
  const handleDeleteRole = async (record: Role) => {
    // 系统角色不能被删除
    if (record.is_system) {
      messageApi.warning('系统角色不能被删除');
      return;
    }
    
    try {
      await deleteRole(record.id);
      messageApi.success('角色已删除');
      fetchRoles();
    } catch (error: any) {
      messageApi.error(`删除角色失败: ${error.message || '未知错误'}`);
      console.error('删除角色失败:', error);
    }
  };
  
  // 处理设置/取消默认角色
  const handleToggleDefault = async (record: Role) => {
    try {
      if (record.is_default) {
        await unsetDefaultRole(record.id);
        messageApi.success('已取消默认角色设置');
      } else {
        await setDefaultRole(record.id);
        messageApi.success('已设置为默认角色');
      }
      fetchRoles();
    } catch (error: any) {
      messageApi.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('设置默认角色失败:', error);
    }
  };
  
  // 显示权限管理模态框
  const showPermissionsModal = (record: Role) => {
    setCurrentRoleId(record.id);
    setCurrentRoleName(record.name);
    
    // 设置当前角色的租户ID
    if (record.tenant && typeof record.tenant === 'object') {
      setCurrentRoleTenantId((record.tenant as any).id);
    } else if (record.tenant && typeof record.tenant === 'string') {
      setCurrentRoleTenantId(record.tenant);
    } else {
      setCurrentRoleTenantId(null);
    }
    
    setPermissionsModalVisible(true);
  };
  
  // 关闭权限管理模态框
  const handlePermissionsModalCancel = () => {
    setPermissionsModalVisible(false);
    setCurrentRoleId('');
    setCurrentRoleName('');
    setCurrentRoleTenantId(null);
  };
  
  // 权限管理成功回调
  const handlePermissionsSuccess = () => {
    setPermissionsModalVisible(false);
    fetchRoles();
  };
  
  // 显示用户列表模态框
  const showUsersModal = (record: Role) => {
    setCurrentRoleId(record.id);
    setCurrentRoleName(record.name);
    setUsersModalVisible(true);
  };
  
  // 关闭用户列表模态框
  const handleUsersModalCancel = () => {
    setUsersModalVisible(false);
    setCurrentRoleId('');
    setCurrentRoleName('');
  };
  
  // 处理系统角色筛选变化
  const handleSystemFilterChange = (value: string) => {
    let newFilterValue: boolean | undefined;
    
    if (value === 'all') {
      newFilterValue = undefined;
    } else if (value === 'system') {
      newFilterValue = true;
    } else if (value === 'custom') {
      newFilterValue = false;
    }
    
    // 先更新状态
    setIsSystemFilter(newFilterValue);
    
    // 直接使用新值发起请求，避免依赖状态变更
    setPagination({ ...pagination, current: 1 });
    fetchRoles({ page: 1 }, newFilterValue);
  };
  
  // 表格列定义
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <div className={css`display: flex; align-items: center;`}>
          <span>
            {text}
            {record.is_default && (
              <Tooltip title="默认角色">
                <StarFilled className={css`color: #faad14; margin-left: 8px;`} />
              </Tooltip>
            )}
          </span>
        </div>
      )
    },
    {
      title: '角色代码',
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
      title: '类型',
      key: 'type',
      render: (text: string, record: Role) => (
        <Space>
          {record.is_system ? (
            <Tag color="purple">系统角色</Tag>
          ) : (
            <Tag color="blue">自定义角色</Tag>
          )}
          {record.tenant ? (
            <Tag color="green">租户角色</Tag>
          ) : (
            <Tag color="orange">全局角色</Tag>
          )}
        </Space>
      )
    },
    {
      title: '所属租户',
      key: 'tenant',
      render: (text: string, record: Role) => {
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
      title: '默认',
      key: 'default',
      render: (text: string, record: Role) => (
        <Switch
          checked={record.is_default}
          onChange={() => handleToggleDefault(record)}
          checkedChildren="是"
          unCheckedChildren="否"
          disabled={record.is_system} // 系统角色不能修改默认状态
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Role) => {
        // 根据是否为系统角色动态生成操作菜单
        const menuItems: any[] = [
          {
            key: 'permissions',
            icon: <SafetyOutlined />,
            label: '管理权限',
            onClick: () => showPermissionsModal(record)
          },
          {
            key: 'users',
            icon: <TeamOutlined />,
            label: '查看用户',
            onClick: () => showUsersModal(record)
          }
        ];
        
        // 非系统角色可以编辑
        if (!record.is_system) {
          menuItems.unshift({
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => showEditRoleForm(record)
          });
          
          // 非系统角色可以删除
          menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除角色 "${record.name}" 吗？此操作不可逆。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => handleDeleteRole(record)
              });
            }
          });
        }
        
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
            onClick={showCreateRoleForm}
          >
            新建角色
          </Button>
          <Input.Search
            placeholder="搜索角色名称或代码"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Select
            placeholder="角色类型"
            style={{ width: 150 }}
            onChange={handleSystemFilterChange}
            defaultValue="all"
            options={[
              { value: 'all', label: '全部角色' },
              { value: 'system', label: '系统角色' },
              { value: 'custom', label: '自定义角色' }
            ]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchRoles()}
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
        dataSource={roles}
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
      
      {/* 角色表单模态框 */}
      {roleFormVisible && (
        <RoleFormModal 
          visible={roleFormVisible}
          role={editingRole}
          tenantId={tenantId}
          onCancel={handleRoleFormCancel}
          onSuccess={handleRoleFormSuccess}
        />
      )}
      
      {/* 权限管理模态框 */}
      {permissionsModalVisible && (
        <RolePermissionsModal
          visible={permissionsModalVisible}
          roleId={currentRoleId}
          roleName={currentRoleName}
          tenantId={currentRoleTenantId || tenantId}
          onCancel={handlePermissionsModalCancel}
          onSuccess={handlePermissionsSuccess}
        />
      )}
      
      {/* 用户列表模态框 */}
      {usersModalVisible && (
        <RoleUsersModal
          visible={usersModalVisible}
          roleId={currentRoleId}
          roleName={currentRoleName}
          onCancel={handleUsersModalCancel}
        />
      )}
    </div>
  );
};

export default RoleManagement; 