import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { masonryLayout } from "./masonryLayout";

type AnimatedFilterGridProps = {
  children?: React.ReactNode;
  className?: string;
  duration?: number;
  offsetY?: number;
  layout?: "grid" | "masonry";
  columns?: number;
  tabletColumns?: number;
  mobileColumns?: number;
  gap?: number;
};

export function AnimatedFilterGrid({
  children,
  className,
  duration = 0.22,
  offsetY = 8,
  layout = "grid",
  columns = 3,
  tabletColumns = 2,
  mobileColumns = 1,
  gap = 16,
}: AnimatedFilterGridProps) {
  if (layout === "masonry") {
    return <MasonryGrid {...{ children, className, duration, offsetY, columns, tabletColumns, mobileColumns, gap }} />;
  }
  const items = React.Children.toArray(children);

  return (
    <motion.div
      layout
      className={className}
      style={{ position: "relative" }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((child, index) => {
          const element = React.isValidElement(child)
            ? (child as React.ReactElement<Record<string, unknown>>)
            : null;

          const itemKey =
            element?.props?.["data-item-key"] ??
            element?.key ??
            index;

          return (
            <motion.div
              key={String(itemKey)}
              layout="position"
              initial={{
                opacity: 0,
                y: offsetY,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -offsetY,
              }}
              transition={{
                opacity: {
                  duration: duration * 0.75,
                },
                y: {
                  duration,
                },
                layout: {
                  duration,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

// Plasmic slots may wrap repeated cards in fragments. Flatten only in Masonry
// mode so the existing grid's DOM and key behavior remain unchanged.
function flattenCards(children: React.ReactNode, prefix = ""): { key: string; node: React.ReactNode }[] {
  return React.Children.toArray(children).flatMap((node, index) => {
    const element = React.isValidElement(node) ? node as React.ReactElement<any> : null;
    const key = prefix + String(element?.props?.["data-item-key"] ?? element?.key ?? index);
    return element?.type === React.Fragment
      ? flattenCards(element.props.children, key + "/")
      : [{ key, node }];
  });
}

function MasonryGrid({ children, className, duration = 0.22, offsetY = 8,
  columns = 3, tabletColumns = 2, mobileColumns = 1, gap = 16 }: AnimatedFilterGridProps) {
  const items = React.useMemo(() => flattenCards(children), [children]);
  const root = React.useRef<HTMLDivElement>(null);
  const cards = React.useRef(new Map<string, HTMLDivElement>());
  const [geometry, setGeometry] = React.useState({ width: 0, left: 0, top: 0, bottom: 0 });
  const [heights, setHeights] = React.useState<Record<string, number>>({});
  const safeCount = (value: number) => Number.isFinite(value) ? Math.max(1, Math.min(12, Math.floor(value))) : 1;
  const count = safeCount(geometry.width <= 640 ? mobileColumns : geometry.width <= 840 ? tabletColumns : columns);
  const spacing = Number.isFinite(gap) ? Math.max(0, gap) : 16;
  const arrangement = masonryLayout(items.map(item => heights[item.key] ?? 0), count, geometry.width, spacing);

  React.useEffect(() => {
    const container = root.current;
    if (!container) return;
    let frame = 0;
    const measure = () => {
      const style = getComputedStyle(container);
      const left = parseFloat(style.paddingLeft) || 0;
      const right = parseFloat(style.paddingRight) || 0;
      const top = parseFloat(style.paddingTop) || 0;
      const bottom = parseFloat(style.paddingBottom) || 0;
      const width = Math.max(0, container.clientWidth - left - right);
      setGeometry(old => old.width === width && old.left === left && old.top === top && old.bottom === bottom
        ? old : { width, left, top, bottom });
      const next: Record<string, number> = {};
      items.forEach(item => { next[item.key] = cards.current.get(item.key)?.offsetHeight ?? 0; });
      setHeights(old => Object.keys(old).length === items.length && items.every(item => old[item.key] === next[item.key]) ? old : next);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(container);
    cards.current.forEach(card => observer?.observe(card));
    window.addEventListener("resize", schedule);
    container.addEventListener("load", schedule, true);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", schedule);
      container.removeEventListener("load", schedule, true);
    };
  }, [items, count, spacing]);

  return <div ref={root} className={className} data-layout="masonry"
    style={{ position: "relative", display: "block", boxSizing: "border-box",
      height: arrangement.height + geometry.top + geometry.bottom }}>
    <AnimatePresence initial={false} mode="popLayout">
      {items.map((item, index) => <motion.div key={item.key}
        ref={node => { if (node) cards.current.set(item.key, node); else cards.current.delete(item.key); }}
        layout="position"
        style={{ position: "absolute", display: "flow-root", boxSizing: "border-box", minWidth: 0,
          width: arrangement.itemWidth,
          left: geometry.left + arrangement.positions[index].left,
          top: geometry.top + arrangement.positions[index].top,
          visibility: geometry.width > 0 ? "visible" : "hidden" }}
        initial={{ opacity: 0, y: offsetY }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -offsetY }}
        transition={{ opacity: { duration: duration * 0.75 }, y: { duration },
          layout: { duration, ease: [0.22, 1, 0.36, 1] } }}>
        {item.node}
      </motion.div>)}
    </AnimatePresence>
  </div>;
}
