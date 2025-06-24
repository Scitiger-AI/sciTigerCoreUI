"use client";

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, App, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, HomeOutlined, SafetyOutlined, LoginOutlined } from '@ant-design/icons';
import { css, keyframes } from '@emotion/css';
import { useAuth } from '@/contexts/AuthContext';
import { useError } from '@/contexts/ErrorContext';
import { LoginParams } from '@/types/user';
import Link from 'next/link';
import { ErrorInfo, handleApiError } from '@/utils/errorHandler';
import { useRouter } from 'next/navigation';

const { Text, Paragraph } = Typography;

// 定义动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(22, 119, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(22, 119, 255, 0);
  }
`;

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { clearError } = useError();
  const { message } = App.useApp();
  const router = useRouter();
  const [form] = Form.useForm();
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showInactiveAccount, setShowInactiveAccount] = useState(false);
  const [inactiveUsername, setInactiveUsername] = useState<string>('');
  const [resendingActivation, setResendingActivation] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // 添加输入框焦点效果
  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (values: LoginParams) => {
    clearError();
    setLocalError(null);
    setShowInactiveAccount(false);
    setInactiveUsername('');
    
    try {
      await login(values);
    } catch (err: any) {
      // 直接使用handleApiError处理错误
      const errorInfo = handleApiError(err);
      
      // 特殊情况处理：账号未激活
      if (errorInfo.isInactive) {
        setShowInactiveAccount(true);
        setLocalError(errorInfo.message);
        setInactiveUsername(values.username); // 保存未激活的用户名，用于重新发送激活邮件
      } else {
        setLocalError(errorInfo.message);
      }
    }
  };

 
  
  // 返回首页
  const handleBackToHome = () => {
    router.push('/');
  };

  // 设置自动聚焦用户名输入框
  useEffect(() => {
    setTimeout(() => {
      form.getFieldInstance('username')?.focus();
    }, 100);
  }, [form]);

  return (
    <Form
      form={form}
      name="login"
      initialValues={{ username: '', password: '', remember: true }}
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      className={css`
        animation: ${fadeIn} 0.6s ease-out;
      `}
    >
      {localError && (
        <Form.Item>
          <Alert 
            message={localError} 
            type="error" 
            showIcon 
            action={
              showInactiveAccount && (
                <Button 
                  size="small" 
                  type="primary"
                  loading={resendingActivation}
                  className={css`
                    background: #ff4d4f;
                    border-color: #ff4d4f;
                    box-shadow: 0 2px 0 rgba(255, 77, 79, 0.1);
                    &:hover {
                      background: #ff7875;
                      border-color: #ff7875;
                    }
                  `}
                >
                  重新发送激活邮件
                </Button>
              )
            }
            className={css`
              border-radius: 8px;
              margin-bottom: 24px;
              border: none;
              background: rgba(255, 77, 79, 0.08);
              box-shadow: 0 2px 8px rgba(255, 77, 79, 0.08);
              
              .ant-alert-message {
                font-weight: 500;
              }
              
              .ant-alert-icon {
                color: #ff4d4f;
              }
            `}
          />
        </Form.Item>
      )}
      
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input
          prefix={
            <UserOutlined 
              className={css`
                color: ${focusedField === 'username' ? '#1677ff' : 'rgba(0, 0, 0, 0.25)'};
                transition: color 0.3s;
              `} 
            />
          }
          placeholder="邮箱"
          autoComplete="username"
          onFocus={() => handleFocus('username')}
          onBlur={handleBlur}
          className={css`
            height: 50px;
            border-radius: 10px;
            transition: all 0.3s;
            border-width: 1.5px;
            box-shadow: ${focusedField === 'username' 
              ? '0 0 0 2px rgba(22, 119, 255, 0.1)' 
              : '0 2px 5px rgba(0, 0, 0, 0.05)'};
            
            &:hover {
              border-color: #4096ff;
            }
            
            &:focus {
              border-color: #1677ff;
              box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
            }
          `}
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          prefix={
            <LockOutlined 
              className={css`
                color: ${focusedField === 'password' ? '#1677ff' : 'rgba(0, 0, 0, 0.25)'};
                transition: color 0.3s;
              `} 
            />
          }
          placeholder="密码"
          autoComplete="current-password"
          onFocus={() => handleFocus('password')}
          onBlur={handleBlur}
          className={css`
            height: 50px;
            border-radius: 10px;
            transition: all 0.3s;
            border-width: 1.5px;
            box-shadow: ${focusedField === 'password' 
              ? '0 0 0 2px rgba(22, 119, 255, 0.1)' 
              : '0 2px 5px rgba(0, 0, 0, 0.05)'};
            
            &:hover {
              border-color: #4096ff;
            }
            
            &:focus {
              border-color: #1677ff;
              box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
            }
            
            .ant-input-password-icon {
              color: ${focusedField === 'password' ? '#1677ff' : 'rgba(0, 0, 0, 0.45)'};
            }
          `}
        />
      </Form.Item>
      
      <Form.Item>
        <div
          className={css`
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          `}
        >
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={css`
              .ant-checkbox-checked .ant-checkbox-inner {
                background-color: #1677ff;
                border-color: #1677ff;
              }
              
              .ant-checkbox-wrapper:hover .ant-checkbox-inner, 
              .ant-checkbox:hover .ant-checkbox-inner {
                border-color: #1677ff;
              }
            `}
          >
            <Text 
              className={css`
                color: rgba(0, 0, 0, 0.65);
                user-select: none;
              `}
            >
              记住我
            </Text>
          </Checkbox>
          {/* <Link
            href="/forgot-password"
            className={css`
              color: #1677ff;
              font-size: 14px;
              transition: all 0.3s;
              position: relative;
              
              &:hover {
                color: #4096ff;
                text-decoration: none;
              }
              
              &:after {
                content: '';
                position: absolute;
                width: 100%;
                height: 1px;
                bottom: -2px;
                left: 0;
                background-color: #4096ff;
                transform: scaleX(0);
                transform-origin: bottom right;
                transition: transform 0.3s;
              }
              
              &:hover:after {
                transform: scaleX(1);
                transform-origin: bottom left;
              }
            `}
          >
            忘记密码?
          </Link> */}
        </div>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          icon={<LoginOutlined />}
          className={css`
            width: 100%;
            height: 50px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: 1px;
            background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
            border: none;
            box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
            transition: all 0.3s;
            animation: ${pulse} 2s infinite;
            
            &:hover {
              transform: translateY(-2px);
              background: linear-gradient(135deg, #4096ff 0%, #1677ff 100%);
              box-shadow: 0 6px 16px rgba(22, 119, 255, 0.4);
            }
            
            &:active {
              transform: translateY(0);
              box-shadow: 0 2px 8px rgba(22, 119, 255, 0.25);
            }
            
            .ant-btn-loading-icon {
              color: white;
            }
          `}
        >
          登录
        </Button>
      </Form.Item>

      {/* <Divider 
        className={css`
          margin: 24px 0;
          &:before, &:after {
            border-top: 1px solid rgba(5, 5, 5, 0.06);
          }
        `}
      >
        <Text type="secondary" className={css`font-size: 14px;`}>或者</Text>
      </Divider> */}

      {/* <Space
        className={css`
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 16px;
        `}
      >
        <Button 
          icon={<HomeOutlined />} 
          onClick={handleBackToHome}
          className={css`
            height: 44px;
            display: flex;
            align-items: center;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            padding: 0 16px;
            transition: all 0.3s;
            box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
            
            &:hover {
              color: #1677ff;
              border-color: #1677ff;
              background: rgba(22, 119, 255, 0.02);
              transform: translateY(-2px);
            }
            
            .anticon {
              font-size: 16px;
              margin-right: 8px;
            }
          `}
        >
          返回首页
        </Button>
        <Link href="/register">
          <Button
            icon={<SafetyOutlined />}
            className={css`
              height: 44px;
              display: flex;
              align-items: center;
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              padding: 0 16px;
              transition: all 0.3s;
              box-shadow: 0 2px 0 rgba(0, 0, 0, 0.02);
              
              &:hover {
                color: #1677ff;
                border-color: #1677ff;
                background: rgba(22, 119, 255, 0.02);
                transform: translateY(-2px);
              }
              
              .anticon {
                font-size: 16px;
                margin-right: 8px;
              }
            `}
          >
            立即注册
          </Button>
        </Link>
      </Space> */}
      
      {/* <div className={css`
        text-align: center;
        margin-top: 24px;
      `}>
        <Text type="secondary" className={css`
          font-size: 13px;
          color: rgba(0, 0, 0, 0.45);
        `}>
          登录即表示您同意我们的 <Link href="/terms" className={css`color: #1677ff;`}>服务条款</Link> 和 <Link href="/privacy" className={css`color: #1677ff;`}>隐私政策</Link>
        </Text>
      </div> */}
    </Form>
  );
}; 