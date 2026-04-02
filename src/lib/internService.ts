import { supabase } from './supabase';
import { Intern } from './types';

export async function getInterns(): Promise<Intern[]> {
  const { data, error } = await supabase.from('interns').select('*').order('createdAt', { ascending: true });
  if (error) throw error;
  return data as Intern[];
}

export async function getInternById(id: string): Promise<Intern | null> {
  const { data, error } = await supabase.from('interns').select('*').eq('id', id).single();
  if (error) return null;
  return data as Intern;
}

export async function addIntern(intern: Omit<Intern, 'id' | 'internId' | 'createdAt'>): Promise<Intern> {
  const interns = await getInterns();
  const num = interns.length + 1;
  const internId = `CAP-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
  
  const { data, error } = await supabase.from('interns').insert([{ ...intern, internId, status: intern.status || 'Active' }]).select().single();
  if (error) throw error;
  return data as Intern;
}

export async function updateIntern(id: string, updates: Partial<Intern>): Promise<Intern> {
  const { data, error } = await supabase.from('interns').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Intern;
}

export async function deleteIntern(id: string): Promise<void> {
  const { error } = await supabase.from('interns').delete().eq('id', id);
  if (error) throw error;
}