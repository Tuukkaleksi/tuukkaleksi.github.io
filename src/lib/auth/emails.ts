import { Resend } from "resend";
import { siteConfig } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pilotEmailShell(title: string, bodyHtml: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0b0f;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#0b0c10;border-radius:16px;border:1px solid rgba(59,158,255,0.25);overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#0563bb,#38bdf8);color:#ffffff;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.9;">Neon Drift</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;color:#e2e8f0;font-size:15px;line-height:1.65;">
              ${bodyHtml}
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">Sent via <a href="${escapeHtml(siteUrl)}" style="color:#38bdf8;">${escapeHtml(siteUrl)}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function authFromAddress() {
  return (
    process.env.AUTH_FROM_EMAIL ??
    process.env.CONTACT_FROM_EMAIL ??
    "Neon Drift <onboarding@resend.dev>"
  );
}

async function sendPilotEmail(to: string, subject: string, html: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[auth] RESEND_API_KEY not set — skipping email to", to);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: authFromAddress(),
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[auth] Resend error:", error);
    throw new Error("SEND_FAILED");
  }
}

export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  url: string;
}) {
  const { to, name, url } = params;
  const html = pilotEmailShell(
    "Verify your pilot email",
    `<p style="margin:0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
     <p style="margin:0 0 20px;">Confirm your email to unlock shop purchases and synced pilot data.</p>
     <p style="margin:0;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#38bdf8;color:#0a0b0f;text-decoration:none;border-radius:10px;font-weight:600;">Verify email</a></p>
     <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">If you did not register, you can ignore this message.</p>`,
  );
  await sendPilotEmail(
    to,
    "Verify your Neon Drift pilot email",
    html,
    `Hi ${name},\n\nVerify your email: ${url}\n`,
  );
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  url: string;
}) {
  const { to, name, url } = params;
  const html = pilotEmailShell(
    "Reset your password",
    `<p style="margin:0 0 16px;">Hi <strong>${escapeHtml(name)}</strong>,</p>
     <p style="margin:0 0 20px;">Use the link below to set a new password. It expires soon.</p>
     <p style="margin:0;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 20px;background:#38bdf8;color:#0a0b0f;text-decoration:none;border-radius:10px;font-weight:600;">Reset password</a></p>
     <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;">If you did not request this, ignore this email.</p>`,
  );
  await sendPilotEmail(
    to,
    "Reset your Neon Drift pilot password",
    html,
    `Hi ${name},\n\nReset your password: ${url}\n`,
  );
}

export function isAuthEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
