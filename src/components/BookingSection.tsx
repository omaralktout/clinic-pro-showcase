import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Phone, UserRound } from 'lucide-react';
import { bookAppointment, getAvailableSlots, getSettings } from '../api/public';
import { supabase } from '../lib/supabase';
import type { Slot } from '../types/models';
import { addDays, formatTime, todayLocalDate } from '../utils/date';
import SectionHeading from './SectionHeading';

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<string>(addDays(todayLocalDate(), 1));
  const [bookingDaysAhead, setBookingDaysAhead] = useState<number>(14);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  async function loadSettings() {
    try {
      const settings = await getSettings();
      setBookingDaysAhead(settings.booking_days_ahead || 14);
    } catch {
      setBookingDaysAhead(14);
    }
  }

  async function loadSlots(targetDate: string) {
    setLoadingSlots(true);
    setErrorText('');
    try {
      const data = await getAvailableSlots(targetDate);
      setSlots(data);
      if (!data.some((slot) => slot.id === selectedSlotId)) {
        setSelectedSlotId('');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'تعذر تحميل المواعيد المتاحة');
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    void loadSlots(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const channel = supabase
      .channel('public-live-slots')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_slots' }, () => {
        void loadSlots(selectedDate);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const minDate = todayLocalDate();
  const maxDate = useMemo(() => addDays(minDate, bookingDaysAhead), [bookingDaysAhead, minDate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (!selectedSlotId) {
      setErrorText('اختر وقت الموعد أولًا');
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({
        slotId: selectedSlotId,
        patientName,
        patientPhone,
        notes,
      });

      setSuccessText('تم حجز الموعد بنجاح');
      setPatientName('');
      setPatientPhone('');
      setNotes('');
      setSelectedSlotId('');
      await loadSlots(selectedDate);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'تعذر إتمام الحجز');
      await loadSlots(selectedDate);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="booking" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="احجز الآن"
          title="اختر الموعد المناسب لك"
          subtitle="اعرض الأوقات المتاحة حسب جدول العيادة واحجز خلال ثوانٍ باسمك ورقم هاتفك فقط."
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="overflow-hidden rounded-[32px] bg-hero-grid p-6 text-white shadow-glass md:p-8">
            <p className="mb-4 text-sm font-extrabold tracking-[0.28em] text-brand-100">اختر التاريخ والوقت</p>
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
                <CalendarDays size={18} />
                اختر التاريخ
              </label>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                max={maxDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-[22px] border border-white/10 bg-white/10 px-5 py-4 text-lg font-bold text-white outline-none ring-0 placeholder:text-white/60"
              />
            </div>

            <div className="mt-8">
              <label className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-200">
                <Clock3 size={18} />
                الأوقات المتاحة
              </label>

              {loadingSlots ? (
                <div className="rounded-[26px] border border-white/10 bg-white/10 p-6 text-center text-slate-200">جارٍ تحميل الأوقات...</div>
              ) : slots.length === 0 ? (
                <div className="rounded-[26px] border border-white/10 bg-white/10 p-6 text-center text-lg font-bold text-slate-100">
                  لا توجد مواعيد متاحة لهذا اليوم.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {slots.map((slot) => {
                    const active = selectedSlotId === slot.id;
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`rounded-[24px] border px-4 py-6 text-center text-2xl font-black transition ${
                          active
                            ? 'border-white bg-white text-brand-700 shadow-lg'
                            : 'border-white/10 bg-white/10 text-white hover:bg-white/15'
                        }`}
                      >
                        {formatTime(slot.start_at)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="card-surface p-6 md:p-8">
            <p className="text-sm font-extrabold tracking-[0.24em] text-brand-600">تأكيد الحجز</p>
            <h3 className="mt-4 text-3xl font-black text-slate-900">أدخل بياناتك</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">اختر الوقت المناسب ثم أدخل الاسم ورقم الهاتف ليتم تسجيل الموعد مباشرة.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <UserRound size={18} />
                  الاسم الكامل
                </label>
                <input
                  value={patientName}
                  onChange={(event) => setPatientName(event.target.value)}
                  placeholder="أدخل الاسم الكامل"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={18} />
                  رقم الهاتف
                </label>
                <input
                  value={patientPhone}
                  onChange={(event) => setPatientPhone(event.target.value)}
                  placeholder="07xxxxxxxx"
                  className="input-base"
                  required
                />
              </div>

              <div>
                <label className="mb-2 text-sm font-bold text-slate-700">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="اكتب ملاحظة إن وجدت"
                  className="textarea-base"
                />
              </div>

              {errorText ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorText}</div>
              ) : null}

              {successText ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <span>{successText}</span>
                  </div>
                </div>
              ) : null}

              <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-lg">
                {submitting ? 'جارٍ تأكيد الموعد...' : 'تأكيد حجز الموعد'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
