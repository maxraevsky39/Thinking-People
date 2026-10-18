import * as React from "react";

type Direction = "right" | "left";
type OverflowMode = "visible" | "hidden";
type Distance = number | string;

export type HoverRevealStackProps = {
  items?: React.ReactNode;
  className?: string;
  itemClassName?: string;

  stackWidth?: string;

  /**
   * Если не задано, высота контейнера равна высоте элемента.
   */
  stackHeight?: number;

  /**
   * Автоматически рассчитывать ширину элемента
   * по ширине контейнера и количеству элементов.
   */
  autoSize?: boolean;

  /**
   * Используется только при autoSize=false
   * или до первого измерения контейнера.
   */
  itemWidth?: number;

  /**
   * Если не задано, элемент будет квадратным.
   */
  itemHeight?: number;

  /**
   * Расстояние между началами карточек в собранной стопке.
   *
   * Примеры:
   * 24
   * "24px"
   * "4%"
   */
  baseSpacing?: Distance;

  /**
   * Расстояние между карточками в раскрытом состоянии.
   *
   * Примеры:
   * 8
   * "8px"
   * "2%"
   */
  itemGap?: Distance;

  /**
   * Используются только при autoSize=false.
   */
  revealShift?: number;
  revealedSpacing?: number;

  durationMs?: number;
  easing?: string;
  staggerMs?: number;
  direction?: Direction;
  overflow?: OverflowMode;
  hoverEnabled?: boolean;
  focusEnabled?: boolean;
  clickEnabled?: boolean;
  closeOnMouseLeave?: boolean;
  defaultActiveIndex?: number;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  ariaLabel?: string;
};

function finiteNumber(
  value: number | undefined,
  fallback: number
): number {
  return Number.isFinite(value) ? Number(value) : fallback;
}

/**
 * Переводит значение расстояния в пиксели.
 *
 * 20      → 20 px
 * "20px"  → 20 px
 * "5%"    → 5% ширины контейнера
 */
function distanceToPx(
  value: Distance | undefined,
  containerWidth: number,
  fallback: number
): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalizedValue = value.trim();

  if (normalizedValue.endsWith("%")) {
    const percent = Number.parseFloat(normalizedValue);

    if (!Number.isFinite(percent) || containerWidth <= 0) {
      return fallback;
    }

    return containerWidth * (percent / 100);
  }

  if (normalizedValue.endsWith("px")) {
    const pixels = Number.parseFloat(normalizedValue);
    return Number.isFinite(pixels) ? pixels : fallback;
  }

  const numericValue = Number.parseFloat(normalizedValue);

  return Number.isFinite(numericValue)
    ? numericValue
    : fallback;
}

