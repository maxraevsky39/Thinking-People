import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

type AnimatedFilterGridProps = {
  children?: React.ReactNode;
  className?: string;
  duration?: number;
  offsetY?: number;
};

export function AnimatedFilterGrid({
  children,
  className,
  duration = 0.22,
  offsetY = 8,
}: AnimatedFilterGridProps) {
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