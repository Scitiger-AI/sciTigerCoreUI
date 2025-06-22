"use client";

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Upload, Button, message, Avatar, Spin } from 'antd';
import { UploadOutlined, UserOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { UserListItem, CreateUserParams, UpdateUserParams } from '@/types/user';
import { createUser, updateUserComplete, getUserDetail, updateUserInfo } from '@/services/user';
import { getRoles } from '@/services/role';
import { App } from 'antd';
import { Role } from '@/types/role';
import { css } from '@emotion/css';
import { getMediaUrl } from '@/utils/mediaUrl';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

interface UserFormModalProps {
  visible: boolean;
  user: UserListItem | null; // 如果是编辑，则传入用户信息
  tenantId?: string | null; // 租户ID
  onCancel: () => void;
  onSuccess: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  visible,
  user,
  tenantId,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [userDetail, setUserDetail] = useState<UserListItem | null>(null);
  const [userDetailLoading, setUserDetailLoading] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message: messageApi } = App.useApp();
  const isEdit = !!user;
  
  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      setRolesLoading(true);
      try {
        // 根据租户ID过滤角色
        const params = tenantId ? { tenant_id: tenantId } : {};
        const data = await getRoles(params);
        setRoles(data.results);
      } catch (error: any) {
        messageApi.error('获取角色列表失败: ' + (error.message || '未知错误'));
        console.error('获取角色列表失败:', error);
      } finally {
        setRolesLoading(false);
      }
    };
    
    if (visible) {
      fetchRoles();
    }
  }, [visible, tenantId, messageApi]);
  
  // 获取用户详情
  useEffect(() => {
    const fetchUserDetail = async () => {
      if (!user || !user.id) return;
      
      setUserDetailLoading(true);
      try {
        const detailData = await getUserDetail(user.id);
        setUserDetail(detailData);
        if (detailData.avatar) {
          setAvatarUrl(getMediaUrl(detailData.avatar));
          setFileList([{
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: getMediaUrl(detailData.avatar)
          }]);
        } else {
          setFileList([]);
        }
      } catch (error: any) {
        messageApi.error('获取用户详情失败: ' + (error.message || '未知错误'));
        console.error('获取用户详情失败:', error);
      } finally {
        setUserDetailLoading(false);
      }
    };
    
    if (visible && isEdit) {
      fetchUserDetail();
    }
  }, [visible, user, isEdit, messageApi]);
  
  // 表单字段初始化
  useEffect(() => {
    if (visible) {
      if (isEdit && userDetail) {
        // 使用获取到的用户详情填充表单
        form.setFieldsValue({
          username: userDetail.username,
          email: userDetail.email,
          first_name: userDetail.first_name,
          last_name: userDetail.last_name,
          phone: userDetail.phone || '',
          is_active: userDetail.is_active,
          bio: userDetail.bio || '',
          roles: userDetail.roles ? userDetail.roles.map(role => role.id) : []
        });
      } else if (isEdit && user && !userDetailLoading) {
        // 如果还未获取到详情，先用列表数据填充
        form.setFieldsValue({
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || '',
          is_active: user.is_active,
          bio: user.bio || '',
          roles: user.roles ? user.roles.map(role => role.id) : []
        });
        if (user.avatar) {
          setAvatarUrl(getMediaUrl(user.avatar));
          setFileList([{
            uid: '-1',
            name: 'avatar.png',
            status: 'done',
            url: getMediaUrl(user.avatar)
          }]);
        } else {
          setFileList([]);
        }
      } else if (!isEdit) {
        // 新建用户时重置表单
        form.resetFields();
        form.setFieldsValue({
          is_active: true
        });
        setAvatarUrl('');
        setAvatarFile(null);
        setFileList([]);
      }
    }
  }, [visible, user, userDetail, userDetailLoading, isEdit, form]);
  
  // 处理头像上传前的预览
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      messageApi.error('只能上传图片文件!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error('图片必须小于2MB!');
      return false;
    }
    
    // 预览图片
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
      setFileList([{
        uid: '-1',
        name: file.name,
        status: 'done',
        url: reader.result as string
      }]);
    };
    setAvatarFile(file);
    
    // 阻止自动上传
    return false;
  };
  
  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEdit && user) {
        // 编辑用户 - 使用FormData一次性提交所有数据
        const formData = new FormData();
        
        // 添加基本字段
        formData.append('username', values.username);
        formData.append('email', values.email);
        
        if (values.first_name) formData.append('first_name', values.first_name);
        if (values.last_name) formData.append('last_name', values.last_name);
        if (values.phone) formData.append('phone', values.phone);
        if (values.bio) formData.append('bio', values.bio);
        formData.append('is_active', values.is_active ? 'true' : 'false');
        
        // 添加角色
        if (values.roles && Array.isArray(values.roles)) {
          values.roles.forEach((roleId: string) => {
            formData.append('roles', roleId);
          });
        }
        
        // 添加租户ID
        if (tenantId) {
          formData.append('tenant_id', tenantId);
        }
        
        // 添加头像文件
        if (avatarFile) {
          formData.append('avatar', avatarFile);
        }
        
        // 一次性提交所有数据
        await updateUserComplete(user.id, formData);
        messageApi.success('用户更新成功');
      } else {
        // 创建用户 - 使用FormData一次性提交所有数据
        const formData = new FormData();
        
        // 添加基本字段
        formData.append('username', values.username);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('password_confirm', values.password_confirm);
        
        if (values.first_name) formData.append('first_name', values.first_name);
        if (values.last_name) formData.append('last_name', values.last_name);
        if (values.phone) formData.append('phone', values.phone);
        if (values.bio) formData.append('bio', values.bio);
        formData.append('is_active', values.is_active ? 'true' : 'false');
        
        // 添加角色
        if (values.roles && Array.isArray(values.roles)) {
          values.roles.forEach((roleId: string) => {
            formData.append('roles', roleId);
          });
        }
        
        // 添加租户ID
        if (tenantId) {
          formData.append('tenant_id', tenantId);
        }
        
        // 添加头像文件
        if (avatarFile) {
          formData.append('avatar', avatarFile);
        }
        
        // 一次性提交所有数据
        await createUser(formData);
        messageApi.success('用户创建成功');
      }
      
      onSuccess();
    } catch (error: any) {
      messageApi.error(
        isEdit 
          ? `更新用户失败: ${error.message || '未知错误'}` 
          : `创建用户失败: ${error.message || '未知错误'}`
      );
      console.error(isEdit ? '更新用户失败:' : '创建用户失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 上传按钮
  const uploadButton = (
    <div>
      {avatarLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传头像</div>
    </div>
  );
  
  return (
    <Modal
      title={isEdit ? '编辑用户' : '新建用户'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      maskClosable={true}
      width={600}
    >
      {userDetailLoading ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ marginTop: '8px', color: 'rgba(0, 0, 0, 0.45)' }}>加载用户详情...</div>
            </div>
          </Spin>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          requiredMark={true}
        >
          {/* 头像上传 */}
          <Form.Item
            name="avatar_upload"
            label="头像"
            className={css`
              .ant-upload-select {
                display: block;
                width: 100px;
                height: 100px;
                margin: 0 auto;
              }
            `}
          >
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={beforeUpload}
              fileList={fileList}
            >
              {avatarUrl ? (
                <Avatar 
                  src={avatarUrl} 
                  alt="头像" 
                  size={100}
                  icon={<UserOutlined />}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          
          {/* 用户名和邮箱在同一行 */}
          <div className={css`display: flex; gap: 16px;`}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
              className={css`flex: 1;`}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
              className={css`flex: 1;`}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>
          
          {/* 密码和确认密码在同一行（仅在创建用户时显示） */}
          {!isEdit && (
            <div className={css`display: flex; gap: 16px;`}>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
                hasFeedback
                className={css`flex: 1;`}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
              
              <Form.Item
                name="password_confirm"
                label="确认密码"
                dependencies={['password']}
                hasFeedback
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
                className={css`flex: 1;`}
              >
                <Input.Password placeholder="请确认密码" />
              </Form.Item>
            </div>
          )}
          
          {/* 名和姓在同一行 */}
          <div className={css`display: flex; gap: 16px;`}>
            <Form.Item
              name="first_name"
              label="名"
              className={css`flex: 1;`}
            >
              <Input placeholder="请输入名" />
            </Form.Item>
            
            <Form.Item
              name="last_name"
              label="姓"
              className={css`flex: 1;`}
            >
              <Input placeholder="请输入姓" />
            </Form.Item>
          </div>
          
          {/* 电话一行 */}
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          
          {/* 个人简介一行 */}
          <Form.Item
            name="bio"
            label="个人简介"
          >
            <Input.TextArea placeholder="请输入个人简介" rows={3} />
          </Form.Item>
          
          {/* 角色一行 */}
          <Form.Item
            name="roles"
            label="系统角色"
          >
            <Select
              mode="multiple"
              placeholder="请选择系统角色"
              loading={rolesLoading}
              allowClear
            >
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* 状态一行 */}
          <Form.Item
            name="is_active"
            label="状态"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UserFormModal; 