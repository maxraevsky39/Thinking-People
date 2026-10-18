import * as React from "react";

type Direction = "left" | "right" | "up" | "down";
type SizeValue = number | string;

export type MovingSlotCarouselProps = {
  children?: React.ReactNode;
  className?: string;
  itemCount?: number;
  cardWidth?: SizeValue;
  cardHeight?: SizeValue;
  speed?: number;
  hoverSpeed?: number;
  direction?: Direction;
  gap?: SizeValue;
  borderRadius?: SizeValue;
  wrapItems?: boolean;
  ariaLabel?: string;
};

function toCssSize(value: SizeValue | undefined, fallback: string) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === "stretch") return "100%";
  return typeof value === "number" ? `${value}px` : value;
}

function normalizeChildren(children: React.ReactNode, itemCount: number) {
  const childItems = React.Children.toArray(children).filter(Boolean);

  if (!childItems.length || itemCount <= 0) return [];

  return Array.from({ length: itemCount }, (_, index) => ({
    child: childItems[index % childItems.length],
    key: index,
  }));
}

export function MovingSlotCarousel({
  children,
  className,
  itemCount,
  cardWidth = "260px",
  cardHeight = "180px",
  speed = 20,
  hoverSpeed = 8,
  direction = "left",
  gap = "16px",
  borderRadius = "12px",
  wrapItems = true,
  ariaLabel = "Moving content carousel",
}: MovingSlotCarouselProps) {
  const instanceClass = `msc-${React.useId().replace(/:/g, "")}`;
  const trackRef = React.useRef<HTMLDivElement>(null);
  const baseItems = React.Children.toArray(children).filter(Boolean);
  const items = normalizeChildren(
    children,
    Math.max(0, Math.floor(itemCount ?? baseItems.length))
  );
  const isVertical = direction === "up" || direction === "down";
  const animationName = isVertical
    ? `${instanceClass}-scroll-y`
    : `${instanceClass}-scroll-x`;
  const animationDirection =
    direction === "right" || direction === "down" ? "reverse" : "normal";

  const normalDuration = Math.max(0.1, speed || 20);
  const hoverDuration = Math.max(0.1, hoverSpeed || speed || 20);
  const hoverPlaybackRate = normalDuration / hoverDuration;

  const setPlaybackRate = React.useCallback((rate: number) => {
    const animation = trackRef.current?.getAnimations()[0];
    animation?.updatePlaybackRate(rate);
  }, []);

  React.useEffect(() => {
    setPlaybackRate(1);
  }, [setPlaybackRate, normalDuration, hoverDuration, direction, children]);

  const rootStyle = {
    "--msc-card-width": toCssSize(cardWidth, "260px"),
    "--msc-card-height": toCssSize(cardHeight, "180px"),
    "--msc-gap": toCssSize(gap, "16px"),
    "--msc-radius": toCssSize(borderRadius, "12px"),
    "--msc-speed": `${normalDuration}s`,
  } as React.CSSProperties;

  if (!items.length) {
    return (
      <div
        className={className}
        style={{ minHeight: toCssSize(cardHeight, "180px") }}
      />
    );
  }

  const renderItem = (item: { child: React.ReactNode; key: number }, copy: number) => {
    const key = `${copy}-${item.key}`;

    if (!wrapItems) {
      return (
        <React.Fragment key={key}>
          {item.child}
        </React.Fragment>
      );
    }

    return (
      <div className="msc-card" key={key}>
        {item.child}
      </div>
    );
  };

  return (
    <div
      className={[
        "msc-carousel",
        instanceClass,
        isVertical ? "msc-carousel--vertical" : "msc-carousel--horizontal",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      onMouseEnter={() => setPlaybackRate(hoverPlaybackRate)}
      onMouseLeave={() => setPlaybackRate(1)}
    >
      <style>{`
        .${instanceClass}.msc-carousel {
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .${instanceClass}.msc-carousel--horizontal {
          height: var(--msc-card-height);
        }

        .${instanceClass}.msc-carousel--vertical {
          width: var(--msc-card-width);
          height: 100%;
          min-height: var(--msc-card-height);
        }

        .${instanceClass} .msc-track {
          display: flex;
          gap: var(--msc-gap);
          width: max-content;
          animation-name: ${animationName};
          animation-duration: var(--msc-speed);
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-direction: ${animationDirection};
          will-change: transform;
        }

        .${instanceClass}.msc-carousel--vertical .msc-track {
          flex-direction: column;
          width: var(--msc-card-width);
        }

        .${instanceClass} .msc-card {
          flex: 0 0 auto;
          width: var(--msc-card-width);
          height: var(--msc-card-height);
          overflow: hidden;
          border-radius: var(--msc-radius);
        }

        .${instanceClass} .msc-card > * {
          width: 100%;
          height: 100%;
        }

        @keyframes ${instanceClass}-scroll-x {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-50% - (var(--msc-gap) / 2))); }
        }

        @keyframes ${instanceClass}-scroll-y {
          from { transform: translateY(0); }
          to { transform: translateY(calc(-50% - (var(--msc-gap) / 2))); }
        }

        @media (prefers-reduced-motion: reduce) {
          .${instanceClass} .msc-track {
            animation: none;
          }
        }
      `}</style>

      <div ref={trackRef} className="msc-track" aria-label={ariaLabel}>
        {items.map((item) => renderItem(item, 0))}
        {items.map((item) => renderItem(item, 1))}
      </div>
    </div>
  );
}

export default MovingSlotCarousel;
