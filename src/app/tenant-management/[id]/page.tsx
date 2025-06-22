"use client";

import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useParams } from 'next/navigation';
import TenantDetailPage from '@/components/tenant-management/TenantDetailPage';

export default function TenantDetail() {
  const params = useParams();
  const tenantId = params.id as string;

  return (
    <MainLayout>
      <TenantDetailPage tenantId={tenantId} />
    </MainLayout>
  );
} 