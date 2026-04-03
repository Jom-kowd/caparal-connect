import { supabase } from './supabase';

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: 'Admin' | 'Staff';
  photo?: string;
  password?: string;
}

export async function login(username: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) return false;

  // I-se-save natin ang impormasyon ng user sa browser (kasama ang Role niya)
  localStorage.setItem('caparal_session', JSON.stringify({
    id: data.id,
    username: data.username,
    fullName: data.fullName,
    role: data.role,
    photo: data.photo
  }));
  
  return true;
}

export function logout(): void {
  localStorage.removeItem('caparal_session');
}

export function isAuthenticated(): boolean {
  return localStorage.getItem('caparal_session') !== null;
}

export function getUser(): AppUser | null {
  const session = localStorage.getItem('caparal_session');
  return session ? JSON.parse(session) : null;
}

// Para sa Account Management (Admin Only)
export async function getSystemUsers() {
  const { data } = await supabase.from('app_users').select('*').order('createdAt', { ascending: true });
  return data as AppUser[];
}

export async function updateUserProfile(id: string, updates: Partial<AppUser>) {
  const { data } = await supabase.from('app_users').update(updates).eq('id', id).select().single();
  // Update local session if it's the current user
  const currentUser = getUser();
  if (currentUser && currentUser.id === id && data) {
    localStorage.setItem('caparal_session', JSON.stringify({ ...currentUser, ...data }));
  }
  return data;
}

export async function addSystemUser(user: Partial<AppUser>) {
  const { data } = await supabase.from('app_users').insert([user]).select().single();
  return data;
}

export async function deleteSystemUser(id: string) {
  await supabase.from('app_users').delete().eq('id', id);
}