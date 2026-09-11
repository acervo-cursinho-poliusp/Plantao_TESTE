export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Tutor {
  id: string;
  name: string;
  meetLink: string;
  subjects: string[]; // array of subject IDs
}

export interface BookingsMap {
  [dateString: string]: {
    '00'?: string | null;
    '15'?: string | null;
    '30'?: string | null;
    '45'?: string | null;
    [key: string]: string | null | undefined;
  };
}

export interface Slot {
  id: string;
  day: number;
  hour: number;
  tutorId: string;
  bookings: BookingsMap;
}

export interface User {
  role: 'STUDENT' | 'ADMIN' | 'TUTOR';
  name?: string; // Only for student
  tutorId?: string; // Only for tutor
}
