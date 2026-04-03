import { supabase } from './supabase';
import { EmployeeAttendanceRecord } from './types';

export async function getEmployeeAttendance(): Promise<EmployeeAttendanceRecord[]> {
  const { data, error } = await supabase.from('employee_attendance').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data as EmployeeAttendanceRecord[];
}

export async function getAttendanceForEmployee(employeeId: string): Promise<EmployeeAttendanceRecord[]> {
  const { data, error } = await supabase.from('employee_attendance').select('*').eq('employeeId', employeeId).order('date', { ascending: false });
  if (error) throw error;
  return data as EmployeeAttendanceRecord[];
}

export async function logEmployeeAttendance(employeeId: string): Promise<{ action: 'time_in' | 'time_out'; record: EmployeeAttendanceRecord }> {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const { data: existingRecords } = await supabase.from('employee_attendance').select('*').eq('employeeId', employeeId).eq('date', today);

  if (existingRecords && existingRecords.length > 0) {
    const existing = existingRecords[0] as EmployeeAttendanceRecord;
    if (!existing.timeOut) {
      const { data } = await supabase.from('employee_attendance').update({ timeOut: now }).eq('id', existing.id).select().single();
      return { action: 'time_out', record: data as EmployeeAttendanceRecord };
    }
    return { action: 'time_out', record: existing };
  }

  const { data: newRecord } = await supabase.from('employee_attendance').insert([{ employeeId, date: today, timeIn: now }]).select().single();
  return { action: 'time_in', record: newRecord as EmployeeAttendanceRecord };
}