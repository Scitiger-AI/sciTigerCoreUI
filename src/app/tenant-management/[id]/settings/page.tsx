"use client";

import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useParams } from 'next/navigation';
import TenantSettingsPage from '@/components/tenant-management/TenantSettingsPage';

export default function TenantSettings() {
  const params = useParams();
  const tenantId = params.id as string;

  return (
    <MainLayout>
      <TenantSettingsPage tenantId={tenantId} />
    </MainLayout>
  );
} 