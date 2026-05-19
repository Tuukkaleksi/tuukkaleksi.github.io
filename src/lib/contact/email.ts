import { Resend } from "resend";
import type { ContactBody } from "@/lib/contact/schema";
import { siteConfig } from "@/lib/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildContactEmailHtml(data: ContactBody) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #dde3ec;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:#0563bb;color:#ffffff;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">Portfolio contact</p>
              <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">New message from ${escapeHtml(data.name)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;color:#272829;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
              <p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(data.name)} &lt;${escapeHtml(data.email)}&gt;</p>
              <p style="margin:0 0 20px;"><strong>Locale:</strong> ${escapeHtml(data.locale ?? "—")}</p>
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#45505b;">Message</p>
              <div style="padding:16px;background:#eef1f6;border-radius:12px;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
              <p style="margin:24px 0 0;font-size:12px;color:#45505b;">Sent via <a href="${escapeHtml(siteUrl)}" style="color:#0563bb;">${escapeHtml(siteUrl)}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendContactEmail(data: ContactBody) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: data.email,
    subject: `[Portfolio] ${data.subject}`,
    html: buildContactEmailHtml(data),
    text: [
      `From: ${data.name} <${data.email}>`,
      `Subject: ${data.subject}`,
      `Locale: ${data.locale ?? "—"}`,
      "",
      data.message,
    ].join("\n"),
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    throw new Error("SEND_FAILED");
  }
}
