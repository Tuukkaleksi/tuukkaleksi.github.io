function buildContentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    // Next.js injects inline hydration/bootstrap scripts; hash-only CSP breaks the app.
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-src 'self' https://w.soundcloud.com https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];

  return directives.join("; ");
}

const sharedHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      'camera=(), microphone=(), geolocation=(), interest-cohort=(), encrypted-media=(self "https://w.soundcloud.com")',
  },
] as const;

/** CSP is production-only — Next.js dev/HMR requires inline scripts that cannot be hash-pinned. */
export function getSecurityHeaders(isProduction: boolean) {
  if (!isProduction) {
    return [...sharedHeaders];
  }

  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
    ...sharedHeaders,
  ];
}
