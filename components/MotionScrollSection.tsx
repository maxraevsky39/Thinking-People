import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

type EaseFunction = (value: number) => number;

export interface MotionScrollSectionProps {
  children?: ReactNode;
  className?: string;

  /** Motion scroll offsets, for example "start end" and "end start". */
  offsetStart?: string;
  offsetEnd?: string;
  /** CSS selector for the element whose position drives the animation. */
  targetSelector?: string;
  /** CSS selector for the scrollable element. The viewport is used by default. */
  containerSelector?: string;
  /** Recalculate the scroll range when the tracked content changes size. */
  trackContentSize?: boolean;
  /** Scroll catch-up duration in seconds. Set to 0 to disable smoothing. */
  smoothing?: number;
  ease?: string;

  fromOpacity?: number;
  toOpacity?: number;
  fromY?: number;
  toY?: number;
  fromX?: number;
  toX?: number;
  fromScale?: number;
  toScale?: number;
  /** Rotation around the Z axis, in degrees. */
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

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
const out = (easeIn: EaseFunction): EaseFunction => value => 1 - easeIn(1 - value);
const inOut = (easeIn: EaseFunction): EaseFunction => value =>
  value < 0.5 ? easeIn(value * 2) / 2 : 1 - easeIn((1 - value) * 2) / 2;

function resolveEase(name: string): EaseFunction {
  const linear: EaseFunction = value => value;
  const power1: EaseFunction = value => value ** 2;
  const power2: EaseFunction = value => value ** 3;
  const power3: EaseFunction = value => value ** 4;
  const sine: EaseFunction = value => 1 - Math.cos((value * Math.PI) / 2);
  const expo: EaseFunction = value => value === 0 ? 0 : 2 ** (10 * value - 10);
  const circ: EaseFunction = value => 1 - Math.sqrt(1 - value ** 2);
  const back: EaseFunction = value => {
    const overshoot = 1.70158;
    return (overshoot + 1) * value ** 3 - overshoot * value ** 2;
  };
  const eases: Record<string, EaseFunction> = {
    none: linear,
    "sine.in": sine, "sine.out": out(sine), "sine.inOut": inOut(sine),
    "power1.in": power1, "power1.out": out(power1), "power1.inOut": inOut(power1),
    "power2.in": power2, "power2.out": out(power2), "power2.inOut": inOut(power2),
    "power3.in": power3, "power3.out": out(power3), "power3.inOut": inOut(power3),
    "expo.in": expo, "expo.out": out(expo), "expo.inOut": inOut(expo),
    "circ.in": circ, "circ.out": out(circ), "circ.inOut": inOut(circ),
    "back.in": back, "back.out": out(back), "back.inOut": inOut(back),
  };
  return eases[name] || linear;
}

export function MotionScrollSection({
  children,
  className = "",
  offsetStart = "start end",
  offsetEnd = "end start",
  targetSelector = "",
  containerSelector = "",
  trackContentSize = false,
  smoothing = 0.5,
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
}: MotionScrollSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const normalizedTargetSelector = targetSelector.trim();
  const normalizedContainerSelector = containerSelector.trim();
  const targetRef = useMemo(
    () => ({ current: null as HTMLElement | null }),
    [normalizedTargetSelector, trackContentSize]
  );
  const containerRef = useMemo(
    () => ({ current: null as HTMLElement | null }),
    [normalizedContainerSelector, trackContentSize]
  );

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    targetRef.current = section;
    containerRef.current =
      (document.scrollingElement as HTMLElement | null) ||
      document.documentElement;

    if (normalizedTargetSelector) {
      try {
        const target =
          section.querySelector<HTMLElement>(normalizedTargetSelector) ||
          document.querySelector<HTMLElement>(normalizedTargetSelector);

        if (target) {
          targetRef.current = target;
        } else {
          console.warn(
            `[MotionScrollSection] Target not found for selector "${normalizedTargetSelector}". Using the section instead.`
          );
        }
      } catch (error) {
        console.warn(
          `[MotionScrollSection] Invalid target selector "${normalizedTargetSelector}". Using the section instead.`,
          error
        );
      }
    }

    if (normalizedContainerSelector) {
      try {
        const container =
          section.closest<HTMLElement>(normalizedContainerSelector) ||
          document.querySelector<HTMLElement>(normalizedContainerSelector);

        if (container) {
          containerRef.current = container;
        } else {
          console.warn(
            `[MotionScrollSection] Container not found for selector "${normalizedContainerSelector}". Using the viewport instead.`
          );
        }
      } catch (error) {
        console.warn(
          `[MotionScrollSection] Invalid container selector "${normalizedContainerSelector}". Using the viewport instead.`,
          error
        );
      }
    }
  }, [
    containerRef,
    normalizedContainerSelector,
    normalizedTargetSelector,
    targetRef,
  ]);

  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: normalizedTargetSelector ? targetRef : sectionRef,
    ...(normalizedContainerSelector ? { container: containerRef } : {}),
    offset: [offsetStart, offsetEnd] as any,
    trackContentSize,
  });
  const smoothingDuration = Number.isFinite(smoothing)
    ? Math.max(0, smoothing)
    : 0;
  const smoothedScrollYProgress = useSpring(scrollYProgress, {
    visualDuration: Math.max(0.01, smoothingDuration),
    bounce: 0,
    skipInitialAnimation: true,
  });
  const sourceProgress =
    smoothingDuration > 0 ? smoothedScrollYProgress : scrollYProgress;
  const easing = resolveEase(ease);
  const progress = useTransform(sourceProgress, value =>
    prefersReducedMotion ? 1 : easing(clamp(value))
  );
  const opacity = useTransform(progress, [0, 1], [fromOpacity, toOpacity]);
  const x = useTransform(progress, [0, 1], [fromX, toX]);
  const y = useTransform(progress, [0, 1], [fromY, toY]);
  const scale = useTransform(progress, [0, 1], [fromScale, toScale]);
  const rotate = useTransform(progress, [0, 1], [fromRotation, toRotation]);
  const rotateX = useTransform(progress, [0, 1], [fromRotationX, toRotationX]);
  const rotateY = useTransform(progress, [0, 1], [fromRotationY, toRotationY]);
  const filter = useTransform(
    progress,
    [0, 1],
    [`blur(${Math.max(0, fromBlur)}px)`, `blur(${Math.max(0, toBlur)}px)`]
  );

  return (
    <section
      ref={sectionRef}
      className={`motion-scroll-section ${className}`.trim()}
    >
      <motion.div
        className="motion-scroll-section-content"
        style={{
          opacity,
          x,
          y,
          scale,
          rotate,
          rotateX,
          rotateY,
          filter,
          transformPerspective: perspective > 0 ? perspective : undefined,
          transformOrigin,
        }}
      >
        {children}
      </motion.div>
    </section>
  );
}

export default MotionScrollSection;
