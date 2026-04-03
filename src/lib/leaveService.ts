import { supabase } from './supabase';
import { LeaveRequest } from './types';

export async function getLeaves(): Promise<LeaveRequest[]> {
  const { data, error } = await supabase.from('leave_requests').select('*').order('createdAt', { ascending: false });
  if (error) throw error;
  return data as LeaveRequest[];
}

export async function addLeave(leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'status'>): Promise<LeaveRequest> {
  const { data, error } = await supabase.from('leave_requests').insert([{ ...leave, status: 'Pending' }]).select().single();
  if (error) throw error;
  return data as LeaveRequest;
}

export async function updateLeaveStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<LeaveRequest> {
  const { data, error } = await supabase.from('leave_requests').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data as LeaveRequest;
}

export async function deleteLeave(id: string): Promise<void> {
  const { error } = await supabase.from('leave_requests').delete().eq('id', id);
  if (error) throw error;
}