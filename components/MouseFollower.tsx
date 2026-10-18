import * as React from "react";

type MouseFollowerAnchor =
  | "top-left"
  | "top-center"
  | "center"
  | "bottom-left"
  | "bottom-center";
type SizeValue = number | string | undefined;

type MouseFollowerProps = {
  children?: React.ReactNode;
  className?: string;
  offsetX?: number;
  offsetY?: number;
  width?: SizeValue;
  height?: SizeValue;
  zIndex?: number;
  transitionMs?: number;
  anchor?: MouseFollowerAnchor;
  pointerEvents?: "none" | "auto";
  hideUntilPointerMove?: boolean;
  initialX?: number;
  initialY?: number;
};

function toCssSize(value: SizeValue) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return typeof value === "number" ? `${value}px` : value;
}

export function MouseFollower({
  children,
  className,
  offsetX = 16,
  offsetY = 16,
  width = "auto",
  height = "auto",
  zIndex = 1000,
  transitionMs = 80,
  anchor = "top-left",
  pointerEvents = "none",
  hideUntilPointerMove = false,
  initialX = 0,
  initialY = 0,
}: MouseFollowerProps) {
  const [{ x, y }, setPosition] = React.useState({ x: initialX, y: initialY });
  const [hasPointer, setHasPointer] = React.useState(!hideUntilPointerMove);

  React.useEffect(() => {
    const updatePosition = (event: PointerEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setHasPointer(true);
    };

    window.addEventListener("pointermove", updatePosition, { passive: true });

    return () => {
      window.removeEventListener("pointermove", updatePosition);
    };
  }, []);

  const anchorTransforms: Record<MouseFollowerAnchor, string> = {
    "top-left": "translate3d(var(--mf-x), var(--mf-y), 0)",
    "top-center": "translate3d(calc(-50% + var(--mf-x)), var(--mf-y), 0)",
    center:
      "translate3d(calc(-50% + var(--mf-x)), calc(-50% + var(--mf-y)), 0)",
    "bottom-left": "translate3d(var(--mf-x), calc(-100% + var(--mf-y)), 0)",
    "bottom-center":
      "translate3d(calc(-50% + var(--mf-x)), calc(-100% + var(--mf-y)), 0)",
  };

const translate = anchorTransforms[anchor] || anchorTransforms["top-left"];
  return (
    <div
      className={className}
      style={
        {
          "--mf-x": `${x + offsetX}px`,
          "--mf-y": `${y + offsetY}px`,
          position: "fixed",
          left: 0,
          top: 0,
          width: toCssSize(width),
          height: toCssSize(height),
          zIndex,
          pointerEvents,
          opacity: hasPointer ? 1 : 0,
          transform: translate,
          transition: transitionMs
            ? `transform ${transitionMs}ms ease-out, opacity ${transitionMs}ms ease-out`
            : undefined,
          willChange: "transform",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export default MouseFollower;
