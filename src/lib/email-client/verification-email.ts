import { sendEmail } from "@/lib/email-client/infobip";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendVerificationEmail({
  email,
  name,
  url,
}: {
  email: string;
  name: string;
  url: string;
}) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  await sendEmail({
    to: email,
    subject: "Verify your email address",
    text: `Hi ${name},\n\nVerify your email address to finish setting up your Rick and Morty Finder account:\n${url}\n\nIf you did not sign up, you can ignore this email.`,
    html: ` <p>Hi ${safeName},</p>
            <p>Verify your email address to finish setting up your Rick and Morty Finder account.</p>
            <p><a href="${safeUrl}">Verify email address</a></p>
            <p>If you did not sign up, you can ignore this email.</p>`,
  });
}
