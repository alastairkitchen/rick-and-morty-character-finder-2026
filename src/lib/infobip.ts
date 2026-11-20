interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

// Infobip Email API v3: https://www.infobip.com/docs/api/channels/email
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const baseUrl = requireEnv("INFOBIP_BASE_URL").replace(/\/+$/, "");
  const apiKey = requireEnv("INFOBIP_API_KEY");
  const fromEmail = requireEnv("INFOBIP_FROM_EMAIL");
  const fromName = process.env.INFOBIP_FROM_NAME;

  const body = new FormData();
  body.append("from", fromName ? `${fromName} <${fromEmail}>` : fromEmail);
  body.append("to", to);
  body.append("subject", subject);
  body.append("html", html);
  body.append("text", text);

  const url = /^https?:\/\//.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
  const response = await fetch(`${url}/email/3/send`, {
    method: "POST",
    headers: {
      Authorization: `App ${apiKey}`,
      Accept: "application/json",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `Infobip email send failed (${response.status}): ${await response.text()}`,
    );
  }
}
