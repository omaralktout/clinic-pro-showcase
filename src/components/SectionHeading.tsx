type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
};

export default function SectionHeading({ eyebrow, title, subtitle, light = false }: Props) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow ? (
        <p className={`mb-3 text-sm font-extrabold tracking-[0.28em] ${light ? 'text-brand-200' : 'text-brand-600'}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-black md:text-4xl ${light ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
      {subtitle ? (
        <p className={`mt-4 text-lg leading-8 ${light ? 'text-slate-200' : 'text-slate-600'}`}>{subtitle}</p>
      ) : null}
    </div>
  );
}
