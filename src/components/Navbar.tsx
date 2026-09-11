'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '../context/AppContext';

export default function Navbar() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { user, logout } = ctx;

  return (
    <nav className="navbar" style={{ position: 'relative' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: '60px', width: '100%' }}>
        
        <h1 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', margin: 0, whiteSpace: 'nowrap' }}>
          Plantão de Dúvidas
        </h1>
        
        <div style={{ zIndex: 10 }}>
          {user && (
            <button onClick={logout} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer' }}>Sair</button>
          )}
        </div>
      </div>
    </nav>
  );
}
