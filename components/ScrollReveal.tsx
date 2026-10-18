import React, {
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScrollRevealProps {
  text?: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;

  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;

  containerClassName?: string;
  textClassName?: string;

  rotationStart?: string;
  rotationEnd?: string;

  wordAnimationStart?: string;
  wordAnimationEnd?: string;
}

export function ScrollReveal({
  text = "Текст с анимацией",

  scrollContainerRef,

  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,

  containerClassName = "",
  textClassName = "",

  rotationStart = "top bottom",
  rotationEnd = "bottom bottom",

  wordAnimationStart = "top bottom-=20%",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    return text.split(/(\s+)/).map((part, index) => {
      if (/^\s+$/.test(part)) {
        return part;
      }

      return (
        <span className="scroll-reveal-word" key={`${part}-${index}`}>
          {part}
        </span>
      );
    });
  }, [text]);

 useIsomorphicLayoutEffect(() => {
  const container = containerRef.current;

  if (!container) {
    return;
  }

  const scroller = scrollContainerRef?.current ?? undefined;

  const context = gsap.context(() => {
    /*
     * Ищем слова только внутри текущего экземпляра компонента.
     */
    const words = Array.from(
      container.querySelectorAll<HTMLElement>(
        ".scroll-reveal-word"
      )
    );

    if (!words.length) {
      return;
    }

    /*
     * Сразу задаём исходное состояние всей группы.
     *
     * Важно: здесь нет stagger, поэтому все слова получают
     * blur и opacity одновременно ещё до начала анимации.
     */
    gsap.set(words, {
      opacity: baseOpacity,
      filter: enableBlur
        ? `blur(${blurStrength}px)`
        : "blur(0px)",
      willChange: "opacity, filter",
    });

    /*
     * Исходный поворот также задаём отдельно,
     * чтобы не полагаться на отложенную инициализацию fromTo.
     */
    gsap.set(container, {
      rotate: baseRotation,
      transformOrigin: "0% 50%",
    });

    /*
     * Поворот всего контейнера.
     */
    gsap.to(container, {
      rotate: 0,
      ease: "none",
      lazy: false,

      scrollTrigger: {
        trigger: container,
        scroller,
        start: rotationStart,
        end: rotationEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    /*
     * Проявление слов.
     *
     * Начальное состояние уже установлено через gsap.set(),
     * поэтому используется gsap.to(), а не fromTo().
     */
    gsap.to(words, {
      opacity: 1,
      filter: "blur(0px)",
      ease: "none",
      lazy: false,

      stagger: {
        each: 0.05,
        from: "start",
      },

      scrollTrigger: {
        trigger: container,
        scroller,
        start: wordAnimationStart,
        end: wordAnimationEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  }, container);

  return () => {
    context.revert();
  };
}, [
  scrollContainerRef,
  enableBlur,
  baseOpacity,
  baseRotation,
  blurStrength,
  rotationStart,
  rotationEnd,
  wordAnimationStart,
  wordAnimationEnd,
]);

  return (
    <h2
      ref={containerRef}
      className={`scroll-reveal ${containerClassName}`.trim()}
    >
      <span
        className={`scroll-reveal-text ${textClassName}`.trim()}
      >
        {splitText}
      </span>
    </h2>
  );
}

export default ScrollReveal;