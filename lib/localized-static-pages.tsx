import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import type { GetStaticPropsContext } from "next";
import { extractPlasmicQueryData } from "@plasmicapp/react-web/lib/prepass";
import type { LocalizedPageProps } from "../components/LocalizedPage";

type Entry = { params: Record<string, string>; url: string };
type Page = { route: string; name: string; collection?: string; singleType?: string; entries: Entry[] };
type Manifest = { defaultLocale: string; locales: string[]; pages: Page[]; urls: string[]; unmanagedUrls: string[] };
export function readStaticManifest(): Manifest {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), ".tp-generated/static-pages.json"), "utf8"));
}
const blockingCollections: Record<string, string> = {
  "/[locale]/blog/[slug]": "articles",
  "/[locale]/cases/[slug]": "caseStudies",
};
async function publishedEntries(route: string, slug: string, locales: string[]): Promise<Entry[]> {
  const collection = blockingCollections[route];
  const token = process.env.STRAPI_BEARER_TOKEN;
  if (!token) throw Error("STRAPI_BEARER_TOKEN is required for static generation");
  const query = `query PublishedPage($locale: I18NLocaleCode!, $slug: String!) {
    ${collection}(locale: $locale, status: PUBLISHED, filters: { slug: { eq: $slug } }, pagination: { pageSize: 2 }) { slug }
  }`;
  const entries = await Promise.all(locales.map(async (locale): Promise<Entry | null> => {
    const response = await fetch(process.env.STRAPI_GRAPHQL_URL || "http://127.0.0.1:8080/graphql", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { locale, slug } }), signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw Error(`Strapi HTTP ${response.status}`);
    const body = await response.json();
    if (body.errors?.length) throw Error("Strapi published-page lookup failed");
    const rows = body.data?.[collection];
    if (!Array.isArray(rows) || rows.length > 1 || rows.some(row => row.slug !== slug)) throw Error("Invalid Strapi published-page response");
    return rows.length ? { params: { locale, slug }, url: route.replace("[locale]", locale).replace("[slug]", encodeURIComponent(slug)) + "/" } : null;
  }));
  return entries.filter((entry): entry is Entry => entry !== null);
}
function routeKeys(route: string) { return Array.from(route.matchAll(/\[([^\]]+)\]/g)).map(m => m[1]); }
export function getLocalizedStaticPaths(route: string) {
  const page = readStaticManifest().pages.find(p => p.route === route);
  if (!page) throw Error(`No static page configuration for ${route}`);
  return { paths: page.entries.map(e => ({ params: Object.fromEntries(routeKeys(route).map(k => [k, e.params[k]])) })), fallback: blockingCollections[route] ? "blocking" as const : false as const };
}
function containsData(value: unknown, field: string): boolean {
  if (!value || typeof value !== "object") return false;
  if (Object.prototype.hasOwnProperty.call(value, field)) {
    const v = (value as any)[field];
    if (Array.isArray(v) ? v.length > 0 : v && typeof v === "object") return true;
  }
  return Object.values(value).some(v => containsData(v, field));
}
export async function getLocalizedStaticProps(route: string, context: GetStaticPropsContext, render: (props: LocalizedPageProps) => ReactElement) {
  const manifest = readStaticManifest();
  const page = manifest.pages.find(p => p.route === route);
  if (!page) throw Error(`No static page configuration for ${route}`);
  let entries = page.entries;
  if (blockingCollections[route]) {
    const { locale, slug } = context.params || {};
    if (typeof locale !== "string" || !manifest.locales.includes(locale) || typeof slug !== "string" || !slug || /[\/?#]/.test(slug)) {
      return { notFound: true as const, revalidate: 60 };
    }
    entries = await publishedEntries(route, slug, manifest.locales);
  }
  const entry = entries.find(e => routeKeys(route).every(k => e.params[k] === context.params?.[k]));
  if (!entry) return { notFound: true as const, ...(blockingCollections[route] ? { revalidate: 60 } : {}) };
  const origin = (process.env.SITE_URL || "https://event.thinking-people.eu").replace(/\/$/, "");
  const props: LocalizedPageProps = {
    locale: entry.params.locale,
    defaultLocale: manifest.defaultLocale,
    params: entry.params,
    canonicalUrl: origin + entry.url,
    languageLinks: entries.filter(e => e.params.slug === entry.params.slug).map(e => ({locale:e.params.locale, url:origin+e.url})),
  };
  const queryCache = await extractPlasmicQueryData(render(props));
  const requiredField = page.collection || page.singleType;
  if (requiredField && !containsData(queryCache, requiredField)) {
    throw Error(`Static data was not prefetched for ${entry.url} (${requiredField}). Check the existing Plasmic query; no query was modified.`);
  }
  for (const value of Object.values(queryCache || {}) as any[]) {
    if (value?.error || value?.data?.errors?.length) throw Error(`Plasmic query failed for ${entry.url}`);
  }
  return { props: { ...props, queryCache } };
}
