"use client";

import React, { useState, useEffect } from 'react';
import { Modal, Transfer, Spin, Button, Empty, Input } from 'antd';
import type { TransferDirection } from 'antd/es/transfer';
import { getRoleDetail, assignPermissionsToRole, removePermissionsFromRole } from '@/services/role';
import { getPermissions } from '@/services/permission';
import { Permission } from '@/types/role';
import { App } from 'antd';
import { css } from '@emotion/css';
import { SearchOutlined, SafetyOutlined } from '@ant-design/icons';

interface RolePermissionsModalProps {
  visible: boolean;
  roleId: string;
  roleName: string;
  tenantId?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

interface PermissionItem extends Permission {
  key: string;
  title: string;
  description: string;
}

const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  visible,
  roleId,
  roleName,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [targetKeys, setTargetKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const { message: messageApi } = App.useApp();

  // 加载角色详情和所有权限
  useEffect(() => {
    const loadData = async () => {
      if (!visible || !roleId) return;
      
      setLoading(true);
      try {
        // 获取角色详情
        const roleDetail = await getRoleDetail(roleId);
        
        // 准备查询参数
        const queryParams: any = { page_size: 1000 };
        
        // 如果有租户ID，添加到查询参数
        if (tenantId) {
          queryParams.tenant_id = tenantId;
        }
        
        // 获取所有权限
        const allPermissionsData = await getPermissions(queryParams);
        
        // 转换权限数据为Transfer需要的格式
        const permissionItems: PermissionItem[] = allPermissionsData.results.map((permission: Permission) => ({
          ...permission,
          key: permission.id,
          title: permission.name,
          description: permission.code
        }));
        
        setAllPermissions(permissionItems);
        
        // 设置已分配的权限
        const assignedPermissionIds = roleDetail.permissions.map(p => p.id);
        setTargetKeys(assignedPermissionIds);
      } catch (error: any) {
        messageApi.error('加载数据失败: ' + (error.message || '未知错误'));
        console.error('加载权限数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [visible, roleId, tenantId, messageApi]);

  // 处理权限变更
  const handleChange = (nextTargetKeys: React.Key[], direction: TransferDirection, moveKeys: React.Key[]) => {
    setTargetKeys(nextTargetKeys);
  };

  // 处理选择变更
  const handleSelectChange = (sourceSelectedKeys: React.Key[], targetSelectedKeys: React.Key[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  // 处理搜索
  const handleSearch = (dir: 'left' | 'right', value: string) => {
    setSearchText(value);
  };

  // 处理保存
  const handleSave = async () => {
    setSubmitting(true);
    try {
      // 获取原有的权限
      const roleDetail = await getRoleDetail(roleId);
      const originalPermissionIds = roleDetail.permissions.map(p => p.id);
      
      // 计算需要添加和删除的权限
      const permissionsToAdd = targetKeys.filter(id => !originalPermissionIds.includes(id as string));
      const permissionsToRemove = originalPermissionIds.filter(id => !targetKeys.includes(id));
      
      // 添加权限
      if (permissionsToAdd.length > 0) {
        await assignPermissionsToRole(roleId, { permission_ids: permissionsToAdd as string[] });
      }
      
      // 移除权限
      if (permissionsToRemove.length > 0) {
        await removePermissionsFromRole(roleId, { permission_ids: permissionsToRemove });
      }
      
      messageApi.success('权限更新成功');
      onSuccess();
    } catch (error: any) {
      messageApi.error(`操作失败: ${error.message || '未知错误'}`);
      console.error('保存权限失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 渲染Transfer项
  const renderItem = (item: PermissionItem) => {
    const customLabel = (
      <div className={css`
        display: flex;
        flex-direction: column;
      `}>
        <span>{item.title}</span>
        <span className={css`
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);
        `}>
          {item.code}
        </span>
      </div>
    );
    
    return {
      label: customLabel,
      value: item.id,
    };
  };

  // 过滤选项
  const filterOption = (inputValue: string, item: PermissionItem) => {
    return item.name.indexOf(inputValue) > -1 || 
           item.code.indexOf(inputValue) > -1 ||
           item.service.indexOf(inputValue) > -1 ||
           item.resource.indexOf(inputValue) > -1 ||
           item.action.indexOf(inputValue) > -1;
  };

  return (
    <Modal
      title={`管理角色权限 - ${roleName}`}
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={submitting}
          onClick={handleSave}
        >
          保存
        </Button>
      ]}
      maskClosable={true}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {/* <div className={css`margin-bottom: 16px;`}>
          <Input
            placeholder="搜索权限名称或代码"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
        </div> */}
        
        {allPermissions.length > 0 ? (
          <Transfer<PermissionItem>
            dataSource={allPermissions}
            titles={['可用权限', '已分配权限']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            onSearch={handleSearch}
            render={item => item.name}
            filterOption={filterOption}
            showSearch
            listStyle={{
              width: 350,
              height: 400,
            }}
            operations={['添加', '移除']}
            oneWay={false}
            pagination={{
              pageSize: 10,
            }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无权限数据"
          />
        )}
      </Spin>
    </Modal>
  );
};

export default RolePermissionsModal; 