import { Intern, AttendanceRecord } from './types';
import { v4 as uuidv4 } from 'uuid';

const INTERNS_KEY = 'caparal_interns';
const ATTENDANCE_KEY = 'caparal_attendance';
const AUTH_KEY = 'caparal_auth';

// Default admin: admin / admin123
const DEFAULT_ADMIN_HASH = 'admin:admin123';

export function getInterns(): Intern[] {
  const data = localStorage.getItem(INTERNS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveInterns(interns: Intern[]) {
  localStorage.setItem(INTERNS_KEY, JSON.stringify(interns));
}

export function generateInternId(): string {
  const interns = getInterns();
  const num = interns.length + 1;
  return `CAP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
}

export function addIntern(intern: Omit<Intern, 'id' | 'internId' | 'createdAt'>): Intern {
  const interns = getInterns();
  const newIntern: Intern = {
    ...intern,
    id: uuidv4(),
    internId: generateInternId(),
    createdAt: new Date().toISOString(),
  };
  interns.push(newIntern);
  saveInterns(interns);
  return newIntern;
}

export function updateIntern(id: string, updates: Partial<Intern>): Intern | null {
  const interns = getInterns();
  const idx = interns.findIndex(i => i.id === id);
  if (idx === -1) return null;
  interns[idx] = { ...interns[idx], ...updates };
  saveInterns(interns);
  return interns[idx];
}

export function deleteIntern(id: string) {
  const interns = getInterns().filter(i => i.id !== id);
  saveInterns(interns);
}

export function getInternById(id: string): Intern | undefined {
  return getInterns().find(i => i.id === id);
}

// Attendance
export function getAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(ATTENDANCE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAttendance(records: AttendanceRecord[]) {
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function logAttendance(internId: string): { action: 'time_in' | 'time_out'; record: AttendanceRecord } {
  const records = getAttendance();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const existing = records.find(r => r.internId === internId && r.date === today);
  
  if (existing && !existing.timeOut) {
    existing.timeOut = now;
    saveAttendance(records);
    return { action: 'time_out', record: existing };
  }
  
  if (existing && existing.timeOut) {
    // Already completed for today
    return { action: 'time_out', record: existing };
  }
  
  const newRecord: AttendanceRecord = {
    id: uuidv4(),
    internId,
    date: today,
    timeIn: now,
    timeOut: null,
  };
  records.push(newRecord);
  saveAttendance(records);
  return { action: 'time_in', record: newRecord };
}

export function getAttendanceForDate(date: string): AttendanceRecord[] {
  return getAttendance().filter(r => r.date === date);
}

export function getAttendanceForIntern(internId: string): AttendanceRecord[] {
  return getAttendance().filter(r => r.internId === internId);
}

// Auth
export function login(username: string, password: string): boolean {
  if (`${username}:${password}` === DEFAULT_ADMIN_HASH) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username, token: uuidv4() }));
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_KEY);
}

export function getAdmin() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}
