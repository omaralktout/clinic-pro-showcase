import { CalendarClock, LayoutDashboard, LogOut, Stethoscope } from 'lucide-react';
import type { ReactNode } from 'react';

export default function AdminShell({
  children,
  onLogout,
}: {
  children: ReactNode;
  onLogout: () => void | Promise<void>;
}) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[320px_1fr]">
        <aside className="bg-slate-950 px-6 py-8 text-white">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 inline-flex rounded-3xl bg-brand-600 p-4">
              <Stethoscope size={24} />
            </div>
            <h1 className="text-3xl font-black">لوحة إدارة العيادة</h1>
            <p className="mt-4 leading-8 text-slate-300">تحكم كامل بالمحتوى، أوقات الدوام، الحجوزات، وروابط الهيرو من مكان واحد.</p>
          </div>

          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 font-bold text-white">
              <LayoutDashboard size={18} />
              <span>إدارة كاملة</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-slate-200">
              <CalendarClock size={18} />
              <span>حجوزات ومواعيد</span>
            </div>
          </div>

          <button onClick={onLogout} className="btn-secondary mt-8 w-full border-white/10 bg-white/5 text-white hover:bg-white/10">
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </aside>

        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
