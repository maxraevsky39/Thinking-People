import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let scrollSyncInstalled = false;

function installScrollTriggerScrollSync() {
  if (
    typeof window === "undefined" ||
    scrollSyncInstalled
  ) {
    return;
  }

  scrollSyncInstalled = true;

  const finalSync = () => {
    requestAnimationFrame(() => {
      /**
       * КЛЮЧЕВОЕ отличие от прошлых попыток:
       *
       * перед refresh удаляем сохранённую ScrollTrigger
       * позицию прокрутки.
       */
      ScrollTrigger.clearScrollMemory();

      /**
       * Теперь refresh должен использовать реальный
       * текущий scrollY браузера.
       */
      ScrollTrigger.refresh(true);
    });
  };

  if (document.readyState === "complete") {
    finalSync();
  } else {
    window.addEventListener(
      "load",
      finalSync,
      { once: true }
    );
  }
if (typeof window !== "undefined") {
  const w = window as typeof window & {
    __scrollTriggerDebugInstalled?: boolean;
  };

  if (!w.__scrollTriggerDebugInstalled) {
    w.__scrollTriggerDebugInstalled = true;

    console.log("[GSAP VERSION]", gsap.version);

    ScrollTrigger.addEventListener("refreshInit", () => {
      console.log("[ST refreshInit]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
        innerHeight: window.innerHeight,
      });
    });

    ScrollTrigger.addEventListener("refresh", () => {
      console.log("[ST refresh]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
        innerHeight: window.innerHeight,
        triggers: ScrollTrigger.getAll().map((st) => ({
          start: Math.round(st.start),
          end: Math.round(st.end),
          progress: Number(st.progress.toFixed(3)),
          trigger:
            st.trigger instanceof HTMLElement
              ? st.trigger.className
              : null,
        })),
      });
    });

    ScrollTrigger.addEventListener("scrollStart", () => {
      console.log("[ST scrollStart]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
      });
    });

    ScrollTrigger.addEventListener("scrollEnd", () => {
      console.log("[ST scrollEnd]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
      });
    });

    window.addEventListener("load", () => {
      console.log("[WINDOW load]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
      });
    });

    window.addEventListener("resize", () => {
      console.log("[WINDOW resize]", {
        time: Math.round(performance.now()),
        scrollY: Math.round(window.scrollY),
        width: window.innerWidth,
        height: window.innerHeight,
      });
    });

    window.addEventListener("hashchange", () => {
      console.log("[HASH change]", {
        time: Math.round(performance.now()),
        hash: window.location.hash,
        scrollY: Math.round(window.scrollY),
      });
    });

    window.addEventListener("pageshow", (event) => {
      console.log("[WINDOW pageshow]", {
        time: Math.round(performance.now()),
        persisted: event.persisted,
        scrollY: Math.round(window.scrollY),
      });
    });

    document.addEventListener(
      "load",
      (event) => {
        const target = event.target;

        if (target instanceof HTMLIFrameElement) {
          console.log("[IFRAME load]", {
            time: Math.round(performance.now()),
            src: target.src,
            scrollY: Math.round(window.scrollY),
            rect: target.getBoundingClientRect().toJSON(),
          });
        }
      },
      true
    );
  }
}
  /**
   * Back/Forward Cache.
   */
  window.addEventListener("pageshow", event => {
    if (event.persisted) {
      finalSync();
    }
  });
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.config({
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,resize",
  });

  installScrollTriggerScrollSync();
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScrollSectionProps {
  children?: ReactNode;
  className?: string;

  /** CSS class(es) on the content wrapper. Enables CSS @keyframes mode. */
  animationClassName?: string;

  start?: string;
  end?: string;

  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;

  fromOpacity?: number;
  toOpacity?: number;

  fromY?: number;
  toY?: number;

  fromX?: number;
  toX?: number;

  ease?: string;

  fromScale?: number;
  toScale?: number;

  fromRotation?: number;
  toRotation?: number;

  fromBlur?: number;
  toBlur?: number;

  fromRotationX?: number;
  toRotationX?: number;

  fromRotationY?: number;
  toRotationY?: number;

  perspective?: number;
  transformOrigin?: string;
}

type ControlledAnimation = {
  animation: Animation;
  endTime: number;
};

/**
 * При открытии страницы сразу с #anchor браузер может установить scrollY
 * уже после первого React layout effect.
 *
 * Мы НЕ делаем refresh().
 * Мы просто заставляем ScrollTrigger прочитать текущий scrollY,
 * а затем сразу ставим tween в соответствующий progress.
 *
 * Это особенно важно для scrub={number}, потому что иначе tween может
 * несколько секунд "догонять" правильное положение от progress=0.
 */
