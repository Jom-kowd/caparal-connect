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
  
  // ⚡ SMART ID GENERATOR: Hahanapin ang pinakamataas na ID number para iwas duplicate
  const maxNum = interns.reduce((max, curr) => {
    const parts = curr.internId.split('-'); // Example: ['CAP', '2026', '0001']
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const nextNum = maxNum + 1;
  const internId = `CAP-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
  
  const { data, error } = await supabase.from('interns')
    .insert([{ ...intern, internId, status: intern.status || 'Active' }])
    .select()
    .single();
    
  if (error) {
    console.error("Supabase Error (Add Intern):", error);
    throw error;
  }
  return data as Intern;
}

export async function updateIntern(id: string, updates: Partial<Intern>): Promise<Intern> {
  const { data, error } = await supabase.from('interns').update(updates).eq('id', id).select().single();
  if (error) {
    console.error("Supabase Error (Update Intern):", error);
    throw error;
  }
  return data as Intern;
}

export async function deleteIntern(id: string): Promise<void> {
  const { error } = await supabase.from('interns').delete().eq('id', id);
  if (error) throw error;
}