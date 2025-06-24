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
  Popconfirm,
  App
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  EllipsisOutlined,
  ToolOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { 
  getActions, 
  createAction, 
  updateAction, 
  deleteAction
} from '@/services/serviceScope';
import { Action, ActionQueryParams } from '@/types/serviceScope';
import ActionFormModal from './ActionFormModal';

interface ActionManagementProps {
  tenantId?: string | null;
}

const ActionManagement: React.FC<ActionManagementProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState<string>('');
  const [systemFilter, setSystemFilter] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [actionFormVisible, setActionFormVisible] = useState<boolean>(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const { message, modal } = App.useApp();
  
  // 获取操作列表
  const fetchActions = useCallback(async (params: ActionQueryParams = {}, systemFilterValue?: string) => {
    setLoading(true);
    try {
      const queryParams: ActionQueryParams = {
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText,
        ...params
      };
      
      // 如果指定了租户ID，添加到查询参数
      if (tenantId) {
        queryParams.tenant_id = tenantId;
      }
      
      // 添加系统操作筛选条件
      const filterValue = systemFilterValue !== undefined ? systemFilterValue : systemFilter;
      if (filterValue === 'system') {
        queryParams.is_system = true;
      } else if (filterValue === 'custom') {
        queryParams.is_system = false;
      }
      
      const data = await getActions(queryParams);
      setActions(data.results);
      setPagination({
        ...pagination,
        current: data.current_page || pagination.current,
        pageSize: data.page_size || pagination.pageSize,
        total: data.total || 0
      });
    } catch (error: any) {
      message.error('获取操作列表失败: ' + (error.message || '未知错误'));
      console.error('获取操作列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, tenantId, systemFilter, message]);
  
  // 首次加载和参数变化时获取操作列表
  useEffect(() => {
    fetchActions();
  }, [fetchActions]);
  
  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchActions({ page: 1 });
  };
  
  // 处理系统操作筛选变化
  const handleSystemFilterChange = (value: string) => {
    setSystemFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchActions({ page: 1 }, value);
  };
  
  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
    fetchActions({ page: pagination.current });
  };
  
  // 显示创建操作表单
  const showCreateActionForm = () => {
    setEditingAction(null);
    setActionFormVisible(true);
  };
  
  // 显示编辑操作表单
  const showEditActionForm = (record: Action) => {
    setEditingAction(record);
    setActionFormVisible(true);
  };
  
  // 关闭操作表单
  const handleActionFormCancel = () => {
    setActionFormVisible(false);
    setEditingAction(null);
  };
  
  // 操作表单提交成功回调
  const handleActionFormSuccess = () => {
    setActionFormVisible(false);
    setEditingAction(null);
    fetchActions();
  };
  
  // 处理删除操作
  const handleDeleteAction = async (record: Action) => {
    // 系统操作不能被删除
    if (record.is_system) {
      message.warning('系统操作不能被删除');
      return;
    }
    
    try {
      await deleteAction(record.id);
      message.success('操作已删除');
      fetchActions();
    } catch (error: any) {
      message.error(`删除操作失败: ${error.message || '未知错误'}`);
      console.error('删除操作失败:', error);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '操作名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Action) => (
        <div className={css`display: flex; align-items: center;`}>
          <ToolOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>
            {text}
            {record.is_system && (
              <Tag color="purple" style={{ marginLeft: 8 }}>
                系统操作
              </Tag>
            )}
          </span>
        </div>
      )
    },
    {
      title: '操作代码',
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
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Action) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditActionForm(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此操作吗？"
            description="删除后无法恢复，且可能影响关联的权限配置。"
            onConfirm={() => handleDeleteAction(record)}
            okText="确定"
            cancelText="取消"
            // disabled={record.is_system}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              // disabled={record.is_system}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  return (
    <div className={css`padding: 0;`}>
      <div className={css`
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 8px;
      `}>
        <Space wrap>
          <Input
            placeholder="搜索操作名称或代码"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 220 }}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Select
            style={{ width: 120 }}
            value={systemFilter}
            onChange={handleSystemFilterChange}
            options={[
              { value: 'all', label: '全部操作' },
              { value: 'system', label: '系统操作' },
              { value: 'custom', label: '自定义操作' },
            ]}
            prefix={<FilterOutlined />}
          />
        </Space>
        <Space wrap>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showCreateActionForm}
          >
            新建操作
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchActions()}
          >
            刷新
          </Button>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={actions}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
      />
      
      {actionFormVisible && (
        <ActionFormModal
          visible={actionFormVisible}
          action={editingAction}
          tenantId={tenantId}
          onCancel={handleActionFormCancel}
          onSuccess={handleActionFormSuccess}
        />
      )}
    </div>
  );
};

export default ActionManagement; 