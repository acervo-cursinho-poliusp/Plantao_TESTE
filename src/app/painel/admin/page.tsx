'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../../components/AdminDashboard';

export default function AdminPage() {
  const ctx = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (ctx && ctx.user?.role !== 'ADMIN') {
      router.push('/equipe');
    }
  }, [ctx, router]);

  if (!ctx || ctx.user?.role !== 'ADMIN') return null;

  return <AdminDashboard />;
}
