import * as React from "react";

type OffsetUnit = "px" | "%";

type NavbarRevealOnBlockProps = {
  children?: React.ReactNode;
  className?: string;
  targetSelector?: string;
  offset?: number;
  offsetUnit?: OffsetUnit;
  initiallyVisibleInCanvas?: boolean;
  top?: string;
  zIndex?: number;
  transitionMs?: number;
};

function getThreshold(element: Element, offset: number, offsetUnit: OffsetUnit) {
  const rect = element.getBoundingClientRect();
  const pageTop = rect.top + window.scrollY;
  const offsetPx = offsetUnit === "%" ? rect.height * (offset / 100) : offset;

  return pageTop + offsetPx;
}

export function NavbarRevealOnBlock({
  children,
  className,
  targetSelector = "#show-navbar",
  offset = 0,
  offsetUnit = "px",
  initiallyVisibleInCanvas = true,
  top = "0px",
  zIndex = 1000,
  transitionMs = 220,
}: NavbarRevealOnBlockProps) {
  const [visible, setVisible] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const isPlasmicCanvas = window.location.pathname.includes("plasmic-host");

    if (isPlasmicCanvas && initiallyVisibleInCanvas) {
      setVisible(true);
      setReady(true);
      return;
    }

    const updateVisibility = () => {
      const target = document.querySelector(targetSelector);

      if (!target) {
        setVisible(false);
        setReady(true);
        return;
      }

      setVisible(window.scrollY >= getThreshold(target, offset, offsetUnit));
      setReady(true);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
    };
  }, [initiallyVisibleInCanvas, offset, offsetUnit, targetSelector]);

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        top,
        left: 0,
        right: 0,
        zIndex,
        opacity: ready && visible ? 1 : 0,
        pointerEvents: ready && visible ? "auto" : "none",
        transform: ready && visible ? "translateY(0)" : "translateY(-12px)",
        transition: ready ? `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`: "none",
      }}
    >
      {children}
    </div>
  );
}

export default NavbarRevealOnBlock;
