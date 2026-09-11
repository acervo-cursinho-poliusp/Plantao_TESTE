'use client';

import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Login from '../../components/Login';
import StudentDashboard from '../../components/StudentDashboard';

export default function AlunoPage() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;

  const { user } = ctx;

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  return <Login defaultTab="STUDENT" />;
}
