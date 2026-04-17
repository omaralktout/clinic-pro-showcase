import { useEffect, useMemo, useState } from 'react';
import {
  CalendarSync,
  Clock3,
  Link2,
  MapPinned,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  cancelAppointment,
  createDoctor,
  createService,
  deleteDoctor,
  deleteService,
  getAppointments,
  getCurrentSession,
  getDoctorsAdmin,
  getServicesAdmin,
  getWorkingHours,
  regenerateSlots,
  signOutAdmin,
  updateClinicProfile,
  updateDoctor,
  updateService,
  updateSettings,
  updateWorkingHour,
} from '../api/admin';
import { getClinicProfile, getSettings } from '../api/public';
import SectionHeading from '../components/SectionHeading';
import AdminShell from '../layout/AdminShell';
import { supabase } from '../lib/supabase';
import type {
  AdminSettings,
  Appointment,
  ClinicProfile,
  Doctor,
  Service,
  WorkingHour,
} from '../types/models';
import { addDays, formatDateTime, todayLocalDate } from '../utils/date';
import { dayNamesAr } from '../utils/dayNames';

const defaultClinic: ClinicProfile = {
  clinic_name: '',
  about_text: '',
  phone: '',
  whatsapp: '',
  address: '',
  map_url: '',
  logo_url: '',
  primary_color: '#2563eb',
  hero_badge: 'موقع طبي احترافي',
  hero_title: '',
  hero_subtitle: '',
  hero_primary_label: 'احجز موعدك الآن',
  hero_primary_url: '#booking',
  hero_secondary_label: 'اعرف موقع العيادة',
  hero_secondary_url: '#contact',
};

