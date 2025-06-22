"use client";

import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Switch, 
  Divider, 
  Spin, 
  Tabs, 
  InputNumber, 
  Space, 
  Breadcrumb,
  Upload,
  App
} from 'antd';
import { 
  SaveOutlined, 
  ArrowLeftOutlined, 
  UploadOutlined, 
  GlobalOutlined,
  LockOutlined,
  BellOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { css } from '@emotion/css';
import { useRouter } from 'next/navigation';
import { getTenantDetail, updateTenant } from '@/services/tenant';
import { getTenantSettingsByTenant, updateTenantSettings } from '@/services/tenant';
import { Tenant, TenantSettings, UpdateTenantSettingsParams, UpdateTenantParams } from '@/types/tenant';
import Link from 'next/link';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { TabsProps } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TenantSettingsPageProps {
  tenantId: string;
}

const TenantSettingsPage: React.FC<TenantSettingsPageProps> = ({ tenantId }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loadingTenant, setLoadingTenant] = useState<boolean>(true);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [savingBasic, setSavingBasic] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('basic');
  
  const [basicForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [passwordPolicyForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  
  const router = useRouter();
  const { message } = App.useApp();

  // 获取租户详情和设置
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setLoadingTenant(true);
        const tenantData = await getTenantDetail(tenantId);
        setTenant(tenantData);
        
        // 如果有logo，设置文件列表
        if (tenantData.logo) {
          setFileList([
            {
              uid: '-1',
              name: 'logo.png',
              status: 'done',
              url: tenantData.logo,
            },
          ]);
        }
        
        // 设置基本信息表单初始值
        basicForm.setFieldsValue({
          name: tenantData.name,
          description: tenantData.description || '',
          is_active: tenantData.status === 'active',
          primary_color: tenantData.primary_color || '#1677ff',
          secondary_color: tenantData.secondary_color || '#52c41a',
        });
      } catch (error) {
        console.error('获取租户详情失败:', error);
        message.error('获取租户详情失败，请重试');
      } finally {
        setLoadingTenant(false);
      }
    };

    const fetchSettingsData = async () => {
      try {
        setLoadingSettings(true);
        const settingsData = await getTenantSettingsByTenant(tenantId);
        setSettings(settingsData);
        
        // 设置设置表单初始值
        settingsForm.setFieldsValue({
          timezone: settingsData.timezone,
          date_format: settingsData.date_format,
          time_format: settingsData.time_format,
          language: settingsData.language,
          theme: settingsData.theme,
          allow_registration: settingsData.allow_registration,
          require_email_verification: settingsData.require_email_verification,
          session_timeout_minutes: settingsData.session_timeout_minutes,
        });
        
        // 设置密码策略表单初始值
        if (settingsData.password_policy) {
          passwordPolicyForm.setFieldsValue({
            min_length: settingsData.password_policy.min_length,
            require_uppercase: settingsData.password_policy.require_uppercase,
            require_lowercase: settingsData.password_policy.require_lowercase,
            require_number: settingsData.password_policy.require_number,
            require_special_char: settingsData.password_policy.require_special_char,
            password_expiry_days: settingsData.password_policy.password_expiry_days,
          });
        }
        
        // 设置通知设置表单初始值
        if (settingsData.notification_settings) {
          notificationForm.setFieldsValue({
            email_notifications: settingsData.notification_settings.email_notifications,
            system_notifications: settingsData.notification_settings.system_notifications,
            marketing_emails: settingsData.notification_settings.marketing_emails,
          });
        }
      } catch (error) {
        console.error('获取租户设置失败:', error);
        message.error('获取租户设置失败，请重试');
      } finally {
        setLoadingSettings(false);
      }
    };

    if (tenantId) {
      fetchTenantData();
      fetchSettingsData();
    }
  }, [tenantId, basicForm, settingsForm, passwordPolicyForm, notificationForm, message]);

  // 处理基本信息保存
  const handleBasicSave = async () => {
    try {
      const values = await basicForm.validateFields();
      setSavingBasic(true);
      
      const updateData: UpdateTenantParams = {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
        primary_color: values.primary_color,
        secondary_color: values.secondary_color,
      };
      
      // 如果有上传的新logo，添加到表单数据
      if (fileList.length > 0 && fileList[0].originFileObj) {
        updateData.logo = fileList[0].originFileObj as File;
      }
      
      await updateTenant(tenantId, updateData);
      message.success('租户基本信息已更新');
    } catch (error) {
      console.error('更新租户基本信息失败:', error);
      message.error('更新租户基本信息失败，请重试');
    } finally {
      setSavingBasic(false);
    }
  };

  // 处理设置保存
  const handleSettingsSave = async () => {
    try {
      const generalValues = await settingsForm.validateFields();
      const passwordValues = await passwordPolicyForm.validateFields();
      const notificationValues = await notificationForm.validateFields();
      
      setSavingSettings(true);
      
      if (!settings) {
        message.error('租户设置数据不存在');
        return;
      }
      
      const updateData: UpdateTenantSettingsParams = {
        timezone: generalValues.timezone,
        date_format: generalValues.date_format,
        time_format: generalValues.time_format,
        language: generalValues.language,
        theme: generalValues.theme,
        allow_registration: generalValues.allow_registration,
        require_email_verification: generalValues.require_email_verification,
        session_timeout_minutes: generalValues.session_timeout_minutes,
        password_policy: {
          min_length: passwordValues.min_length,
          require_uppercase: passwordValues.require_uppercase,
          require_lowercase: passwordValues.require_lowercase,
          require_number: passwordValues.require_number,
          require_special_char: passwordValues.require_special_char,
          password_expiry_days: passwordValues.password_expiry_days,
        },
        notification_settings: {
          email_notifications: notificationValues.email_notifications,
          system_notifications: notificationValues.system_notifications,
          marketing_emails: notificationValues.marketing_emails,
        },
      };
      
      await updateTenantSettings(settings.id, updateData);
      message.success('租户设置已更新');
    } catch (error) {
      console.error('更新租户设置失败:', error);
      message.error('更新租户设置失败，请重试');
    } finally {
      setSavingSettings(false);
    }
  };

  // 处理返回
  const handleBack = () => {
    router.push(`/tenant-management/${tenantId}`);
  };

  // 上传前校验文件
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
      return false;
    }
    
    return false; // 阻止自动上传
  };

  // 处理文件变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // 标签页配置
  const tabItems: TabsProps['items'] = [
    {
      key: 'basic',
      label: (
        <span>
          <UserOutlined />
          基本信息
        </span>
      ),
      children: (
        <Card loading={loadingTenant}>
          <Form
            form={basicForm}
            layout="vertical"
            requiredMark
          >
            <Form.Item
              name="name"
              label="租户名称"
              rules={[{ required: true, message: '请输入租户名称' }]}
            >
              <Input placeholder="请输入租户名称" />
            </Form.Item>
            
            <Form.Item
              label="租户标识(slug)"
            >
              <Input value={tenant?.slug || tenant?.code} disabled />
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                租户标识创建后不可修改
              </div>
            </Form.Item>
            
            <Form.Item
              label="子域名"
            >
              <Input value={tenant?.subdomain} disabled />
              <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                子域名创建后不可修改
              </div>
            </Form.Item>
            
            <Form.Item
              name="description"
              label="租户描述"
            >
              <Input.TextArea rows={4} placeholder="请输入租户描述（可选）" />
            </Form.Item>
            
            <Form.Item
              name="is_active"
              label="租户状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="活跃" unCheckedChildren="未激活" />
            </Form.Item>
            
            <Form.Item
              name="primary_color"
              label="主色调"
            >
              <Input type="color" style={{ width: 100 }} />
            </Form.Item>
            
            <Form.Item
              name="secondary_color"
              label="辅助色调"
            >
              <Input type="color" style={{ width: 100 }} />
            </Form.Item>
            
            <Form.Item
              name="logo"
              label="租户Logo"
            >
              <Upload
                listType="picture"
                fileList={fileList}
                beforeUpload={beforeUpload}
                onChange={handleChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </Upload>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                onClick={handleBasicSave} 
                loading={savingBasic}
                icon={<SaveOutlined />}
              >
                保存基本信息
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'general',
      label: (
        <span>
          <ClockCircleOutlined />
          常规设置
        </span>
      ),
      children: (
        <Card loading={loadingSettings}>
          <Form
            form={settingsForm}
            layout="vertical"
            requiredMark
          >
            <Form.Item
              name="timezone"
              label="时区"
              rules={[{ required: true, message: '请选择时区' }]}
            >
              <Select
                showSearch
                placeholder="请选择时区"
                options={[
                  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
                  { value: 'America/New_York', label: '美国东部时间 (UTC-5/UTC-4)' },
                  { value: 'Europe/London', label: '英国标准时间 (UTC+0/UTC+1)' },
                  { value: 'Europe/Paris', label: '欧洲中部时间 (UTC+1/UTC+2)' },
                  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)' },
                ]}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            
            <Form.Item
              name="date_format"
              label="日期格式"
              rules={[{ required: true, message: '请选择日期格式' }]}
            >
              <Select>
                <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
                <Select.Option value="YYYY/MM/DD">YYYY/MM/DD</Select.Option>
                <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
                <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                <Select.Option value="YYYY年MM月DD日">YYYY年MM月DD日</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="time_format"
              label="时间格式"
              rules={[{ required: true, message: '请选择时间格式' }]}
            >
              <Select>
                <Select.Option value="HH:mm:ss">HH:mm:ss (24小时制)</Select.Option>
                <Select.Option value="HH:mm">HH:mm (24小时制)</Select.Option>
                <Select.Option value="hh:mm:ss a">hh:mm:ss a (12小时制)</Select.Option>
                <Select.Option value="hh:mm a">hh:mm a (12小时制)</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="language"
              label="默认语言"
              rules={[{ required: true, message: '请选择默认语言' }]}
            >
              <Select>
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="en-US">English (US)</Select.Option>
                <Select.Option value="ja-JP">日本語</Select.Option>
                <Select.Option value="ko-KR">한국어</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="theme"
              label="默认主题"
              rules={[{ required: true, message: '请选择默认主题' }]}
            >
              <Select>
                <Select.Option value="light">浅色</Select.Option>
                <Select.Option value="dark">深色</Select.Option>
                <Select.Option value="auto">跟随系统</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="session_timeout_minutes"
              label="会话超时时间（分钟）"
              rules={[{ required: true, message: '请输入会话超时时间' }]}
            >
              <InputNumber min={5} max={1440} />
            </Form.Item>
            
            <Form.Item
              name="allow_registration"
              label="允许用户注册"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="require_email_verification"
              label="要求邮箱验证"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined />
          密码策略
        </span>
      ),
      children: (
        <Card loading={loadingSettings}>
          <Form
            form={passwordPolicyForm}
            layout="vertical"
            requiredMark
          >
            <Form.Item
              name="min_length"
              label="密码最小长度"
              rules={[{ required: true, message: '请输入密码最小长度' }]}
            >
              <InputNumber min={6} max={32} />
            </Form.Item>
            
            <Form.Item
              name="require_uppercase"
              label="要求大写字母"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="require_lowercase"
              label="要求小写字母"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="require_number"
              label="要求数字"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="require_special_char"
              label="要求特殊字符"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="password_expiry_days"
              label="密码过期天数"
              rules={[{ required: true, message: '请输入密码过期天数' }]}
              tooltip="设置为0表示密码永不过期"
            >
              <InputNumber min={0} max={365} />
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'notification',
      label: (
        <span>
          <BellOutlined />
          通知设置
        </span>
      ),
      children: (
        <Card loading={loadingSettings}>
          <Form
            form={notificationForm}
            layout="vertical"
            requiredMark
          >
            <Form.Item
              name="email_notifications"
              label="启用邮件通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="system_notifications"
              label="启用系统通知"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item
              name="marketing_emails"
              label="接收营销邮件"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </Card>
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
            title: '租户设置',
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
            {tenant ? `${tenant.name} - 租户设置` : '租户设置'}
          </Title>
        </Space>
        
        <Button 
          type="primary" 
          onClick={handleSettingsSave} 
          loading={savingSettings}
          icon={<SaveOutlined />}
        >
          保存所有设置
        </Button>
      </div>

      {/* 设置标签页 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        type="card"
        items={tabItems}
      />
    </div>
  );
};

export default TenantSettingsPage; 