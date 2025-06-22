"use client";

import React from 'react';
import MainLayout from '@/layout/MainLayout';
import UserPermissionsContainer from '@/components/user-permissions/UserPermissionsContainer';
import { useSearchParams } from 'next/navigation';

const UserPermissionsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenant');
  const tab = searchParams.get('tab');
  
  return (
    <MainLayout>
      <UserPermissionsContainer tenantId={tenantId} />
    </MainLayout>
  );
};

export default UserPermissionsPage; 