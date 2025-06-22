"use client";

import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useParams } from 'next/navigation';
import TenantUsersPage from '@/components/tenant-management/TenantUsersPage';

export default function TenantUsers() {
  const params = useParams();
  const tenantId = params.id as string;

  return (
    <MainLayout>
      <TenantUsersPage tenantId={tenantId} />
    </MainLayout>
  );
} 