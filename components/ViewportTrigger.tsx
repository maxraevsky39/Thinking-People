import * as React from "react";

export interface ViewportTriggerProps {
  children?: React.ReactNode;
  className?: string;
  offset?: number;
  onViewportEnter?: () => void;
}

export const ViewportTrigger = React.forwardRef<
  HTMLDivElement,
  ViewportTriggerProps
>(function ViewportTrigger(
  {
    children,
    className,
    offset = 0,
    onViewportEnter,
  },
  forwardedRef
) {
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const wasInViewport = React.useRef(false);
  const handlerRef = React.useRef(onViewportEnter);

  React.useEffect(() => {
    handlerRef.current = onViewportEnter;
  }, [onViewportEnter]);

  const setRefs = React.useCallback(
    (element: HTMLDivElement | null) => {
      elementRef.current = element;

      if (typeof forwardedRef === "function") {
        forwardedRef(element);
      } else if (forwardedRef) {
        forwardedRef.current = element;
      }
    },
    [forwardedRef]
  );

  React.useEffect(() => {
    const element = elementRef.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const safeOffset = Math.max(0, offset);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isInViewport = entry.isIntersecting;

        if (isInViewport && !wasInViewport.current) {
          handlerRef.current?.();
        }

        wasInViewport.current = isInViewport;
      },
      {
        root: null,
        threshold: 0,
        rootMargin: `0px 0px ${safeOffset}px 0px`,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [offset]);

  return (
    <div ref={setRefs} className={className}>
      {children}
    </div>
  );
});

ViewportTrigger.displayName = "ViewportTrigger";