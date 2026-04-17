import { Menu, PhoneCall } from 'lucide-react';
import type { ClinicProfile } from '../types/models';
import { formatPhoneHref } from '../utils/date';

export default function PublicHeader({ clinic }: { clinic: ClinicProfile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3 text-white">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 overflow-hidden">
            {clinic?.logo_url ? (
              <img src={clinic.logo_url} alt={clinic.clinic_name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-black">+</span>
            )}
          </div>
          <div>
            <p className="text-lg font-black">{clinic?.clinic_name || 'اسم العيادة'}</p>
            <p className="text-sm text-slate-300">موقع عيادة احترافي مع حجز مواعيد مباشر</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-200 lg:flex">
          <a href="#about" className="hover:text-white">عن العيادة</a>
          <a href="#services" className="hover:text-white">الخدمات</a>
          <a href="#doctors" className="hover:text-white">الأطباء</a>
          <a href="#booking" className="hover:text-white">احجز الآن</a>
          <a href="#contact" className="hover:text-white">التواصل</a>
        </nav>

        <div className="flex items-center gap-3">
          {clinic?.phone ? (
            <a href={formatPhoneHref(clinic.phone)} className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2.5 font-bold text-slate-900 md:flex">
              <PhoneCall size={18} />
              <span>{clinic.phone}</span>
            </a>
          ) : null}
          <a href="/admin/login" className="rounded-2xl border border-white/15 px-4 py-2.5 font-bold text-white hover:bg-white/10">لوحة التحكم</a>
          <button className="rounded-2xl border border-white/15 p-2.5 text-white lg:hidden" type="button" aria-label="menu">
            <Menu size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
