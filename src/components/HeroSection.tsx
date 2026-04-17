import {
  ArrowUpLeft,
  CalendarClock,
  Hospital,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import type { ClinicProfile } from '../types/models';

function normalizeUrl(url?: string | null) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function HeroSection({
  clinic,
}: {
  clinic: ClinicProfile | null;
}) {
  const title = clinic?.hero_title || clinic?.clinic_name || 'اسم العيادة';
  const subtitle =
    clinic?.hero_subtitle ||
    clinic?.about_text ||
    'واجهة عصرية للعيادة مع تجربة حجز سهلة وسريعة للمرضى.';

  const imageUrl = normalizeUrl(clinic?.logo_url);
  const primaryUrl = clinic?.hero_primary_url || '#booking';
  const secondaryUrl = clinic?.hero_secondary_url || '#contact';

  return (
    <section className="relative overflow-hidden bg-hero-grid">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_22%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-brand-100">
            <ShieldCheck size={16} />
            {clinic?.hero_badge || 'موقع طبي احترافي'}
          </span>

          <h1 className="mt-6 text-4xl font-black leading-[1.2] text-white md:text-6xl md:leading-[1.15]">
            {title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-200 md:text-xl">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={primaryUrl}
              className="btn-primary bg-white text-slate-950 hover:bg-slate-100"
            >
              <CalendarClock size={18} />
              {clinic?.hero_primary_label || 'احجز موعدك الآن'}
            </a>

            <a
              href={secondaryUrl}
              className="btn-secondary border-white/15 bg-white/10 text-white hover:bg-white/15"
            >
              <ArrowUpLeft size={18} />
              {clinic?.hero_secondary_label || 'اعرف موقع العيادة'}
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-glass">
              <Hospital className="mb-3 text-brand-200" />
              <p className="font-black">خدمة منظمة</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                عرض احترافي للعيادة والخدمات والأطباء في صفحة واحدة قوية.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-glass">
              <CalendarClock className="mb-3 text-brand-200" />
              <p className="font-black">حجز مباشر</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                المريض يختار التاريخ والوقت المتاح مباشرة بدون تعقيد.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-glass">
              <MapPin className="mb-3 text-brand-200" />
              <p className="font-black">وصول أسرع</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">
                تسهيل الوصول للعنوان والتواصل والحجز من الجوال أو الكمبيوتر.
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface overflow-hidden bg-white/95 p-0">
          <div className="relative h-[260px] overflow-hidden md:h-[320px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={clinic?.clinic_name || 'صورة العيادة'}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : null}

            {!imageUrl && (
              <div className="flex h-full items-center justify-center bg-gradient-to-l from-brand-700 to-brand-600 p-8 text-center text-white">
                <div>
                  <p className="text-sm font-extrabold tracking-[0.25em] text-brand-100">
                    {clinic?.hero_badge || 'انطباع طبي احترافي'}
                  </p>
                  <h3 className="mt-4 text-3xl font-black">واجهة تليق بالعيادة</h3>
                  <p className="mt-4 text-base leading-8 text-brand-50">
                    تصميم عصري مرتب يعطي ثقة للمريض ويعرض كل المعلومات المهمة بطريقة
                    نظيفة وواضحة.
                  </p>
                </div>
              </div>
            )}

            {imageUrl && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent p-6 text-white">
                <p className="text-sm font-extrabold tracking-[0.25em] text-brand-100">
                  {clinic?.hero_badge || 'انطباع طبي احترافي'}
                </p>
                <h3 className="mt-3 text-3xl font-black">
                  {clinic?.clinic_name || 'اسم العيادة'}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-100">
                  {clinic?.hero_subtitle ||
                    clinic?.about_text ||
                    'تصميم عصري مرتب يعطي ثقة للمريض ويعرض كل المعلومات المهمة بطريقة نظيفة وواضحة.'}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 p-6 text-slate-700 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">اسم العيادة</p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {clinic?.clinic_name || 'اسم العيادة'}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-500">رقم الهاتف</p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {clinic?.phone || '0790000000'}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
              <p className="text-sm font-bold text-slate-500">العنوان</p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {clinic?.address || 'العنوان هنا'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}