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
  message,
  Avatar,
  Tooltip,
  Dropdown,
  Menu,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  KeyOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { getUserList, activateUser, deactivateUser, resetPassword, resetPasswordWithNewPassword, deleteUser } from '@/services/user';
import { UserListItem, UserQueryParams } from '@/types/user';
import { App } from 'antd';
import { PaginatedData } from '@/types/api';
import { getMediaUrl } from '@/utils/mediaUrl';
import UserFormModal from './user/UserFormModal';
import AssignUserModal from './user/AssignUserModal';

const { Option } = Select;

interface UserManagementProps {
  tenantId?: string | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [userFormVisible, setUserFormVisible] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const { message: messageApi, modal } = App.useApp();
  
  // 重置密码相关状态
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState<boolean>(false);
  const [resetPasswordForm] = Form.useForm();
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string>('');
  const [resetPasswordUsername, setResetPasswordUsername] = useState<string>('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState<boolean>(false);
  
  // 分配用户相关状态
  const [assignUserModalVisible, setAssignUserModalVisible] = useState<boolean>(false);
  
  // 获取用户列表
  const fetchUsers = useCallback(async (params: UserQueryParams = {}) => {
    setLoading(true);
    try {
      const queryParams: UserQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        // 注意：这里假设API支持通过tenant_id过滤用户，具体实现可能需要调整
        queryParams.tenant_id = tenantId;
      }
      
      const data = await getUserList(queryParams);
      setUsers(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      messageApi.error('获取用户列表失败: ' + (error.message || '未知错误'));
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, messageApi]);
  
  // 首次加载和参数变化时获取用户列表
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchUsers({ page: 1 });
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchUsers({ page: pagination.current });
  };
  
  // 处理激活/禁用用户
  const handleToggleStatus = async (record: UserListItem) => {
    // 超级管理员不能被禁用
    if (record.is_superuser) {
      messageApi.warning('超级管理员账户不能被禁用');
      return;
    }
    
    try {
      if (record.is_active) {
        await deactivateUser(record.id);
        messageApi.success('用户已禁用');
      } else {
        await activateUser(record.id);
        messageApi.success('用户已激活');
      }
      fetchUsers();
    } catch (error: any) {
      messageApi.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('操作用户状态失败:', error);
    }
  };
  
  // 显示重置密码对话框
  const showResetPasswordModal = (record: UserListItem) => {
    setResetPasswordUserId(record.id);
    setResetPasswordUsername(record.username);
    resetPasswordForm.resetFields();
    setResetPasswordModalVisible(true);
  };
  
  // 关闭重置密码对话框
  const handleResetPasswordCancel = () => {
    setResetPasswordModalVisible(false);
    setResetPasswordUserId('');
    setResetPasswordUsername('');
    resetPasswordForm.resetFields();
  };
  
  // 处理重置密码
  const handleResetPassword = async () => {
    try {
      await resetPasswordForm.validateFields();
      const values = resetPasswordForm.getFieldsValue();
      
      setResetPasswordLoading(true);
      
      // 如果用户输入了新密码，使用自定义密码重置
      if (values.new_password) {
        await resetPasswordWithNewPassword(resetPasswordUserId, values.new_password);
        messageApi.success('密码已重置为您指定的新密码');
      } else {
        // 否则使用系统生成的随机密码
        const result = await resetPassword(resetPasswordUserId);
        modal.success({
          title: '密码重置成功',
          content: (
            <div>
              <p>新密码: <strong>{result.new_password}</strong></p>
              <p>请记录此密码并安全传达给用户。</p>
            </div>
          )
        });
      }
      
      setResetPasswordModalVisible(false);
      resetPasswordForm.resetFields();
    } catch (error: any) {
      messageApi.error(`重置密码失败: ${error.message || '未知错误'}`);
      console.error('重置密码失败:', error);
    } finally {
      setResetPasswordLoading(false);
    }
  };
  
  // 处理删除用户
  const handleDeleteUser = async (record: UserListItem) => {
    // 超级管理员不能被删除
    if (record.is_superuser) {
      messageApi.warning('超级管理员账户不能被删除');
      return;
    }
    
    try {
      await deleteUser(record.id);
      messageApi.success('用户已删除');
      fetchUsers();
    } catch (error: any) {
      messageApi.error(`删除用户失败: ${error.message || '未知错误'}`);
      console.error('删除用户失败:', error);
    }
  };
  
  // 显示编辑用户表单
  const showEditUserForm = (record: UserListItem) => {
    setEditingUser({ id: record.id } as UserListItem);
    setUserFormVisible(true);
  };
  
  // 显示新建用户表单
  const showCreateUserForm = () => {
    setEditingUser(null);
    setUserFormVisible(true);
  };
  
  // 关闭用户表单
  const handleUserFormCancel = () => {
    setUserFormVisible(false);
    setEditingUser(null);
  };
  
  // 用户表单提交成功回调
  const handleUserFormSuccess = () => {
    setUserFormVisible(false);
    setEditingUser(null);
    fetchUsers();
  };
  
  // 显示分配用户模态框
  const showAssignUserModal = () => {
    setAssignUserModalVisible(true);
  };
  
  // 关闭分配用户模态框
  const handleAssignUserCancel = () => {
    setAssignUserModalVisible(false);
  };
  
  // 分配用户成功回调
  const handleAssignUserSuccess = () => {
    setAssignUserModalVisible(false);
    fetchUsers();
    messageApi.success('用户分配成功');
  };
  
  // 表格列定义
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: UserListItem) => (
        <div className={css`display: flex; align-items: center;`}>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={record.avatar ? getMediaUrl(record.avatar) : undefined}
            className={css`margin-right: 8px;`}
          />
          <span>
            {text}
            {record.is_superuser && (
              <Tag color="gold" style={{ marginLeft: 8 }}>
                超级管理员
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '姓名',
      key: 'fullname',
      render: (text: string, record: UserListItem) => (
        <span>
          {record.first_name || record.last_name 
            ? `${record.first_name || ''} ${record.last_name || ''}`.trim() 
            : '-'}
        </span>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text: string, record: UserListItem) => (
        <span>
          {text}
          {record.email_verified && (
            <Tooltip title="已验证">
              <CheckCircleOutlined className={css`color: #52c41a; margin-left: 8px;`} />
            </Tooltip>
          )}
        </span>
      )
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-'
    },
    {
      title: '所属租户',
      key: 'tenant',
      render: (text: string, record: UserListItem) => {
        // 如果有当前租户信息
        if (record.current_tenant) {
          return (
            <Tooltip 
              title={
                <div>
                  <p><strong>当前租户:</strong> {record.current_tenant.name}</p>
                  <p><strong>角色:</strong> {record.current_tenant.role_display}</p>
                  {record.tenants && record.tenants.length > 1 && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <p><strong>所有租户:</strong></p>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {record.tenants.map(tenant => (
                          <li key={tenant.id}>
                            {tenant.name} ({tenant.role_display})
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              }
            >
              <Space>
                <span>{record.current_tenant.name}</span>
                <Tag color={
                  record.current_tenant.role === 'owner' ? 'gold' : 
                  record.current_tenant.role === 'admin' ? 'blue' : 'green'
                }>
                  {record.current_tenant.role_display}
                </Tag>
              </Space>
            </Tooltip>
          );
        } 
        // 如果有多个租户但没有当前租户
        else if (record.tenants && record.tenants.length > 0) {
          return (
            <Tooltip 
              title={
                <div>
                  <p><strong>所有租户:</strong></p>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {record.tenants.map(tenant => (
                      <li key={tenant.id}>
                        {tenant.name} ({tenant.role_display})
                      </li>
                    ))}
                  </ul>
                </div>
              }
            >
              <Tag color="blue">{record.tenants.length} 个租户</Tag>
            </Tooltip>
          );
        }
        // 如果没有租户信息
        return <Tag>无租户</Tag>;
      }
    },
    {
      title: '系统角色',
      key: 'roles',
      render: (text: string, record: UserListItem) => (
        <Space>
          {record.roles && record.roles.length > 0 ? (
            record.roles.map(role => (
              <Tag color="blue" key={role.id}>{role.name}</Tag>
            ))
          ) : (
            <Tag>无角色</Tag>
          )}
        </Space>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (text: string, record: UserListItem) => (
        <Switch
          checked={record.is_active}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          disabled={record.is_superuser} // 超级管理员不能被禁用
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: UserListItem) => {
        // 根据是否为超级管理员动态生成操作菜单
        const menuItems: any[] = [
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => showEditUserForm(record)
          },
          {
            key: 'reset',
            icon: <KeyOutlined />,
            label: '重置密码',
            onClick: () => showResetPasswordModal(record)
          }
        ];
        
        // 只有非超级管理员才能被删除
        if (!record.is_superuser) {
          menuItems.push({
            key: 'delete',
            icon: <DeleteOutlined />,
            label: '删除',
            danger: true,
            onClick: () => {
              modal.confirm({
                title: '确认删除',
                content: `确定要删除用户 "${record.username}" 吗？此操作不可逆。`,
                okText: '删除',
                okType: 'danger',
                cancelText: '取消',
                onOk: () => handleDeleteUser(record)
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
          {tenantId ? (
            // 如果有租户ID，显示"分配用户"按钮
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              onClick={showAssignUserModal}
            >
              分配用户
            </Button>
          ) : (
            // 如果没有租户ID，显示"新建用户"按钮
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showCreateUserForm}
            >
              新建用户
            </Button>
          )}
          <Input.Search
            placeholder="搜索用户名、邮箱或姓名"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers()}
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
        dataSource={users}
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
      
      {/* 用户表单模态框 */}
      {userFormVisible && (
        <UserFormModal 
          visible={userFormVisible}
          user={editingUser}
          tenantId={tenantId}
          onCancel={handleUserFormCancel}
          onSuccess={handleUserFormSuccess}
        />
      )}
      
      {/* 分配用户模态框 */}
      {tenantId && (
        <AssignUserModal
          visible={assignUserModalVisible}
          tenantId={tenantId}
          onCancel={handleAssignUserCancel}
          onSuccess={handleAssignUserSuccess}
        />
      )}
      
      {/* 重置密码模态框 */}
      <Modal
        title="重置用户密码"
        open={resetPasswordModalVisible}
        onCancel={handleResetPasswordCancel}
        onOk={handleResetPassword}
        confirmLoading={resetPasswordLoading}
        maskClosable={false}
      >
        <Form
          form={resetPasswordForm}
          layout="vertical"
        >
          <div className={css`margin-bottom: 16px;`}>
            <p>您正在为用户 <strong>{resetPasswordUsername}</strong> 重置密码。</p>
            <p>您可以指定新密码，或留空以使用系统生成的随机密码。</p>
          </div>
          
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[
              { min: 8, message: '密码长度不能少于8个字符' },
              { 
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 
                message: '密码必须包含大小写字母和数字' 
              }
            ]}
          >
            <Input.Password placeholder="输入新密码或留空使用系统生成的随机密码" />
          </Form.Item>
          
          <Form.Item
            name="confirm_password"
            label="确认密码"
            dependencies={['new_password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!getFieldValue('new_password') || !value) {
                    return Promise.resolve();
                  }
                  if (getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 