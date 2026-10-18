import * as React from "react";
import { usePlasmicCanvasContext } from "@plasmicapp/host";

export interface CookiePopupProps {
  children?: React.ReactNode;
  className?: string;
  animationClassName?: string;
  cookieName?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  delaySeconds?: number;
  showInEditor?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isCookieTrue(cookieName: string): boolean {
  const expectedName = cookieName.trim();
  if (!expectedName || typeof document === "undefined") return false;

  return document.cookie.split(";").some((part) => {
    const separator = part.indexOf("=");
    const rawName = separator >= 0 ? part.slice(0, separator) : part;
    const rawValue = separator >= 0 ? part.slice(separator + 1) : "";
    return (
      safeDecode(rawName.trim()) === expectedName &&
      safeDecode(rawValue.trim()).toLowerCase() === "true"
    );
  });
}

export const CookiePopup = React.forwardRef<HTMLDivElement, CookiePopupProps>(
  function CookiePopup(
    {
      children,
      className,
      animationClassName,
      cookieName = "cookieSoglasie",
      isOpen = true,
      onOpenChange,
      delaySeconds = 0,
      showInEditor = true,
      onVisibilityChange,
    },
    forwardedRef
  ) {
    const canvas = usePlasmicCanvasContext();
    const isEditor = Boolean(canvas);
    const [hydrated, setHydrated] = React.useState(false);
    const [delayPassed, setDelayPassed] = React.useState(false);
    const onOpenChangeRef = React.useRef(onOpenChange);
    const onVisibilityChangeRef = React.useRef(onVisibilityChange);
    const lastReportedVisibility = React.useRef<boolean | null>(null);

    React.useEffect(() => {
      onOpenChangeRef.current = onOpenChange;
    }, [onOpenChange]);

    React.useEffect(() => {
      onVisibilityChangeRef.current = onVisibilityChange;
    }, [onVisibilityChange]);

    React.useEffect(() => {
      setHydrated(true);

      if (isEditor && showInEditor) {
        setDelayPassed(true);
        return;
      }

      if (isCookieTrue(cookieName)) {
        setDelayPassed(false);
        onOpenChangeRef.current?.(false);
        return;
      }

      const delayMs = Math.max(0, Number(delaySeconds) || 0) * 1000;
      if (delayMs === 0) {
        setDelayPassed(true);
        return;
      }

      setDelayPassed(false);
      const timeout = window.setTimeout(() => setDelayPassed(true), delayMs);
      return () => window.clearTimeout(timeout);
    }, [cookieName, delaySeconds, isEditor, showInEditor]);

    const isVisible =
      hydrated &&
      ((isEditor && showInEditor) || (isOpen && delayPassed));

    React.useEffect(() => {
      if (!hydrated || lastReportedVisibility.current === isVisible) return;
      lastReportedVisibility.current = isVisible;
      onVisibilityChangeRef.current?.(isVisible);
    }, [hydrated, isVisible]);

    if (!isVisible) return null;

    const combinedClassName = [className, animationClassName]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={forwardedRef}
        className={combinedClassName || undefined}
        data-cookie-popup=""
        data-cookie-name={cookieName || undefined}
        data-visible="true"
      >
        {children}
      </div>
    );
  }
);

CookiePopup.displayName = "CookiePopup";
