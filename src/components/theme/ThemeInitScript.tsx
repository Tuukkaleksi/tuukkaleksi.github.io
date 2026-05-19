/**
 * Blocking theme script for the initial paint (SSR-safe, no React 19 script-in-component warning).
 * Must be the first child of <body>.
 */
export function ThemeInitScript() {
  const script = `
(function () {
  try {
    var theme = localStorage.getItem('theme') || 'system';
    var resolved =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    var root = document.documentElement;
    if (resolved === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = resolved;
  } catch (e) {}
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
