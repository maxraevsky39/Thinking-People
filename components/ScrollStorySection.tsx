import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ScrollStorySectionProps {
  children?: ReactNode;
  className?: string;

  /**
   * CSS-селектор карточек внутри children.
   * Всем карточкам в Plasmic нужно назначить этот класс.
   */
  cardSelector?: string;

  /**
   * Общая длина закреплённой прокрутки в пикселях.
   */
  scrollDistance?: number;

  /**
   * Насколько плавно анимация догоняет прокрутку.
   */
  scrub?: boolean | number;

  /**
   * Продолжительность появления одной карточки
   * в относительных единицах Timeline.
   */
  cardDuration?: number;

  /**
   * Общий интервал между появлением
   * первой и последней карточки.
   */
  staggerAmount?: number;

  /**
   * Пауза после появления всех карточек.
   */
  holdDuration?: number;

  /**
   * Продолжительность ухода всей композиции.
   */
  exitDuration?: number;

  cardFromX?: number;
  cardFromY?: number;
  cardFromScale?: number;

  exitX?: number;
  exitY?: number;
  exitOpacity?: number;

  cardEase?: string;
  exitEase?: string;

  markers?: boolean;
}

export function ScrollStorySection({
  children,
  className = "",

  cardSelector = ".scroll-card",

  scrollDistance = 1200,
  scrub = 0.5,

  cardDuration = 0.16,
  staggerAmount = 0.22,
  holdDuration = 0.12,
  exitDuration = 0.45,

  cardFromX = 0,
  cardFromY = 60,
  cardFromScale = 0.92,

  exitX = 0,
  exitY = -160,
  exitOpacity = 0,

  cardEase = "power2.out",
  exitEase = "power2.inOut",

  markers = false,
}: ScrollStorySectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinRef.current;
    const scene = sceneRef.current;

    if (!section || !pinContainer || !scene) {
      return;
    }

    const cards = Array.from(
      scene.querySelectorAll<HTMLElement>(cardSelector)
    );

    if (!cards.length) {
      console.warn(
        `ScrollStorySection: элементы по селектору "${cardSelector}" не найдены`
      );

      return;
    }

    const context = gsap.context(() => {
      /*
       * Момент начала ухода всей композиции:
       * появление карточки
       * + разброс появления карточек
       * + небольшая пауза.
       */
      const exitStart =
        cardDuration +
        staggerAmount +
        holdDuration;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${scrollDistance}`,

          /*
           * Закрепляем внешний контейнер,
           * но анимируем внутренний scene.
           */
          pin: pinContainer,

          scrub,
          markers,

          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
       * Карточки появляются почти одновременно,
       * но с небольшим последовательным смещением.
       */
      timeline.fromTo(
        cards,
        {
          autoAlpha: 0,
          x: cardFromX,
          y: cardFromY,
          scale: cardFromScale,
        },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,

          duration: cardDuration,

          stagger: {
            amount: staggerAmount,
            from: "start",
          },

          ease: cardEase,
        },
        0
      );

      /*
       * Здесь уезжает scene целиком:
       * заголовок и все карточки вместе.
       */
      timeline.to(
        scene,
        {
          x: exitX,
          y: exitY,
          autoAlpha: exitOpacity,

          duration: exitDuration,
          ease: exitEase,
        },
        exitStart
      );
    }, section);

    return () => {
      context.revert();
    };
  }, [
    cardSelector,
    scrollDistance,
    scrub,

    cardDuration,
    staggerAmount,
    holdDuration,
    exitDuration,

    cardFromX,
    cardFromY,
    cardFromScale,

    exitX,
    exitY,
    exitOpacity,

    cardEase,
    exitEase,
    markers,
  ]);

  return (
    <section
      ref={sectionRef}
      className={`scroll-story-section ${className}`.trim()}
    >
      <div
        ref={pinRef}
        className="scroll-story-pin"
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          ref={sceneRef}
          className="scroll-story-scene"
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

export default ScrollStorySection;