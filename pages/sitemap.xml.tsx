import type { GetServerSideProps } from "next";
import { readStaticManifest } from "../lib/localized-static-pages";
const escapeXml = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
export const getServerSideProps: GetServerSideProps = async ({res}) => {
  const origin = (process.env.SITE_URL || "https://event.thinking-people.eu").replace(/\/$/, "");
  const manifest = readStaticManifest();
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.write(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...manifest.urls,...manifest.unmanagedUrls].map(url=>`<url><loc>${escapeXml(origin+url)}</loc></url>`).join("")}</urlset>`);
  res.end();
  return {props:{}};
};
export default function Sitemap() { return null; }