function syncTweenAfterInitialAnchor(
  tween: gsap.core.Tween,
  afterSync?: () => void
) {
  if (
    typeof window === "undefined" ||
    !window.location.hash
  ) {
    return () => {};
  }

  let frame2: number | null = null;

  const frame1 = requestAnimationFrame(() => {
    frame2 = requestAnimationFrame(() => {
      /**
       * Только update.
       *
       * Никакого refresh:
       * start/end не пересчитываем и анимацию не сбрасываем.
       */
      ScrollTrigger.update();

      const trigger = tween.scrollTrigger;

      if (!trigger) return;

      /**
       * Ключевой момент.
       *
       * При numeric scrub ScrollTrigger обычно плавно догоняет
       * текущую позицию. При первоначальной загрузке по #anchor
       * нам это не нужно — визуальное состояние должно сразу
       * соответствовать текущей позиции страницы.
       */
      tween.totalProgress(trigger.progress, true);

      afterSync?.();
    });
  });

  return () => {
    cancelAnimationFrame(frame1);

    if (frame2 !== null) {
      cancelAnimationFrame(frame2);
    }
  };
}

export function ScrollSection({
  children,
  className = "",
  animationClassName = "",

  start = "top bottom",
  end = "bottom top",

  scrub = true,
  pin = false,
  markers = false,

  ease = "power2.inOut",

  fromOpacity = 0,
  toOpacity = 1,

  fromY = 80,
  toY = 0,

  fromX = 0,
  toX = 0,

  fromScale = 0.95,
  toScale = 1,

  fromRotation = 0,
  toRotation = 0,

  fromBlur = 0,
  toBlur = 0,

  fromRotationX = 0,
  toRotationX = 0,

  fromRotationY = 0,
  toRotationY = 0,

  perspective = 1000,
  transformOrigin = "center center",
}: ScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    console.log(
  "[ScrollSection MOUNT]",
  {
    time: performance.now(),
    scrollY: window.scrollY,
    sectionTop:
      sectionRef.current?.getBoundingClientRect().top,
  }
);
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) {
      return;
    }

    /**
     * ==========================================================
     * CSS @KEYFRAMES MODE
     * ==========================================================
     */

    if (animationClassName.trim()) {
      const previousPlayState =
        content.style.animationPlayState;

      const previousFillMode =
        content.style.animationFillMode;

      content.style.animationPlayState = "paused";
      content.style.animationFillMode = "both";

      const progress = {
        value: 0,
      };

      let animations: ControlledAnimation[] = [];
      let totalDuration = 0;

      const renderFrame = () => {
        if (!animations.length || totalDuration <= 0) {
          return;
        }

        const timelineTime =
          gsap.utils.clamp(0, 1, progress.value) *
          totalDuration;

        for (const item of animations) {
          item.animation.currentTime = Math.min(
            timelineTime,
            item.endTime
          );
        }
      };

      const collectAnimations = () => {
        const found: ControlledAnimation[] = [];

        let maxEndTime = 0;

        for (const animation of content.getAnimations()) {
          /**
           * Отбрасываем transitions и анимации дочерних элементов.
           */
          if (!("animationName" in animation)) {
            continue;
          }

          const effect =
            animation.effect as KeyframeEffect | null;

          if (!effect || effect.target !== content) {
            continue;
          }

          const endTime = Number(
            effect.getComputedTiming().endTime
          );

          if (
            !Number.isFinite(endTime) ||
            endTime <= 0
          ) {
            continue;
          }

          animation.pause();

          found.push({
            animation,
            endTime,
          });

          maxEndTime = Math.max(
            maxEndTime,
            endTime
          );
        }

        animations = found;
        totalDuration = maxEndTime;

        renderFrame();
      };

      /**
       * Обычно CSS уже есть к моменту layout effect.
       */
      collectAnimations();

      // gsap.context invokes its callback synchronously.
    let tween!: gsap.core.Tween;

      const context = gsap.context(() => {
        tween = gsap.to(progress, {
          value: 1,
          duration: 1,

          /**
           * GSAP двигает только время.
           * easing остаётся в CSS @keyframes.
           */
          ease: "none",

          onUpdate: renderFrame,

          scrollTrigger: {
            trigger: section,

            start,
            end,

            scrub,
            pin,
            markers,

            /**
             * ВАЖНО:
             *
             * invalidateOnRefresh здесь специально отсутствует.
             * Нам не нужно сбрасывать внутренние стартовые значения.
             */
          },
        });
      }, section);

      /**
       * Plasmic иногда применяет CSS не прямо в layout effect.
       *
       * Повторно собираем animations несколько кадров,
       * но НЕ вызываем ScrollTrigger.refresh().
       */
      let discoveryFrame: number | null = null;
      let attempts = 0;

      const discover = () => {
        collectAnimations();

        attempts += 1;

        if (
          animations.length === 0 &&
          attempts < 12
        ) {
          discoveryFrame =
            requestAnimationFrame(discover);
        }
      };

      discoveryFrame =
        requestAnimationFrame(discover);

      /**
       * Если CSS animation появилась позже.
       *
       * Опять же — только собираем animation,
       * никаких refresh().
       */
      const onAnimationStart = (
        event: AnimationEvent
      ) => {
        if (event.target !== content) {
          return;
        }

        collectAnimations();

        const trigger = tween.scrollTrigger;

        if (trigger) {
          tween.totalProgress(
            trigger.progress,
            true
          );

          renderFrame();
        }
      };

      content.addEventListener(
        "animationstart",
        onAnimationStart
      );

      /**
       * Исправление загрузки сразу через #form / #about / etc.
       */
      const cancelInitialSync =
        syncTweenAfterInitialAnchor(
          tween,
          renderFrame
        );

      return () => {
        cancelInitialSync();

        if (discoveryFrame !== null) {
          cancelAnimationFrame(discoveryFrame);
        }

        content.removeEventListener(
          "animationstart",
          onAnimationStart
        );

        context.revert();

        content.style.animationPlayState =
          previousPlayState;

        content.style.animationFillMode =
          previousFillMode;
      };
    }

    /**
     * ==========================================================
     * NORMAL GSAP MODE
     * ==========================================================
     */

    // gsap.context invokes its callback synchronously.
    let tween!: gsap.core.Tween;

    const context = gsap.context(() => {
      const fromVars: gsap.TweenVars = {
        opacity: fromOpacity,

        x: fromX,
        y: fromY,

        scale: fromScale,

        rotate: fromRotation,

        rotationX: fromRotationX,
        rotationY: fromRotationY,

        transformOrigin,
      };

      const toVars: gsap.TweenVars = {
        opacity: toOpacity,

        x: toX,
        y: toY,

        scale: toScale,

        rotate: toRotation,

        rotationX: toRotationX,
        rotationY: toRotationY,

        transformOrigin,

        ease,

        /**
         * Очень важно при загрузке страницы уже
         * в середине документа.
         *
         * fromTo по умолчанию имеет immediateRender=true,
         * то есть мгновенно пишет from-состояние.
         */
        immediateRender: false,

        scrollTrigger: {
          trigger: section,

          start,
          end,

          scrub,
          pin,
          markers,

          /**
           * invalidateOnRefresh убрали намеренно.
           */
        },
      };

      /**
       * Не затираем существующий CSS filter,
       * если blur вообще не используется.
       */
      if (
        fromBlur !== 0 ||
        toBlur !== 0
      ) {
        fromVars.filter =
          `blur(${Math.max(0, fromBlur)}px)`;

        toVars.filter =
          `blur(${Math.max(0, toBlur)}px)`;
      }

      const uses3D =
        fromRotationX !== 0 ||
        toRotationX !== 0 ||
        fromRotationY !== 0 ||
        toRotationY !== 0;

      if (
        perspective > 0 &&
        uses3D
      ) {
        fromVars.transformPerspective =
          perspective;

        toVars.transformPerspective =
          perspective;
      }

      tween = gsap.fromTo(
        content,
        fromVars,
        toVars
      );
    }, section);

    /**
     * Единственная специальная обработка #anchor.
     *
     * Не refresh(), а синхронизация progress.
     */
    const cancelInitialSync =
      syncTweenAfterInitialAnchor(tween);

    return () => {
      cancelInitialSync();
      context.revert();
    };
  }, [
    animationClassName,

    start,
    end,

    scrub,
    pin,
    markers,

    fromOpacity,
    toOpacity,

    ease,

    fromX,
    toX,

    fromY,
    toY,

    fromScale,
    toScale,

    fromRotation,
    toRotation,

    fromBlur,
    toBlur,

    fromRotationX,
    toRotationX,

    fromRotationY,
    toRotationY,

    perspective,
    transformOrigin,
  ]);

  return (
    <section
      ref={sectionRef}
      className={
        `scroll-section ${className}`.trim()
      }
    >
      <div
        ref={contentRef}
        className={
          `scroll-section-content ${animationClassName}`.trim()
        }
      >
        {children}
      </div>
    </section>
  );
}

export default ScrollSection;