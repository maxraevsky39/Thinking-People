import * as React from "react";

import {
  extractTableOfContents,
  type StrapiPageBlock,
} from "./strapi-toc-utils";

export type StrapiTableOfContentsProps = {
  blocks?: StrapiPageBlock[] | null;
  title?: string;
  hideWhenEmpty?: boolean;
  richTextTypeName?: string;
  ariaLabel?: string;
  className?: string;
  titleClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  linkClassName?: string;
  activeLinkClassName?: string;
  highlightActiveSection?: boolean;
  observerOffset?: number;
  onActiveIdChange?: (activeId: string) => void;
};

export function StrapiTableOfContents({
  blocks,
  title = "Содержание",
  hideWhenEmpty = true,
  richTextTypeName = "ComponentSharedRichText",
  ariaLabel = "Оглавление страницы",
  className,
  titleClassName,
  listClassName,
  itemClassName,
  linkClassName,
  activeLinkClassName,
  highlightActiveSection = true,
  observerOffset = 120,
  onActiveIdChange,
}: StrapiTableOfContentsProps) {
  const items = React.useMemo(
    () => extractTableOfContents(blocks, richTextTypeName),
    [blocks, richTextTypeName]
  );
  const [activeId, setActiveId] = React.useState("");

  React.useEffect(() => {
    if (!highlightActiveSection || items.length === 0) {
      setActiveId("");
      return;
    }

    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    if (headings.length === 0) {
      setActiveId("");
      return;
    }

    const offset = Math.max(0, Math.min(observerOffset, window.innerHeight - 1));
    let animationFrame = 0;

    const updateActiveHeading = () => {
      let nextActiveId = headings[0].id;

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset + 1) {
          nextActiveId = heading.id;
        } else {
          break;
        }
      }

      setActiveId((currentId) =>
        currentId === nextActiveId ? currentId : nextActiveId
      );
    };

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveHeading);
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      rootMargin: `-${offset}px 0px 0px 0px`,
      threshold: [0, 1],
    });

    headings.forEach((heading) => observer.observe(heading));
    window.addEventListener("resize", scheduleUpdate);
    scheduleUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [highlightActiveSection, items, observerOffset]);

  React.useEffect(() => {
    if (activeId) {
      onActiveIdChange?.(activeId);
    }
  }, [activeId, onActiveIdChange]);

  if (hideWhenEmpty && items.length === 0) {
    return null;
  }

  return (
    <nav className={className} aria-label={ariaLabel}>
      {title ? <div className={titleClassName}>{title}</div> : null}

      <ol className={listClassName}>
        {items.map((item) => {
          const isActive = highlightActiveSection && item.id === activeId;
          const classNames = [
            linkClassName,
            isActive ? activeLinkClassName : undefined,
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={item.id} className={itemClassName}>
              <a
                href={`#${item.id}`}
                className={classNames || undefined}
                aria-current={isActive ? "location" : undefined}
                data-active={isActive ? "true" : "false"}
                onClick={() => {
                  if (highlightActiveSection) setActiveId(item.id);
                }}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default StrapiTableOfContents;
