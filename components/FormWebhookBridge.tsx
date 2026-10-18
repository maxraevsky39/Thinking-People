import {
  InvisibleSmartCaptcha,
} from "@yandex/smart-captcha";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type PendingCaptcha = {
  resolve: (token: string) => void;
  reject: (error: Error) => void;
  timeoutId: number;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?\d+$/;

const SUBMIT_COOLDOWN_MS = 180_000;
const SUBMIT_COOLDOWN_KEY = "lead_form_last_submit";

function diagnosticId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function logFormEvent(fields: Record<string, unknown>) {
  // Best effort only: diagnostics must never block a real application.
  try {
    void fetch("/api/lead-client-event/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(fields),
    }).catch(() => {});
  } catch {}
}

function diagnosticErrorCode(message: string, stage: string) {
  const codes: Record<string, string> = {
    "Не удалось выполнить проверку. Попробуйте ещё раз.": "captcha_timeout",
    "Проверка на робота была отменена": "captcha_cancelled",
    "Ошибка соединения с сервисом проверки на робота": "captcha_network_error",
    "Не удалось загрузить сервис проверки на робота": "captcha_script_error",
    "Время проверки на робота истекло. Попробуйте ещё раз.": "captcha_expired",
    "SmartCaptcha не вернула токен": "captcha_empty_token",
    "Проверка была прервана": "captcha_interrupted",
    "Проверка уже выполняется": "captcha_busy",
    "Капча не настроена": "captcha_not_configured",
  };
  return codes[message] || `${stage}_error`;
}

const SMARTCAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_YANDEX_SMARTCAPTCHA_SITE_KEY ||
  "";

function getSubmitCooldownLeft() {
  const lastSubmit = Number(
    localStorage.getItem(SUBMIT_COOLDOWN_KEY) || "0"
  );

  const elapsed = Date.now() - lastSubmit;

  return Math.max(
    0,
    SUBMIT_COOLDOWN_MS - elapsed
  );
}

function resetReactForm(form: HTMLFormElement) {
  const fields = form.querySelectorAll<
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement
  >("input, textarea, select");

  fields.forEach((field) => {
    if (field instanceof HTMLInputElement) {
      if (
        field.type === "submit" ||
        field.type === "button" ||
        field.type === "hidden"
      ) {
        return;
      }

      if (
        field.type === "checkbox" ||
        field.type === "radio"
      ) {
        field.checked = false;

        field.dispatchEvent(
          new Event("change", {
            bubbles: true,
          })
        );

        return;
      }

      const setter =
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value"
        )?.set;

      setter?.call(field, "");

      field.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );

      return;
    }

    if (field instanceof HTMLTextAreaElement) {
      const setter =
        Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          "value"
        )?.set;

      setter?.call(field, "");

      field.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );

      return;
    }

    if (field instanceof HTMLSelectElement) {
      field.selectedIndex = 0;

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );
    }
  });
}

function showFormError(
  errorEl: HTMLElement | null,
  message: string,
  fallbackToAlert = true
) {
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    return;
  }

  if (fallbackToAlert) {
    window.alert(message);
  }
}

function clearFieldErrorOnInput(
  field:
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement,
  errorEl: HTMLElement | null
) {
  field.addEventListener(
    "input",
    () => {
      field.classList.remove(
        "js-form-req-active"
      );

      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }
    },
    {
      once: true,
    }
  );
}

function getCookies() {
  return Object.fromEntries(
    document.cookie
      .split("; ")
      .filter(Boolean)
      .map((cookie) => {
        const [name, ...valueParts] =
          cookie.split("=");

        return [
          decodeURIComponent(name),
          decodeURIComponent(
            valueParts.join("=")
          ),
        ];
      })
  );
}

