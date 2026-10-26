import "server-only";

/**
 * Where leads go. Swap providers with LEAD_PROVIDER without touching the forms:
 *   resend  - email via Resend (default when RESEND_API_KEY is set)
 *   hubspot - POST JSON to HUBSPOT_WEBHOOK_URL (e.g. a HubSpot workflow webhook)
 *   console - log only (default with no keys; used by tests)
 */
export type Lead = {
  kind: "start_project" | "plan_upload";
  subject: string;
  /** flat key/value summary, also used for webhooks/CRM fields */
  fields: Record<string, string>;
  html: string;
  text: string;
  replyTo: string;
  autoReply: { to: string; subject: string; html: string; text: string };
};

export interface LeadProvider {
  name: string;
  send(lead: Lead): Promise<void>;
}

class ConsoleProvider implements LeadProvider {
  name = "console";
  async send(lead: Lead) {
    console.info(`[lead:${lead.kind}] ${lead.subject}\n${lead.text}`);
  }
}

class ResendProvider implements LeadProvider {
  name = "resend";
  constructor(
    private apiKey: string,
    private to: string,
    private from: string,
  ) {}
  async send(lead: Lead) {
    const { Resend } = await import("resend");
    const resend = new Resend(this.apiKey);
    const notify = await resend.emails.send({
      from: this.from,
      to: this.to,
      replyTo: lead.replyTo,
      subject: lead.subject,
      html: lead.html,
      text: lead.text,
    });
    if (notify.error) throw new Error(`Resend: ${notify.error.message}`);
    // The auto-reply is best effort: a failure here must not lose the lead.
    const reply = await resend.emails.send({ from: this.from, ...lead.autoReply });
    if (reply.error) console.warn("[lead] auto-reply failed:", reply.error.message);
  }
}

class HubSpotWebhookProvider implements LeadProvider {
  name = "hubspot";
  constructor(private url: string) {}
  async send(lead: Lead) {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: lead.kind, subject: lead.subject, ...lead.fields }),
    });
    if (!res.ok) throw new Error(`HubSpot webhook: HTTP ${res.status}`);
  }
}

export function getLeadProvider(): LeadProvider {
  const choice = process.env.LEAD_PROVIDER || (process.env.RESEND_API_KEY ? "resend" : "console");
  if (choice === "resend") {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.LEAD_TO_EMAIL;
    if (!key || !to) throw new Error("LEAD_PROVIDER=resend needs RESEND_API_KEY and LEAD_TO_EMAIL");
    return new ResendProvider(
      key,
      to,
      process.env.LEAD_FROM_EMAIL || "JM Kelley Inc. <onboarding@resend.dev>",
    );
  }
  if (choice === "hubspot") {
    const url = process.env.HUBSPOT_WEBHOOK_URL;
    if (!url) throw new Error("LEAD_PROVIDER=hubspot needs HUBSPOT_WEBHOOK_URL");
    return new HubSpotWebhookProvider(url);
  }
  return new ConsoleProvider();
}
