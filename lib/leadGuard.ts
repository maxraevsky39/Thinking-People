import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, renameSync } from "fs";

export const WINDOW_MS = 180_000;
export const MIN_FILL_MS = 3_000;
const directory = (process.env.LEAD_GUARD_DIR || "/home/bsadmin/shared/tp-site/lead-guard");
mkdirSync(directory, { recursive: true, mode: 0o700 });
const secretPath = `${directory}/secret`;
try { writeFileSync(secretPath, randomBytes(32), { flag: "wx", mode: 0o600 }); }
catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
const secret = readFileSync(secretPath);
const statePath = `${directory}/success.json`;
let successes: Record<string, number> = {};
try { successes = JSON.parse(readFileSync(statePath, "utf8")); }
catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
// The production service runs one Node process. Reserve synchronously before any await.
const pending = new Set<string>();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const sign = (value: string) => createHmac("sha256", secret).update(value).digest("hex");

export function issueFormToken() {
  const value = `${Date.now()}.${randomBytes(16).toString("hex")}`;
  return `${value}.${sign(value)}`;
}

export function checkFormToken(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3 || !/^[a-f0-9]{64}$/.test(parts[2])) return false;
  const value = `${parts[0]}.${parts[1]}`;
  if (!timingSafeEqual(Buffer.from(parts[2], "hex"), Buffer.from(sign(value), "hex"))) return false;
  const age = Date.now() - Number(parts[0]);
  return Number.isFinite(age) && age >= MIN_FILL_MS && age <= 86_400_000;
}

export function reserveLead(ip: string, email: string, phone: string) {
  const keys = [`ip:${ip}`, ...(email ? [`email:${email.toLowerCase()}`] : []), ...(phone ? [`phone:${phone}`] : [])].map(hash);
  const now = Date.now();
  for (const key of Object.keys(successes)) if (successes[key] <= now) delete successes[key];
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (pending.has(key) || successes[key] > now) {
      return { ok: false as const, status: index === 0 ? "rate_limited" : "duplicate", seconds: pending.has(key) ? 3 : Math.ceil((successes[key] - now) / 1000) };
    }
  }
  keys.forEach(key => pending.add(key));
  return {
    ok: true as const,
    release: () => keys.forEach(key => pending.delete(key)),
    commit: () => {
      keys.forEach(key => { successes[key] = Date.now() + WINDOW_MS; });
      writeFileSync(`${statePath}.tmp`, JSON.stringify(successes), { mode: 0o600 });
      renameSync(`${statePath}.tmp`, statePath);
    },
  };
}
