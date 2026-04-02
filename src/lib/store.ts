import { Intern, AttendanceRecord } from './types';
import { supabase } from './supabase';

// --- ⚡ IN-MEMORY CACHE (Para instant loading pa rin!) ⚡ ---
let cachedInterns: Intern[] | null = null;
let cachedAttendance: AttendanceRecord[] | null = null;

// --- INTERNS ---
export async function getInterns(): Promise<Intern[]> {
  if (cachedInterns) return cachedInterns; // Instant load mula sa cache!
  
  const { data, error } = await supabase.from('interns').select('*').order('createdAt', { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  
  cachedInterns = data as Intern[];
  return cachedInterns;
}

export async function generateInternId(): Promise<string> {
  const interns = await getInterns();
  const num = interns.length + 1;
  return `CAP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
}

export async function addIntern(intern: Omit<Intern, 'id' | 'internId' | 'createdAt'>): Promise<Intern> {
  const internId = await generateInternId();
  
  const { data, error } = await supabase
    .from('interns')
    .insert([{ ...intern, internId, status: intern.status || 'Active' }])
    .select()
    .single();
    
  if (error) throw error;
  
  const newIntern = data as Intern;
  if (cachedInterns) cachedInterns.push(newIntern); // Update cache
  return newIntern;
}

export async function updateIntern(id: string, updates: Partial<Intern>): Promise<Intern | null> {
  const { data, error } = await supabase
    .from('interns')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  if (cachedInterns) {
    const idx = cachedInterns.findIndex(i => i.id === id);
    if (idx > -1) cachedInterns[idx] = { ...cachedInterns[idx], ...data };
  }
  return data as Intern;
}

export async function deleteIntern(id: string): Promise<void> {
  const { error } = await supabase.from('interns').delete().eq('id', id);
  if (error) throw error;
  
  if (cachedInterns) {
    cachedInterns = cachedInterns.filter(i => i.id !== id);
  }
}

export async function getInternById(id: string): Promise<Intern | null> {
  if (cachedInterns) {
    const found = cachedInterns.find(i => i.id === id);
    if (found) return found;
  }
  const { data, error } = await supabase.from('interns').select('*').eq('id', id).single();
  if (error) return null;
  return data as Intern;
}

// --- ATTENDANCE ---
export async function getAttendance(): Promise<AttendanceRecord[]> {
  if (cachedAttendance) return cachedAttendance;
  
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  
  cachedAttendance = data as AttendanceRecord[];
  return cachedAttendance;
}

export async function logAttendance(internId: string): Promise<{ action: 'time_in' | 'time_out'; record: AttendanceRecord }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Hanapin kung may record na siya ngayong araw
  const { data: existingRecords, error: searchError } = await supabase
    .from('attendance')
    .select('*')
    .eq('internId', internId)
    .eq('date', today);

  if (searchError) throw searchError;

  if (existingRecords && existingRecords.length > 0) {
    const existingRecord = existingRecords[0] as AttendanceRecord;

    // Time Out kung hindi pa naka-Time Out
    if (!existingRecord.timeOut) {
      const { data: updatedRecord, error: updateError } = await supabase
        .from('attendance')
        .update({ timeOut: now })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (cachedAttendance) {
        const index = cachedAttendance.findIndex(a => a.id === existingRecord.id);
        if (index > -1) cachedAttendance[index] = updatedRecord as AttendanceRecord;
      }
      return { action: 'time_out', record: updatedRecord as AttendanceRecord };
    }
    return { action: 'time_out', record: existingRecord };
  }

  // Time In kung wala pang record
  const { data: newRecord, error: insertError } = await supabase
    .from('attendance')
    .insert([{ internId, date: today, timeIn: now }])
    .select()
    .single();

  if (insertError) throw insertError;

  if (cachedAttendance) cachedAttendance.unshift(newRecord as AttendanceRecord);
  
  return { action: 'time_in', record: newRecord as AttendanceRecord };
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  if (cachedAttendance) return cachedAttendance.filter(a => a.date === date);
  const { data, error } = await supabase.from('attendance').select('*').eq('date', date);
  if (error) return [];
  return data as AttendanceRecord[];
}

export async function getAttendanceForIntern(internId: string): Promise<AttendanceRecord[]> {
  if (cachedAttendance) return cachedAttendance.filter(a => a.internId === internId);
  const { data, error } = await supabase.from('attendance').select('*').eq('internId', internId);
  if (error) return [];
  return data as AttendanceRecord[];
}

// --- AUTHENTICATION ---
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const email = username.includes('@') ? username : `${username}@caparal.com`;
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error("Login failed:", error.message);
      return false;
    }
    
    localStorage.setItem('caparal_auth', JSON.stringify({ email }));
    return true;
  } catch (error) {
    return false;
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem('caparal_auth');
  // I-clear ang cache para secured
  cachedInterns = null;
  cachedAttendance = null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('caparal_auth');
}

export function getAdmin() {
  const data = localStorage.getItem('caparal_auth');
  return data ? JSON.parse(data) : null;
}