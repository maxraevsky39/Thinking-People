import { registerComponent } from "@plasmicapp/react-web/lib/host";
import { CookiePopup } from "./CookiePopup";

let registered = false;

export function registerCookiePopup() {
  if (registered) return;
  registered = true;

  registerComponent(CookiePopup, {
    name: "CookiePopup",
    displayName: "Cookie / delayed popup",
    importPath: "./components/CookiePopup",
    importName: "CookiePopup",
    defaultStyles: {
      width: "100%",
    },
    props: {
      children: {
        type: "slot",
        displayName: "Содержимое",
        defaultValue: {
          type: "vbox",
          styles: {
            width: "100%",
            padding: "20px",
            background: "#ffffff",
            borderRadius: "12px",
          },
          children: [
            {
              type: "text",
              value: "Мы используем cookie",
            },
          ],
        },
      },
      cookieName: {
        type: "string",
        displayName: "Название cookie",
        defaultValue: "cookieSoglasie",
        description:
          "Если cookie с этим именем имеет значение true, компонент не показывается.",
      },
      isOpen: {
        type: "boolean",
        displayName: "Открыт",
        defaultValue: true,
        description:
          "Управляемое состояние. Его можно изменить действием другой кнопки в Plasmic.",
      },
      onOpenChange: {
        type: "eventHandler",
        displayName: "Изменение состояния",
        argTypes: [{ name: "isOpen", type: "boolean" }],
        advanced: true,
      },
      delaySeconds: {
        type: "number",
        displayName: "Задержка, секунд",
        defaultValue: 0,
        min: 0,
        step: 0.1,
        description:
          "Время после гидратации страницы, через которое компонент появится.",
      },
      animationClassName: {
        type: "string",
        displayName: "CSS-класс появления",
        defaultValue: "",
        description:
          "Класс добавляется при монтировании компонента. Укажите без точки и задайте animation/@keyframes в CSS.",
      },
      showInEditor: {
        type: "boolean",
        displayName: "Показывать в редакторе",
        defaultValue: true,
        description:
          "Игнорирует cookie, задержку и состояние только внутри редактора Plasmic.",
        advanced: true,
      },
      onVisibilityChange: {
        type: "eventHandler",
        displayName: "Изменение видимости",
        argTypes: [{ name: "isVisible", type: "boolean" }],
        advanced: true,
      },
    },
    states: {
      isOpen: {
        type: "writable",
        variableType: "boolean",
        valueProp: "isOpen",
        onChangeProp: "onOpenChange",
      },
    },
  });
}
