import { supabase } from '../lib/supabase';
import type { AdminSettings, ClinicProfile, Doctor, Service, Slot } from '../types/models';

export async function getClinicProfile(): Promise<ClinicProfile> {
  const { data, error } = await supabase.from('clinic_profile').select('*').single();
  if (error) throw error;
  return data as ClinicProfile;
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Service[];
}

export async function getDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase.from('doctors').select('*').order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Doctor[];
}

export async function getSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase.from('admin_settings').select('*').single();
  if (error) throw error;
  return data as AdminSettings;
}

export async function getAvailableSlots(date: string): Promise<Slot[]> {
  const { data, error } = await supabase
    .from('available_slots')
    .select('*')
    .eq('slot_date', date)
    .order('start_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Slot[];
}

export async function bookAppointment(params: {
  slotId: string;
  patientName: string;
  patientPhone: string;
  notes?: string;
}) {
  const { data, error } = await supabase.rpc('book_appointment', {
    p_slot_id: params.slotId,
    p_patient_name: params.patientName,
    p_patient_phone: params.patientPhone,
    p_notes: params.notes ?? null,
  });

  if (error) throw error;
  return data;
}
