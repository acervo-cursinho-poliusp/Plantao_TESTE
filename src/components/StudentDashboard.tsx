'use client';

import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Slot, Subject, Tutor } from '../types';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const MINUTES = ['00', '15', '30', '45'];

// Define an extended type for the selected slot in the modal
interface SelectedSlot extends Slot {
  currentDateString: string;
}

export default function StudentDashboard() {
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { user, slots, tutors, subjects, bookSlot, cancelBooking, currentWeekStart, prevWeek, nextWeek } = ctx;
  
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  
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

  const visibleDays = selectedDay ? [selectedDay] : DAYS;

  const getTutor = (tutorId: string) => tutors.find(t => t.id === tutorId);
  const getSubject = (subjectId: string) => subjects.find(s => s.id === subjectId);

  const handleSlotClick = (slot: Slot) => {
    const dateString = getDateStringForDayIndex(slot.day);
    setSelectedSlot({ ...slot, currentDateString: dateString });
  };

  const handleAction = (minute: string, action: 'BOOK' | 'CANCEL') => {
    if (!selectedSlot || !user || !user.name) return;
    const dateString = selectedSlot.currentDateString;
    
    if (action === 'BOOK') {
      bookSlot(selectedSlot.id, dateString, minute, user.name);
    } else if (action === 'CANCEL') {
      cancelBooking(selectedSlot.id, dateString, minute);
    }
    
    // Update local selected slot so the modal reflects the change immediately
    const currentDayBookings = selectedSlot.bookings?.[dateString] || { '00': null, '15': null, '30': null, '45': null };
    const newDayBookings = { ...currentDayBookings, [minute]: action === 'BOOK' ? user.name : null };
    
    setSelectedSlot(prev => prev ? ({
      ...prev,
      bookings: { ...prev.bookings, [dateString]: newDayBookings }
    }) : null);
  };

  return (
    <div className="container">
      <h2>Agendar Plantão</h2>
      <p className="mb-4" style={{ color: 'var(--text-muted)' }}>Selecione um bloco de horário disponível para agendar sua chamada com o plantonista</p>

      {/* Week Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '1rem', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <button className="btn btn-outline" onClick={prevWeek} style={{ padding: '0.5rem 1rem' }}>&larr; Semana Anterior</button>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Semana {formatDate(currentWeekStart)} - {formatDate(fridayDate)}
        </span>
        <button className="btn btn-outline" onClick={nextWeek} style={{ padding: '0.5rem 1rem' }}>Próxima Semana &rarr;</button>
      </div>

      <div className="mb-4 flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, marginRight: '0.5rem', minWidth: '130px' }}>Filtrar por matéria:</span>
        <button 
          className={`btn ${selectedSubject === null ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedSubject(null)}
          style={{ borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', border: '2px solid black' }}
        >
          Todas
        </button>
        {subjects.map(sub => (
          <button 
            key={sub.id}
            className={`btn ${selectedSubject === sub.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedSubject(sub.id)}
            style={{ 
              borderRadius: '20px', 
              padding: '0.25rem 0.75rem', 
              fontSize: '0.8rem', 
              borderColor: selectedSubject === sub.id ? 'transparent' : sub.color, 
              color: selectedSubject === sub.id ? 'white' : '#333', 
              backgroundColor: selectedSubject === sub.id ? sub.color : 'transparent',
              border: selectedSubject === sub.id ? 'none' : `1px solid ${sub.color}`
            }}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, marginRight: '0.5rem', minWidth: '130px' }}>Filtrar por dia:</span>
        <button 
          className={`btn ${selectedDay === null ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setSelectedDay(null)}
          style={{ borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', border: '2px solid black' }}
        >
          Todos os Dias
        </button>
        {DAYS.map(dayName => (
          <button 
            key={dayName}
            className={`btn ${selectedDay === dayName ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedDay(dayName)}
            style={{ borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', border: selectedDay === dayName ? 'none' : '1px solid var(--border-color)' }}
          >
            {dayName}
          </button>
        ))}
      </div>

      <div className="calendar-grid" style={{ gridTemplateColumns: `80px repeat(${visibleDays.length}, minmax(150px, 1fr))` }}>
        <div style={{ visibility: 'hidden' }}></div>
        {visibleDays.map((dayName) => {
          const dayIndex = DAYS.indexOf(dayName) + 1;
          return (
            <div key={dayName} className="calendar-header">
              {dayName} <br/> <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>({formatDate(getDateForDayIndex(dayIndex))})</span>
            </div>
          );
        })}

        {HOURS.map(hour => (
          <React.Fragment key={hour}>
            <div className="time-slot-label">{hour}:00</div>
            {visibleDays.map((dayName) => {
              const day = DAYS.indexOf(dayName) + 1;
              const dateString = getDateStringForDayIndex(day);
              
              const slotList = slots
                .filter(s => s.day === day && s.hour === hour)
                .filter(s => {
                  if (!selectedSubject) return true;
                  const tutor = getTutor(s.tutorId);
                  return tutor?.subjects.includes(selectedSubject);
                });
              
              if (slotList.length === 0) {
                return <div key={`${day}-${hour}`} className="slot-empty"></div>;
              }

              return (
                <div key={`${day}-${hour}`} className="slot-cell">
                  {slotList.map(slot => {
                    const tutor = getTutor(slot.tutorId);
                    const totalSlots = 4;
                    const todaysBookings = slot.bookings?.[dateString] || {};
                    const bookedSlots = Object.values(todaysBookings).filter(v => v !== null).length;
                    const availableSlots = totalSlots - bookedSlots;
                    const hasMyBooking = Object.values(todaysBookings).includes(user?.name);

                    let cardClass = 'slot-card';
                    if (hasMyBooking) cardClass += ' my-booking';
                    else if (availableSlots === 0) cardClass += ' occupied';

                    return (
                      <div key={slot.id} className={cardClass} onClick={() => handleSlotClick(slot)}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{tutor?.name}</div>
                          <div style={{ marginTop: '0.25rem' }}>
                            {tutor?.subjects.map(subId => {
                              const subject = getSubject(subId);
                              return subject ? (
                                <span key={subId} className="badge" style={{ backgroundColor: subject.color }}>
                                  {subject.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: hasMyBooking ? 'var(--success-color)' : availableSlots === 0 ? 'var(--text-muted)' : 'var(--primary-color)' }}>
                          {hasMyBooking ? 'Você agendou aqui' : availableSlots === 0 ? 'Lotado' : `${availableSlots}/4 Livres`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {selectedSlot && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h3 className="mb-4">Reservar Horário</h3>
            
            <div className="mb-4">
              <p><strong>Plantonista:</strong> {getTutor(selectedSlot.tutorId)?.name}</p>
              <p><strong>Data:</strong> {DAYS[selectedSlot.day - 1]}, {formatDate(getDateForDayIndex(selectedSlot.day))}</p>
              <p><strong>Bloco:</strong> {selectedSlot.hour}:00 - {selectedSlot.hour + 1}:00</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {MINUTES.map(minute => {
                const todaysBookings = selectedSlot.bookings?.[selectedSlot.currentDateString] || {};
                const booking = todaysBookings[minute];
                const isMyBooking = booking === user?.name;
                const isAvailable = !booking;

                return (
                  <div key={minute} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: isMyBooking ? '#ecfdf5' : isAvailable ? 'var(--surface-color)' : '#f8fafc' }}>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {selectedSlot.hour}:{minute}
                    </div>
                    <div>
                      {isMyBooking ? (
                        <div className="flex gap-2 items-center">
                          <span style={{ color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>SEU HORÁRIO</span>
                          <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleAction(minute, 'CANCEL')}>Cancelar</button>
                        </div>
                      ) : isAvailable ? (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleAction(minute, 'BOOK')}>Agendar</button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'bold' }}>OCUPADO</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.values(selectedSlot.bookings?.[selectedSlot.currentDateString] || {}).includes(user?.name) && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', borderLeft: '4px solid var(--secondary-color)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: '700' }}>Link da Sala (Google Meet) para seus horários:</p>
                <a href={getTutor(selectedSlot.tutorId)?.meetLink} target="_blank" rel="noreferrer" style={{ wordBreak: 'break-all', color: 'var(--primary-color)' }}>
                  {getTutor(selectedSlot.tutorId)?.meetLink}
                </a>
              </div>
            )}

            <div className="flex justify-end">
              <button className="btn btn-outline" onClick={() => setSelectedSlot(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
