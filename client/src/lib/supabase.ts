import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client for authentication only
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Proxy function to use backend API instead of direct PostgREST
export async function dbQuery(table: string, options?: Record<string, any>) {
  const query = new URLSearchParams(options || {}).toString();
  const response = await fetch(`/api/${table}${query ? '?' + query : ''}`);
  if (!response.ok) {
    throw new Error(`Database query failed: ${response.statusText}`);
  }
  return response.json();
}

export async function dbInsert(table: string, data: any) {
  const response = await fetch(`/api/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`Insert failed: ${response.statusText}`);
  }
  return response.json();
}

export async function dbUpdate(table: string, id: string, data: any) {
  const response = await fetch(`/api/${table}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data })
  });
  if (!response.ok) {
    throw new Error(`Update failed: ${response.statusText}`);
  }
  return response.json();
}

export async function dbDelete(table: string, id: string) {
  const response = await fetch(`/api/${table}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Delete failed: ${response.statusText}`);
  }
  return null;
}
