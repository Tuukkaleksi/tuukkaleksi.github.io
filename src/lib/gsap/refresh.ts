"use client";

import { ScrollTrigger, ensureGsapRegistered } from "@/lib/gsap/register";

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function refreshScrollTriggers() {
  if (typeof window === "undefined") return;
  ensureGsapRegistered();
  ScrollTrigger.refresh();
}

export function refreshScrollTriggersDebounced(delayMs = 120) {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    refreshScrollTriggers();
  }, delayMs);
}
