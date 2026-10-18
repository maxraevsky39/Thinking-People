import * as React from "react";

type SizeValue = number | string;
type ArrowMode = "overlay" | "outside";
type DisabledArrowBehavior = "dim" | "hide";

type SlotSliderProps = {
  className?: string;
  items?: React.ReactNode;
  leftArrow?: React.ReactNode;
  rightArrow?: React.ReactNode;
  visibleItems?: number;
  visibleItemsTablet?: number;
  visibleItemsMobile?: number;
  tabletBreakpoint?: number;
  mobileBreakpoint?: number;
  step?: number;
  gap?: SizeValue;
  transitionMs?: number;
  startIndex?: number;
  loop?: boolean;
  dragEnabled?: boolean;
  arrowMode?: ArrowMode;
  arrowTop?: SizeValue;
  leftArrowOffset?: SizeValue;
  rightArrowOffset?: SizeValue;
  arrowWidth?: SizeValue;
  arrowHeight?: SizeValue;
  arrowZIndex?: number;
  disabledArrowBehavior?: DisabledArrowBehavior;
  disableOpacity?: number;
  ariaLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
};

function toCssSize(value: SizeValue | undefined, fallback: string) {
  if (value === undefined || value === null || value === "") return fallback;
  if (value === "stretch") return "100%";
  return typeof value === "number" ? `${value}px` : value;
}

function toPositiveInteger(value: number | undefined, fallback: number) {
  const normalized = Math.floor(Number(value));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : fallback;
}

