import { supabase } from '../lib/supabase';
import type { Appointment, ClinicProfile, Doctor, Service, WorkingHour } from '../types/models';

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateClinicProfile(values: Partial<ClinicProfile>) {
  const { data: rows, error: readError } = await supabase.from('clinic_profile').select('id').limit(1);
  if (readError) throw readError;
  const id = rows?.[0]?.id;
  if (!id) throw new Error('تعذر العثور على بيانات العيادة');

  const { error } = await supabase.from('clinic_profile').update(values).eq('id', id);
  if (error) throw error;
}

export async function getWorkingHours(): Promise<WorkingHour[]> {
  const { data, error } = await supabase.from('working_hours').select('*').order('day_of_week', { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkingHour[];
}

export async function updateWorkingHour(dayOfWeek: number, values: Partial<WorkingHour>) {
  const { error } = await supabase.from('working_hours').update(values).eq('day_of_week', dayOfWeek);
  if (error) throw error;
}

export async function updateSettings(values: { appointment_duration_minutes: number; booking_days_ahead: number }) {
  const { data: rows, error: readError } = await supabase.from('admin_settings').select('id').limit(1);
  if (readError) throw readError;
  const id = rows?.[0]?.id;
  if (!id) throw new Error('تعذر العثور على إعدادات الحجز');

  const { error } = await supabase.from('admin_settings').update(values).eq('id', id);
  if (error) throw error;
}

export async function regenerateSlots(startDate: string, endDate: string) {
  const { error } = await supabase.rpc('generate_slots_for_range', {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
}

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, time_slots(id, slot_date, start_at, end_at)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Appointment[];
}

export async function cancelAppointment(appointmentId: string) {
  const { error } = await supabase.rpc('admin_cancel_appointment', { p_appointment_id: appointmentId });
  if (error) throw error;
}

export async function getServicesAdmin(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function createService(values: Omit<Service, 'id'>) {
  const { error } = await supabase.from('services').insert(values);
  if (error) throw error;
}

export async function updateService(id: string, values: Partial<Service>) {
  const { error } = await supabase.from('services').update(values).eq('id', id);
  if (error) throw error;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function getDoctorsAdmin(): Promise<Doctor[]> {
  const { data, error } = await supabase.from('doctors').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Doctor[];
}

export async function createDoctor(values: Omit<Doctor, 'id'>) {
  const { error } = await supabase.from('doctors').insert(values);
  if (error) throw error;
}

export async function updateDoctor(id: string, values: Partial<Doctor>) {
  const { error } = await supabase.from('doctors').update(values).eq('id', id);
  if (error) throw error;
}

export async function deleteDoctor(id: string) {
  const { error } = await supabase.from('doctors').delete().eq('id', id);
  if (error) throw error;
}
