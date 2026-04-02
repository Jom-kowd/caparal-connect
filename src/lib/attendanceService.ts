import { supabase } from './supabase';
import { AttendanceRecord } from './types';

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data as AttendanceRecord[];
}
export async function getAttendanceForIntern(internId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from('attendance').select('*').eq('internId', internId).order('date', { ascending: false });
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function logAttendance(internId: string): Promise<{ action: 'time_in' | 'time_out'; record: AttendanceRecord }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const { data: existingRecords } = await supabase.from('attendance').select('*').eq('internId', internId).eq('date', today);

  if (existingRecords && existingRecords.length > 0) {
    const existing = existingRecords[0] as AttendanceRecord;
    if (!existing.timeOut) {
      const { data } = await supabase.from('attendance').update({ timeOut: now }).eq('id', existing.id).select().single();
      return { action: 'time_out', record: data as AttendanceRecord };
    }
    return { action: 'time_out', record: existing };
  }

  const { data: newRecord } = await supabase.from('attendance').insert([{ internId, date: today, timeIn: now }]).select().single();
  return { action: 'time_in', record: newRecord as AttendanceRecord };
}