function useResponsiveVisibleItems({
  visibleItems,
  visibleItemsTablet,
  visibleItemsMobile,
  tabletBreakpoint,
  mobileBreakpoint,
}: Pick<
  SlotSliderProps,
  | "visibleItems"
  | "visibleItemsTablet"
  | "visibleItemsMobile"
  | "tabletBreakpoint"
  | "mobileBreakpoint"
>) {
  const getValue = React.useCallback(() => {
    const desktop = toPositiveInteger(visibleItems, 4);
    const tablet = toPositiveInteger(visibleItemsTablet, desktop);
    const mobile = toPositiveInteger(visibleItemsMobile, tablet);

    if (typeof window === "undefined") return desktop;

    if (window.innerWidth <= toPositiveInteger(mobileBreakpoint, 520)) {
      return mobile;
    }

    if (window.innerWidth <= toPositiveInteger(tabletBreakpoint, 820)) {
      return tablet;
    }

    return desktop;
  }, [visibleItems, visibleItemsTablet, visibleItemsMobile, tabletBreakpoint, mobileBreakpoint]);

  const [activeVisibleItems, setActiveVisibleItems] = React.useState(getValue);

  React.useEffect(() => {
    const update = () => setActiveVisibleItems(getValue());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [getValue]);

  return activeVisibleItems;
}

export function SlotSlider({
  className,
  items,
  leftArrow,
  rightArrow,
  visibleItems = 4,
  visibleItemsTablet,
  visibleItemsMobile,
  tabletBreakpoint = 820,
  mobileBreakpoint = 520,
  step = 1,
  gap = "6px",
  transitionMs = 420,
  startIndex = 0,
  loop = false,
  dragEnabled = true,
  arrowMode = "overlay",
  arrowTop = "50%",
  leftArrowOffset = "0px",
  rightArrowOffset = "0px",
  arrowWidth = "54px",
  arrowHeight = "54px",
  arrowZIndex = 3,
  disabledArrowBehavior = "dim",
  disableOpacity = 0.35,
  ariaLabel = "Slider",
  previousLabel = "Previous slide",
  nextLabel = "Next slide",
}: SlotSliderProps) {
  const instanceClass = `slot-slider-${React.useId().replace(/:/g, "")}`;
  const itemNodes = React.Children.toArray(items).filter(Boolean);
  const itemCount = itemNodes.length;
  const activeVisibleItems = useResponsiveVisibleItems({
    visibleItems,
    visibleItemsTablet,
    visibleItemsMobile,
    tabletBreakpoint,
    mobileBreakpoint,
  });
  const normalizedStep = toPositiveInteger(step, 1);
  const maxIndex = Math.max(0, itemCount - activeVisibleItems);
  const [index, setIndex] = React.useState(() => Math.min(Math.max(0, Math.floor(startIndex)), maxIndex));
  const dragStartX = React.useRef<number | null>(null);

  React.useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  const canGoPrev = loop || index > 0;
  const canGoNext = loop || index < maxIndex;

  const goTo = React.useCallback(
    (nextIndex: number) => {
      if (!itemCount) return;

      if (loop && itemCount > activeVisibleItems) {
        if (nextIndex < 0) {
          setIndex(maxIndex);
          return;
        }
        if (nextIndex > maxIndex) {
          setIndex(0);
          return;
        }
      }

      setIndex(Math.min(Math.max(0, nextIndex), maxIndex));
    },
    [activeVisibleItems, itemCount, loop, maxIndex]
  );

  const goPrev = React.useCallback(() => {
    if (canGoPrev) goTo(index - normalizedStep);
  }, [canGoPrev, goTo, index, normalizedStep]);

  const goNext = React.useCallback(() => {
    if (canGoNext) goTo(index + normalizedStep);
  }, [canGoNext, goTo, index, normalizedStep]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled || dragStartX.current === null) return;

    const delta = event.clientX - dragStartX.current;
    dragStartX.current = null;

    if (Math.abs(delta) < 32) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  const rootStyle = {
    "--slot-slider-visible": activeVisibleItems,
    "--slot-slider-index": index,
    "--slot-slider-gap": toCssSize(gap, "6px"),
    "--slot-slider-transition": `${Math.max(0, transitionMs)}ms`,
    "--slot-slider-arrow-top": toCssSize(arrowTop, "50%"),
    "--slot-slider-left-offset": toCssSize(leftArrowOffset, "0px"),
    "--slot-slider-right-offset": toCssSize(rightArrowOffset, "0px"),
    "--slot-slider-arrow-width": toCssSize(arrowWidth, "54px"),
    "--slot-slider-arrow-height": toCssSize(arrowHeight, "54px"),
    "--slot-slider-arrow-z": arrowZIndex,
    "--slot-slider-disabled-opacity": disableOpacity,
  } as React.CSSProperties;

  const renderArrow = (
    direction: "prev" | "next",
    content: React.ReactNode,
    disabled: boolean,
    onClick: () => void,
    label: string
  ) => {
    const hidden = disabled && disabledArrowBehavior === "hide";

    return (
      <button
        className={[
          "slot-slider__arrow",
          `slot-slider__arrow--${direction}`,
          disabled ? "slot-slider__arrow--disabled" : "",
          hidden ? "slot-slider__arrow--hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
      >
        {content || (direction === "prev" ? "<" : ">")}
      </button>
    );
  };

  return (
    <div
      className={["slot-slider", instanceClass, className].filter(Boolean).join(" ")}
      style={rootStyle}
      aria-label={ariaLabel}
    >
      <style>{`
        .${instanceClass}.slot-slider {
          position: relative;
          width: 100%;
          padding-inline: ${arrowMode === "outside" ? "calc(var(--slot-slider-arrow-width) + var(--slot-slider-gap))" : "0"};
        }

        .${instanceClass} .slot-slider__viewport {
          overflow: hidden;
          width: 100%;
        }

        .${instanceClass} .slot-slider__track {
          display: flex;
          gap: var(--slot-slider-gap);
          transition: transform var(--slot-slider-transition) cubic-bezier(.2, .75, .25, 1);
          transform: translateX(calc(var(--slot-slider-index) * -1 * ((100% - ((var(--slot-slider-visible) - 1) * var(--slot-slider-gap))) / var(--slot-slider-visible) + var(--slot-slider-gap))));
          will-change: transform;
          touch-action: pan-y;
        }

        .${instanceClass} .slot-slider__item {
          flex: 0 0 calc((100% - ((var(--slot-slider-visible) - 1) * var(--slot-slider-gap))) / var(--slot-slider-visible));
          min-width: 0;
        }

        .${instanceClass} .slot-slider__arrow {
          position: absolute;
          top: var(--slot-slider-arrow-top);
          z-index: var(--slot-slider-arrow-z);
          width: var(--slot-slider-arrow-width);
          height: var(--slot-slider-arrow-height);
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .${instanceClass} .slot-slider__arrow--prev {
          left: var(--slot-slider-left-offset);
        }

        .${instanceClass} .slot-slider__arrow--next {
          right: var(--slot-slider-right-offset);
        }

        .${instanceClass} .slot-slider__arrow--disabled {
          opacity: var(--slot-slider-disabled-opacity);
          cursor: default;
          pointer-events: none;
        }

        .${instanceClass} .slot-slider__arrow--hidden {
          opacity: 0;
          visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .${instanceClass} .slot-slider__track {
            transition: none;
          }
        }
      `}</style>

      {renderArrow("prev", leftArrow, !canGoPrev, goPrev, previousLabel)}
      <div className="slot-slider__viewport">
        <div
          className="slot-slider__track"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            dragStartX.current = null;
          }}
        >
          {itemNodes.map((item, itemIndex) => (
            <div className="slot-slider__item" key={itemIndex}>
              {item}
            </div>
          ))}
        </div>
      </div>
      {renderArrow("next", rightArrow, !canGoNext, goNext, nextLabel)}
    </div>
  );
}

export default SlotSlider;
