"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Table, Input, Button, Avatar, Spin, Empty } from 'antd';
import { getRoleUsers } from '@/services/role';
import { UserListItem } from '@/types/user';
import { App } from 'antd';
import { css } from '@emotion/css';
import { UserOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { getMediaUrl } from '@/utils/mediaUrl';

interface RoleUsersModalProps {
  visible: boolean;
  roleId: string;
  roleName: string;
  onCancel: () => void;
}

const RoleUsersModal: React.FC<RoleUsersModalProps> = ({
  visible,
  roleId,
  roleName,
  onCancel
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const { message: messageApi } = App.useApp();

  // 获取角色用户列表
  const fetchRoleUsers = useCallback(async (params = {}) => {
    if (!roleId) return;
    
    setLoading(true);
    try {
      const data = await getRoleUsers(roleId, {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...params
      });
      
      setUsers(data.results);
      setPagination({
        ...pagination,
        current: data.current_page,
        pageSize: data.page_size,
        total: data.total
      });
    } catch (error: any) {
      messageApi.error('获取用户列表失败: ' + (error.message || '未知错误'));
      console.error('获取角色用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [roleId, pagination.current, pagination.pageSize, messageApi]);

  // 首次加载和参数变化时获取用户列表
  useEffect(() => {
    if (visible) {
      fetchRoleUsers();
    }
  }, [visible, fetchRoleUsers]);

  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchRoleUsers({ page: 1 });
  };

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchRoleUsers({ page: pagination.current });
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
              <span className={css`
                margin-left: 8px;
                color: #faad14;
                font-size: 12px;
              `}>
                (超级管理员)
              </span>
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
      render: (text: string) => text || '-'
    },
    {
      title: '状态',
      key: 'status',
      render: (text: string, record: UserListItem) => (
        <span className={css`
          color: ${record.is_active ? '#52c41a' : '#ff4d4f'};
        `}>
          {record.is_active ? '已启用' : '已禁用'}
        </span>
      )
    }
  ];

  return (
    <Modal
      title={`角色用户列表 - ${roleName}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="close" onClick={onCancel}>
          关闭
        </Button>
      ]}
      maskClosable={true}
      destroyOnClose
    >
      <div className={css`
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
      `}>
        <div>
          <span className={css`margin-right: 8px;`}>
            共 {pagination.total} 个用户
          </span>
        </div>
        <div>
          <Input.Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchRoleUsers()}
            loading={loading}
            style={{ marginLeft: 8 }}
          />
        </div>
      </div>
      
      <Spin spinning={loading}>
        {users.length > 0 ? (
          <Table
            rowKey="id"
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
            size="middle"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无用户数据"
          />
        )}
      </Spin>
    </Modal>
  );
};

export default RoleUsersModal; 