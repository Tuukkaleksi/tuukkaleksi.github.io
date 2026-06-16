"use client";

import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";

type MarketTeaserPrimaryCtaProps = {
  label: string;
};

export function MarketTeaserPrimaryCta({ label }: MarketTeaserPrimaryCtaProps) {
  return (
    <MagneticButton
      href="/market"
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition hover:bg-primary-hover"
    >
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </MagneticButton>
  );
}
