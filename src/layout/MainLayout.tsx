"use client";

import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Space, Divider } from 'antd';
import { css } from '@emotion/css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GithubOutlined, 
  MailOutlined,
  CopyrightOutlined,
  SafetyCertificateOutlined,
  WechatOutlined
} from '@ant-design/icons';
import Header from './Header';
import { Sidebar } from './Sidebar';

const { Content, Footer } = Layout;
const { Title, Text, Link: AntLink } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  fullWidth?: boolean;
  home?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  hideFooter = false,
  fullWidth = false,
  home = false
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname?.startsWith('/tenant-management') || home === true;

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout
      className={css`
        min-height: 100vh;
        background: #f0f2f5;
      `}
    >
      {!isHomePage && <Sidebar collapsed={collapsed} />}
      <Layout
        className={css`
          margin-left: ${isHomePage ? '0' : (collapsed ? '80px' : '200px')};
          transition: all 0.2s;
          min-height: 100vh;
          
          @media (max-width: 768px) {
            margin-left: 0;
          }
        `}
      >
        <Header collapsed={collapsed} toggleCollapsed={toggleCollapsed} />
        <Content
          className={css`
            margin: 24px 16px;
            padding: ${fullWidth ? '0' : '24px'};
            background: #fff;
            min-height: calc(100vh - 136px);
            border-radius: 6px;
            overflow: auto;
          `}
        >
          {children}
        </Content>
        
        {!hideFooter && (
          <Footer
            className={css`
              background: linear-gradient(to bottom, #ffffff, #f9fafb);
              padding: 16px 24px;
              text-align: center;
              border-top: 1px solid #f0f0f0;
              box-shadow: 0 -1px 8px rgba(0, 0, 0, 0.03);
            `}
          >
            <div
              className={css`
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                
                @media (max-width: 768px) {
                  flex-direction: column;
                  gap: 20px;
                }
              `}
            >
              {/* 左侧 - 版权和备案信息 */}
              <div className={css`
                text-align: center;
                padding-right: 20px;
                
                @media (min-width: 768px) {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  border-right: 1px solid #f0f0f0;
                }
              `}>
                <Space direction="vertical" size={8}>
                  <Text type="secondary" className={css`
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                  `}>
                    <CopyrightOutlined /> Copyright © 2025-{new Date().getFullYear()} 科虎智能信息有限公司 版权所有
                  </Text>
                  
                  <Text type="secondary" className={css`
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                  `}>
                    <SafetyCertificateOutlined /> 备案号：粤ICP备XXXXXXXXXXXX号-1
                  </Text>
                </Space>
              </div>
              
              {/* 右侧 - 资源链接和社交媒体 */}
              <div className={css`
                text-align: center;
                padding-left: 20px;
                
                @media (min-width: 768px) {
                  flex: 1;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                }
              `}>
                <Space direction="vertical" size={12} className={css`width: 100%;`}>
                  {/* 资源链接 */}
                  <Space size={16} wrap className={css`
                    display: flex;
                    justify-content: center;
                  `}>
                    <Link href="#" className={css`
                      color: rgba(0, 0, 0, 0.65);
                      transition: all 0.3s;
                      font-size: 14px;
                      &:hover {
                        color: #1677ff;
                      }
                    `}>API平台</Link>
                    <Link href="#" className={css`
                      color: rgba(0, 0, 0, 0.65);
                      transition: all 0.3s;
                      font-size: 14px;
                      &:hover {
                        color: #1677ff;
                      }
                    `}>会员中心</Link>
                    {/* <Link href="/terms" className={css`
                      color: rgba(0, 0, 0, 0.65);
                      transition: all 0.3s;
                      font-size: 14px;
                      &:hover {
                        color: #1677ff;
                      }
                    `}>服务条款</Link>
                    <Link href="/privacy" className={css`
                      color: rgba(0, 0, 0, 0.65);
                      transition: all 0.3s;
                      font-size: 14px;
                      &:hover {
                        color: #1677ff;
                      }
                    `}>隐私政策</Link> */}
                  </Space>
                  
                  {/* 社交媒体图标 */}
                  <Space size={12} className={css`
                    display: flex;
                    justify-content: center;
                  `}>
                    <AntLink href="https://github.com" target="_blank" title="GitHub">
                      <div className={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: rgba(0, 0, 0, 0.03);
                        transition: all 0.3s;
                        
                        &:hover {
                          background: #24292e;
                          transform: translateY(-2px);
                        }
                      `}>
                        <GithubOutlined style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.65)' }} />
                      </div>
                    </AntLink>
                    <AntLink href="mailto:contact@example.com" title="联系我们">
                      <div className={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: rgba(0, 0, 0, 0.03);
                        transition: all 0.3s;
                        
                        &:hover {
                          background: #1677ff;
                          transform: translateY(-2px);
                        }
                      `}>
                        <MailOutlined style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.65)' }} />
                      </div>
                    </AntLink>
                    <AntLink href="#" title="微信公众号">
                      <div className={css`
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 28px;
                        height: 28px;
                        border-radius: 50%;
                        background: rgba(0, 0, 0, 0.03);
                        transition: all 0.3s;
                        
                        &:hover {
                          background: #07c160;
                          transform: translateY(-2px);
                        }
                      `}>
                        <WechatOutlined style={{ fontSize: 16, color: 'rgba(0, 0, 0, 0.65)' }} />
                      </div>
                    </AntLink>
                  </Space>
                </Space>
              </div>
            </div>
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

export default MainLayout; 