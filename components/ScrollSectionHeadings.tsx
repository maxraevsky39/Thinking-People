import React, { Children, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import styles from "./ScrollSectionHeadings.module.css";

export interface ScrollSectionHeadingsProps {
  className?: string;
  headings?: ReactNode;
  sections?: ReactNode;
  stickyTop?: number;
  switchPoint?: number;
  transitionDuration?: number;
  headingWidth?: number;
  columnGap?: number;
  sectionGap?: number;
  mobileBreakpoint?: number;
  mobileHeadingGap?: number;
}

// Preserve each direct slot item; fragments are transparent grouping only.
function slotItems(slot: ReactNode): ReactNode[] {
  return Children.toArray(slot).flatMap(child =>
    React.isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? slotItems(child.props.children) : [child]
  );
}
const finite = (value: number, fallback: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

export function ScrollSectionHeadings({
  className, headings, sections, stickyTop = 96, switchPoint = 35,
  transitionDuration = 0.35, headingWidth = 35, columnGap = 64,
  sectionGap = 96, mobileBreakpoint = 767, mobileHeadingGap = 24,
}: ScrollSectionHeadingsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const [mobile, setMobile] = useState(false);
  const titles = slotItems(headings);
  const content = slotItems(sections);
  const count = content.length;
  const breakpoint = finite(mobileBreakpoint, 767, 0, 3000);
  const point = finite(switchPoint, 35, 0, 100);

  useEffect(() => {
    const view = rootRef.current?.ownerDocument.defaultView;
    if (!view) return;
    const media = view.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [breakpoint]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const doc = root.ownerDocument;
    const view = doc.defaultView;
    if (!view || mobile || !count) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      let top = 0;
      let height = view.innerHeight;
      // Use the rendering document, including Plasmic's scrolling iframe body.
      for (let parent = root.parentElement; parent; parent = parent.parentElement) {
        if (parent === doc.scrollingElement) break;
        if (/^(auto|scroll|overlay)$/.test(view.getComputedStyle(parent).overflowY) &&
            parent.scrollHeight > parent.clientHeight) {
          top = parent.getBoundingClientRect().top + parent.clientTop;
          height = parent.clientHeight;
          break;
        }
      }
      const line = top + height * point / 100;
      let next = 0;
      for (let i = 0; i < count; i++) {
        const section = sectionRefs.current[i];
        if (section && section.getBoundingClientRect().top <= line) next = i;
      }
      setActive(previous => previous === next ? previous : next);
    };
    const schedule = () => {
      if (!raf) raf = view.requestAnimationFrame(measure);
    };
    // Capturing scroll also handles nested scroll containers; no global window.
    doc.addEventListener("scroll", schedule, true);
    view.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    sectionRefs.current.slice(0, count).forEach(section => section && observer.observe(section));
    schedule();
    return () => {
      if (raf) view.cancelAnimationFrame(raf);
      observer.disconnect();
      doc.removeEventListener("scroll", schedule, true);
      view.removeEventListener("resize", schedule);
    };
  }, [count, mobile, point]);

  const current = Math.min(active, Math.max(0, count - 1));
  const style = {
    "--ssh-top": `${finite(stickyTop, 96, 0, 2000)}px`,
    "--ssh-duration": `${finite(transitionDuration, 0.35, 0, 5)}s`,
    "--ssh-width": `${finite(headingWidth, 35, 10, 70)}%`,
    "--ssh-column-gap": `${finite(columnGap, 64, 0, 400)}px`,
    "--ssh-section-gap": `${finite(sectionGap, 96, 0, 1000)}px`,
    "--ssh-mobile-heading-gap": `${finite(mobileHeadingGap, 24, 0, 200)}px`,
  } as React.CSSProperties;

  return (
    <div ref={rootRef} className={`${styles.root} ${className || ""}`} style={style}
      data-scroll-section-headings="" data-mobile={mobile} data-active-section={current}>
      {!mobile && count > 0 && (
        <div className={styles.left}>
          <div className={styles.sticky}>
            {content.map((_, index) => (
              <div key={index} className={styles.heading} data-active={index === current}
                aria-hidden={index !== current}>
                {titles[index]}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.right}>
        {content.map((section, index) => (
          <section key={index} className={styles.section}
            ref={element => { sectionRefs.current[index] = element; }}>
            {mobile && titles[index] != null && <div className={styles.mobileHeading}>{titles[index]}</div>}
            {section}
          </section>
        ))}
      </div>
    </div>
  );
}
