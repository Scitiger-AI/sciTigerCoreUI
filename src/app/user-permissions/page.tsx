import React, { Suspense } from 'react';
import MainLayout from '@/layout/MainLayout';

// 直接导入客户端组件
import UserPermissionsContainer from '@/components/user-permissions/UserPermissionsContainer';

// 加载状态组件
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '500px' 
  }}>
    <div>加载中...</div>
  </div>
);

// 将页面组件标记为异步
export default async function UserPermissionsPage({
  searchParams,
}: {
  searchParams: { tenant?: string; tab?: string };
}) {
  // 在 Next.js 15 中，searchParams 对象的属性需要使用 await 获取
  const { tenant } = await searchParams;
  const tenantId = tenant || null;
  
  return (
    <MainLayout>
      <Suspense fallback={<LoadingFallback />}>
        <UserPermissionsContainer tenantId={tenantId} />
      </Suspense>
    </MainLayout>
  );
} 