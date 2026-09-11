'use client';

import { useContext, useEffect } from 'react';
import { AppContext } from '../../../context/AppContext';
import { useRouter } from 'next/navigation';
import TutorDashboard from '../../../components/TutorDashboard';

export default function TutorPage() {
  const ctx = useContext(AppContext);
  const router = useRouter();

  useEffect(() => {
    if (ctx && ctx.user?.role !== 'TUTOR') {
      router.push('/equipe');
    }
  }, [ctx, router]);

  if (!ctx || ctx.user?.role !== 'TUTOR') return null;

  return <TutorDashboard />;
}
