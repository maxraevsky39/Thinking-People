import * as React from "react";
import {
  BlocksRenderer,
  type BlocksContent,
} from "@strapi/blocks-react-renderer";
import { createHeadingIdFactory } from "./strapi-toc-utils";

const SHORT_RUSSIAN_WORD_PATTERN =
  /(в|во|и|а|но|к|ко|с|со|у|о|об|от|до|по|на|за|из|для|без|над|под|при)( +)/gi;
const LETTER_OR_NUMBER_PATTERN = /[0-9A-Za-zА-Яа-яЁё]/;

export function replaceShortWordSpaces(text: string): string {
  return text.replace(
    SHORT_RUSSIAN_WORD_PATTERN,
    (match, word: string, _spaces: string, offset: number, source: string) => {
      const previousCharacter = offset > 0 ? source[offset - 1] : "";

      if (
        previousCharacter &&
        LETTER_OR_NUMBER_PATTERN.test(previousCharacter)
      ) {
        return match;
      }

      return `${word}\u00A0`;
    }
  );
}

function transformTypographyNode(node: unknown): unknown {
  if (!node || typeof node !== "object") {
    return node;
  }

  const value = node as Record<string, unknown>;

  if (value.type === "code") {
    return node;
  }

  if (value.type === "text" && typeof value.text === "string") {
    return {
      ...value,
      text: replaceShortWordSpaces(value.text),
    };
  }

  if (Array.isArray(value.children)) {
    return {
      ...value,
      children: value.children.map(transformTypographyNode),
    };
  }

  return node;
}

export function applyRussianTypography(content: BlocksContent): BlocksContent {
  return content.map(transformTypographyNode) as BlocksContent;
}

function extractRenderedText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractRenderedText).join("");
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractRenderedText(node.props.children);
  }

  return "";
}

function mergeClassNames(
  ...classNames: Array<string | undefined>
): string | undefined {
  const result = classNames.filter(Boolean).join(" ");
  return result || undefined;
}

export type StrapiRichTextProps = {
  content?: BlocksContent | null;
  blockId?: string | number | null;
  scrollOffset?: number;
  className?: string;
  paragraphClassName?: string;
  paragraphCustomClassName?: string;
  headingClassName?: string;
  headingCustomClassName?: string;
  heading1ClassName?: string;
  heading1CustomClassName?: string;
  heading2ClassName?: string;
  heading2CustomClassName?: string;
  heading3ClassName?: string;
  heading3CustomClassName?: string;
  linkClassName?: string;
  linkCustomClassName?: string;
  listClassName?: string;
  listCustomClassName?: string;
  quoteClassName?: string;
  quoteCustomClassName?: string;
  codeClassName?: string;
  codeCustomClassName?: string;
  openExternalLinksInNewTab?: boolean;
  typography?: boolean;
};

export function StrapiRichText({
  content,
  blockId = "rich-text",
  scrollOffset = 120,
  className,
  paragraphClassName,
  paragraphCustomClassName,
  headingClassName,
  headingCustomClassName,
  heading1ClassName,
  heading1CustomClassName,
  heading2ClassName,
  heading2CustomClassName,
  heading3ClassName,
  heading3CustomClassName,
  linkClassName,
  linkCustomClassName,
  listClassName,
  listCustomClassName,
  quoteClassName,
  quoteCustomClassName,
  codeClassName,
  codeCustomClassName,
  openExternalLinksInNewTab = true,
  typography = true,
}: StrapiRichTextProps) {
  const renderedContent = React.useMemo(
    () =>
      Array.isArray(content) && typography
        ? applyRussianTypography(content)
        : content,
    [content, typography]
  );

  if (!Array.isArray(content) || content.length === 0) {
    return null;
  }

  const createHeadingId = createHeadingIdFactory(blockId ?? "rich-text");

  return (
    <div className={className}>
      <BlocksRenderer
        content={renderedContent as BlocksContent}
        blocks={{
          paragraph: ({ children }) => (
            <p
              className={mergeClassNames(
                paragraphClassName,
                paragraphCustomClassName
              )}
            >
              {children}
            </p>
          ),
          heading: ({ children, level, plainText }) => {
            const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
            const levelClassNames: Record<number, string | undefined> = {
              1: heading1ClassName,
              2: heading2ClassName,
              3: heading3ClassName,
            };
            const levelCustomClassNames: Record<number, string | undefined> = {
              1: heading1CustomClassName,
              2: heading2CustomClassName,
              3: heading3CustomClassName,
            };
            const levelClassName = levelClassNames[level];
            const levelCustomClassName = levelCustomClassNames[level];
            const headingText =
              typeof plainText === "string"
                ? plainText
                : extractRenderedText(children);
            const id =
              level === 2 ? createHeadingId(headingText.trim()) : undefined;

            return (
              <Tag
                id={id}
                className={mergeClassNames(
                  levelClassName || headingClassName,
                  headingCustomClassName,
                  levelCustomClassName
                )}
                style={
                  level === 2
                    ? { scrollMarginTop: `${Math.max(0, scrollOffset)}px` }
                    : undefined
                }
              >
                {children}
              </Tag>
            );
          },
          link: ({ children, url }) => {
            const isExternal = /^https?:\/\//i.test(url);
            const openInNewTab = openExternalLinksInNewTab && isExternal;

            return (
              <a
                href={url}
                className={mergeClassNames(
                  linkClassName,
                  linkCustomClassName
                )}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          list: ({ children, format }) => {
            const Tag = format === "ordered" ? "ol" : "ul";

            return (
              <Tag
                className={mergeClassNames(listClassName, listCustomClassName)}
              >
                {children}
              </Tag>
            );
          },
          quote: ({ children }) => (
            <blockquote
              className={mergeClassNames(quoteClassName, quoteCustomClassName)}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, plainText }) => (
            <pre className={mergeClassNames(codeClassName, codeCustomClassName)}>
              <code>{plainText || children}</code>
            </pre>
          ),
        }}
      />
    </div>
  );
}

export default StrapiRichText;
