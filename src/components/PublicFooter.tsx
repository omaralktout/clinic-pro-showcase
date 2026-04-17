import type { ClinicProfile } from '../types/models';

export default function PublicFooter({ clinic }: { clinic: ClinicProfile | null }) {
  return (
    <footer className="bg-slate-950 py-8 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-center md:flex-row md:px-6 md:text-right">
        <div>
          <p className="text-lg font-black text-white">{clinic?.clinic_name || 'اسم العيادة'}</p>
          <p className="mt-1 text-sm">واجهة عصرية بالعربية مع نظام حجز مباشر ولوحة تحكم بسيطة.</p>
        </div>
        <p className="text-sm">تم تطوير هذا القالب ليكون جاهزًا للعرض على العملاء مباشرة.</p>
      </div>
    </footer>
  );
}
