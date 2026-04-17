export type ClinicProfile = {
  id?: string;
  clinic_name: string;
  about_text: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  map_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_primary_label: string | null;
  hero_primary_url: string | null;
  hero_secondary_label: string | null;
  hero_secondary_url: string | null;
};

export type AdminSettings = {
  id?: string;
  appointment_duration_minutes: number;
  booking_days_ahead: number;
};

export type WorkingHour = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type Slot = {
  id: string;
  slot_date: string;
  start_at: string;
  end_at: string;
  is_booked?: boolean;
};

export type Appointment = {
  id: string;
  patient_name: string;
  patient_phone: string;
  notes: string | null;
  status: 'booked' | 'cancelled';
  created_at: string;
  time_slots?: Slot;
};

export type Service = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
};
