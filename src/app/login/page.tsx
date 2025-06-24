"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, Typography, Alert, Spin } from 'antd';
import { css } from '@emotion/css';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '@/contexts/AuthContext';

const { Title, Text } = Typography;

// 定义标题动画过渡效果
const titleAnimation = css`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes glowPulse {
    0% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
    50% {
      text-shadow: 0 0 20px rgba(22, 119, 255, 0.3), 0 0 30px rgba(22, 119, 255, 0.2);
    }
    100% {
      text-shadow: 0 0 5px rgba(22, 119, 255, 0.1), 0 0 10px rgba(22, 119, 255, 0.1);
    }
  }
`;

// 创建一个包含 useSearchParams 的组件
function LoginContent() {
  const searchParams = useSearchParams();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [redirectDisplay, setRedirectDisplay] = useState<string>('');
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const from = searchParams.get('from');
    if (from) {
      setRedirectPath(from);
      
      // 提取友好的显示文本
      if (from.startsWith('/agent/')) {
        setRedirectDisplay('Agent详情');
      } else if (from.startsWith('/user-center')) {
        setRedirectDisplay('个人中心');
      } else if (from.startsWith('/workflow/')) {
        setRedirectDisplay('工作流');
      } else {
        // 将路径格式化为更友好的显示
        setRedirectDisplay(from.replace(/^\//, '').replace(/-/g, ' '));
      }
    }
  }, [searchParams]);

  // 如果用户已登录，重定向到首页
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const redirectTo = redirectPath || '/';
      router.push(redirectTo);
    }
  }, [isLoggedIn, isLoading, redirectPath, router]);

  // 如果正在加载或已登录，显示加载中
  if (isLoading || isLoggedIn) {
    return (
      <div className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>正在加载...</div>
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        width: 100%;
        position: relative;
        background-image: url('/loginback.jpg');
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        
        &:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.05);
        }
      `}
    >      
      <Card
        className={css`
          width: 440px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: none;
          position: relative;
          z-index: 1;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          padding: 24px 32px;
          transition: all 0.3s ease;
          margin: 20px;
          margin-top: 100px;

          &:hover {
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
            transform: translateY(-5px);
          }

          @media (max-width: 576px) {
            width: 90%;
            padding: 20px;
          }
        `}
      >
        {/* 新设计的科虎多租户应用基础服务管理平台标题区域 */}
        <div
          className={css`
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 36px;
            ${titleAnimation}
          `}
        >
          {/* 平台图标 */}
          <div className={css`
            display: flex;
            justify-content: center;
            align-items: center;
            width: 80px;
            height: 80px;
            // border-radius: 20px;
            // background: linear-gradient(135deg, #1677ff 0%, #06f 50%, #0051cc 100%);
            // margin-bottom: 16px;
            // box-shadow: 0 10px 20px rgba(22, 119, 255, 0.3);
            // animation: fadeInUp 0.8s ease-out forwards;
          `}>
            <Image 
              src="/logo.png" 
              alt="科虎智能信息Logo" 
              width={80} 
              height={80} 
              style={{ objectFit: 'contain' }}
            />
          </div>
          
          {/* 平台主标题 */}
          <div className={css`
            text-align: center;
            animation: fadeInUp 0.8s ease-out 0.1s forwards;
            opacity: 0;
          `}>
            <Title
              level={2}
              className={css`
                margin: 0;
                background: linear-gradient(to right, #1677ff, #06f);
                -webkit-background-clip: text;
                background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
                letter-spacing: 1px;
                animation: glowPulse 3s infinite;
              `}
            >
              科虎多租户应用基础服务管理平台
            </Title>
          </div>
          
          {/* 平台副标题 */}
          <div className={css`
            width: 60px;
            height: 2px;
            background: linear-gradient(to right, #1677ff, #06f);
            margin: 16px 0;
            animation: fadeInUp 0.8s ease-out 0.2s forwards;
            opacity: 0;
          `}></div>
          
          <div className={css`
            text-align: center;
            animation: fadeInUp 0.8s ease-out 0.3s forwards;
            opacity: 0;
          `}>
            <Text
              className={css`
                font-size: 14px;
                color: rgba(0, 0, 0, 0.45);
              `}
            >
              科虎自研、不提供注册、仅支持管理员登录
            </Text>
          </div>
        </div>

        {/* 显示需登录访问的提示信息 */}
        {redirectPath && redirectPath !== '/' && (
          <Alert
            message={`登录后将跳转到：${redirectDisplay}`}
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <LoginForm />
      </Card>
    </div>
  );
}

// 包装 Suspense 的主页面组件
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={css`
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      `}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            <div style={{ marginTop: '20px', color: 'rgba(0, 0, 0, 0.45)' }}>正在加载登录页面...</div>
          </div>
        </Spin>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
} 