import { supabase } from './supabase';

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const email = username.includes('@') ? username : `${username}@caparal.com`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;
    localStorage.setItem('caparal_auth', JSON.stringify({ email }));
    return true;
  } catch {
    return false;
  }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
  localStorage.removeItem('caparal_auth');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('caparal_auth');
}