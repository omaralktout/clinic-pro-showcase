import { useEffect, useState } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession, signInAdmin } from '../api/admin';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    async function checkSession() {
      const session = await getCurrentSession();
      if (session) navigate('/admin/dashboard', { replace: true });
    }

    void checkSession();
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorText('');

    try {
      await signInAdmin(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(37,99,235,.18),transparent_26%),linear-gradient(180deg,#f8fbff,#edf4ff)] px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-soft lg:grid-cols-[.95fr_1.05fr]">
        <div className="bg-hero-grid p-8 text-white md:p-12">
          <div className="inline-flex rounded-3xl bg-white/10 p-4">
            <ShieldCheck size={26} />
          </div>
          <h1 className="mt-8 text-4xl font-black leading-tight">لوحة إدارة العيادة</h1>
          <p className="mt-6 text-lg leading-9 text-slate-200">تسجيل دخول آمن لإدارة المواعيد، أوقات الدوام، الخدمات، الأطباء، وروابط الهيرو في الواجهة الرئيسية.</p>
        </div>

        <div className="p-8 md:p-12">
          <p className="text-sm font-extrabold tracking-[0.25em] text-brand-600">تسجيل الدخول</p>
          <h2 className="mt-4 text-3xl font-black text-slate-900">مرحبًا بعودتك</h2>
          <p className="mt-3 text-lg leading-8 text-slate-600">استخدم حساب الأدمن الموجود في Supabase للدخول إلى لوحة التحكم.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">البريد الإلكتروني</label>
              <input type="email" className="input-base" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">كلمة المرور</label>
              <input type="password" className="input-base" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>

            {errorText ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{errorText}</div>
            ) : null}

            <button className="btn-primary w-full py-4 text-lg" disabled={loading}>
              <LogIn size={18} />
              {loading ? 'جارٍ تسجيل الدخول...' : 'دخول إلى لوحة التحكم'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
