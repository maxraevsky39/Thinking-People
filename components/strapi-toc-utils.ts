import type { BlocksContent } from "@strapi/blocks-react-renderer";

export type StrapiPageBlock = {
  id?: string | number | null;
  __typename?: string | null;
  blockType?: string | null;
  body?: BlocksContent | null;
  RichText?: BlocksContent | null;
};

export type TocItem = {
  id: string;
  title: string;
};

export function extractNodeText(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  const value = node as Record<string, unknown>;

  if (typeof value.text === "string") {
    return value.text;
  }

  if (Array.isArray(value.children)) {
    return value.children.map(extractNodeText).join("");
  }

  return "";
}

export function slugifyHeading(text: string): string {
  const slug = text
    .toLocaleLowerCase("ru-RU")
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "section";
}

function normalizeBlockKey(value: string | number): string {
  return String(value)
    .toLocaleLowerCase("ru-RU")
    .replace(/[^a-zа-яё0-9_-]+/gi, "-");
}

export function createHeadingIdFactory(
  blockId: string | number
): (title: string) => string {
  const blockKey = normalizeBlockKey(blockId) || "rich-text";
  let headingIndex = 0;

  return () => {
    headingIndex += 1;
    const baseId = `section-${blockKey}`;

    return headingIndex === 1 ? baseId : `${baseId}-${headingIndex}`;
  };
}

export function extractTableOfContents(
  blocks: StrapiPageBlock[] | null | undefined,
  richTextTypeName = "ComponentSharedRichText"
): TocItem[] {
  if (!Array.isArray(blocks)) {
    return [];
  }

  const items: TocItem[] = [];

  blocks.forEach((block, blockIndex) => {
    const blockType = block?.__typename ?? block?.blockType;
    const content = Array.isArray(block?.body)
      ? block.body
      : Array.isArray(block?.RichText)
      ? block.RichText
      : null;

    if (blockType !== richTextTypeName || !content) {
      return;
    }

    const createHeadingId = createHeadingIdFactory(
      block.id ?? `block-${blockIndex}`
    );

    for (const node of content as unknown[]) {
      if (!node || typeof node !== "object") {
        continue;
      }

      const value = node as Record<string, unknown>;

      if (value.type !== "heading" || Number(value.level) !== 2) {
        continue;
      }

      const title = extractNodeText(value).trim();

      if (title) {
        items.push({ id: createHeadingId(title), title });
      }
    }
  });

  return items;
}
