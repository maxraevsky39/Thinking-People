import * as React from "react";
import { useEffect, useRef } from "react";

export type DynamicBottomNavProps = {
  children?: React.ReactNode;
  className?: string;

  /**
   * Желаемая визуальная ширина меню
   * в полностью компактном состоянии.
   */
  collapsedWidth?: number;

  /**
   * Примерно сколько px скролла требуется,
   * чтобы перейти от 100% к компактному состоянию.
   */
  shrinkDistance?: number;

  /**
   * Отступ меню от нижнего края экрана.
   */
  bottom?: number;

  /**
   * Движения скролла меньше этого значения
   * игнорируются.
   */
  deadZone?: number;

  /**
   * Через сколько мс после окончания скролла
   * меню начинает досаживаться
   * до ближайшего состояния.
   */
  snapDelay?: number;

  /**
   * Насколько сильно скорость скролла
   * влияет на выбор конечного состояния.
   */
  inertia?: number;
};

const clamp = (
  value: number,
  min: number,
  max: number
) => Math.min(Math.max(value, min), max);

export function DynamicBottomNav({
  children,
  className,

  collapsedWidth = 320,
  shrinkDistance = 180,
  bottom = 12,

  deadZone = 1.5,
  snapDelay = 140,
  inertia = 170,
}: DynamicBottomNavProps) {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    /**
     * =========================================================
     * STATE
     * =========================================================
     */

    let lastScrollY = Math.max(
      window.scrollY,
      0
    );

    let lastScrollTime =
      performance.now();

    /**
     * 0 = полностью раскрыто
     * 1 = полностью уменьшено
     */
    let targetProgress = 0;
    let currentProgress = 0;

    /**
     * Скорость скролла.
     *
     * > 0 = пользователь движется вниз
     * < 0 = пользователь движется вверх
     *
     * px / ms
     */
    let scrollVelocity = 0;

    /**
     * Когда пользователь нажал на уменьшенное меню,
     * раскрываем его немного быстрее.
     */
    let forceExpanding = false;

    let rafId: number | null = null;

    let snapTimer:
      | ReturnType<typeof setTimeout>
      | null = null;

    let lastFrameTime =
      performance.now();

    /**
     * =========================================================
     * SCALE
     * =========================================================
     */

    const getCollapsedScale = () => {
      /**
       * offsetWidth не учитывает CSS transform.
       *
       * Поэтому даже когда nav уже scale(.85),
       * здесь по-прежнему получаем его
       * исходную реальную ширину.
       */
      const expandedWidth =
        nav.offsetWidth;

      if (!expandedWidth) {
        return 1;
      }

      return clamp(
        collapsedWidth /
          expandedWidth,

        /**
         * Не позволяем меню стать
         * совсем крошечным.
         */
        0.55,

        1
      );
    };

    /**
     * =========================================================
     * ANIMATION
     * =========================================================
     */

    const render = (
      now: number
    ) => {
      /**
       * Ограничиваем deltaTime,
       * чтобы после переключения вкладок
       * не происходил огромный скачок.
       */
      const deltaTime = Math.min(
        now - lastFrameTime,
        32
      );

      lastFrameTime = now;

      const difference =
        targetProgress -
        currentProgress;

      const isExpanding =
        targetProgress <
        currentProgress;

      /**
       * Скорости:
       *
       * тап по меню → самое быстрое раскрытие
       * скролл вверх → быстрое раскрытие
       * скролл вниз → более спокойное схлопывание
       */
      const followSpeed =
        forceExpanding
          ? 22
          : isExpanding
            ? 15
            : 10;

      /**
       * Frame-rate independent smoothing.
       *
       * Будет примерно одинаково работать
       * на 60Hz и 120Hz экранах.
       */
      const smoothing =
        1 -
        Math.exp(
          -followSpeed *
            (deltaTime / 1000)
        );

      currentProgress +=
        difference * smoothing;

      /**
       * Не оставляем бесконечные
       * микроскопические дроби.
       */
      if (
        Math.abs(difference) <
        0.0005
      ) {
        currentProgress =
          targetProgress;
      }

      /**
       * Если полностью раскрылись,
       * выключаем режим
       * принудительного раскрытия.
       */
      if (
        currentProgress <= 0.001
      ) {
        currentProgress = 0;

        if (
          targetProgress === 0
        ) {
          forceExpanding = false;
        }
      }

      const collapsedScale =
        getCollapsedScale();

      /**
       *
       * progress = 0
       * scale = 1
       *
       * progress = 1
       * scale = collapsedScale
       *
       */
      const scale =
        1 -
        (1 - collapsedScale) *
          currentProgress;

      /**
       * Небольшое движение вниз
       * при уменьшении.
       *
       * Добавляет ощущение,
       * что объект немного "оседает".
       */
      const translateY =
        currentProgress * 0;

      /**
       * Масштабируем весь nav,
       * поэтому масштабируются:
       *
       * - текст
       * - иконки
       * - padding
       * - gap
       * - radius
       * - вложенные компоненты
       */
      nav.style.transform = `
        translate3d(
          -50%,
          ${translateY}px,
          0
        )
        scale(${scale})
      `;

      /**
       * CSS variables можно использовать
       * во вложенном меню при необходимости.
       *
       * Например:
       *
       * opacity:
       * calc(1 - var(--nav-progress))
       */
      nav.style.setProperty(
        "--nav-progress",
        String(currentProgress)
      );

      nav.style.setProperty(
        "--nav-scale",
        String(scale)
      );

      /**
       * Продолжаем анимацию,
       * пока не догнали target.
       */
      if (
        Math.abs(
          targetProgress -
            currentProgress
        ) > 0.0005
      ) {
        rafId =
          requestAnimationFrame(
            render
          );
      } else {
        rafId = null;
      }
    };

    const requestRender = () => {
      if (rafId !== null) {
        return;
      }

      lastFrameTime =
        performance.now();

      rafId =
        requestAnimationFrame(
          render
        );
    };

    /**
     * =========================================================
     * SNAP + INERTIA
     * =========================================================
     */

    const snap = () => {
      const scrollY = Math.max(
        window.scrollY,
        0
      );

      /**
       * На самом верху страницы
       * всегда раскрываем меню.
       */
      if (scrollY <= 4) {
        targetProgress = 0;
        scrollVelocity = 0;

        requestRender();

        return;
      }

      /**
       * Примерно прогнозируем,
       * куда движение продолжилось бы
       * по инерции.
       */
      const predictedDelta =
        scrollVelocity * inertia;

      const predictedProgress =
        targetProgress +
        predictedDelta /
          shrinkDistance;

      /**
       * Гистерезис.
       *
       * Если движение было вверх,
       * легче перейти в раскрытое состояние.
       *
       * Если вниз —
       * легче перейти в компактное.
       */
      if (
        scrollVelocity < -0.08
      ) {
        targetProgress =
          predictedProgress < 0.82
            ? 0
            : 1;
      } else if (
        scrollVelocity > 0.08
      ) {
        targetProgress =
          predictedProgress > 0.18
            ? 1
            : 0;
      } else {
        /**
         * Если движение практически
         * остановилось —
         * выбираем ближайшее состояние.
         */
        targetProgress =
          predictedProgress >= 0.5
            ? 1
            : 0;
      }

      requestRender();
    };

    const scheduleSnap = () => {
      if (snapTimer) {
        clearTimeout(
          snapTimer
        );
      }

      snapTimer =
        setTimeout(() => {
          snapTimer = null;
          snap();
        }, snapDelay);
    };

    /**
     * =========================================================
     * SCROLL
     * =========================================================
     */

    const handleScroll = () => {
      const now =
        performance.now();

      /**
       * iOS Safari может давать
       * отрицательный scrollY
       * при rubber-band эффекте.
       */
      const scrollY = Math.max(
        window.scrollY,
        0
      );

      const delta =
        scrollY -
        lastScrollY;

      const elapsed = Math.max(
        now -
          lastScrollTime,
        1
      );

      lastScrollY = scrollY;
      lastScrollTime = now;

      /**
       * Если пользователь снова скроллит,
       * отменяем принудительное
       * раскрытие от предыдущего клика.
       */
      forceExpanding = false;

      /**
       * Верх страницы.
       */
      if (scrollY <= 4) {
        targetProgress = 0;
        scrollVelocity = 0;

        requestRender();
        scheduleSnap();

        return;
      }

      /**
       * Игнорируем очень маленькие
       * изменения позиции.
       */
      if (
        Math.abs(delta) <
        deadZone
      ) {
        scheduleSnap();

        return;
      }

      /**
       * Текущая скорость
       * движения скролла.
       */
      const instantVelocity =
        delta / elapsed;

      /**
       * Low-pass фильтр:
       * сглаживаем скорость.
       */
      scrollVelocity =
        scrollVelocity * 0.72 +
        instantVelocity * 0.28;

      /**
       * Вниз:
       *
       * targetProgress → 1
       *
       * Вверх:
       *
       * targetProgress → 0
       */
      targetProgress = clamp(
        targetProgress +
          delta /
            shrinkDistance,

        0,
        1
      );

      requestRender();
      scheduleSnap();
    };

    /**
     * =========================================================
     * CLICK TO EXPAND
     * =========================================================
     */

    const handleNavClick = (
      event: MouseEvent
    ) => {
      /**
       * Если меню раскрыто практически
       * полностью —
       * ничего не перехватываем.
       *
       * Ссылка / кнопка внутри
       * работает как обычно.
       */
      if (
        currentProgress <= 0.01
      ) {
        return;
      }

      /**
       * Если меню уменьшено —
       * первый клик используется
       * исключительно для раскрытия.
       *
       * Поэтому отменяем:
       *
       * <a href>
       * button
       * Plasmic interactions
       */
      event.preventDefault();
      event.stopPropagation();

      /**
       * Останавливаем snap,
       * который мог попытаться
       * снова уменьшить меню.
       */
      if (snapTimer) {
        clearTimeout(
          snapTimer
        );

        snapTimer = null;
      }

      scrollVelocity = 0;

      targetProgress = 0;

      /**
       * Более быстрое раскрытие,
       * чем от обычного scroll-up.
       */
      forceExpanding = true;

      requestRender();
    };

    /**
     * =========================================================
     * RESIZE
     * =========================================================
     */

    const handleResize = () => {
      requestRender();
    };

    /**
     * =========================================================
     * EVENT LISTENERS
     * =========================================================
     */

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    /**
     * true = capture phase.
     *
     * Благодаря этому обработчик
     * nav получает событие ДО
     * вложенной ссылки или кнопки.
     */
    nav.addEventListener(
      "click",
      handleNavClick,
      true
    );

    /**
     * Начальный render.
     */
    requestRender();

    /**
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      nav.removeEventListener(
        "click",
        handleNavClick,
        true
      );

      if (rafId !== null) {
        cancelAnimationFrame(
          rafId
        );
      }

      if (snapTimer) {
        clearTimeout(
          snapTimer
        );
      }
    };
  }, [
    collapsedWidth,
    shrinkDistance,
    deadZone,
    snapDelay,
    inertia,
  ]);

  return (
    <nav
      ref={navRef}
      className={`${className ?? ""} navbarMain-mob`}
      style={{
        position: "fixed",

        left: "50%",

        bottom: `${bottom}px`,

        zIndex: 1000,

        /**
         * Меню уменьшается
         * относительно нижнего центра.
         */
        transformOrigin:
          "50% 100%",

        transform:
          "translate3d(-50%, 0, 0) scale(1)",

        /**
         * Основная анимация идёт
         * только через transform.
         *
         * Это гораздо дешевле
         * для браузера, чем width/height.
         */
        willChange:
          "transform",

        backfaceVisibility:
          "hidden",

        WebkitBackfaceVisibility:
          "hidden",
      }}
    >
      {children}
    </nav>
  );
}