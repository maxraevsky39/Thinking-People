import React from "react";
import { DataProvider } from "@plasmicapp/host";

type CssSize = number | string;
type EventSide = "left" | "right";
type PlasmicImage = string | { src?: string; fullWidth?: number; fullHeight?: number };

type HistoryPointContextValue = {
  point?: React.ReactNode;
  index: number;
  active: boolean;
  showMarkerLabel: boolean;
};

const HistoryPointContext = React.createContext<HistoryPointContextValue>({
  index: 0,
  active: false,
  showMarkerLabel: true,
});

export type HistoryTimelineProps = {
  children?: React.ReactNode;
  points?: React.ReactNode;
  activationPoint?: number;
  lineColor?: string;
  activeColor?: string;
  lineWidth?: CssSize;
  eventsGap?: CssSize;
  mobileBreakpoint?: number;
  showMarkerLabels?: boolean;
  onPointActivate?: (index: number, marker: string) => void;
  onPointDeactivate?: (index: number, marker: string) => void;
  className?: string;
  paddingCard?: string;
};

export type HistoryEventProps = {
  marker?: string;
  side?: EventSide;
  imageSlot?: React.ReactNode;
  image?: PlasmicImage;
  imageAlt?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  cardPadding?: CssSize;
  cardRadius?: CssSize;
  cardBackground?: string;
  imageAspectRatio?: string;
  className?: string;
  paddingCard?: string;
};

function cssSize(value: CssSize | undefined, fallback: string) {
  if (value === undefined || value === "") return fallback;
  return typeof value === "number" ? `${value}px` : value;
}

