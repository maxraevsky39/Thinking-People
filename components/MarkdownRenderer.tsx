import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export type MarkdownRendererProps = {
  markdown?: string | null;
  className?: string;
  paragraphClassName?: string;
  heading1ClassName?: string;
  heading2ClassName?: string;
  heading3ClassName?: string;
  headingClassName?: string;
  linkClassName?: string;
  listClassName?: string;
  listItemClassName?: string;
  quoteClassName?: string;
  inlineCodeClassName?: string;
  codeBlockClassName?: string;
  tableClassName?: string;
  tableHeadClassName?: string;
  tableCellClassName?: string;
  imageClassName?: string;
  openExternalLinksInNewTab?: boolean;
  allowImages?: boolean;
};

export function MarkdownRenderer({
  markdown,
  className,
  paragraphClassName,
  heading1ClassName,
  heading2ClassName,
  heading3ClassName,
  headingClassName,
  linkClassName,
  listClassName,
  listItemClassName,
  quoteClassName,
  inlineCodeClassName,
  codeBlockClassName,
  tableClassName,
  tableHeadClassName,
  tableCellClassName,
  imageClassName,
  openExternalLinksInNewTab = true,
  allowImages = true,
}: MarkdownRendererProps) {
  if (typeof markdown !== "string" || markdown.trim().length === 0) {
    return null;
  }

  const components: Components = {
    h1: ({ node: _node, ...props }) => (
      <h1 className={heading1ClassName} {...props} />
    ),
    h2: ({ node: _node, ...props }) => (
      <h2 className={heading2ClassName} {...props} />
    ),
    h3: ({ node: _node, ...props }) => (
      <h3 className={heading3ClassName} {...props} />
    ),
    h4: ({ node: _node, ...props }) => (
      <h4 className={headingClassName} {...props} />
    ),
    h5: ({ node: _node, ...props }) => (
      <h5 className={headingClassName} {...props} />
    ),
    h6: ({ node: _node, ...props }) => (
      <h6 className={headingClassName} {...props} />
    ),
    p: ({ node: _node, ...props }) => (
      <p className={paragraphClassName} {...props} />
    ),
    a: ({ node: _node, href, ...props }) => {
      const isExternal = Boolean(href && /^https?:\/\//i.test(href));
      const openInNewTab = openExternalLinksInNewTab && isExternal;

      return (
        <a
          {...props}
          href={href}
          className={linkClassName}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noopener noreferrer" : undefined}
        />
      );
    },
    ul: ({ node: _node, ...props }) => (
      <ul className={listClassName} {...props} />
    ),
    ol: ({ node: _node, ...props }) => (
      <ol className={listClassName} {...props} />
    ),
    li: ({ node: _node, ...props }) => (
      <li className={listItemClassName} {...props} />
    ),
    blockquote: ({ node: _node, ...props }) => (
      <blockquote className={quoteClassName} {...props} />
    ),
    code: ({ node: _node, className: languageClassName, ...props }) => (
      <code
        className={[inlineCodeClassName, languageClassName]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    ),
    pre: ({ node: _node, ...props }) => (
      <pre className={codeBlockClassName} {...props} />
    ),
    table: ({ node: _node, ...props }) => (
      <table className={tableClassName} {...props} />
    ),
    thead: ({ node: _node, ...props }) => (
      <thead className={tableHeadClassName} {...props} />
    ),
    th: ({ node: _node, ...props }) => (
      <th className={tableCellClassName} {...props} />
    ),
    td: ({ node: _node, ...props }) => (
      <td className={tableCellClassName} {...props} />
    ),
    img: ({ node: _node, alt, ...props }) =>
      allowImages ? (
        <img
          {...props}
          alt={alt || ""}
          className={imageClassName}
          loading="lazy"
        />
      ) : null,
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
