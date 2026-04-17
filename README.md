# Clinic Pro Arabic

مشروع React + TypeScript + Tailwind + Supabase لموقع عيادة عربي مع لوحة تحكم.

## التشغيل

```bash
npm install
npm run dev
```

## البيئة

انسخ `.env.example` إلى `.env` ثم ضع بيانات Supabase.

## مهم جدًا

شغّل ملف `supabase_patch.sql` مرة واحدة داخل Supabase SQL Editor قبل استخدام لوحة التحكم الكاملة.

## النشر على Vercel

- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

ويوجد `vercel.json` لمعالجة routes مثل `/admin/login` و `/admin/dashboard`.
