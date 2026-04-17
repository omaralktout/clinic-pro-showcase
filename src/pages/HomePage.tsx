import { useEffect, useState } from 'react';
import { BadgeCheck, CalendarCheck2, Sparkles, Stethoscope } from 'lucide-react';
import { getClinicProfile, getDoctors, getServices } from '../api/public';
import BookingSection from '../components/BookingSection';
import ContactSection from '../components/ContactSection';
import HeroSection from '../components/HeroSection';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';
import SectionHeading from '../components/SectionHeading';
import type { ClinicProfile, Doctor, Service } from '../types/models';

export default function HomePage() {
  const [clinic, setClinic] = useState<ClinicProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorText('');
      try {
        const [clinicData, servicesData, doctorsData] = await Promise.all([
          getClinicProfile(),
          getServices(),
          getDoctors(),
        ]);
        setClinic(clinicData);
        setServices(servicesData);
        setDoctors(doctorsData);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : 'تعذر تحميل بيانات الموقع');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-xl font-black">جارٍ تحميل الموقع...</div>;
  }

  if (errorText) {
    return <div className="grid min-h-screen place-items-center px-4 text-center text-xl font-black text-rose-700">{errorText}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader clinic={clinic} />
      <HeroSection clinic={clinic} />

      <section id="about" className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <SectionHeading
              eyebrow="عن العيادة"
              title="واجهة تعكس مستوى الخدمة والاحتراف"
              subtitle={clinic?.about_text || 'أضف وصفًا مختصرًا من لوحة التحكم ليظهر هنا بشكل جميل ومقنع للمرضى.'}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card-surface p-5">
                <Sparkles className="mb-4 text-brand-600" />
                <h3 className="text-xl font-black">تصميم أنيق بالعربية</h3>
                <p className="mt-3 leading-8 text-slate-600">واجهة راقية وسهلة القراءة، مناسبة للعرض الفوري على أي عيادة أو مركز طبي.</p>
              </div>
              <div className="card-surface p-5">
                <CalendarCheck2 className="mb-4 text-brand-600" />
                <h3 className="text-xl font-black">حجز واضح وسريع</h3>
                <p className="mt-3 leading-8 text-slate-600">المريض يختار التاريخ والوقت المتاح ويؤكد الحجز خلال لحظات.</p>
              </div>
            </div>
          </div>

          <div className="card-surface overflow-hidden p-0">
            <div className="bg-gradient-to-l from-brand-600 to-brand-700 p-8 text-white">
              <p className="text-sm font-extrabold tracking-[0.26em] text-brand-100">صورة قوية للعيادة</p>
              <h3 className="mt-4 text-3xl font-black">كل ما يحتاجه المريض في صفحة واحدة</h3>
            </div>
            <div className="grid gap-4 p-6">
              <div className="rounded-3xl bg-slate-50 p-5">
                <BadgeCheck className="mb-3 text-brand-600" />
                <p className="font-black">عرض الخدمات والأطباء والتواصل والحجز</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <Stethoscope className="mb-3 text-brand-600" />
                <p className="font-black">مرونة كاملة لتخصيص الألوان والنصوص وروابط الهيرو من لوحة التحكم</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="الخدمات"
            title="خدمات طبية مرتبة وواضحة"
            subtitle="اعرض أهم الخدمات الطبية بشكل يسهّل على المريض معرفة ما تقدمه العيادة بسرعة." 
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => (
              <div key={service.id} className="card-surface p-6">
                <div className="inline-flex rounded-2xl bg-brand-50 px-4 py-2 text-sm font-black text-brand-700">خدمة {index + 1}</div>
                <h3 className="mt-5 text-2xl font-black">{service.title}</h3>
                <p className="mt-4 leading-8 text-slate-600">{service.description || 'أضف وصفًا موجزًا للخدمة من لوحة التحكم.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="doctors" className="py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeading
            eyebrow="الطاقم الطبي"
            title="تقديم الأطباء بصورة احترافية"
            subtitle="أضف صور الأطباء وتخصصاتهم ونبذة مختصرة عن كل طبيب لرفع الثقة والانطباع المهني." 
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="card-surface overflow-hidden p-0">
                <div className="h-72 bg-gradient-to-b from-brand-100 to-slate-100">
                  {doctor.image_url ? (
                    <img src={doctor.image_url} alt={doctor.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-6xl font-black text-brand-700">{doctor.name.charAt(0)}</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black">{doctor.name}</h3>
                  <p className="mt-2 text-base font-bold text-brand-700">{doctor.specialty || 'التخصص الطبي'}</p>
                  <p className="mt-4 leading-8 text-slate-600">{doctor.bio || 'أضف نبذة تعريفية مختصرة عن الطبيب.'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BookingSection />
      <ContactSection clinic={clinic} />
      <PublicFooter clinic={clinic} />
    </div>
  );
}
