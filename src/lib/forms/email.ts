import "server-only";
import type { Lead } from "./provider";
import {
  budgets,
  cities,
  labelOf,
  lotStatus,
  projectTypes,
  startWindows,
  type PlanUploadData,
  type StartProjectData,
} from "./schemas";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function table(rows: [string, string][]) {
  return `<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font:15px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#2A2A2A">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="border-bottom:1px solid #E9E2D6;color:#5b6270;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="border-bottom:1px solid #E9E2D6">${v}</td></tr>`,
    )
    .join("")}</table>`;
}

function wrap(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#FAF9F6;padding:32px"><div style="max-width:640px;margin:auto;background:#fff;padding:32px;border:1px solid #E9E2D6">
<p style="font:12px Helvetica,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#756452;margin:0 0 8px">JM Kelley Inc.</p>
<h1 style="font:400 26px Georgia,serif;color:#171917;margin:0 0 24px">${esc(title)}</h1>${body}</div></body></html>`;
}

const toText = (rows: [string, string][]) => rows.map(([k, v]) => `${k}: ${v}`).join("\n");

export function startProjectLead(d: StartProjectData): Lead {
  const where = d.city === "other" ? d.cityOther : labelOf(cities, d.city);
  const type = labelOf(projectTypes, d.projectType);
  const rows: [string, string][] = [
    ["Project type", type],
    ["Location", where],
    ["Lot", labelOf(lotStatus, d.lot)],
    ["Budget", labelOf(budgets, d.budget)],
    ["Target start", labelOf(startWindows, d.start)],
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone || "—"],
    ["Message", d.message || "—"],
    ...(d.ref ? ([["Came from", `/work/${d.ref}`]] as [string, string][]) : []),
  ];
  const html = wrap(
    `New project inquiry: ${type}`,
    table(rows.map(([k, v]) => [k, esc(v).replace(/\n/g, "<br>")])) +
      `<p style="font:14px Helvetica,Arial,sans-serif;margin-top:24px"><a href="mailto:${esc(d.email)}">Reply to ${esc(d.name)}</a></p>`,
  );
  return {
    kind: "start_project",
    subject: `New project inquiry: ${type} in ${where} (${d.name})`,
    fields: Object.fromEntries(rows),
    html,
    text: toText(rows),
    replyTo: d.email,
    autoReply: {
      to: d.email,
      subject: "We received your project details — JM Kelley Inc.",
      html: wrap(
        "Thanks — we've got your project details.",
        `<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">Hi ${esc(d.name.split(" ")[0])},</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">Thanks for telling us about your ${esc(type.toLowerCase())} in ${esc(where)}. We'll review it and get back to you to talk through next steps, usually starting with budget.</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">If it's urgent, call us at <a href="tel:+19498730740">949-873-0740</a> (Mon–Fri, 8am–5pm).</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">— JM Kelley Inc.</p>`,
      ),
      text: `Hi ${d.name.split(" ")[0]},\n\nThanks for telling us about your ${type.toLowerCase()} in ${where}. We'll review it and get back to you to talk through next steps, usually starting with budget.\n\nIf it's urgent, call 949-873-0740 (Mon–Fri, 8am–5pm).\n\n— JM Kelley Inc.`,
    },
  };
}

export function planUploadLead(d: PlanUploadData, uploadsEnabled: boolean): Lead {
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  const fileRows = d.files.map((f) =>
    f.url ? `${f.name} (${mb(f.size)}): ${f.url}` : `${f.name} (${mb(f.size)}) — not uploaded`,
  );
  const rows: [string, string][] = [
    ["Company", d.company],
    ["Contact", d.contactName],
    ["Email", d.email],
    ["Phone", d.phone || "—"],
    ["Project address", d.projectAddress],
    ["Needed by", d.neededBy],
    ["Notes", d.notes || "—"],
    ["Files", fileRows.join("\n")],
  ];
  const filesHtml = d.files
    .map((f) =>
      f.url
        ? `<a href="${esc(f.url)}">${esc(f.name)}</a> (${mb(f.size)})`
        : `${esc(f.name)} (${mb(f.size)}) — not uploaded`,
    )
    .join("<br>");
  const html = wrap(
    `Take-off request: ${d.company}`,
    table([
      ...rows.slice(0, -1).map(([k, v]) => [k, esc(v).replace(/\n/g, "<br>")] as [string, string]),
      ["Files", filesHtml],
    ]) +
      (uploadsEnabled
        ? ""
        : `<p style="font:14px Helvetica,Arial,sans-serif;color:#756452;margin-top:24px">File storage isn't configured (BLOB_READ_WRITE_TOKEN), so files were not uploaded. Ask the sender to email them.</p>`),
  );
  return {
    kind: "plan_upload",
    subject: `Take-off request: ${d.company} — needed by ${d.neededBy}`,
    fields: Object.fromEntries(rows),
    html,
    text: toText(rows),
    replyTo: d.email,
    autoReply: {
      to: d.email,
      subject: "We received your plans — JM Kelley Inc.",
      html: wrap(
        "Plans received.",
        `<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">Hi ${esc(d.contactName.split(" ")[0])},</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">We received ${d.files.length} file${d.files.length === 1 ? "" : "s"} for ${esc(d.projectAddress)}. We'll review the set and confirm the quote and turnaround.</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">Questions: <a href="tel:+19498730740">949-873-0740</a>.</p>
<p style="font:16px/1.6 Helvetica,Arial,sans-serif;color:#2A2A2A">— JM Kelley Inc.</p>`,
      ),
      text: `Hi ${d.contactName.split(" ")[0]},\n\nWe received ${d.files.length} file(s) for ${d.projectAddress}. We'll review the set and confirm the quote and turnaround.\n\nQuestions: 949-873-0740.\n\n— JM Kelley Inc.`,
    },
  };
}
