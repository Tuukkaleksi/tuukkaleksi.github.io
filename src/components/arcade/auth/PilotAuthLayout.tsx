"use client";

type PilotAuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  features: string[];
  children: React.ReactNode;
};

export function PilotAuthLayout({
  eyebrow,
  title,
  subtitle,
  features,
  children,
}: PilotAuthLayoutProps) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-14">
      <section className="relative overflow-hidden rounded-2xl border border-sky-400/15 bg-[#07080c] p-8 sm:p-10">
        <div className="neon-drift-grid pointer-events-none absolute inset-0 opacity-80" aria-hidden />
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-400/70">{eyebrow}</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/45">{subtitle}</p>
          <ul className="mt-8 space-y-3 text-sm text-white/55">
            {features.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400/80" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pilot-auth-enter arcade-gameover-panel rounded-2xl p-6 sm:p-8">
        <div className="arcade-gameover-body">{children}</div>
      </section>
    </div>
  );
}
