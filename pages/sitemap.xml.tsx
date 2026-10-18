import type { GetServerSideProps } from "next";
import {
  strapiGraphqlRequest,
  type StrapiCollectionName,
} from "../lib/strapi-static-pages";

const SITE_URL = (
  process.env.SITE_URL ??
  "http://82.26.91.140"
).replace(/\/$/, "");

const PAGE_SIZE = 100;

type StrapiSitemapItem = {
  slug?: string | null;
  updatedAt?: string | null;
};

type SitemapItem = {
  path: string;
  lastmod?: string | null;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
};

const dynamicCollections: Array<{
  collection: StrapiCollectionName;
  prefix: string;
  changefreq: SitemapItem["changefreq"];
  priority: number;
}> = [
  {
    collection: "articles",
    prefix: "/blog",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    collection: "events",
    prefix: "/events",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    collection: "programs",
    prefix: "/programs",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    collection: "experts",
    prefix: "/experts",
    changefreq: "monthly",
    priority: 0.8,
  },
];

const staticPages: SitemapItem[] = [{ path: "/", changefreq: "weekly", priority: 1 }];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeDate(
  value?: string | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}

function createAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function getCollectionItems(
  collection: StrapiCollectionName
): Promise<StrapiSitemapItem[]> {
  const items = new Map<string, StrapiSitemapItem>();

  let page = 1;

  while (true) {
    const data = await strapiGraphqlRequest<
      Record<StrapiCollectionName, StrapiSitemapItem[]>
    >(
      `
        query SitemapCollection(
          $page: Int!
          $pageSize: Int!
        ) {
          ${collection}(
            pagination: {
              page: $page
              pageSize: $pageSize
            }
            filters: {
                showOnSite: {
                    eq: true
                }
            }
          ) {
            slug
            updatedAt
          }
        }
      `,
      {
        page,
        pageSize: PAGE_SIZE,
      }
    );

    const currentPage = data[collection] ?? [];

    if (currentPage.length === 0) {
      break;
    }

    let addedItems = 0;

    for (const item of currentPage) {
      const slug = item.slug?.trim();

      if (!slug || items.has(slug)) {
        continue;
      }

      items.set(slug, item);
      addedItems += 1;
    }

    // Защита от бесконечного цикла, если Strapi
    // перестанет учитывать pagination.page.
    if (addedItems === 0) {
      break;
    }

    page += 1;
  }

  return Array.from(items.values());
}

async function getDynamicPages(): Promise<SitemapItem[]> {
  const collections = await Promise.all(
    dynamicCollections.filter(config => (process.env.STRAPI_ENABLED_COLLECTIONS || "").split(",").includes(config.collection)).map(async (config) => {
      const items = await getCollectionItems(
        config.collection
      );

      return items
        .filter(
          (
            item
          ): item is StrapiSitemapItem & {
            slug: string;
          } =>
            typeof item.slug === "string" &&
            item.slug.trim().length > 0
        )
        .map((item): SitemapItem => ({
          path: `${config.prefix}/${encodeURIComponent(
            item.slug.trim()
          )}`,
          lastmod: item.updatedAt,
          changefreq: config.changefreq,
          priority: config.priority,
        }));
    })
  );

  return collections.flat();
}

function buildSitemap(items: SitemapItem[]): string {
  const uniqueItems = new Map<string, SitemapItem>();

  for (const item of items) {
    uniqueItems.set(item.path, item);
  }

  const urls = Array.from(uniqueItems.values())
    .sort((left, right) =>
      left.path.localeCompare(right.path)
    )
    .map((item) => {
      const absoluteUrl = createAbsoluteUrl(item.path);
      const lastmod = normalizeDate(item.lastmod);

      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl)}</loc>`,
        lastmod
          ? `    <lastmod>${escapeXml(lastmod)}</lastmod>`
          : null,
        `    <changefreq>${item.changefreq}</changefreq>`,
        `    <priority>${item.priority.toFixed(1)}</priority>`,
        "  </url>",
      ]
        .filter(
          (line): line is string => line !== null
        )
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
  ].join("\n");
}

export const getServerSideProps: GetServerSideProps =
  async ({ res }) => {
    try {
      const dynamicPages = await getDynamicPages();

      const sitemap = buildSitemap([
        ...staticPages,
        ...dynamicPages,
      ]);

      res.statusCode = 200;
      res.setHeader(
        "Content-Type",
        "application/xml; charset=utf-8"
      );
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=900, stale-while-revalidate=86400"
      );
      res.end(sitemap);
    } catch (error) {
      console.error("Failed to build sitemap:", error);

      res.statusCode = 500;
      res.setHeader(
        "Content-Type",
        "text/plain; charset=utf-8"
      );
      res.end("Failed to build sitemap");
    }

    return {
      props: {},
    };
  };

export default function SitemapXml() {
  return null;
}
