"use client";

import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useParams } from 'next/navigation';
import TenantDashboardPage from '@/components/tenant-management/TenantDashboardPage';

export default function TenantDashboard() {
  const params = useParams();
  const tenantId = params.id as string;

  return (
    <MainLayout>
      <TenantDashboardPage tenantId={tenantId} />
    </MainLayout>
  );
} 