import { MapPin, MessageCircle, PhoneCall } from 'lucide-react';
import type { ClinicProfile } from '../types/models';
import { formatPhoneHref, formatWhatsappHref } from '../utils/date';
import SectionHeading from './SectionHeading';

export default function ContactSection({ clinic }: { clinic: ClinicProfile | null }) {
  return (
    <section id="contact" className="py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeading
          eyebrow="تواصل معنا"
          title="كل طرق الوصول في مكان واحد"
          subtitle="ضع رقم الهاتف والواتساب والرابط المباشر للموقع الجغرافي لتسهيل وصول المرضى للعيادة." 
        />

        <div className="grid gap-6 md:grid-cols-3">
          <a href={formatPhoneHref(clinic?.phone)} className="card-surface group p-6">
            <div className="mb-5 inline-flex rounded-2xl bg-brand-50 p-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
              <PhoneCall />
            </div>
            <h3 className="text-2xl font-black">اتصال مباشر</h3>
            <p className="mt-3 text-lg text-slate-600">{clinic?.phone || 'أضف رقم الهاتف من لوحة التحكم'}</p>
          </a>

          <a href={formatWhatsappHref(clinic?.whatsapp)} target="_blank" rel="noreferrer" className="card-surface group p-6">
            <div className="mb-5 inline-flex rounded-2xl bg-brand-50 p-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
              <MessageCircle />
            </div>
            <h3 className="text-2xl font-black">واتساب العيادة</h3>
            <p className="mt-3 text-lg text-slate-600">{clinic?.whatsapp || 'أضف رقم الواتساب من لوحة التحكم'}</p>
          </a>

          <a href={clinic?.map_url || '#'} target="_blank" rel="noreferrer" className="card-surface group p-6">
            <div className="mb-5 inline-flex rounded-2xl bg-brand-50 p-4 text-brand-600 group-hover:bg-brand-600 group-hover:text-white">
              <MapPin />
            </div>
            <h3 className="text-2xl font-black">موقع العيادة</h3>
            <p className="mt-3 text-lg text-slate-600">{clinic?.address || 'أضف العنوان من لوحة التحكم'}</p>
          </a>
        </div>
      </div>
    </section>
  );
}