function imageSource(image: PlasmicImage | undefined) {
  return typeof image === "string" ? image : image?.src;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sameIndexes(left: Set<number>, right: Set<number>) {
  return (
    left.size === right.size &&
    Array.from(left).every((index) => right.has(index))
  );
}

export function HistoryTimeline({
  children,
  points,
  activationPoint = 58,
  lineColor = "#d9d9de",
  activeColor = "#6f4bf2",
  lineWidth = 2,
  eventsGap = 72,
  mobileBreakpoint = 680,
  showMarkerLabels = true,
  onPointActivate,
  onPointDeactivate,
  className,
  paddingCard = "16px",
}: HistoryTimelineProps) {
  const rootRef = React.useRef<HTMLElement>(null);
  const activationHandlerRef = React.useRef(onPointActivate);
  const deactivationHandlerRef = React.useRef(onPointDeactivate);
  const [activeIndexes, setActiveIndexes] = React.useState<Set<number>>(
    () => new Set()
  );
  const instanceClass = `history-${React.useId().replace(/:/g, "")}`;
  const activationRatio = clamp(activationPoint, 0, 100) / 100;
  const breakpoint = Math.max(320, Math.round(mobileBreakpoint));

  const rootStyle = {
    "--history-line-color": lineColor,
    "--history-active-color": activeColor,
    "--history-line-width": cssSize(lineWidth, "2px"),
    "--history-events-gap": cssSize(eventsGap, "72px"),
  } as React.CSSProperties;

  React.useEffect(() => {
    activationHandlerRef.current = onPointActivate;
  }, [onPointActivate]);

  React.useEffect(() => {
    deactivationHandlerRef.current = onPointDeactivate;
  }, [onPointDeactivate]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;

    const update = () => {
      frame = 0;
      const items = Array.from(
        root.querySelectorAll<HTMLElement>("[data-history-event]")
      );
      const markers = items
        .map((item) => item.querySelector<HTMLElement>("[data-history-marker]"))
        .filter((marker): marker is HTMLElement => Boolean(marker));

      if (!markers.length) {
        root.style.setProperty("--history-track-top", "0px");
        root.style.setProperty("--history-track-height", "0px");
        root.style.setProperty("--history-progress", "0");
        root.classList.add("history-is-enhanced");
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const centers = markers.map((marker) => {
        const rect = marker.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      const first = centers[0];
      const last = centers[centers.length - 1];
      const activationY = window.innerHeight * activationRatio;
      const distance = Math.max(last - first, 1);
      const progress = markers.length === 1
        ? Number(first <= activationY)
        : clamp((activationY - first) / distance, 0, 1);
      const nextActiveIndexes = new Set<number>();

      root.style.setProperty("--history-track-top", `${first - rootRect.top}px`);
      root.style.setProperty("--history-track-height", `${Math.max(last - first, 0)}px`);
      root.style.setProperty("--history-progress", String(progress));

      items.forEach((item, index) => {
        const wasActive = item.classList.contains("history-is-active");
        const isActive = centers[index] <= activationY;
        item.classList.toggle("history-is-active", isActive);
        if (isActive) nextActiveIndexes.add(index);

        if (isActive && !wasActive) {
          activationHandlerRef.current?.(
            index,
            item.dataset.historyMarkerValue || ""
          );
        }
        if (!isActive && wasActive) {
          deactivationHandlerRef.current?.(
            index,
            item.dataset.historyMarkerValue || ""
          );
        }
      });
      setActiveIndexes((current) =>
        sameIndexes(current, nextActiveIndexes) ? current : nextActiveIndexes
      );
      root.classList.add("history-is-enhanced");
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(scheduleUpdate);
      resizeObserver.observe(root);
      root
        .querySelectorAll<HTMLElement>("[data-history-event]")
        .forEach((item) => resizeObserver?.observe(item));
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
    };
  }, [children, activationRatio]);

  const eventNodes = React.Children.toArray(children);
  const pointNodes = React.Children.toArray(points);

  return (
    <section
      ref={rootRef}
      className={["history-timeline", instanceClass, className]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      aria-label="История"
    >
      <style>{`
        .${instanceClass}.history-timeline {
          position: relative;
          width: 100%;
        }
        .${instanceClass} .history-timeline__track {
          position: absolute;
          z-index: 0;
          top: var(--history-track-top);
          left: 50%;
          width: var(--history-line-width);
          height: var(--history-track-height);
          overflow: hidden;
          transform: translateX(-50%);
          background: var(--history-line-color);
          pointer-events: none;
        }
        .${instanceClass} .history-timeline__fill {
          position: absolute;
          inset: 0;
          background: var(--history-active-color);
          transform: scaleY(var(--history-progress, 0));
          transform-origin: top;
          will-change: transform;
        }
        .${instanceClass} .history-timeline__list {
          display: grid;
          gap: var(--history-events-gap);
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .${instanceClass} .history-event {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) max-content minmax(0, 1fr);
          align-items: center;
        }
        .${instanceClass} .history-event__card-wrap {
          min-width: 0;
        }
        .${instanceClass} .history-event--left .history-event__card-wrap {
          grid-column: 1;
          padding-right: ${paddingCard};
        }
        .${instanceClass} .history-event--right .history-event__card-wrap {
          grid-column: 3;
          padding-left: ${paddingCard};
        }
        .${instanceClass} .history-event__axis {
          grid-column: 2;
          grid-row: 1;
          display: grid;
          justify-items: center;
          gap: 12px;
          color: #8a8a94;
          text-align: center;
          transition: color .35s ease;
        }
        .${instanceClass} .history-event__marker-anchor {
          display: grid;
          place-items: center;
          min-width: 16px;
          min-height: 16px;
        }
        .${instanceClass} .history-event__default-marker {
          display: flow;
          width: fit-content;
          max-width: 120px;
          height: fit-content;
          font-size: 16px;
          padding: 4px 12px;
          color: white;
          border-radius: 999px;
          background: var(--history-line-color);
          box-shadow: 0 0 0 1px var(--history-line-color);
          transition: transform .35s ease, background-color .35s ease, box-shadow .35s ease;
        }
        .${instanceClass} .history-event__marker-label {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          opacity: .5;
          transform: translateY(4px);
          transition: opacity .35s ease, transform .35s ease;
        }
        .${instanceClass} .history-event__card {
          overflow: hidden;
          border-radius: var(--history-card-radius);
          background: var(--history-card-background);
          box-shadow: 0 12px 34px rgba(18, 18, 23, .08);
        }
        .${instanceClass} .history-event__image {
          display: block;
          width: 100%;
          aspect-ratio: var(--history-image-ratio);
          object-fit: cover;
        }
        .${instanceClass} .history-event__image-slot {
          position: relative;
          width: 100%;
          aspect-ratio: var(--history-image-ratio);
          overflow: hidden;
        }
        .${instanceClass} .history-event__image-slot > * {
          width: 100%;
          height: 100%;
        }
        .${instanceClass} .history-event__image-slot img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        .${instanceClass} .history-event__copy {
          display: grid;
          gap: 12px;
          padding: var(--history-card-padding);
        }
        .${instanceClass} .history-event__copy > * {
          margin: 0;
        }
        .${instanceClass} .history-event__eyebrow {
          color: #777780;
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .${instanceClass}.history-is-enhanced .history-event__card {
          opacity: .38;
          transform: translateY(24px);
          transition: opacity .55s ease, transform .55s ease;
        }
        .${instanceClass} .history-event.history-is-active .history-event__card {
          opacity: 1;
          transform: translateY(0);
        }
        .${instanceClass} .history-event.history-is-active .history-event__axis {
          color: inherit;
        }
        .${instanceClass} .history-event.history-is-active .history-event__marker-label {
          opacity: 1;
          transform: translateY(0);
        }
        .${instanceClass} .history-event.history-is-active .history-event__default-marker {
          transform: scale(1.22);
          background: var(--history-active-color);
          box-shadow: 0 0 15px 5px color-mix(in srgb, var(--history-active-color) 20%, transparent);
        }
        @media (max-width: ${breakpoint}px) {
          .${instanceClass}.history-timeline {
            padding-top: 16px;
          }
          .${instanceClass} .history-timeline__track {
          }
          .${instanceClass} .history-event {
            min-height: 0;
            display: inline-flex;
            flex-direction: column;
            align-items: center;
          }
          .${instanceClass} .history-event__axis {
            grid-column: 1;
            padding: 20px 0px;
            order:1 ;
          }
          .${instanceClass} .history-event__card-wrap,
          .${instanceClass} .history-event--left .history-event__card-wrap,
          .${instanceClass} .history-event--right .history-event__card-wrap {
            order: 2;
            padding: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${instanceClass} .history-event__card,
          .${instanceClass} .history-event__axis,
          .${instanceClass} .history-event__default-marker,
          .${instanceClass} .history-event__marker-label {
            transition: none;
          }
        }
      `}</style>

      <div className="history-timeline__track" aria-hidden="true">
        <div className="history-timeline__fill" />
      </div>
      <ol className="history-timeline__list">
        {eventNodes.map((eventNode, index) => (
          <HistoryPointContext.Provider
            key={index}
            value={{
              point: pointNodes[index],
              index,
              active: activeIndexes.has(index),
              showMarkerLabel: showMarkerLabels,
            }}
          >
            {eventNode}
          </HistoryPointContext.Provider>
        ))}
      </ol>
    </section>
  );
}

export function HistoryEvent({
  marker = "2008",
  side = "left",
  imageSlot,
  image,
  imageAlt = "",
  title = "Заголовок события",
  subtitle = "Короткое описание важного события.",
  eyebrow,
  cardPadding = 24,
  cardRadius = 16,
  cardBackground = "#ffffff",
  imageAspectRatio = "16 / 10",
  className,
  paddingCard = '16px'
}: HistoryEventProps) {
  const pointContext = React.useContext(HistoryPointContext);
  const src = imageSource(image);
  const hasImageSlot = React.Children.count(imageSlot) > 0;
  const cardStyle = {
    "--history-card-padding": cssSize(cardPadding, "24px"),
    "--history-card-radius": cssSize(cardRadius, "16px"),
    "--history-card-background": cardBackground,
    "--history-image-ratio": imageAspectRatio || "16 / 10",
  } as React.CSSProperties;

  const pointMarker = marker;
  const pointMarkerIsYear = /^\d{4}$/.test(pointMarker.trim());
  const markerLabel = pointMarkerIsYear ? (
    <time dateTime={pointMarker}>{pointMarker}</time>
  ) : (
    <span>{pointMarker}</span>
  );

  return (
    <li
      className={["history-event", `history-event--${side}`, className]
        .filter(Boolean)
        .join(" ")}
      data-history-event
      data-history-marker-value={pointMarker}
    >
      <div className="history-event__card-wrap">
        <article className="history-event__card" style={cardStyle}>
          {hasImageSlot ? (
            <div className="history-event__image-slot">{imageSlot}</div>
          ) : src ? (
            <img className="history-event__image" src={src} alt={imageAlt} />
          ) : null}
          <div className="history-event__copy">
            {eyebrow ? (
              <div className="history-event__eyebrow">{eyebrow}</div>
            ) : null}
            {title ? <div className="history-event__title">{title}</div> : null}
            {subtitle ? (
              <div className="history-event__subtitle">{subtitle}</div>
            ) : null}
          </div>
        </article>
      </div>
      <div className="history-event__axis">
        <div
          className="history-event__marker-anchor"
          data-history-marker
          aria-hidden="true"
        >
          {pointContext.point ? (
            <DataProvider
              name="historyPoint"
              data={{
                marker: pointMarker,
                index: pointContext.index,
                active: pointContext.active,
              }}
            >
              {pointContext.point}
            </DataProvider>
          ) : (
            <span className="history-event__default-marker rf-550 rf-w-80">{markerLabel}</span>
          )}
        </div>
      </div>
    </li>
  );
}

export default HistoryTimeline;