export function FormWebhookBridge() {
  const [captchaVisible, setCaptchaVisible] =
    useState(false);

  /*
   * Изменение key полностью пересоздаёт
   * InvisibleSmartCaptcha.
   *
   * Это необходимо, потому что токен CAPTCHA
   * одноразовый и старое состояние виджета
   * нельзя использовать для следующей заявки.
   */
  const [captchaKey, setCaptchaKey] =
    useState(0);

  const pendingCaptchaRef =
    useRef<PendingCaptcha | null>(null);

  /*
   * Единая функция завершения проверки.
   *
   * Важно сначала очистить pendingCaptchaRef,
   * а уже потом resolve/reject Promise.
   */
  const finishCaptcha = useCallback(
    (result: {
      token?: string;
      error?: string;
    }) => {
      const pending =
        pendingCaptchaRef.current;

      if (!pending) {
        return;
      }

      pendingCaptchaRef.current = null;

      window.clearTimeout(
        pending.timeoutId
      );

      setCaptchaVisible(false);

      /*
       * Подготавливаем чистый экземпляр
       * CAPTCHA для следующей заявки.
       */
      setCaptchaKey(
        (currentKey) => currentKey + 1
      );

      if (result.token) {
        pending.resolve(result.token);
        return;
      }

      pending.reject(
        new Error(
          result.error ||
            "Не удалось пройти проверку"
        )
      );
    },
    []
  );

  const rejectCaptcha = useCallback(
    (message: string) => {
      finishCaptcha({
        error: message,
      });
    },
    [finishCaptcha]
  );

  const handleCaptchaSuccess =
    useCallback(
      (token: string) => {
        if (!token) {
          rejectCaptcha(
            "SmartCaptcha не вернула токен"
          );

          return;
        }

        finishCaptcha({
          token,
        });
      },
      [
        finishCaptcha,
        rejectCaptcha,
      ]
    );

  const requestCaptchaToken =
    useCallback(() => {
      return new Promise<string>(
        (resolve, reject) => {
          if (!SMARTCAPTCHA_SITE_KEY) {
            reject(
              new Error(
                "Капча не настроена"
              )
            );

            return;
          }

          if (
            pendingCaptchaRef.current
          ) {
            reject(
              new Error(
                "Проверка уже выполняется"
              )
            );

            return;
          }

          const timeoutId =
            window.setTimeout(() => {
              rejectCaptcha(
                "Не удалось выполнить проверку. Попробуйте ещё раз."
              );
            }, 60_000);

          pendingCaptchaRef.current = {
            resolve,
            reject,
            timeoutId,
          };

          setCaptchaVisible(true);
        }
      );
    }, [rejectCaptcha]);

  /*
   * При размонтировании компонента очищаем
   * таймер и незавершённую проверку.
   */
  useEffect(() => {
    return () => {
      const pending =
        pendingCaptchaRef.current;

      if (!pending) {
        return;
      }

      pendingCaptchaRef.current = null;

      window.clearTimeout(
        pending.timeoutId
      );

      pending.reject(
        new Error(
          "Проверка была прервана"
        )
      );
    };
  }, []);

  useEffect(() => {
    const formTokens = new WeakMap<HTMLFormElement, Promise<string>>();
    const formSessions = new WeakMap<HTMLFormElement, string>();
    const submitting = new WeakSet<HTMLFormElement>();
    const getFormToken = (form: HTMLFormElement) => {
      let token = formTokens.get(form);
      if (!token) {
        token = fetch("/api/lead", { cache: "no-store" })
          .then(async response => {
            if (!response.ok) throw new Error("Не удалось начать проверку формы");
            const result = await response.json();
            if (!result.formToken) throw new Error("Не удалось начать проверку формы");
            return String(result.formToken);
          });
        formTokens.set(form, token);
        void token.catch(() => formTokens.delete(form));
      }
      return token;
    };
    const startForm = (event: Event) => {
      const form = event.target instanceof Element
        ? event.target.closest<HTMLFormElement>("form.js-lead-form") : null;
      if (form) void getFormToken(form).catch(() => {});
    };
    async function handleSubmit(
      event: SubmitEvent
    ) {
      const form = event.target;

      if (
        !(
          form instanceof
          HTMLFormElement
        )
      ) {
        return;
      }

      if (
        !form.matches(".js-lead-form")
      ) {
        return;
      }

      event.preventDefault();
      if (submitting.has(form)) return;

      /*
       * Нативная HTML-валидация:
       * required, type=email и т. д.
       */
      if (!form.reportValidity()) {
        return;
      }

      const submitText = form.querySelector<HTMLDivElement>(
  'div[type="submit"]'
);
const submitButton = submitText?.closest<HTMLButtonElement>("button");

      const errorEl =
        form.querySelector<HTMLElement>(
          ".js-form-error"
        );

      const successEl =
        form.querySelector<HTMLElement>(
          ".js-form-success"
        );

      const cooldownLeft =
        getSubmitCooldownLeft();

      if (cooldownLeft > 0) {
        const secondsLeft = Math.ceil(
          cooldownLeft / 1000
        );

        showFormError(
          errorEl,
          `Повторную заявку можно отправить через ${secondsLeft} сек.`
        );

        return;
      }

      if (errorEl) {
        errorEl.style.display = "none";
      }

      if (successEl) {
        successEl.style.display = "none";
      }

      const requiredFields =
        Array.from(
          form.querySelectorAll<
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
          >(".js-form-req")
        );

      let hasRequiredErrors = false;

      requiredFields.forEach(
        (field) => {
          const value = String(
            field.value || ""
          ).trim();

          const isInvalid = !value;

          if (isInvalid) {
            field.classList.add(
              "js-form-req-active"
            );

            hasRequiredErrors = true;

            clearFieldErrorOnInput(
              field,
              errorEl
            );
          } else {
            field.classList.remove(
              "js-form-req-active"
            );
          }
        }
      );

      if (hasRequiredErrors) {
        showFormError(
          errorEl,
          "Не заполнены обязательные поля"
        );

        const firstInvalidField =
          form.querySelector<HTMLElement>(
            ".js-form-req-active"
          );

        firstInvalidField?.focus();

        return;
      }

      const consentField =
        form.querySelector<HTMLInputElement>(
          'input[name="soglasiePers"]'
        );

      const consentLabel =
        consentField?.closest("label");

      if (
        consentField &&
        !consentField.checked
      ) {
        consentLabel?.classList.add(
          "js-form-req-active"
        );

        showFormError(
          errorEl,
          "Необходимо дать согласие на обработку персональных данных"
        );

        consentField.addEventListener(
          "change",
          () => {
            consentLabel?.classList.remove(
              "js-form-req-active"
            );

            if (errorEl) {
              errorEl.textContent = "";
              errorEl.style.display =
                "none";
            }
          },
          {
            once: true,
          }
        );

        consentField.focus();

        return;
      }

      const formData =
        new FormData(form);

      const data =
        Object.fromEntries(
          formData.entries()
        );

      const emailField =
        form.querySelector<HTMLInputElement>(
          '[name="email"]'
        );

      const phoneField =
        form.querySelector<HTMLInputElement>(
          '[name="phone"]'
        );

      const email = String(
        data.email || ""
      ).trim();

      const rawPhone = String(
        data.phone || ""
      ).trim();

      const phoneDigits =
        rawPhone.replace(/^\+/, "");

      if (
        email &&
        !EMAIL_PATTERN.test(email)
      ) {
        emailField?.classList.add(
          "js-form-req-active"
        );

        if (emailField) {
          clearFieldErrorOnInput(
            emailField,
            errorEl
          );
        }

        showFormError(
          errorEl,
          "Введите корректный email"
        );

        emailField?.focus();

        return;
      }

      if (
        rawPhone &&
        !PHONE_PATTERN.test(rawPhone)
      ) {
        phoneField?.classList.add(
          "js-form-req-active"
        );

        if (phoneField) {
          clearFieldErrorOnInput(
            phoneField,
            errorEl
          );
        }

        showFormError(
          errorEl,
          "Телефон может содержать только цифры и + в начале"
        );

        phoneField?.focus();

        return;
      }

      if (
        rawPhone &&
        phoneDigits.length < 11
      ) {
        phoneField?.classList.add(
          "js-form-req-active"
        );

        if (phoneField) {
          clearFieldErrorOnInput(
            phoneField,
            errorEl
          );
        }

        showFormError(
          errorEl,
          "Введите корректный номер телефона"
        );

        phoneField?.focus();

        return;
      }

      const formSessionId = formSessions.get(form) || diagnosticId();
      formSessions.set(form, formSessionId);
      const attemptId = diagnosticId();
      const startedAt = performance.now();
      let stage = "form_token";
      let stageStartedAt = startedAt;
      let httpStatus: number | undefined;
      const diagnostic = (event: string, extra: Record<string, unknown> = {}) => {
        logFormEvent({
          event, attemptId, formSessionId, stage,
          elapsedMs: Math.round(performance.now() - startedAt),
          stageElapsedMs: Math.round(performance.now() - stageStartedAt),
          httpStatus, email, phone: rawPhone,
          formId: form.dataset.formId || form.id || form.getAttribute("name") || "",
          pageUrl: window.location.origin + window.location.pathname,
          online: navigator.onLine,
          visibility: document.visibilityState,
          ...extra,
        });
      };
      try {
        submitting.add(form);
        diagnostic("attempt_started");
        const formToken = await getFormToken(form);
        if (Date.now() - Number(formToken.split(".")[0]) > 86_400_000) {
          formTokens.delete(form);
          void getFormToken(form).catch(() => {});
          throw new Error("Подождите 3 секунды и повторите отправку");
        }
        if (submitButton) submitButton.disabled = true;

if (submitText) {
  submitText.dataset.originalText = submitText.textContent || "Отправить";
  submitText.textContent = "Проверяем...";
}

        /*
         * Для каждой отправки получаем
         * новый одноразовый токен.
         */
        stage = "captcha";
        stageStartedAt = performance.now();
        diagnostic("captcha_started");
        const captchaToken =
          await requestCaptchaToken();
        diagnostic("captcha_passed");
        stage = "lead_request";
        stageStartedAt = performance.now();

        if (submitText) submitText.textContent = "Отправляем...";

        const response = await fetch(
          "/api/lead",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              ...data,
              attemptId,
              formSessionId,
              captchaToken,
              formToken,
              soglasie:
                consentField?.checked ??
                false,
              email,
              phone: rawPhone,
              pageUrl:
                window.location.href,
              pageTitle:
                document.title,
              createdAt:
                new Date().toISOString(),
              cookies: getCookies(),
            }),
          }
        );

        httpStatus = response.status;
        const result = await response
          .json()
          .catch(() => ({}));

        if (
          !response.ok ||
          result.ok === false
        ) {
          throw new Error(
            result.error ||
              "Не получилось отправить форму"
          );
        }

        diagnostic("attempt_succeeded");
        stage = "success_ui";
        stageStartedAt = performance.now();
        localStorage.setItem(
          SUBMIT_COOLDOWN_KEY,
          String(Date.now())
        );

        const formId =
  form.dataset.formId ||
  form.id ||
  form.getAttribute("name") ||
  "";

document.dispatchEvent(
  new CustomEvent("lead-form-success", {
    detail: {
      form,
      formId,
    },
  })
);

        resetReactForm(form);
        formTokens.delete(form);

        if (successEl) {
          successEl.style.display =
            "block";
        } else {
          window.alert(
            "Спасибо! Мы скоро свяжемся с вами."
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Не получилось отправить форму";

        diagnostic("attempt_failed", {
          code: diagnosticErrorCode(message, stage), message,
        });

        showFormError(
          errorEl,
          message
        );
      } finally {
        submitting.delete(form);
        if (submitButton) submitButton.disabled = false;

if (submitText) {
  submitText.textContent = submitText.dataset.originalText || "Отправить";
}
      }
    }

    document.addEventListener("focusin", startForm);
    document.addEventListener("pointerdown", startForm);
    document.addEventListener("input", startForm);
    document.addEventListener(
      "submit",
      handleSubmit
    );

    return () => {
      document.removeEventListener("focusin", startForm);
      document.removeEventListener("pointerdown", startForm);
      document.removeEventListener("input", startForm);
      document.removeEventListener(
        "submit",
        handleSubmit
      );
    };
  }, [requestCaptchaToken]);

  if (!SMARTCAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <InvisibleSmartCaptcha
      key={captchaKey}
      sitekey={
        SMARTCAPTCHA_SITE_KEY
      }
      visible={captchaVisible}
      language="ru"
      hideShield={true}
      onSuccess={
        handleCaptchaSuccess
      }
      onChallengeHidden={() => {
        /*
         * При успешной проверке событие hidden
         * иногда приходит раньше success.
         * Небольшая задержка позволяет сначала
         * обработать onSuccess.
         */
        window.setTimeout(() => {
          if (
            pendingCaptchaRef.current
          ) {
            rejectCaptcha(
              "Проверка на робота была отменена"
            );
          }
        }, 200);
      }}
      onNetworkError={() => {
        rejectCaptcha(
          "Ошибка соединения с сервисом проверки на робота"
        );
      }}
      onJavascriptError={() => {
        rejectCaptcha(
          "Не удалось загрузить сервис проверки на робота"
        );
      }}
      onTokenExpired={() => {
        rejectCaptcha(
          "Время проверки на робота истекло. Попробуйте ещё раз."
        );
      }}
    />
  );
}
