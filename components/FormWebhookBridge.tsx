import { useEffect } from "react";

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
  useEffect(() => {
    const formTokens = new WeakMap<HTMLFormElement, Promise<string>>();
    const formSessions = new WeakMap<HTMLFormElement, string>();
    const submitting = new WeakSet<HTMLFormElement>();
    const getFormToken = (form: HTMLFormElement) => {
      let token = formTokens.get(form);
      if (!token) {
        token = fetch("/api/lead", { cache: "no-store" })
          .then(async response => {
            if (!response.ok) throw new Error("Failed to start form validation");
            const result = await response.json();
            if (!result.formToken) throw new Error("Failed to start form validation");
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
          `You can submit the application again in ${secondsLeft} seconds`
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
          "Required fields are not filled"
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
          "You must consent to the processing of personal data"
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
          "Enter a valid email address"
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
          "Phone number can only contain digits and + at the beginning"
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
          "Enter a valid phone number"
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
          throw new Error("Please wait 3 seconds and try submitting again");
        }
        if (submitButton) submitButton.disabled = true;

if (submitText) {
  submitText.dataset.originalText = submitText.textContent || "Send";
  submitText.textContent = "Checking...";
}

        // SmartCaptcha is temporarily disabled; server time and rate guards remain active.
        stage = "lead_request";
        stageStartedAt = performance.now();

        if (submitText) submitText.textContent = "Sending...";

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
              "Failed to submit form"
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
            "Thank you! We will be in touch with you soon."
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to submit the form";

        diagnostic("attempt_failed", {
          code: `${stage}_error`, message,
        });

        showFormError(
          errorEl,
          message
        );
      } finally {
        submitting.delete(form);
        if (submitButton) submitButton.disabled = false;

if (submitText) {
  submitText.textContent = submitText.dataset.originalText || "Send";
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
  }, []);

  return null;
}
