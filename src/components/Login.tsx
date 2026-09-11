'use client';

import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import Link from 'next/link';

export default function Login({ defaultTab = 'STUDENT' }: { defaultTab?: 'STUDENT' | 'ADMIN' | 'TUTOR' }) {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { loginStudent, loginAdmin, loginTutor, tutors } = ctx;

  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [tutorPassword, setTutorPassword] = useState('');
  const [error, setError] = useState('');

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim() === '') {
      setError('Por favor, insira seu nome.');
      return;
    }
    if (studentPassword === 'Aluno2026&!') {
      loginStudent(studentName.trim());
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Coord2026&!') {
      loginAdmin();
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) {
      setError('Por favor, selecione seu nome.');
      return;
    }
    if (tutorPassword === 'Plantonista2026&!') {
      loginTutor(tutorId);
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center" style={{ color: 'var(--primary-color)' }}>Plantão de Dúvidas</h2>

        {error && tab === 'STUDENT' && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

        {tab === 'STUDENT' ? (
          <>
            <form onSubmit={handleStudentSubmit}>
              <div className="input-group">
                <label className="input-label">Seu Nome</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: João Silva" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">Senha de Acesso</label>
                <input 
                  type="password" 
                  className="input-field" 
                  placeholder="Digite a senha" 
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Entrar como Aluno</button>
            </form>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === 'TUTOR' ? '2px solid var(--primary-color)' : '2px solid transparent', fontWeight: tab === 'TUTOR' ? '600' : '400' }}
                onClick={() => { setTab('TUTOR'); setError(''); }}
              >
                Plantonista
              </button>
              <button 
                type="button"
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === 'ADMIN' ? '2px solid var(--primary-color)' : '2px solid transparent', fontWeight: tab === 'ADMIN' ? '600' : '400' }}
                onClick={() => { setTab('ADMIN'); setError(''); }}
              >
                Coordenação
              </button>
            </div>

            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

            {tab === 'TUTOR' && (
              <form onSubmit={handleTutorSubmit}>
                <div className="input-group">
                  <label className="input-label">Selecione seu Nome</label>
                  <select className="input-field" value={tutorId} onChange={e => setTutorId(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {tutors.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Senha de Acesso</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Digite a senha" 
                    value={tutorPassword}
                    onChange={(e) => setTutorPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Entrar na Área do Plantonista</button>
              </form>
            )}

            {tab === 'ADMIN' && (
              <form onSubmit={handleAdminSubmit}>
                <div className="input-group">
                  <label className="input-label">Senha da Coordenação</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="Digite a senha" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Acessar Gestão</button>
              </form>
            )}

            <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
              <Link 
                href="/aluno"
                onClick={() => setError('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                &larr; Voltar para Login de Aluno
              </Link>
            </div>
          </>
        )}
      </div>

      {tab === 'STUDENT' && (
        <Link 
          href="/equipe"
          onClick={() => setError('')}
          style={{ position: 'fixed', bottom: '1rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Área da equipe
        </Link>
      )}
    </div>
  );
}
