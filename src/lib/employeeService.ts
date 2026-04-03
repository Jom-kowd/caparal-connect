import { supabase } from './supabase';
import { Employee } from './types';

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase.from('employees').select('*').order('createdAt', { ascending: true });
  if (error) throw error;
  return data as Employee[];
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
  if (error) return null;
  return data as Employee;
}

export async function addEmployee(employee: Omit<Employee, 'id' | 'employeeId' | 'createdAt'>): Promise<Employee> {
  const employees = await getEmployees();
  
  // ⚡ SMART ID GENERATOR: Hahanapin ang pinakamataas na ID number
  const maxNum = employees.reduce((max, curr) => {
    const parts = curr.employeeId.split('-'); // Example: ['EMP', '2026', '0001']
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  const nextNum = maxNum + 1;
  const employeeId = `EMP-${new Date().getFullYear()}-${String(nextNum).padStart(4, '0')}`;
  
  const { data, error } = await supabase.from('employees')
    .insert([{ ...employee, employeeId, status: employee.status || 'Active' }])
    .select()
    .single();
    
  if (error) {
    console.error("Supabase Error (Add Employee):", error);
    throw error;
  }
  return data as Employee;
}

export async function updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
  const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
  if (error) {
    console.error("Supabase Error (Update Employee):", error);
    throw error;
  }
  return data as Employee;
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}