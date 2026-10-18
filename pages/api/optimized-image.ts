import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const ALLOWED_FORMATS = new Set(["webp", "avif", "jpeg", "png"]);
const ALLOWED_REMOTE_HOSTS = new Set([
  ...(process.env.IMAGE_ALLOWED_HOSTS || "82.26.91.140").split(","),
]);

function singleQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function integerInRange(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, min), max)
    : fallback;
}

function sourceUrl(rawUrl: string, requestHost: string | undefined) {
  const base = new URL(process.env.SITE_URL || "http://82.26.91.140");
  const host = base.hostname;
  const url = new URL(rawUrl, base);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported image URL protocol");
  }

  if (url.hostname !== host && !ALLOWED_REMOTE_HOSTS.has(url.hostname)) {
    throw new Error("Image host is not allowed");
  }

  return url;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawUrl = singleQueryValue(req.query.url);
  const requestedFormat = singleQueryValue(req.query.format) || "webp";

  if (!rawUrl || !ALLOWED_FORMATS.has(requestedFormat)) {
    res.status(400).json({ error: "Invalid image URL or format" });
    return;
  }

  const width = integerInRange(
    singleQueryValue(req.query.width),
    800,
    16,
    3840
  );
  const quality = integerInRange(
    singleQueryValue(req.query.quality),
    75,
    25,
    100
  );

  try {
    const url = sourceUrl(rawUrl, req.headers.host);
    const upstream = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        Accept: "image/*",
        "User-Agent": "BusinessSpeech-ImageOptimizer/1.0",
      },
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "Unable to load source image" });
      return;
    }

    const declaredLength = Number(upstream.headers.get("content-length") || 0);
    if (declaredLength > MAX_SOURCE_BYTES) {
      res.status(413).json({ error: "Source image is too large" });
      return;
    }

    const source = Buffer.from(await upstream.arrayBuffer());
    if (!source.length || source.length > MAX_SOURCE_BYTES) {
      res.status(413).json({ error: "Source image is empty or too large" });
      return;
    }

    let pipeline = sharp(source, { animated: true })
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
      });

    switch (requestedFormat) {
      case "avif":
        pipeline = pipeline.avif({ quality, effort: 4 });
        break;
      case "jpeg":
        pipeline = pipeline
          .flatten({ background: "#ffffff" })
          .jpeg({ quality, mozjpeg: true });
        break;
      case "png":
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
        break;
      default:
        pipeline = pipeline.webp({ quality, effort: 4 });
    }

    const output = await pipeline.toBuffer();
    const contentType =
      requestedFormat === "jpeg"
        ? "image/jpeg"
        : `image/${requestedFormat}`;

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      "public, max-age=2678400, stale-while-revalidate=86400"
    );
    res.setHeader("Content-Length", String(output.length));
    res.status(200).send(output);
  } catch (error) {
    console.error("Explicit image optimization failed", error);
    res.status(500).json({ error: "Image optimization failed" });
  }
}
