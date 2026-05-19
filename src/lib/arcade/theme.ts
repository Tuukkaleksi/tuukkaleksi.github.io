import type { ThemeColors } from "@/lib/arcade/types";

/** Arcade always runs on a dark palette; uses site primary for brand accent. */
export function readThemeColors(): ThemeColors {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const primary = style.getPropertyValue("--primary").trim() || "#3b9eff";
  const primaryHover = style.getPropertyValue("--primary-hover").trim() || "#5aafff";
  return {
    background: "#0a0b0d",
    foreground: "#e8eaed",
    primary,
    primaryHover,
    surface: "#14161a",
  };
}