export function HoverRevealStack({
  items,
  className,
  itemClassName,

  stackWidth = "100%",
  stackHeight,

  autoSize = true,
  itemWidth = 76,
  itemHeight,

  baseSpacing = "4%",
  itemGap = "2%",

  revealShift = 58,
  revealedSpacing = 82,

  durationMs = 420,
  easing = "cubic-bezier(.22, 1, .36, 1)",
  staggerMs = 0,
  direction = "right",
  overflow = "visible",
  hoverEnabled = true,
  focusEnabled = true,
  clickEnabled = false,
  closeOnMouseLeave = true,
  defaultActiveIndex = -1,
  activeIndex,
  onActiveIndexChange,
  ariaLabel = "Image stack",
}: HoverRevealStackProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] =
    React.useState(0);

  const itemNodes = React.Children.toArray(items).filter(Boolean);
  const itemCount = itemNodes.length;

  /**
   * Получаем реальную ширину компонента.
   * Значение пересчитывается при изменении окна,
   * Grid, Flex или ширины родителя.
   */
  React.useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(element.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const isControlled = activeIndex !== undefined;

  const [internalActiveIndex, setInternalActiveIndex] =
    React.useState(() =>
      Math.floor(finiteNumber(defaultActiveIndex, -1))
    );

  const requestedActiveIndex = isControlled
    ? Math.floor(finiteNumber(activeIndex, -1))
    : internalActiveIndex;

  const currentActiveIndex =
    requestedActiveIndex >= 0 &&
    requestedActiveIndex < itemCount
      ? requestedActiveIndex
      : -1;

  const setActive = React.useCallback(
    (nextIndex: number) => {
      const normalizedIndex =
        nextIndex >= 0 && nextIndex < itemCount
          ? nextIndex
          : -1;

      if (!isControlled) {
        setInternalActiveIndex(normalizedIndex);
      }

      onActiveIndexChange?.(normalizedIndex);
    },
    [isControlled, itemCount, onActiveIndexChange]
  );

  React.useEffect(() => {
    if (
      !isControlled &&
      internalActiveIndex >= itemCount
    ) {
      setInternalActiveIndex(-1);
      onActiveIndexChange?.(-1);
    }
  }, [
    internalActiveIndex,
    isControlled,
    itemCount,
    onActiveIndexChange,
  ]);

  const resolvedBaseSpacing = Math.max(
    0,
    distanceToPx(baseSpacing, containerWidth, 24)
  );

  const resolvedItemGap = Math.max(
    0,
    distanceToPx(itemGap, containerWidth, 6)
  );

  const canCalculateAutomatically =
    autoSize &&
    containerWidth > 0 &&
    itemCount > 0;

  /**
   * Например:
   *
   * контейнер: 1000 px
   * карточек: 5
   * gap: 20 px
   *
   * (1000 - 20 × 4) / 5 = 184 px
   */
  const calculatedItemWidth = canCalculateAutomatically
    ? Math.max(
        0,
        (
          containerWidth -
          resolvedItemGap * Math.max(0, itemCount - 1)
        ) / itemCount
      )
    : Math.max(0, finiteNumber(itemWidth, 76));

  /**
   * Если itemHeight не указан,
   * карточки остаются квадратными.
   */
  const resolvedItemHeight =
    itemHeight === undefined
      ? calculatedItemWidth
      : Math.max(
          0,
          finiteNumber(itemHeight, calculatedItemWidth)
        );

  const resolvedStackHeight =
    stackHeight === undefined
      ? resolvedItemHeight
      : Math.max(
          0,
          finiteNumber(stackHeight, resolvedItemHeight)
        );

  /**
   * Расстояние между началами раскрытых карточек:
   *
   * ширина карточки + промежуток
   */
  const automaticRevealedSpacing =
    calculatedItemWidth + resolvedItemGap;

  /**
   * Первый раскрытый элемент должен начинаться
   * сразу после активного:
   *
   * ширина активного + промежуток
   */
  const automaticRevealShift = Math.max(
    0,
    automaticRevealedSpacing - resolvedBaseSpacing
  );

  const resolvedRevealedSpacing =
    canCalculateAutomatically
      ? automaticRevealedSpacing
      : finiteNumber(revealedSpacing, 82);

  const resolvedRevealShift =
    canCalculateAutomatically
      ? automaticRevealShift
      : finiteNumber(revealShift, 58);

  const normalizedDuration = Math.max(
    0,
    finiteNumber(durationMs, 420)
  );

  const normalizedStagger = Math.max(
    0,
    finiteNumber(staggerMs, 0)
  );

  const directionMultiplier =
    direction === "left" ? -1 : 1;

  return (
    <div
      ref={containerRef}
      className={className}
      role="group"
      aria-label={ariaLabel}
      style={{
        position: "relative",
        isolation: "isolate",
        width: stackWidth,
        height: `${resolvedStackHeight}px`,
        overflow,
        boxSizing: "border-box",
      }}
      onMouseLeave={() => {
        if (
          closeOnMouseLeave &&
          currentActiveIndex !== -1
        ) {
          setActive(-1);
        }
      }}
      onBlurCapture={(event) => {
        if (
          focusEnabled &&
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setActive(-1);
        }
      }}
    >
      {itemNodes.map((item, index) => {
        const isActive =
          index === currentActiveIndex;

        const isAfter =
          currentActiveIndex >= 0 &&
          index > currentActiveIndex;

        const distance = isAfter
          ? index - currentActiveIndex
          : 0;

        const baseX =
          index * resolvedBaseSpacing;

        const firstRevealedX =
          (currentActiveIndex + 1) *
            resolvedBaseSpacing +
          resolvedRevealShift;

        const revealedX =
          firstRevealedX +
          Math.max(0, distance - 1) *
            resolvedRevealedSpacing;

        const x =
          directionMultiplier *
          (isAfter ? revealedX : baseX);

        return (
          <div
            key={
              React.isValidElement(item)
                ? item.key ?? index
                : index
            }
            className={itemClassName}
            data-stack-index={index}
            data-active={isActive ? "true" : "false"}
            data-shifted={isAfter ? "true" : "false"}
            style={{
              position: "absolute",
              top: 0,

              left:
                direction === "right"
                  ? 0
                  : undefined,

              right:
                direction === "left"
                  ? 0
                  : undefined,

              width: `${calculatedItemWidth}px`,
              height: `${resolvedItemHeight}px`,

              zIndex: index + 1,

              transform: `translate3d(${x}px, 0, 0)`,

              transitionProperty: "transform",
              transitionDuration: `${normalizedDuration}ms`,
              transitionTimingFunction: easing,

              transitionDelay: isAfter
                ? `${
                    Math.max(0, distance - 1) *
                    normalizedStagger
                  }ms`
                : "0ms",

              willChange: "transform",
              boxSizing: "border-box",
            }}
            onMouseEnter={() => {
              if (hoverEnabled) {
                setActive(index);
              }
            }}
            onFocusCapture={() => {
              if (focusEnabled) {
                setActive(index);
              }
            }}
            onClick={() => {
              if (clickEnabled) {
                setActive(isActive ? -1 : index);
              }
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}

export default HoverRevealStack;