const defaultSettings: AdminSettings = {
  appointment_duration_minutes: 15,
  booking_days_ahead: 14,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [clinic, setClinic] = useState<ClinicProfile>(defaultClinic);
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    title: '',
    description: '',
    sort_order: 0,
  });

  const [newDoctor, setNewDoctor] = useState<Omit<Doctor, 'id'>>({
    name: '',
    specialty: '',
    bio: '',
    image_url: '',
    sort_order: 0,
  });

  async function ensureAuth() {
    const session = await getCurrentSession();
    if (!session) {
      navigate('/admin/login', { replace: true });
      return false;
    }
    return true;
  }

  const regenerateRange = useMemo(() => {
    const start = todayLocalDate();
    const end = addDays(start, settings.booking_days_ahead || 14);
    return { start, end };
  }, [settings.booking_days_ahead]);

  function showSuccess(message: string) {
    setSuccessText(message);
    setErrorText('');
    window.setTimeout(() => setSuccessText(''), 3000);
  }

  function showError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    setErrorText(message);
    setSuccessText('');
  }

  async function loadAll() {
    setLoading(true);
    setErrorText('');
    try {
      const allowed = await ensureAuth();
      if (!allowed) return;

      const [
        clinicData,
        settingsData,
        hoursData,
        appointmentsData,
        servicesData,
        doctorsData,
      ] = await Promise.all([
        getClinicProfile(),
        getSettings(),
        getWorkingHours(),
        getAppointments(),
        getServicesAdmin(),
        getDoctorsAdmin(),
      ]);

      setClinic({ ...defaultClinic, ...clinicData });
      setSettings({ ...defaultSettings, ...settingsData });
      setWorkingHours(hoursData);
      setAppointments(appointmentsData);
      setServices(servicesData);
      setDoctors(doctorsData);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          void loadAll();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'time_slots' },
        () => {
          void loadAll();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function withBusy<T>(key: string, action: () => Promise<T>) {
    setBusyKey(key);
    try {
      return await action();
    } finally {
      setBusyKey('');
    }
  }

  async function handleLogout() {
    await signOutAdmin();
    navigate('/admin/login', { replace: true });
  }

  async function handleSaveClinic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withBusy('save-clinic', async () => {
      try {
        await updateClinicProfile(clinic);
        showSuccess('تم حفظ بيانات العيادة بنجاح');
      } catch (error) {
        showError(error);
      }
    });
  }

  async function regenerateNow(successMessage: string) {
    await regenerateSlots(regenerateRange.start, regenerateRange.end);
    showSuccess(successMessage);
    await loadAll();
  }

  async function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withBusy('save-settings', async () => {
      try {
        await updateSettings({
          appointment_duration_minutes: Number(
            settings.appointment_duration_minutes
          ),
          booking_days_ahead: Number(settings.booking_days_ahead),
        });
        await regenerateNow(
          'تم حفظ إعدادات الحجز وإعادة توليد المواعيد القادمة'
        );
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleSaveWorkingHour(dayOfWeek: number) {
    const row = workingHours.find((item) => item.day_of_week === dayOfWeek);
    if (!row) return;

    await withBusy(`save-hour-${dayOfWeek}`, async () => {
      try {
        await updateWorkingHour(dayOfWeek, {
          start_time: row.start_time,
          end_time: row.end_time,
          is_active: row.is_active,
        });
        await regenerateNow(
          `تم حفظ دوام ${dayNamesAr[dayOfWeek]} وإعادة توليد المواعيد تلقائيًا`
        );
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleManualRegenerate() {
    await withBusy('manual-regenerate', async () => {
      try {
        await regenerateNow('تمت إعادة توليد المواعيد القادمة بنجاح');
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleCancelAppointment(id: string) {
    await withBusy(`cancel-${id}`, async () => {
      try {
        await cancelAppointment(id);
        showSuccess('تم إلغاء الحجز وإعادة فتح الموعد');
        await loadAll();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAddService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withBusy('add-service', async () => {
      try {
        await createService({
          title: newService.title,
          description: newService.description,
          sort_order: Number(newService.sort_order || 0),
        });
        setNewService({ title: '', description: '', sort_order: 0 });
        showSuccess('تمت إضافة الخدمة');
        await loadAll();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleSaveService(id: string) {
    const row = services.find((item) => item.id === id);
    if (!row) return;

    await withBusy(`save-service-${id}`, async () => {
      try {
        await updateService(id, {
          title: row.title,
          description: row.description,
          sort_order: Number(row.sort_order || 0),
        });
        showSuccess('تم تحديث الخدمة');
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleDeleteService(id: string) {
    await withBusy(`delete-service-${id}`, async () => {
      try {
        await deleteService(id);
        showSuccess('تم حذف الخدمة');
        await loadAll();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleAddDoctor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await withBusy('add-doctor', async () => {
      try {
        await createDoctor({
          name: newDoctor.name,
          specialty: newDoctor.specialty,
          bio: newDoctor.bio,
          image_url: newDoctor.image_url,
          sort_order: Number(newDoctor.sort_order || 0),
        });
        setNewDoctor({
          name: '',
          specialty: '',
          bio: '',
          image_url: '',
          sort_order: 0,
        });
        showSuccess('تمت إضافة الطبيب');
        await loadAll();
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleSaveDoctor(id: string) {
    const row = doctors.find((item) => item.id === id);
    if (!row) return;

    await withBusy(`save-doctor-${id}`, async () => {
      try {
        await updateDoctor(id, {
          name: row.name,
          specialty: row.specialty,
          bio: row.bio,
          image_url: row.image_url,
          sort_order: Number(row.sort_order || 0),
        });
        showSuccess('تم تحديث بيانات الطبيب');
      } catch (error) {
        showError(error);
      }
    });
  }

  async function handleDeleteDoctor(id: string) {
    await withBusy(`delete-doctor-${id}`, async () => {
      try {
        await deleteDoctor(id);
        showSuccess('تم حذف الطبيب');
        await loadAll();
      } catch (error) {
        showError(error);
      }
    });
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-xl font-black">
        جارٍ تحميل لوحة التحكم...
      </div>
    );
  }

  return (
    <AdminShell onLogout={handleLogout}>
      <div className="mx-auto max-w-7xl space-y-6 px-3 sm:px-4 lg:px-6">
        <div className="rounded-[28px] bg-gradient-to-l from-brand-700 to-brand-600 px-4 py-6 text-white shadow-glass sm:px-6 sm:py-7">
          <p className="text-sm font-extrabold tracking-[0.22em] text-brand-100">
            إدارة القالب العربي
          </p>
          <h1 className="mt-3 text-2xl font-black sm:text-3xl md:text-4xl">
            خصص الموقع بالكامل من هنا
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-50 sm:text-lg sm:leading-8">
            أي تعديل على الدوام أو إعدادات الحجز سيعيد توليد المواعيد القادمة
            تلقائيًا حتى لا يتكرر الخطأ الذي واجهناه سابقًا.
          </p>
        </div>

        {errorText ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {errorText}
          </div>
        ) : null}

        {successText ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successText}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          <form
            onSubmit={handleSaveClinic}
            className="admin-card space-y-5 overflow-hidden"
          >
            <SectionHeading
              eyebrow="محتوى العيادة"
              title="بيانات الصفحة الرئيسية"
              subtitle="كل النصوص هنا بالعربية، ويمكنك تعديل أزرار الهيرو وروابطها كما تريد."
            />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  اسم العيادة
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.clinic_name || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, clinic_name: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  نبذة مختصرة عن العيادة
                </label>
                <textarea
                  className="textarea-base w-full"
                  value={clinic.about_text || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, about_text: e.target.value })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  رقم الهاتف
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.phone || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, phone: e.target.value })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  رقم الواتساب
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.whatsapp || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, whatsapp: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 block text-sm font-bold">العنوان</label>
                <input
                  className="input-base w-full"
                  value={clinic.address || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, address: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <MapPinned size={16} />
                  رابط الخريطة
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.map_url || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, map_url: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  رابط الشعار أو الصورة الرئيسية
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.logo_url || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, logo_url: e.target.value })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  شارة الهيرو الصغيرة
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_badge || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, hero_badge: e.target.value })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  عنوان الهيرو الكبير
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_title || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, hero_title: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  وصف الهيرو
                </label>
                <textarea
                  className="textarea-base w-full"
                  value={clinic.hero_subtitle || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, hero_subtitle: e.target.value })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  نص زر الهيرو الأول
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_primary_label || ''}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      hero_primary_label: e.target.value,
                    })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Link2 size={16} />
                  رابط زر الهيرو الأول
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_primary_url || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, hero_primary_url: e.target.value })
                  }
                  placeholder="#booking أو رابط خارجي كامل"
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  نص زر الهيرو الثاني
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_secondary_label || ''}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      hero_secondary_label: e.target.value,
                    })
                  }
                />
              </div>

              <div className="min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Link2 size={16} />
                  رابط زر الهيرو الثاني
                </label>
                <input
                  className="input-base w-full"
                  value={clinic.hero_secondary_url || ''}
                  onChange={(e) =>
                    setClinic({ ...clinic, hero_secondary_url: e.target.value })
                  }
                  placeholder="#contact أو رابط خارجي كامل"
                />
              </div>
            </div>

            <button
              className="btn-primary w-full"
              disabled={busyKey === 'save-clinic'}
            >
              <Save size={18} />
              {busyKey === 'save-clinic' ? 'جارٍ الحفظ...' : 'حفظ بيانات العيادة'}
            </button>
          </form>

          <div className="space-y-6 min-w-0">
            <form
              onSubmit={handleSaveSettings}
              className="admin-card space-y-5 overflow-hidden"
            >
              <SectionHeading
                eyebrow="جدولة المواعيد"
                title="إعدادات الحجز"
                subtitle="أي تعديل هنا يعيد توليد المواعيد القادمة تلقائيًا."
              />

              <div className="min-w-0">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Clock3 size={16} />
                  مدة الموعد
                </label>
                <select
                  className="input-base w-full"
                  value={settings.appointment_duration_minutes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      appointment_duration_minutes: Number(e.target.value),
                    })
                  }
                >
                  {[10, 15, 20, 30, 45, 60].map((value) => (
                    <option key={value} value={value}>
                      {value} دقيقة
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="mb-2 block text-sm font-bold">
                  عدد الأيام المتاحة للحجز مقدمًا
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  className="input-base w-full"
                  value={settings.booking_days_ahead}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      booking_days_ahead: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="btn-primary w-full"
                  disabled={busyKey === 'save-settings'}
                >
                  <Save size={18} />
                  {busyKey === 'save-settings'
                    ? 'جارٍ الحفظ...'
                    : 'حفظ إعدادات الحجز'}
                </button>

                <button
                  type="button"
                  className="btn-secondary w-full"
                  onClick={handleManualRegenerate}
                  disabled={busyKey === 'manual-regenerate'}
                >
                  <CalendarSync size={18} />
                  {busyKey === 'manual-regenerate'
                    ? 'جارٍ التوليد...'
                    : 'إعادة توليد المواعيد'}
                </button>
              </div>
            </form>

            <section className="admin-card overflow-hidden">
              <SectionHeading
                eyebrow="أيام الدوام"
                title="الدوام الأسبوعي"
                subtitle="بعد حفظ أي يوم سيتم تحديث المواعيد القادمة تلقائيًا."
              />

              <div className="space-y-4">
                {workingHours.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5 overflow-hidden"
                  >
                    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[160px_minmax(0,180px)_minmax(0,1fr)_minmax(0,1fr)_130px]">
                      <div className="flex items-center justify-between gap-3 lg:justify-start">
                        <div className="text-lg font-black text-slate-900">
                          {dayNamesAr[row.day_of_week]}
                        </div>
                      </div>

                      <label className="flex min-w-0 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={row.is_active}
                          onChange={(e) =>
                            setWorkingHours((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, is_active: e.target.checked }
                                  : item
                              )
                            )
                          }
                        />
                        <span>فعال</span>
                      </label>

                      <div className="min-w-0">
                        <input
                          type="time"
                          className="input-base w-full"
                          value={row.start_time}
                          onChange={(e) =>
                            setWorkingHours((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, start_time: e.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>

                      <div className="min-w-0">
                        <input
                          type="time"
                          className="input-base w-full"
                          value={row.end_time}
                          onChange={(e) =>
                            setWorkingHours((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? { ...item, end_time: e.target.value }
                                  : item
                              )
                            )
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="btn-primary w-full"
                        onClick={() => handleSaveWorkingHour(row.day_of_week)}
                        disabled={busyKey === `save-hour-${row.day_of_week}`}
                      >
                        <Save size={18} />
                        {busyKey === `save-hour-${row.day_of_week}`
                          ? 'جارٍ الحفظ...'
                          : 'حفظ'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="admin-card overflow-hidden">
          <SectionHeading
            eyebrow="الحجوزات"
            title="قائمة الحجوزات الحالية"
            subtitle="يمكنك إلغاء أي حجز وسيعود الموعد متاحًا مباشرة في الموقع."
          />

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full text-right text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-4 font-extrabold">اسم المريض</th>
                    <th className="px-4 py-4 font-extrabold">رقم الهاتف</th>
                    <th className="px-4 py-4 font-extrabold">موعد الزيارة</th>
                    <th className="px-4 py-4 font-extrabold">الحالة</th>
                    <th className="px-4 py-4 font-extrabold">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-4 font-bold text-slate-900">
                        {appointment.patient_name}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {appointment.patient_phone}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {appointment.time_slots?.start_at
                          ? formatDateTime(appointment.time_slots.start_at)
                          : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                            appointment.status === 'booked'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {appointment.status === 'booked' ? 'محجوز' : 'ملغي'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {appointment.status === 'booked' ? (
                          <button
                            className="btn-danger whitespace-nowrap"
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            disabled={busyKey === `cancel-${appointment.id}`}
                          >
                            <Trash2 size={16} />
                            {busyKey === `cancel-${appointment.id}`
                              ? 'جارٍ الإلغاء...'
                              : 'إلغاء الحجز'}
                          </button>
                        ) : (
                          <span className="font-bold text-slate-500">
                            لا يوجد
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="admin-card space-y-6 overflow-hidden">
            <SectionHeading
              eyebrow="الخدمات"
              title="إدارة الخدمات الطبية"
              subtitle="أضف الخدمات أو عدلها أو احذفها بسهولة."
            />

            <form
              onSubmit={handleAddService}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-4">
                <input
                  className="input-base w-full"
                  placeholder="اسم الخدمة"
                  value={newService.title}
                  onChange={(e) =>
                    setNewService({ ...newService, title: e.target.value })
                  }
                  required
                />
                <textarea
                  className="textarea-base w-full"
                  placeholder="وصف الخدمة"
                  value={newService.description || ''}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      description: e.target.value,
                    })
                  }
                />
                <input
                  type="number"
                  className="input-base w-full"
                  placeholder="ترتيب الظهور"
                  value={newService.sort_order}
                  onChange={(e) =>
                    setNewService({
                      ...newService,
                      sort_order: Number(e.target.value),
                    })
                  }
                />
                <button
                  className="btn-primary w-full"
                  disabled={busyKey === 'add-service'}
                >
                  <Plus size={18} />
                  {busyKey === 'add-service'
                    ? 'جارٍ الإضافة...'
                    : 'إضافة خدمة'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <div className="grid gap-4">
                    <input
                      className="input-base w-full"
                      value={service.title}
                      onChange={(e) =>
                        setServices((prev) =>
                          prev.map((item) =>
                            item.id === service.id
                              ? { ...item, title: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <textarea
                      className="textarea-base w-full"
                      value={service.description || ''}
                      onChange={(e) =>
                        setServices((prev) =>
                          prev.map((item) =>
                            item.id === service.id
                              ? { ...item, description: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      type="number"
                      className="input-base w-full"
                      value={service.sort_order}
                      onChange={(e) =>
                        setServices((prev) =>
                          prev.map((item) =>
                            item.id === service.id
                              ? {
                                  ...item,
                                  sort_order: Number(e.target.value),
                                }
                              : item
                          )
                        )
                      }
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        className="btn-primary w-full sm:w-auto"
                        onClick={() => handleSaveService(service.id)}
                        disabled={busyKey === `save-service-${service.id}`}
                      >
                        <Save size={18} />
                        {busyKey === `save-service-${service.id}`
                          ? 'جارٍ الحفظ...'
                          : 'حفظ'}
                      </button>
                      <button
                        className="btn-danger w-full sm:w-auto"
                        onClick={() => handleDeleteService(service.id)}
                        disabled={busyKey === `delete-service-${service.id}`}
                      >
                        <Trash2 size={16} />
                        {busyKey === `delete-service-${service.id}`
                          ? 'جارٍ الحذف...'
                          : 'حذف'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card space-y-6 overflow-hidden">
            <SectionHeading
              eyebrow="الأطباء"
              title="إدارة الأطباء"
              subtitle="خصص بطاقة كل طبيب بصورة ورابط وصياغة أنيقة."
            />

            <form
              onSubmit={handleAddDoctor}
              className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <div className="grid gap-4">
                <input
                  className="input-base w-full"
                  placeholder="اسم الطبيب"
                  value={newDoctor.name}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, name: e.target.value })
                  }
                  required
                />
                <input
                  className="input-base w-full"
                  placeholder="التخصص"
                  value={newDoctor.specialty || ''}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, specialty: e.target.value })
                  }
                />
                <textarea
                  className="textarea-base w-full"
                  placeholder="نبذة عن الطبيب"
                  value={newDoctor.bio || ''}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, bio: e.target.value })
                  }
                />
                <input
                  className="input-base w-full"
                  placeholder="رابط الصورة"
                  value={newDoctor.image_url || ''}
                  onChange={(e) =>
                    setNewDoctor({ ...newDoctor, image_url: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="input-base w-full"
                  placeholder="ترتيب الظهور"
                  value={newDoctor.sort_order}
                  onChange={(e) =>
                    setNewDoctor({
                      ...newDoctor,
                      sort_order: Number(e.target.value),
                    })
                  }
                />
                <button
                  className="btn-primary w-full"
                  disabled={busyKey === 'add-doctor'}
                >
                  <Plus size={18} />
                  {busyKey === 'add-doctor'
                    ? 'جارٍ الإضافة...'
                    : 'إضافة طبيب'}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="rounded-[24px] border border-slate-200 bg-white p-4"
                >
                  <div className="grid gap-4">
                    <input
                      className="input-base w-full"
                      value={doctor.name}
                      onChange={(e) =>
                        setDoctors((prev) =>
                          prev.map((item) =>
                            item.id === doctor.id
                              ? { ...item, name: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      className="input-base w-full"
                      value={doctor.specialty || ''}
                      onChange={(e) =>
                        setDoctors((prev) =>
                          prev.map((item) =>
                            item.id === doctor.id
                              ? { ...item, specialty: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <textarea
                      className="textarea-base w-full"
                      value={doctor.bio || ''}
                      onChange={(e) =>
                        setDoctors((prev) =>
                          prev.map((item) =>
                            item.id === doctor.id
                              ? { ...item, bio: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      className="input-base w-full"
                      value={doctor.image_url || ''}
                      onChange={(e) =>
                        setDoctors((prev) =>
                          prev.map((item) =>
                            item.id === doctor.id
                              ? { ...item, image_url: e.target.value }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      type="number"
                      className="input-base w-full"
                      value={doctor.sort_order}
                      onChange={(e) =>
                        setDoctors((prev) =>
                          prev.map((item) =>
                            item.id === doctor.id
                              ? {
                                  ...item,
                                  sort_order: Number(e.target.value),
                                }
                              : item
                          )
                        )
                      }
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        className="btn-primary w-full sm:w-auto"
                        onClick={() => handleSaveDoctor(doctor.id)}
                        disabled={busyKey === `save-doctor-${doctor.id}`}
                      >
                        <UserRound size={18} />
                        {busyKey === `save-doctor-${doctor.id}`
                          ? 'جارٍ الحفظ...'
                          : 'حفظ'}
                      </button>
                      <button
                        className="btn-danger w-full sm:w-auto"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        disabled={busyKey === `delete-doctor-${doctor.id}`}
                      >
                        <Trash2 size={16} />
                        {busyKey === `delete-doctor-${doctor.id}`
                          ? 'جارٍ الحذف...'
                          : 'حذف'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}