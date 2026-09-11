'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import Login from '../../components/Login';

export default function EquipePage() {
  const ctx = useContext(AppContext);
  const router = useRouter();
  
  useEffect(() => {
    if (ctx?.user?.role === 'ADMIN') {
      router.push('/painel/admin');
    } else if (ctx?.user?.role === 'TUTOR') {
      router.push('/painel/tutor');
    }
  }, [ctx?.user, router]);

  if (!ctx) return null;
  if (ctx.user?.role === 'ADMIN' || ctx.user?.role === 'TUTOR') return null; // wait for redirect

  return <Login defaultTab="TUTOR" />;
}
