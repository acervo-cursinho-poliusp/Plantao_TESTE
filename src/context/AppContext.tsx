'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Subject, Tutor, Slot, User } from '../types';

export interface AppContextType {
  subjects: Subject[];
  tutors: Tutor[];
  slots: Slot[];
  user: User | null;
  loading: boolean;
  currentWeekStart: Date;
  nextWeek: () => void;
  prevWeek: () => void;
  loginStudent: (name: string) => void;
  loginAdmin: () => void;
  loginTutor: (tutorId: string) => void;
  logout: () => void;
  bookSlot: (slotId: string, dateString: string, minute: string, studentName: string) => Promise<void>;
  cancelBooking: (slotId: string, dateString: string, minute: string) => Promise<void>;
  addSlot: (day: number, hour: number, tutorId: string) => Promise<void>;
  deleteSlot: (slotId: string) => Promise<void>;
  addSubject: (name: string, color: string) => Promise<void>;
  updateSubject: (id: string, name: string, color: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTutor: (name: string, meetLink: string, subjectsList: string[]) => Promise<void>;
  deleteTutor: (id: string) => Promise<void>;
  updateTutor: (id: string, meetLink: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

function getMonday(date: Date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

const initialSubjects: Subject[] = [
  { id: '1', name: 'Matemática', color: '#3b82f6' },
  { id: '2', name: 'Física', color: '#10b981' }
];

const initialTutors: Tutor[] = [
  { id: 't1', name: 'Prof. Carlos', meetLink: 'https://meet.google.com/abc', subjects: ['1'] },
  { id: 't2', name: 'Profa. Ana', meetLink: 'https://meet.google.com/def', subjects: ['2'] },
  { id: 't3', name: 'Prof. Marcos', meetLink: 'https://meet.google.com/ghi', subjects: ['1', '2'] },
];

const initialSlots: Slot[] = [
  { id: 's1', day: 1, hour: 14, tutorId: 't1', bookings: {} },
  { id: 's2', day: 2, hour: 10, tutorId: 't2', bookings: {} },
  { id: 's3', day: 3, hour: 15, tutorId: 't3', bookings: {} }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://sua-url-aqui.supabase.co');

  const [subjects, setSubjects] = useState<Subject[]>(isSupabaseConfigured ? [] : initialSubjects);
  const [tutors, setTutors] = useState<Tutor[]>(isSupabaseConfigured ? [] : initialTutors);
  const [slots, setSlots] = useState<Slot[]>(isSupabaseConfigured ? [] : initialSlots);
  
  const [user, setUser] = useState<User | null>(null);
  
  // Apenas o usuário permanece no localStorage para manter a pessoa logada
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);
  
  const [loading, setLoading] = useState(true);

  // Weekly Calendar State
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));

  const nextWeek = () => {
    setCurrentWeekStart(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const prevWeek = () => {
    setCurrentWeekStart(prev => {
      const prevDate = new Date(prev);
      prevDate.setDate(prev.getDate() - 7);
      return prevDate;
    });
  };

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [subsRes, tutsRes, slotsRes] = await Promise.all([
          supabase.from('subjects').select('*'),
          supabase.from('tutors').select('*'),
          supabase.from('slots').select('*')
        ]);

        if (subsRes.data) setSubjects(subsRes.data as Subject[]);
        if (tutsRes.data) setTutors(tutsRes.data as Tutor[]);
        if (slotsRes.data) setSlots(slotsRes.data as Slot[]);
      } catch (error) {
        console.error("Erro ao buscar dados do Supabase:", error);
      } finally {
        setLoading(false);
      }
    }
    
    if (isSupabaseConfigured) {
      fetchData();
    } else {
      console.warn("Supabase não configurado. Adicione o .env ou configure na Vercel.");
      setLoading(false);
    }
  }, [isSupabaseConfigured]);

  // Save user session
  useEffect(() => { 
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); 
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Auth Actions
  const loginStudent = (name: string) => setUser({ role: 'STUDENT', name });
  const loginAdmin = () => setUser({ role: 'ADMIN' });
  const loginTutor = (tutorId: string) => setUser({ role: 'TUTOR', tutorId });
  const logout = () => setUser(null);

  // Database Actions (Optimistic Updates for fast UI)
  const bookSlot = async (slotId: string, dateString: string, minute: string, studentName: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    
    const currentDayBookings = slot.bookings[dateString] || { '00': null, '15': null, '30': null, '45': null };
    const newDayBookings = { ...currentDayBookings, [minute]: studentName };
    const newBookings = { ...slot.bookings, [dateString]: newDayBookings };
    
    setSlots(slots.map(s => s.id === slotId ? { ...s, bookings: newBookings } : s));
    if (isSupabaseConfigured) await supabase.from('slots').update({ bookings: newBookings }).eq('id', slotId);
  };

  const cancelBooking = async (slotId: string, dateString: string, minute: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;
    
    const currentDayBookings = slot.bookings[dateString] || { '00': null, '15': null, '30': null, '45': null };
    const newDayBookings = { ...currentDayBookings, [minute]: null };
    const newBookings = { ...slot.bookings, [dateString]: newDayBookings };
    
    setSlots(slots.map(s => s.id === slotId ? { ...s, bookings: newBookings } : s));
    if (isSupabaseConfigured) await supabase.from('slots').update({ bookings: newBookings }).eq('id', slotId);
  };

  const addSlot = async (day: number, hour: number, tutorId: string) => {
    const newSlot: Slot = {
      id: Date.now().toString(),
      day,
      hour,
      tutorId,
      bookings: {}
    };
    setSlots([...slots, newSlot]);
    if (isSupabaseConfigured) await supabase.from('slots').insert([newSlot]);
  };

  const deleteSlot = async (slotId: string) => {
    setSlots(slots.filter(s => s.id !== slotId));
    if (isSupabaseConfigured) await supabase.from('slots').delete().eq('id', slotId);
  };

  const addSubject = async (name: string, color: string) => {
    const newSubject: Subject = { id: Date.now().toString(), name, color };
    setSubjects([...subjects, newSubject]);
    if (isSupabaseConfigured) await supabase.from('subjects').insert([newSubject]);
  };

  const updateSubject = async (id: string, name: string, color: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name, color } : s));
    if (isSupabaseConfigured) await supabase.from('subjects').update({ name, color }).eq('id', id);
  };

  const deleteSubject = async (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    if (isSupabaseConfigured) await supabase.from('subjects').delete().eq('id', id);
  };

  const addTutor = async (name: string, meetLink: string, subjectsList: string[]) => {
    const newTutor: Tutor = { id: Date.now().toString(), name, meetLink, subjects: subjectsList };
    setTutors([...tutors, newTutor]);
    if (isSupabaseConfigured) await supabase.from('tutors').insert([newTutor]);
  };

  const deleteTutor = async (id: string) => {
    setTutors(tutors.filter(t => t.id !== id));
    setSlots(slots.filter(s => s.tutorId !== id)); 
    if (isSupabaseConfigured) await supabase.from('tutors').delete().eq('id', id);
  };

  const updateTutor = async (id: string, meetLink: string) => {
    setTutors(tutors.map(t => t.id === id ? { ...t, meetLink } : t));
    if (isSupabaseConfigured) await supabase.from('tutors').update({ meetLink }).eq('id', id);
  };

  return (
    <AppContext.Provider value={{
      subjects, tutors, slots, user, loading,
      currentWeekStart, nextWeek, prevWeek,
      loginStudent, loginAdmin, loginTutor, logout,
      bookSlot, cancelBooking, addSlot, deleteSlot,
      addSubject, updateSubject, deleteSubject,
      addTutor, deleteTutor, updateTutor
    }}>
      {children}
    </AppContext.Provider>
  );
};
