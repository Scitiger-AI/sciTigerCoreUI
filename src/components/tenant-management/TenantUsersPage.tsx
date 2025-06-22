"use client";

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Avatar,
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Breadcrumb,
  Tooltip,
  Popconfirm,
  App,
  AutoComplete,
  Spin
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { useRouter } from 'next/navigation';
import { getTenantDetail } from '@/services/tenant';
import { 
  getTenantUsersByTenant, 
  createTenantUser, 
  updateTenantUser, 
  deleteTenantUser 
} from '@/services/tenant';
import { getUserList } from '@/services/user';
import { Tenant, TenantUser, CreateTenantUserParams, UpdateTenantUserParams } from '@/types/tenant';
import { UserListItem } from '@/types/user';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { getMediaUrl } from '@/utils/mediaUrl';

const { Title, Text } = Typography;

interface TenantUsersPageProps {
  tenantId: string;
}

const TenantUsersPage: React.FC<TenantUsersPageProps> = ({ tenantId }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [userOptions, setUserOptions] = useState<{ value: string; label: React.ReactNode }[]>([]);
  const [userSearchValue, setUserSearchValue] = useState<string>('');
  const [userSearchLoading, setUserSearchLoading] = useState<boolean>(false);
  
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const router = useRouter();
  const { message, modal } = App.useApp();

  // 获取租户详情和用户列表
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const tenantData = await getTenantDetail(tenantId);
        setTenant(tenantData);
      } catch (error) {
        console.error('获取租户详情失败:', error);
        message.error('获取租户详情失败，请重试');
      }
    };

    fetchTenantData();
    fetchUsers(1);
  }, [tenantId, message]);

  // 获取用户列表
  const fetchUsers = async (page: number, pageSize = 10) => {
    try {
      setLoading(true);
      const params = {
        page,
        page_size: pageSize,
      };
      
      const data = await getTenantUsersByTenant(tenantId, params);
      setUsers(data.results);
      setPagination({
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total,
      });
    } catch (error) {
      console.error('获取租户用户列表失败:', error);
      message.error('获取租户用户列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理表格变化
  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination.current, pagination.pageSize);
  };

  // 处理返回
  const handleBack = () => {
    router.push(`/tenant-management/${tenantId}`);
  };

  // 处理添加用户
  const handleAddUser = () => {
    addForm.resetFields();
    setAddModalVisible(true);
  };

  // 处理添加用户提交
  const handleAddUserSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      
      const data: CreateTenantUserParams = {
        tenant_id: tenantId,
        user_id: values.user_id,
        role: values.role,
        is_active: values.is_active,
      };
      
      await createTenantUser(data);
      message.success('用户添加成功');
      setAddModalVisible(false);
      fetchUsers(pagination.current);
    } catch (error: any) {
      console.error('添加用户失败:', error);
      message.error(error.message || '添加用户失败，请重试');
    }
  };

  // 处理编辑用户
  const handleEditUser = (user: TenantUser) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      role: user.role,
      is_active: user.is_active,
    });
    setEditModalVisible(true);
  };

  // 处理编辑用户提交
  const handleEditUserSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      const values = await editForm.validateFields();
      
      const data: UpdateTenantUserParams = {
        role: values.role,
        is_active: values.is_active,
      };
      
      await updateTenantUser(selectedUser.id, data);
      message.success('用户信息更新成功');
      setEditModalVisible(false);
      fetchUsers(pagination.current);
    } catch (error: any) {
      console.error('更新用户失败:', error);
      message.error(error.message || '更新用户失败，请重试');
    }
  };

  // 处理删除用户
  const handleDeleteUser = async (user: TenantUser) => {
    if (user.role === 'owner') {
      modal.error({
        title: '无法删除',
        content: '无法删除租户所有者，请先转移所有权',
      });
      return;
    }
    
    try {
      await deleteTenantUser(user.id);
      message.success('用户已从租户中移除');
      fetchUsers(pagination.current);
    } catch (error: any) {
      console.error('删除用户失败:', error);
      message.error(error.message || '删除用户失败，请重试');
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchValue(value);
    // 实际项目中可能需要调用后端API进行搜索
    // 这里简单实现前端过滤
    if (value) {
      const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) ||
        user.email.toLowerCase().includes(value.toLowerCase())
      );
      setUsers(filteredUsers);
    } else {
      fetchUsers(1);
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    setSearchValue('');
    fetchUsers(1);
    message.success('数据已刷新');
  };

  // 搜索用户
  const handleUserSearch = async (value: string) => {
    if (value.length < 2) {
      setUserOptions([]);
      return;
    }
    
    setUserSearchValue(value);
    setUserSearchLoading(true);
    
    try {
      const { results } = await getUserList({ search: value, page: 1, page_size: 10 });
      
      const options = results.map(user => ({
        value: user.id,
        label: (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size="small" 
              icon={<UserOutlined />} 
              src={user.avatar ? getMediaUrl(user.avatar) : undefined}
              style={{ marginRight: 8 }}
            />
            <div>
              <div>{user.username}</div>
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>{user.email}</div>
            </div>
          </div>
        ),
        user: user
      }));
      
      setUserOptions(options);
    } catch (error) {
      console.error('搜索用户失败:', error);
    } finally {
      setUserSearchLoading(false);
    }
  };

  // 选择用户
  const handleUserSelect = (value: string, option: any) => {
    addForm.setFieldsValue({ user_id: value });
  };

  // 获取角色标签
  const getRoleTag = (role: string) => {
    switch (role) {
      case 'owner':
        return <Tag color="gold">所有者</Tag>;
      case 'admin':
        return <Tag color="blue">管理员</Tag>;
      case 'member':
        return <Tag color="green">成员</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  // 表格列定义
  const columns: ColumnsType<TenantUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record) => (
        <div className={css`display: flex; align-items: center;`}>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            src={record.avatar ? getMediaUrl(record.avatar) : undefined}
            className={css`margin-right: 8px;`}
          />
          <span>
            {text}
          </span>
        </div>
      )
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <Space>
          <MailOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '姓名',
      key: 'name',
      render: (_, record) => (
        <Text>
          {record.full_name || record.username || ''}
        </Text>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        isActive ? 
          <Tag color="success">活跃</Tag> : 
          <Tag color="error">已禁用</Tag>
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date) => (
        date ? new Date(date).toLocaleString() : '从未登录'
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
              disabled={record.role === 'owner' && tenant?.owner_user?.id === record.user_id}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Popconfirm
              title="确定要移除此用户吗？"
              description="此操作将从租户中移除该用户，但不会删除用户账号。"
              onConfirm={() => handleDeleteUser(record)}
              okText="确定"
              cancelText="取消"
              disabled={record.role === 'owner'}
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                disabled={record.role === 'owner'}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        className={css`
          margin-bottom: 16px;
        `}
        items={[
          {
            title: <Link href="/tenant-management">租户管理</Link>,
          },
          {
            title: <Link href={`/tenant-management/${tenantId}`}>{tenant?.name || '租户详情'}</Link>,
          },
          {
            title: '用户管理',
          },
        ]}
      />

      {/* 页面标题 */}
      <div className={css`
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      `}>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            返回
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {tenant ? `${tenant.name} - 用户管理` : '用户管理'}
          </Title>
        </Space>
        
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={handleAddUser}
        >
          添加用户
        </Button>
      </div>

      {/* 操作区域 */}
      <div className={css`
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
      `}>
      
        <Input.Search
          placeholder="搜索用户名或邮箱"
          allowClear
          enterButton={<SearchOutlined />}
          onSearch={handleSearch}
          style={{ width: 300 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />

<Tooltip title="刷新">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
          />
        </Tooltip>
      </div>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      {/* 添加用户模态框 */}
      <Modal
        title="添加用户到租户"
        open={addModalVisible}
        onOk={handleAddUserSubmit}
        onCancel={() => setAddModalVisible(false)}
        maskClosable={true}
      >
        <Form
          form={addForm}
          layout="vertical"
        >
          <Form.Item
            name="user_id"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <AutoComplete
              options={userOptions}
              onSearch={handleUserSearch}
              onSelect={handleUserSelect}
              placeholder="搜索用户名或邮箱"
              notFoundContent={
                userSearchLoading ? (
                  <div style={{ textAlign: 'center', padding: '5px 0' }}>
                    <Spin size="small" /> <span style={{ marginLeft: 8 }}>搜索中...</span>
                  </div>
                ) : '未找到匹配用户'
              }
            />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="用户角色"
            initialValue="member"
            rules={[{ required: true, message: '请选择用户角色' }]}
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="member">成员</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="is_active"
            label="是否激活"
            initialValue={true}
          >
            <Select>
              <Select.Option value={true}>是</Select.Option>
              <Select.Option value={false}>否</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      {selectedUser && (
        <Modal
          title="编辑用户"
          open={editModalVisible}
          onOk={handleEditUserSubmit}
          onCancel={() => setEditModalVisible(false)}
          maskClosable={true}
        >
          <div className={css`
            margin-bottom: 24px;
          `}>
            <Text strong>用户名:</Text> {selectedUser.username}<br />
            <Text strong>邮箱:</Text> {selectedUser.email}
          </div>
          
          <Form
            form={editForm}
            layout="vertical"
          >
            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色' }]}
            >
              <Select disabled={selectedUser.role === 'owner'}>
                <Select.Option value="owner" disabled={selectedUser.role !== 'owner'}>所有者</Select.Option>
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="member">成员</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="is_active"
              label="是否激活"
            >
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default TenantUsersPage; 