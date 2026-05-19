export function parseColor(css: string, fallback: string) {
  if (!css || css.startsWith("var(")) return fallback;
  return css;
}
