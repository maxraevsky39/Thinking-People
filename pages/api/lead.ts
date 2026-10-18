import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs/promises";
import { checkFormToken, issueFormToken, reserveLead } from "../../lib/leadGuard";

type CaptchaResponse = {
  status?: "ok" | "failed";
  message?: string;
  host?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d+$/;



// Лог рядом с приложением
const LOG_FILE = (process.env.LEAD_LOG_FILE || "/home/bsadmin/logs/tp-leads.txt");

async function validateCaptcha(
  token: string,
  ip: string
): Promise<boolean> {
  const secret = process.env.YANDEX_SMARTCAPTCHA_SECRET_KEY;

  if (!secret || !token) {
    return false;
  }

  const params = new URLSearchParams({
    secret,
    token,
    ip,
  });

  const response = await fetch(
    "https://smartcaptcha.cloud.yandex.ru/validate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      signal: AbortSignal.timeout(5_000),
    }
  );

  if (!response.ok) {
    throw new Error(`SmartCaptcha HTTP ${response.status}`);
  }

  const result = (await response.json()) as CaptchaResponse;

  return result.status === "ok";
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "";

  if (digits.startsWith("8")) return "+7" + digits.slice(1);
  if (digits.startsWith("7")) return "+" + digits;
  if (digits.length === 10) return "+7" + digits;

  return "+" + digits;
}

function getClientIp(req: NextApiRequest) {
  const remote = req.socket.remoteAddress || "unknown";
  const realIp = req.headers["x-real-ip"];
  // nginx overwrites X-Real-IP; X-Forwarded-For may contain client-supplied values.
  if (["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remote) && typeof realIp === "string") {
    return realIp.trim();
  }
  return remote.replace(/^::ffff:/, "");
}

async function writeLog(data: {
  status: string;
  ip: string;
  email?: string;
  phone?: string;
  message?: string;
  fields?: unknown;
}) {
  const line = [
    new Date().toISOString(),
    `status=${data.status}`,
    `ip=${data.ip}`,
    data.email ? `email=${data.email.replace(/[\r\n]/g, " ")}` : "",
    data.phone ? `phone=${data.phone.replace(/[\r\n]/g, " ")}` : "",
    data.message ? `message=${JSON.stringify(data.message)}` : "",
    `fields=${JSON.stringify(data.fields ?? {})}`,
  ]
    .filter(Boolean)
    .join(" | ");

  try {
    await fs.appendFile(LOG_FILE, line + "\n", "utf8");
  } catch (error) {
    console.error("Failed to write lead log:", error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ formToken: issueFormToken() });
  }
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  const ip = getClientIp(req);
  const body = req.body || {};
  const log = (data: Parameters<typeof writeLog>[0]) => writeLog({ ...data, fields: body });

  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();

  /*
   * VALIDATION
   */
  if (email && !EMAIL_PATTERN.test(email)) {
    await log({
      status: "invalid_email",
      ip,
      email,
    });

    return res.status(400).json({
      ok: false,
      error: "Введите корректный email",
    });
  }

  if (phone && !PHONE_PATTERN.test(phone)) {
    await log({
      status: "invalid_phone",
      ip,
      phone,
    });

    return res.status(400).json({
      ok: false,
      error: "Телефон может содержать только цифры и + в начале",
    });
  }

  const normalizedPhone = normalizePhone(phone);

  if (!checkFormToken(body.formToken)) {
    await log({ status: "invalid_form_time", ip, email, phone: normalizedPhone });
    return res.status(400).json({ ok: false, error: "Подождите 3 секунды и повторите отправку. Если ошибка повторится, обновите страницу." });
  }

  const reservation = reserveLead(ip, email, normalizedPhone);
  if (!reservation.ok) {
    res.setHeader("Retry-After", String(reservation.seconds));
    await log({ status: reservation.status, ip, email, phone: normalizedPhone, message: `Повторная отправка через ${reservation.seconds} сек.` });
    return res.status(429).json({ ok: false, error: `Повторную заявку можно отправить через ${reservation.seconds} сек.` });
  }
  try {
  const payload = {
    ...body,
    email,
    phone: normalizedPhone,
    source: "plasmic_form",
  };

  const captchaToken = String(body.captchaToken || "");

let captchaPassed = false;

try {
  captchaPassed = await validateCaptcha(captchaToken, ip);
} catch (error) {
  console.error("SmartCaptcha validation error:", error);
  await log({ status: "captcha_error", ip, email, phone: normalizedPhone });

  return res.status(503).json({
    ok: false,
    error: "Сервис проверки временно недоступен",
  });
}

if (!captchaPassed) {
  await log({
    status: "captcha_failed",
    ip,
  });

  return res.status(403).json({
    ok: false,
    error: "Проверка не пройдена. Попробуйте ещё раз.",
  });
}



  const webhookUrl =
    process.env.LEAD_WEBHOOK_URL;

  if (!webhookUrl) return res.status(503).json({ ok: false, error: "Webhook is not configured" });
  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });

    if (!webhookResponse.ok) {
      await log({
        status: "webhook_error",
        ip,
        email,
        phone: normalizedPhone,
        message: `HTTP ${webhookResponse.status}`,
      });

      return res.status(502).json({
        ok: false,
        error: "Webhook request failed",
      });
    }

    reservation.commit();
    await log({
      status: "success",
      ip,
      email,
      phone: normalizedPhone,
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    await log({
      status: "webhook_exception",
      ip,
      email,
      phone: normalizedPhone,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    return res.status(502).json({
      ok: false,
      error: "Webhook request failed",
    });
  }
  } finally {
    reservation.release();
  }
}
