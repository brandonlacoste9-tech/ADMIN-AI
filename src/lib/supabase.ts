import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Mock data for demo purposes when Supabase is not configured
export const mockCustomers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1 555-0101', notes: 'Regular client', created_at: '2024-01-15' },
  { id: '2', name: 'Marie Dubois', email: 'marie@example.fr', phone: '+1 555-0102', notes: 'VIP client', created_at: '2024-01-20' },
  { id: '3', name: 'Carlos Rodriguez', email: 'carlos@example.com', phone: '+1 555-0103', notes: 'New client', created_at: '2024-02-01' },
  { id: '4', name: 'Sophie Martin', email: 'sophie@example.fr', phone: '+1 555-0104', notes: '', created_at: '2024-02-10' },
];

export const mockAppointments = [
  { id: '1', customerName: 'John Smith', service: 'Consultation', date: '2024-03-10', time: '09:00', status: 'confirmed' },
  { id: '2', customerName: 'Marie Dubois', service: 'Follow-up', date: '2024-03-10', time: '10:30', status: 'confirmed' },
  { id: '3', customerName: 'Carlos Rodriguez', service: 'Initial Meeting', date: '2024-03-11', time: '14:00', status: 'pending' },
  { id: '4', customerName: 'Sophie Martin', service: 'Consultation', date: '2024-03-12', time: '11:00', status: 'confirmed' },
];
