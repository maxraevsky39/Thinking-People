import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };
const LOG_FILE = (process.env.LEAD_LOG_FILE || "/home/bsadmin/logs/tp-leads.txt");
const events = new Set([
  "attempt_started", "captcha_started", "captcha_passed",
  "attempt_failed", "attempt_succeeded",
]);
const buckets = new Map<string, number>();
let windowStarted = Date.now();
let total = 0;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max).replace(/[\r\n\x00-\x1f]/g, " ") : "";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  // Additional browser-side protection; these events remain untrusted diagnostics.
  if (req.headers["sec-fetch-site"] === "cross-site") return res.status(403).end();
  const body = req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) ||
      !events.has(body.event) || !/^[a-zA-Z0-9-]{8,80}$/.test(body.attemptId || "") ||
      !/^[a-zA-Z0-9-]{8,80}$/.test(body.formSessionId || "")) {
    return res.status(400).end();
  }
  const remote = req.socket.remoteAddress || "unknown";
  const trustedProxy = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remote);
  const ip = text(trustedProxy && typeof req.headers["x-real-ip"] === "string"
    ? req.headers["x-real-ip"] : remote.replace(/^::ffff:/, ""), 64);
  if (Date.now() - windowStarted >= 60_000) {
    buckets.clear(); total = 0; windowStarted = Date.now();
  }
  const count = buckets.get(ip) || 0;
  if (count >= 60 || total >= 1000) return res.status(429).end();
  buckets.set(ip, count + 1); total++;

  // Explicit allowlist: never accept tokens, cookies or arbitrary form fields.
  const fields: Record<string, unknown> = { source: "browser_untrusted" };
  for (const [key, max] of Object.entries({
    attemptId: 80, formSessionId: 80, stage: 40, code: 80,
    message: 400, email: 254, phone: 40, formId: 120, visibility: 20,
  })) fields[key] = text(body[key], max);
  try {
    const url = new URL(text(body.pageUrl, 2000));
    if (url.protocol === "https:" || url.protocol === "http:") fields.pageUrl = url.origin + url.pathname;
  } catch {}
  for (const key of ["elapsedMs", "stageElapsedMs", "httpStatus"]) {
    if (typeof body[key] === "number" && Number.isFinite(body[key])) {
      fields[key] = Math.max(0, Math.min(86_400_000, Math.round(body[key])));
    }
  }
  if (typeof body.online === "boolean") fields.online = body.online;
  fields.userAgent = text(req.headers["user-agent"], 300);
  try {
    await fs.appendFile(LOG_FILE,
      `${new Date().toISOString()} | status=client_${body.event} | ip=${ip} | fields=${JSON.stringify(fields)}\n`, "utf8");
    return res.status(204).end();
  } catch {
    console.error("Failed to write client lead diagnostic");
    return res.status(503).end();
  }
}
