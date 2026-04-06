import { supabase } from './supabase';
import { AttendanceRecord } from './types';

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  if (error) {
    console.error("Get Attendance Error:", error);
    throw error;
  }
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

  const { data: existingRecords, error: selectErr } = await supabase.from('attendance').select('*').eq('internId', internId).eq('date', today);

  if (selectErr) {
    console.error("Supabase Select Error:", selectErr);
    throw selectErr;
  }

  if (existingRecords && existingRecords.length > 0) {
    const existing = existingRecords[0] as AttendanceRecord;
    if (!existing.timeOut) {
      const { data, error: updateErr } = await supabase.from('attendance').update({ timeOut: now }).eq('id', existing.id).select().single();
      
      if (updateErr) {
         console.error("Supabase Update Error:", updateErr);
         throw new Error(`Update failed: ${updateErr.message}`);
      }
      return { action: 'time_out', record: data as AttendanceRecord };
    }
    return { action: 'time_out', record: existing };
  }

  const { data: newRecord, error: insertErr } = await supabase.from('attendance').insert([{ internId, date: today, timeIn: now }]).select().single();
  
  if (insertErr) {
    console.error("Supabase Insert Error:", insertErr);
    throw new Error(`Insert failed: ${insertErr.message}`);
  }

  if (!newRecord) {
    throw new Error("Database blocked the save action. Please check Supabase RLS Policies.");
  }

  return { action: 'time_in', record: newRecord as AttendanceRecord };
}