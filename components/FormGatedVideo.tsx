import * as React from "react";

type RevealPhase =
  | "checking"
  | "content"
  | "fading-content"
  | "video-preparing"
  | "video";

type CookieSameSite =
  | "Lax"
  | "Strict"
  | "None";

type LeadFormSuccessDetail = {
  form?: HTMLFormElement;
  formId?: string;
};

function hasCookie(
  name: string,
  expectedValue: string
) {
  if (typeof document === "undefined") {
    return false;
  }

  const encodedName = encodeURIComponent(name);
  const encodedValue =
    encodeURIComponent(expectedValue);

  return document.cookie
    .split("; ")
    .some((cookie) => {
      const separatorIndex =
        cookie.indexOf("=");

      const cookieName =
        separatorIndex >= 0
          ? cookie.slice(0, separatorIndex)
          : cookie;

      const cookieValue =
        separatorIndex >= 0
          ? cookie.slice(separatorIndex + 1)
          : "";

      return (
        cookieName === encodedName &&
        cookieValue === encodedValue
      );
    });
}

function writeCookie({
  name,
  value,
  lifetimeDays,
  path,
  domain,
  sameSite,
  secure,
}: {
  name: string;
  value: string;
  lifetimeDays: number;
  path: string;
  domain?: string;
  sameSite: CookieSameSite;
  secure: boolean;
}) {
  if (typeof document === "undefined") {
    return;
  }

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}`,
    `Path=${path || "/"}`,
    `SameSite=${sameSite}`,
  ];

  if (lifetimeDays > 0) {
    parts.push(
      `Max-Age=${Math.floor(
        lifetimeDays * 24 * 60 * 60
      )}`
    );
  }

  if (domain?.trim()) {
    parts.push(`Domain=${domain.trim()}`);
  }

  if (
    secure &&
    window.location.protocol === "https:"
  ) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export interface FormGatedVideoProps {
  className?: string;
  children?: React.ReactNode;

  videoUrl?: string;
  iframeTitle?: string;

  iframeWidth?: string;
  iframeHeight?: number;
  iframeAspectRatio?: string;

  iframeBorder?: string;
  iframeBorderRadius?: number;
  iframeBackground?: string;

  iframeAllow?: string;
  iframeSandbox?: string;
  allowFullScreen?: boolean;
  iframeLoading?: "lazy" | "eager";

  /**
   * Если false, видео начнёт загружаться
   * только после успешной отправки формы.
   */
  loadIframeImmediately?: boolean;

  /**
   * Имя DOM-события от FormWebhookBridge.
   */
  successEventName?: string;

  /**
   * Задержка перед исчезновением формы.
   */
  hideDelaySeconds?: number;

  /**
   * Продолжительность анимации.
   */
  fadeDurationSeconds?: number;

  /**
   * Запоминать успешную отправку между страницами.
   */
  rememberAccess?: boolean;
  cookieName?: string;
  cookieValue?: string;
  cookieLifetimeDays?: number;
  cookiePath?: string;
  cookieDomain?: string;
  cookieSameSite?: CookieSameSite;
  secureCookie?: boolean;

  /**
   * Дополнительное событие для Plasmic.
   */
  onFormSuccess?: (formId: string) => void;
}

export function FormGatedVideo({
  className,
  children,

  videoUrl = "",
  iframeTitle = "Видео",

  iframeWidth = "100%",
  iframeHeight,
  iframeAspectRatio = "16 / 9",

  iframeBorder = "0",
  iframeBorderRadius = 0,
  iframeBackground = "#000000",

  iframeAllow = "autoplay; fullscreen; picture-in-picture",
  iframeSandbox,
  allowFullScreen = true,
  iframeLoading = "lazy",

  loadIframeImmediately = false,

  successEventName = "lead-form-success",
  hideDelaySeconds = 2,
  fadeDurationSeconds = 0.4,

  rememberAccess = true,
  cookieName = "video_access_granted",
  cookieValue = "1",
  cookieLifetimeDays = 365,
  cookiePath = "/",
  cookieDomain = "",
  cookieSameSite = "Lax",
  secureCookie = true,

  onFormSuccess,
}: FormGatedVideoProps) {
  const rootRef =
    React.useRef<HTMLDivElement | null>(null);

  const hideTimerRef =
    React.useRef<number | null>(null);

  const finishTimerRef =
    React.useRef<number | null>(null);

  const completedRef = React.useRef(false);

  const onFormSuccessRef =
    React.useRef(onFormSuccess);

  const [phase, setPhase] =
    React.useState<RevealPhase>("checking");

  const [reduceMotion, setReduceMotion] =
    React.useState(false);

  React.useEffect(() => {
    onFormSuccessRef.current = onFormSuccess;
  }, [onFormSuccess]);

  const clearTimers = React.useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(
        hideTimerRef.current
      );

      hideTimerRef.current = null;
    }

    if (finishTimerRef.current !== null) {
      window.clearTimeout(
        finishTimerRef.current
      );

      finishTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setReduceMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener(
      "change",
      updateMotionPreference
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  /**
   * При открытии страницы проверяем общий cookie.
   * Пока проверка не завершена, форма не рендерится,
   * чтобы пользователь не видел её краткое мигание.
   */
  React.useEffect(() => {
    clearTimers();

    const accessAlreadyGranted =
      rememberAccess &&
      hasCookie(cookieName, cookieValue);

    completedRef.current =
      accessAlreadyGranted;

    setPhase(
      accessAlreadyGranted
        ? "video-preparing"
        : "content"
    );

    return clearTimers;
  }, [
    videoUrl,
    rememberAccess,
    cookieName,
    cookieValue,
    clearTimers,
  ]);

  const revealVideo = React.useCallback(
    (formId: string) => {
      if (completedRef.current) {
        return;
      }

      completedRef.current = true;

      if (rememberAccess) {
        writeCookie({
          name: cookieName,
          value: cookieValue,
          lifetimeDays: cookieLifetimeDays,
          path: cookiePath,
          domain: cookieDomain || undefined,
          sameSite: cookieSameSite,
          secure: secureCookie,
        });
      }

      onFormSuccessRef.current?.(formId);

      const delayMs =
        Math.max(0, hideDelaySeconds) * 1000;

      const animationMs = reduceMotion
        ? 0
        : Math.max(0, fadeDurationSeconds) *
          1000;

      hideTimerRef.current =
        window.setTimeout(() => {
          if (animationMs === 0) {
            setPhase("video-preparing");
            return;
          }

          setPhase("fading-content");

          finishTimerRef.current =
            window.setTimeout(() => {
              setPhase("video-preparing");
            }, animationMs);
        }, delayMs);
    },
    [
      hideDelaySeconds,
      fadeDurationSeconds,
      reduceMotion,
      rememberAccess,
      cookieName,
      cookieValue,
      cookieLifetimeDays,
      cookiePath,
      cookieDomain,
      cookieSameSite,
      secureCookie,
    ]
  );

  /**
   * FormWebhookBridge передаёт сюда форму,
   * которая действительно успешно отправилась.
   *
   * Проверка contains() нужна, чтобы при наличии
   * нескольких форм сработал только тот компонент,
   * внутри которого находится отправленная форма.
   */
  React.useEffect(() => {
    function handleFormSuccess(event: Event) {
      const customEvent =
        event as CustomEvent<LeadFormSuccessDetail>;

      const submittedForm =
        customEvent.detail?.form;

      if (
        !submittedForm ||
        !(submittedForm instanceof HTMLFormElement)
      ) {
        return;
      }

      if (
        !rootRef.current?.contains(
          submittedForm
        )
      ) {
        return;
      }

      const formId =
        customEvent.detail?.formId ||
        submittedForm.dataset.formId ||
        submittedForm.id ||
        submittedForm.getAttribute("name") ||
        "";

      revealVideo(formId);
    }

    document.addEventListener(
      successEventName,
      handleFormSuccess
    );

    return () => {
      document.removeEventListener(
        successEventName,
        handleFormSuccess
      );
    };
  }, [successEventName, revealVideo]);

  /**
   * Сначала iframe рендерится с opacity: 0,
   * а на следующем кадре запускается появление.
   */
  React.useEffect(() => {
    if (phase !== "video-preparing") {
      return;
    }

    const frameId =
      window.requestAnimationFrame(() => {
        setPhase("video");
      });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [phase]);

  const animationDuration = reduceMotion
    ? 0
    : Math.max(0, fadeDurationSeconds);

  const showContent =
    phase === "content" ||
    phase === "fading-content";

  const videoIsMounted =
    loadIframeImmediately ||
    phase === "video-preparing" ||
    phase === "video";

  const videoIsActive =
    phase === "video-preparing" ||
    phase === "video";

  if (phase === "checking") {
    return (
      <div
        ref={rootRef}
        className={className}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={className}
    >
      {showContent && (
        <div
          aria-hidden={
            phase === "fading-content"
          }
          style={{
            opacity:
              phase === "fading-content"
                ? 0
                : 1,

            pointerEvents:
              phase === "fading-content"
                ? "none"
                : undefined,

            transition:
              animationDuration > 0
                ? `opacity ${animationDuration}s ease`
                : "none",
          }}
        >
          {children}
        </div>
      )}

      {videoIsMounted && (
        <div
          style={{
            display: videoIsActive
              ? "block"
              : "none",

            position: "relative",
            width: iframeWidth,

            height:
              iframeHeight !== undefined
                ? iframeHeight
                : undefined,

            aspectRatio:
              iframeHeight === undefined
                ? iframeAspectRatio
                : undefined,

            overflow: "hidden",
            borderRadius:
              iframeBorderRadius,
            background: iframeBackground,

            opacity:
              phase === "video" ? 1 : 0,

            transition:
              animationDuration > 0
                ? `opacity ${animationDuration}s ease`
                : "none",
          }}
        >
          <iframe
            src={videoUrl || undefined}
            title={iframeTitle}
            loading={iframeLoading}
            allow={iframeAllow || undefined}
            sandbox={
              iframeSandbox || undefined
            }
            allowFullScreen={allowFullScreen}
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              width: "100%",
              height: "100%",
              border: iframeBorder,
              background: iframeBackground,
            }}
          />
        </div>
      )}
    </div>
  );
}
