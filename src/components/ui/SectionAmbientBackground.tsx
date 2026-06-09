"use client";

export function SectionAmbientBackground() {
  return (
    <div className="section-bg-animated pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="section-dot-grid absolute inset-0" />
      <div className="section-orb section-orb-1 absolute -left-[12%] top-[10%] h-[400px] w-[400px] rounded-full" />
      <div className="section-orb section-orb-2 absolute -right-[10%] bottom-[5%] h-[360px] w-[360px] rounded-full" />
    </div>
  );
}
