export type StrapiCollectionName =
  | "articles"
  | "events"
  | "programs"
  | "experts";

const STRAPI_GRAPHQL_URL =
  process.env.STRAPI_GRAPHQL_URL ??
  "http://127.0.0.1:8080/graphql";

const STRAPI_BEARER_TOKEN =
  process.env.STRAPI_BEARER_TOKEN ??
  "";

const STATIC_PATHS_PAGE_SIZE = 100;

type SlugItem = {
  slug?: string | null;
};

export async function strapiGraphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!STRAPI_BEARER_TOKEN) {
    throw new Error(
      "STRAPI_BEARER_TOKEN is not configured"
    );
  }

  const response = await fetch(STRAPI_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_BEARER_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Strapi GraphQL returned HTTP ${response.status}`
    );
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(
      `Strapi GraphQL error: ${JSON.stringify(
        result.errors
      )}`
    );
  }

  return result.data as T;
}

export async function getAllCollectionSlugs(
  collection: StrapiCollectionName
): Promise<string[]> {
  const slugs = new Set<string>();
  let page = 1;

  while (true) {
    const data = await strapiGraphqlRequest<
      Record<StrapiCollectionName, SlugItem[]>
    >(
      `
        query StaticPageSlugs(
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
          }
        }
      `,
      {
        page,
        pageSize: STATIC_PATHS_PAGE_SIZE,
      }
    );

    const currentPage = data[collection] ?? [];

    if (currentPage.length === 0) {
      break;
    }

    const previousSize = slugs.size;

    for (const item of currentPage) {
      const slug = item.slug?.trim();

      if (slug) {
        slugs.add(slug);
      }
    }

    if (
      currentPage.length < STATIC_PATHS_PAGE_SIZE ||
      slugs.size === previousSize
    ) {
      break;
    }

    page += 1;
  }

  return Array.from(slugs);
}

export async function hasVisibleCollectionSlug(
  collection: StrapiCollectionName,
  slug: string
): Promise<boolean> {
  const data = await strapiGraphqlRequest<
    Record<
      StrapiCollectionName,
      Array<{ documentId?: string | null }>
    >
  >(
    `
      query StaticPageExists($slug: String!) {
        ${collection}(
          pagination: {
            page: 1
            pageSize: 1
          }
          filters: {
            slug: {
              eq: $slug
            }
            showOnSite: { eq: true }
          }
        ) {
          documentId
        }
      }
    `,
    { slug }
  );

  return (data[collection] ?? []).length > 0;
}

export function getRouteSlug(
  value: string | string[] | undefined
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const slug = value.trim();

  return slug || null;
}
