'use client';

import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

export default function TutorDashboard() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { user, slots, tutors, currentWeekStart, prevWeek, nextWeek, updateTutor } = ctx;
  
  const tutorId = user?.tutorId;
  const tutor = tutors.find(t => t.id === tutorId);
  
  const [isEditingLink, setIsEditingLink] = React.useState(false);
  const [newMeetLink, setNewMeetLink] = React.useState(tutor?.meetLink || '');
  const [isSaving, setIsSaving] = React.useState(false);
  const [linkError, setLinkError] = React.useState('');

  // Sync state if tutor data loads after mount
  React.useEffect(() => {
    if (tutor && !isEditingLink) {
      setNewMeetLink(tutor.meetLink);
      setLinkError('');
    }
  }, [tutor, isEditingLink]);

  const handleUpdateLink = async () => {
    if (newMeetLink && !/^https?:\/\//i.test(newMeetLink)) {
      setLinkError('Por favor, insira um link válido começando com http:// ou https://');
      return;
    }
    
    if (!tutorId) return;
    
    setLinkError('');
    setIsSaving(true);
    await updateTutor(tutorId, newMeetLink);
    setIsSaving(false);
    setIsEditingLink(false);
  };

  // Date logic
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const fridayDate = new Date(currentWeekStart);
  fridayDate.setHours(12, 0, 0, 0);
  fridayDate.setDate(fridayDate.getDate() + 4);

  const getDateForDayIndex = (dayIndex: number) => {
    const d = new Date(currentWeekStart);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + (dayIndex - 1));
    return d;
  };

  const getDateStringForDayIndex = (dayIndex: number) => {
    const d = getDateForDayIndex(dayIndex);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter slots for this specific tutor and sort them by day then hour
  const mySlots = slots
    .filter(s => s.tutorId === tutorId)
    .sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.hour - b.hour;
    });

  return (
    <div className="container">
      <h2>Bem-vindo(a), {tutor?.name}</h2>
      
      <div className="card mb-4" style={{ background: '#f8fafc' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-main)' }}>Link da Sala (Google Meet / Zoom)</h3>
        {isEditingLink ? (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="url" 
                className="input" 
                style={{ flex: 1, minWidth: '250px', borderColor: linkError ? 'var(--danger-color)' : '' }}
                value={newMeetLink} 
                onChange={(e) => { setNewMeetLink(e.target.value); setLinkError(''); }}
                placeholder="https://meet.google.com/..."
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary" onClick={handleUpdateLink} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
                <button className="btn btn-outline" onClick={() => { setIsEditingLink(false); setNewMeetLink(tutor?.meetLink || ''); setLinkError(''); }}>
                  Cancelar
                </button>
              </div>
            </div>
            {linkError && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>{linkError}</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {tutor?.meetLink ? (
              <a href={tutor.meetLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 600, wordBreak: 'break-all', fontSize: '1.05rem', textDecoration: 'underline' }}>
                {tutor.meetLink}
              </a>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Nenhum link configurado</span>
            )}
            <button 
              onClick={() => setIsEditingLink(true)} 
              style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              title="Editar Link"
            >
              ✏️ Editar
            </button>
          </div>
        )}
      </div>

      <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
        Abaixo estão os seus horários de plantão e as reservas feitas pelos alunos para esta semana.
      </p>

      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '1rem', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <button className="btn btn-outline" onClick={prevWeek} style={{ padding: '0.5rem 1rem' }}>&larr; Semana Anterior</button>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Semana {formatDate(currentWeekStart)} - {formatDate(fridayDate)}
        </span>
        <button className="btn btn-outline" onClick={nextWeek} style={{ padding: '0.5rem 1rem' }}>Próxima Semana &rarr;</button>
      </div>

      {mySlots.length === 0 ? (
        <div className="card text-center" style={{ padding: '3rem' }}>
          <h3>Nenhum horário atribuído</h3>
          <p style={{ color: 'var(--text-muted)' }}>Você não possui horários na grade no momento.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {mySlots.map(slot => {
            const dayName = DAYS[slot.day - 1];
            const dateString = getDateStringForDayIndex(slot.day);
            const todaysBookings = slot.bookings?.[dateString] || {};
            
            // Calculate how many fractions are booked
            const bookedCount = Object.values(todaysBookings).filter(v => v !== null).length;
            
            return (
              <div key={slot.id} className="card" style={{ borderTop: bookedCount > 0 ? '4px solid var(--danger-color)' : '4px solid var(--success-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{dayName}</h3>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{slot.hour}:00</span>
                </div>
                
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {formatDate(getDateForDayIndex(slot.day))}
                </div>
                
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600, color: bookedCount > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                  {bookedCount} de 4 horários reservados
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['00', '15', '30', '45'].map(minute => {
                    const student = todaysBookings[minute];
                    return (
                      <div key={minute} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: student ? '#fee2e2' : '#ecfdf5', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, color: '#333' }}>{slot.hour}:{minute}</span>
                        {student ? (
                          <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>{student}</span>
                        ) : (
                          <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>Livre</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
