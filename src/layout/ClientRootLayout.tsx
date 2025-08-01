"use client";

import '@ant-design/v5-patch-for-react-19';
import React from 'react';
import { ConfigProvider, App } from 'antd';
import { themeConfig } from '@/theme/themeConfig';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import ErrorHandler from '@/layout/common/ErrorHandler';
import LoadingScreen from '@/layout/common/LoadingScreen';

interface ClientRootLayoutProps {
  children: React.ReactNode;
}

const ClientRootLayout: React.FC<ClientRootLayoutProps> = ({ children }) => {
  return (
    <LoadingScreen>
      <ConfigProvider theme={themeConfig}>
        <App>
          <ErrorProvider>
            <ErrorHandler>
              <AuthProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
              </AuthProvider>
            </ErrorHandler>
          </ErrorProvider>
        </App>
      </ConfigProvider>
    </LoadingScreen>
  );
};

export default ClientRootLayout; 