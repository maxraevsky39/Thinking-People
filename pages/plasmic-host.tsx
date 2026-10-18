import * as React from "react";
import {
  PlasmicCanvasHost,
  registerComponent,
} from "@plasmicapp/react-web/lib/host";
import { MovingSlotCarousel } from "../components/MovingSlotCarousel";
import { NavbarRevealOnBlock } from "../components/NavbarRevealOnBlock";
import { MouseFollower } from "../components/MouseFollower";
import { OptimizedImage } from "../components/OptimizedImage";
import { SlotSlider } from "../components/SlotSlider";
import { StrapiRichText } from "../components/StrapiRichText";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { StrapiTableOfContents } from "../components/StrapiTableOfContents";
import {
  DEFAULT_PHOSPHOR_GRADIENT_STOPS,
  PHOSPHOR_ICON_NAMES,
  PhosphorIcon,
} from "../components/PhosphorIcon";
import { AnimatedFilterGrid } from "../components/AnimatedFilterGrid";
import { HoverRevealStack } from "../components/HoverRevealStack";
import { ViewportTrigger } from "../components/ViewportTrigger";
import {
  HistoryEvent,
  HistoryTimeline,
} from "../components/HistoryTimeline";
import { ScrollReveal } from '../components/ScrollReveal';
import { ScrollSection } from '../components/ScrollSection'
import { MotionScrollSection } from '../components/MotionScrollSection'
import { ScrollStorySection } from '../components/ScrollStorySection'
import { DynamicBottomNav } from "../components/DynamicBottomNav";
import { FormGatedVideo } from "../components/FormGatedVideo";
import { registerCookiePopup } from "../components/registerCookiePopup";
registerCookiePopup();
registerComponent<React.ComponentType<any>>(FormGatedVideo, {
  name: "FormGatedVideo",
  displayName: "Видео после формы",

  importPath:
    "./components/FormGatedVideo",
  importName: "FormGatedVideo",

  defaultStyles: {
    width: "100%",
  },

  props: {
    children: {
      type: "slot",
      displayName: "Форма",
    },

    videoUrl: {
      type: "string",
      displayName: "Ссылка на видео",
    },

    iframeTitle: {
      type: "string",
      displayName: "Описание видео",
      defaultValue: "Видео",
    },

    iframeWidth: {
      type: "string",
      displayName: "Ширина",
      defaultValue: "100%",
    },

    iframeHeight: {
      type: "number",
      displayName: "Высота",
    },

    iframeAspectRatio: {
      type: "string",
      displayName: "Пропорции",
      defaultValue: "16 / 9",
    },

    iframeBorder: {
      type: "string",
      displayName: "Граница",
      defaultValue: "0",
    },

    iframeBorderRadius: {
      type: "number",
      displayName: "Скругление",
      defaultValue: 0,
    },

    iframeBackground: {
      type: "color",
      displayName: "Фон видео",
      defaultValue: "#000000",
    },

    iframeAllow: {
      type: "string",
      displayName: "Iframe allow",
      defaultValue:
        "autoplay; fullscreen; picture-in-picture",
    },

    iframeSandbox: {
      type: "string",
      displayName: "Iframe sandbox",
    },

    allowFullScreen: {
      type: "boolean",
      displayName: "Разрешить fullscreen",
      defaultValue: true,
    },

    iframeLoading: {
      type: "choice",
      displayName: "Загрузка видео",
      options: [
        {
          label: "После отправки",
          value: "lazy",
        },
        {
          label: "Сразу",
          value: "eager",
        },
      ],
      defaultValue: "lazy",
    },

    loadIframeImmediately: {
      type: "boolean",
      displayName: "Загружать видео заранее",
      defaultValue: false,
    },

    hideDelaySeconds: {
      type: "number",
      displayName: "Задержка, сек.",
      defaultValue: 2,
    },

    fadeDurationSeconds: {
      type: "number",
      displayName: "Анимация, сек.",
      defaultValue: 0.4,
    },

    rememberAccess: {
      type: "boolean",
      displayName: "Запоминать отправку",
      defaultValue: true,
    },

    cookieName: {
      type: "string",
      displayName: "Название cookie",
      defaultValue: "video_access_granted",
    },

    cookieValue: {
      type: "string",
      displayName: "Значение cookie",
      defaultValue: "1",
    },

    cookieLifetimeDays: {
      type: "number",
      displayName: "Срок cookie, дней",
      defaultValue: 365,
    },

    cookiePath: {
      type: "string",
      displayName: "Cookie path",
      defaultValue: "/",
    },

    cookieDomain: {
      type: "string",
      displayName: "Cookie domain",
      description:
        "Оставьте пустым для текущего домена. Для поддоменов: .example.com",
    },

    cookieSameSite: {
      type: "choice",
      displayName: "Cookie SameSite",
      options: [
        {
          label: "Lax",
          value: "Lax",
        },
        {
          label: "Strict",
          value: "Strict",
        },
        {
          label: "None",
          value: "None",
        },
      ],
      defaultValue: "Lax",
    },

    secureCookie: {
      type: "boolean",
      displayName: "Только HTTPS",
      defaultValue: true,
    },

    successEventName: {
      type: "string",
      displayName: "Событие успешной формы",
      defaultValue: "lead-form-success",
    },

    onFormSuccess: {
      type: "eventHandler",
      displayName: "Форма отправлена",
      argTypes: [
        {
          name: "formId",
          type: "string",
        },
      ],
    },
  },
});

registerComponent<React.ComponentType<any>>(
  DynamicBottomNav,
  {
    name: "DynamicBottomNav",
    importPath: "./components/DynamicBottomNav",
    displayName: "Dynamic Bottom Nav",

    props: {
      children: {
        type: "slot",
        displayName: "Menu",
      },

      collapsedWidth: {
        type: "number",
        displayName: "Collapsed width",
        defaultValue: 320,
      },

      shrinkDistance: {
        type: "number",
        displayName: "Shrink distance",
        defaultValue: 180,
      },

      bottom: {
        type: "number",
        displayName: "Bottom",
        defaultValue: 12,
      },

      deadZone: {
        type: "number",
        displayName: "Scroll dead zone",
        defaultValue: 1.5,
        advanced: true,
      },

      snapDelay: {
        type: "number",
        displayName: "Snap delay",
        defaultValue: 140,
        advanced: true,
      },

      inertia: {
        type: "number",
        displayName: "Inertia",
        defaultValue: 170,
        advanced: true,
      },
    },
  }
);

registerComponent<React.ComponentType<any>>(MovingSlotCarousel, {
  name: "MovingSlotCarousel",
  displayName: "Moving Slot Carousel",
  importPath: "./components/MovingSlotCarousel",
  props: {
    children: {
      type: "slot",
      displayName: "Items",
    },
    itemCount: {
      type: "number",
      displayName: "Item count",
      defaultValue: 5,
    },
    cardWidth: {
      type: "string",
      displayName: "Card width",
      defaultValue: "260px",
    },
    cardHeight: {
      type: "string",
      displayName: "Card height",
      defaultValue: "180px",
    },
    speed: {
      type: "number",
      displayName: "Scroll speed",
      defaultValue: 20,
    },
    hoverSpeed: {
      type: "number",
      displayName: "Hover scroll speed",
      defaultValue: 8,
    },
    direction: {
      type: "choice",
      displayName: "Direction",
      options: ["left", "right", "up", "down"],
      defaultValue: "left",
    },
    gap: {
      type: "string",
      displayName: "Gap",
      defaultValue: "16px",
    },
    borderRadius: {
      type: "string",
      displayName: "Border radius",
      defaultValue: "12px",
    },
    wrapItems: {
      type: "boolean",
      displayName: "Wrap slot items",
      defaultValue: true,
    },
    ariaLabel: {
      type: "string",
      displayName: "ARIA label",
      defaultValue: "Moving content carousel",
    },
  },
});

registerComponent<React.ComponentType<any>>(NavbarRevealOnBlock, {
  name: "NavbarRevealOnBlock",
  displayName: "Navbar Reveal On Block",
  importPath: "./components/NavbarRevealOnBlock",
  props: {
    children: {
      type: "slot",
      displayName: "Navbar",
    },
    targetSelector: {
      type: "string",
      displayName: "Target block selector",
      defaultValue: "#show-navbar",
    },
    offset: {
      type: "number",
      displayName: "Offset",
      defaultValue: 0,
    },
    offsetUnit: {
      type: "choice",
      displayName: "Offset unit",
      options: ["px", "%"],
      defaultValue: "px",
    },
    initiallyVisibleInCanvas: {
      type: "boolean",
      displayName: "Visible in Plasmic canvas",
      defaultValue: true,
    },
    top: {
      type: "string",
      displayName: "Top",
      defaultValue: "0px",
    },
    zIndex: {
      type: "number",
      displayName: "Z index",
      defaultValue: 1000,
    },
    transitionMs: {
      type: "number",
      displayName: "Transition ms",
      defaultValue: 220,
    },
  },
});


registerComponent<React.ComponentType<any>>(MouseFollower, {
  name: "MouseFollower",
  displayName: "Mouse Follower",
  importPath: "./components/MouseFollower",
  props: {
    children: {
      type: "slot",
      displayName: "Content",
    },
    offsetX: {
      type: "number",
      displayName: "Offset X",
      defaultValue: 16,
    },
    offsetY: {
      type: "number",
      displayName: "Offset Y",
      defaultValue: 16,
    },
    width: {
      type: "string",
      displayName: "Width",
      defaultValue: "auto",
    },
    height: {
      type: "string",
      displayName: "Height",
      defaultValue: "auto",
    },
    zIndex: {
      type: "number",
      displayName: "Z index",
      defaultValue: 1000,
    },
    transitionMs: {
      type: "number",
      displayName: "Transition ms",
      defaultValue: 80,
    },
    anchor: {
      type: "choice",
      displayName: "Anchor",
      options: ["top-left", "top-center", "center", "bottom-left", "bottom-center"],
      defaultValue: "top-left",
    },
    pointerEvents: {
      type: "choice",
      displayName: "Pointer events",
      options: ["none", "auto"],
      defaultValue: "none",
    },
    hideUntilPointerMove: {
      type: "boolean",
      displayName: "Hide until pointer moves",
      defaultValue: false,
    },
    initialX: {
      type: "number",
      displayName: "Initial X",
      defaultValue: 0,
    },
    initialY: {
      type: "number",
      displayName: "Initial Y",
      defaultValue: 0,
    },
  },
});


registerComponent<React.ComponentType<any>>(OptimizedImage, {
  name: "OptimizedImage",
  displayName: "Optimized Image",
  importPath: "./components/OptimizedImage",
  importName: "OptimizedImage",
  props: {
    src: {
      type: "imageUrl",
      displayName: "Image",
    },
    alt: {
      type: "string",
      displayName: "Alt text",
      defaultValue: "",
    },
    width: {
      type: "number",
      displayName: "Width",
      defaultValue: 800,
    },
    height: {
      type: "number",
      displayName: "Height",
      defaultValue: 600,
    },
    fill: {
      type: "boolean",
      displayName: "Fill parent",
      defaultValue: false,
      helpText: "Use parent width and height. Set a fixed height on the wrapper in Plasmic.",
    },
    sizes: {
      type: "string",
      displayName: "Sizes",
      defaultValue: "(max-width: 768px) 100vw, 50vw",
      advanced: true,
    },
    quality: {
      type: "number",
      displayName: "Quality",
      defaultValue: 75,
      advanced: true,
    },
    format: {
      type: "choice",
      displayName: "Image format",
      options: [
        { label: "Auto (browser)", value: "auto" },
        { label: "WebP", value: "webp" },
        { label: "AVIF", value: "avif" },
        { label: "JPEG", value: "jpeg" },
        { label: "PNG", value: "png" },
      ],
      defaultValue: "auto",
      helpText:
        "Auto uses Next.js content negotiation. Other options force the selected output format for this image.",
    },
    loading: {
      type: "choice",
      displayName: "Loading",
      options: ["lazy", "eager"],
      defaultValue: "lazy",
    },
    objectFit: {
      type: "choice",
      displayName: "Object fit",
      options: ["cover", "contain", "fill"],
      defaultValue: "cover",
    },
    objectPosition: {
      type: "string",
      displayName: "Object position",
      defaultValue: "center",
    },
    placeholder: {
  type: "choice",
  displayName: "Placeholder",
  options: [
    {
      label: "Blur",
      value: "blur",
    },
    {
      label: "Без заглушки",
      value: "empty",
    },
  ],
  defaultValue: "blur",
},
blurDataURL: {
  type: "string",
  displayName: "Blur Data URL",
  description:
    "Миниатюра изображения в формате data:image/...;base64,...",
},
  },
});

registerComponent<React.ComponentType<any>>(SlotSlider, {
  name: "SlotSlider",
  displayName: "Slot Slider",
  importPath: "./components/SlotSlider",
  props: {
    items: {
      type: "slot",
      displayName: "Items",
    },
    leftArrow: {
      type: "slot",
      displayName: "Left arrow",
    },
    rightArrow: {
      type: "slot",
      displayName: "Right arrow",
    },
    visibleItems: {
      type: "number",
      displayName: "Visible items",
      defaultValue: 4,
    },
    visibleItemsTablet: {
      type: "number",
      displayName: "Visible items tablet",
      defaultValue: 2,
    },
    visibleItemsMobile: {
      type: "number",
      displayName: "Visible items mobile",
      defaultValue: 1,
    },
    tabletBreakpoint: {
      type: "number",
      displayName: "Tablet breakpoint",
      defaultValue: 820,
    },
    mobileBreakpoint: {
      type: "number",
      displayName: "Mobile breakpoint",
      defaultValue: 520,
    },
    step: {
      type: "number",
      displayName: "Step",
      defaultValue: 1,
    },
    gap: {
      type: "string",
      displayName: "Gap",
      defaultValue: "6px",
    },
    transitionMs: {
      type: "number",
      displayName: "Transition ms",
      defaultValue: 420,
    },
    startIndex: {
      type: "number",
      displayName: "Start index",
      defaultValue: 0,
    },
    loop: {
      type: "boolean",
      displayName: "Loop",
      defaultValue: false,
    },
    dragEnabled: {
      type: "boolean",
      displayName: "Drag enabled",
      defaultValue: true,
    },
    arrowMode: {
      type: "choice",
      displayName: "Arrow mode",
      options: ["overlay", "outside"],
      defaultValue: "overlay",
    },
    arrowTop: {
      type: "string",
      displayName: "Arrow top",
      defaultValue: "50%",
    },
    leftArrowOffset: {
      type: "string",
      displayName: "Left arrow offset",
      defaultValue: "0px",
    },
    rightArrowOffset: {
      type: "string",
      displayName: "Right arrow offset",
      defaultValue: "0px",
    },
    arrowWidth: {
      type: "string",
      displayName: "Arrow width",
      defaultValue: "54px",
    },
    arrowHeight: {
      type: "string",
      displayName: "Arrow height",
      defaultValue: "54px",
    },
    arrowZIndex: {
      type: "number",
      displayName: "Arrow z-index",
      defaultValue: 3,
    },
    disabledArrowBehavior: {
      type: "choice",
      displayName: "Disabled arrow behavior",
      options: ["dim", "hide"],
      defaultValue: "dim",
    },
    disableOpacity: {
      type: "number",
      displayName: "Disabled opacity",
      defaultValue: 0.35,
    },
    ariaLabel: {
      type: "string",
      displayName: "ARIA label",
      defaultValue: "Slider",
    },
    previousLabel: {
      type: "string",
      displayName: "Previous label",
      defaultValue: "Previous slide",
    },
    nextLabel: {
      type: "string",
      displayName: "Next label",
      defaultValue: "Next slide",
    },
  },
});

registerComponent<React.ComponentType<any>>(StrapiRichText, {
  name: "StrapiRichText",
  displayName: "Strapi Rich Text",
  importPath: "./components/StrapiRichText",
  importName: "StrapiRichText",
  props: {
    content: {
      type: "array",
      displayName: "Content",
      itemType: {
        type: "object",
      },
    },
    blockId: {
      type: "string",
      displayName: "Block ID",
      defaultValue: "rich-text",
      helpText: "Bind currentItem.id so table-of-contents links stay unique",
    },
    scrollOffset: {
      type: "number",
      displayName: "Scroll offset",
      defaultValue: 120,
      helpText: "Space above H2 anchors for a fixed navigation bar",
    },
    typography: {
      type: "boolean",
      displayName: "Russian typography",
      defaultValue: true,
      helpText:
        "Replace spaces after short Russian conjunctions and prepositions with non-breaking spaces",
    },
    paragraphClassName: {
      type: "class",
      displayName: "Paragraphs",
      styleSections: ["typography", "spacing"],
    },
    paragraphCustomClassName: {
      type: "string",
      displayName: "Paragraph CSS classes",
      helpText: "Additional CSS class names separated by spaces",
    },
    headingClassName: {
      type: "class",
      displayName: "Other headings (H4-H6)",
      styleSections: ["typography", "spacing"],
    },
    headingCustomClassName: {
      type: "string",
      displayName: "Other headings CSS classes",
      helpText: "Additional classes for H4-H6",
    },
    heading1ClassName: {
      type: "class",
      displayName: "Heading H1",
      styleSections: ["typography", "spacing"],
    },
    heading1CustomClassName: {
      type: "string",
      displayName: "Heading H1 CSS classes",
    },
    heading2ClassName: {
      type: "class",
      displayName: "Heading H2",
      styleSections: ["typography", "spacing"],
    },
    heading2CustomClassName: {
      type: "string",
      displayName: "Heading H2 CSS classes",
    },
    heading3ClassName: {
      type: "class",
      displayName: "Heading H3",
      styleSections: ["typography", "spacing"],
    },
    heading3CustomClassName: {
      type: "string",
      displayName: "Heading H3 CSS classes",
    },
    linkClassName: {
      type: "class",
      displayName: "Links",
      styleSections: ["typography"],
      selectors: [
        {
          selector: ":hover",
          label: "Hover",
        },
      ],
    },
    linkCustomClassName: {
      type: "string",
      displayName: "Link CSS classes",
    },
    listClassName: {
      type: "class",
      displayName: "Lists",
      styleSections: ["typography", "spacing"],
    },
    listCustomClassName: {
      type: "string",
      displayName: "List CSS classes",
    },
    quoteClassName: {
      type: "class",
      displayName: "Quotes",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    quoteCustomClassName: {
      type: "string",
      displayName: "Quote CSS classes",
    },
    codeClassName: {
      type: "class",
      displayName: "Code blocks",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    codeCustomClassName: {
      type: "string",
      displayName: "Code block CSS classes",
    },
    openExternalLinksInNewTab: {
      type: "boolean",
      displayName: "Open external links in new tab",
      defaultValue: true,
    },
  },
  defaultStyles: {
    width: "100%",
  },
});

registerComponent<React.ComponentType<any>>(MarkdownRenderer, {
  name: "MarkdownRenderer",
  displayName: "Markdown Renderer",
  importPath: "./components/MarkdownRenderer",
  importName: "MarkdownRenderer",
  props: {
    markdown: {
      type: "string",
      displayName: "Markdown",
      description: "Markdown text, including GitHub Flavored Markdown",
    },
    paragraphClassName: {
      type: "class",
      displayName: "Paragraphs",
      styleSections: ["typography", "spacing"],
    },
    heading1ClassName: {
      type: "class",
      displayName: "Heading H1",
      styleSections: ["typography", "spacing"],
    },
    heading2ClassName: {
      type: "class",
      displayName: "Heading H2",
      styleSections: ["typography", "spacing"],
    },
    heading3ClassName: {
      type: "class",
      displayName: "Heading H3",
      styleSections: ["typography", "spacing"],
    },
    headingClassName: {
      type: "class",
      displayName: "Other headings (H4-H6)",
      styleSections: ["typography", "spacing"],
    },
    linkClassName: {
      type: "class",
      displayName: "Links",
      styleSections: ["typography"],
      selectors: [
        {
          selector: ":hover",
          label: "Hover",
        },
      ],
    },
    listClassName: {
      type: "class",
      displayName: "Lists",
      styleSections: ["typography", "spacing"],
    },
    listItemClassName: {
      type: "class",
      displayName: "List items",
      styleSections: ["typography", "spacing"],
    },
    quoteClassName: {
      type: "class",
      displayName: "Quotes",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    inlineCodeClassName: {
      type: "class",
      displayName: "Inline code",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    codeBlockClassName: {
      type: "class",
      displayName: "Code blocks",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    tableClassName: {
      type: "class",
      displayName: "Tables",
      styleSections: ["spacing", "background", "border"],
    },
    tableHeadClassName: {
      type: "class",
      displayName: "Table header",
      styleSections: ["typography", "background", "border"],
    },
    tableCellClassName: {
      type: "class",
      displayName: "Table cells",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    imageClassName: {
      type: "class",
      displayName: "Images",
      styleSections: ["sizing", "spacing", "border"],
    },
    openExternalLinksInNewTab: {
      type: "boolean",
      displayName: "Open external links in new tab",
      defaultValue: true,
    },
    allowImages: {
      type: "boolean",
      displayName: "Show images",
      defaultValue: true,
    },
  },
  defaultStyles: {
    width: "100%",
  },
});

registerComponent<React.ComponentType<any>>(StrapiTableOfContents, {
  name: "StrapiTableOfContents",
  displayName: "Strapi Table of Contents",
  importPath: "./components/StrapiTableOfContents",
  importName: "StrapiTableOfContents",
  props: {
    blocks: {
      type: "array",
      displayName: "Page blocks",
      itemType: {
        type: "object",
      },
    },
    title: {
      type: "string",
      displayName: "Title",
      defaultValue: "Содержание",
    },
    hideWhenEmpty: {
      type: "boolean",
      displayName: "Hide when empty",
      defaultValue: true,
    },
    richTextTypeName: {
      type: "string",
      displayName: "Rich Text typename",
      defaultValue: "ComponentSharedRichText",
      advanced: true,
    },
    ariaLabel: {
      type: "string",
      displayName: "ARIA label",
      defaultValue: "Оглавление страницы",
      advanced: true,
    },
    titleClassName: {
      type: "class",
      displayName: "Title",
      styleSections: ["typography", "spacing"],
    },
    listClassName: {
      type: "class",
      displayName: "List",
      styleSections: ["typography", "spacing"],
    },
    itemClassName: {
      type: "class",
      displayName: "List item",
      styleSections: ["typography", "spacing"],
    },
    linkClassName: {
      type: "class",
      displayName: "Link",
      styleSections: ["typography"],
      selectors: [
        {
          selector: ":hover",
          label: "Hover",
        },
      ],
    },
    activeLinkClassName: {
      type: "class",
      displayName: "Active link",
      styleSections: ["typography", "spacing", "background", "border"],
    },
    highlightActiveSection: {
      type: "boolean",
      displayName: "Highlight active section",
      defaultValue: true,
    },
    observerOffset: {
      type: "number",
      displayName: "Active line offset",
      defaultValue: 120,
      min: 0,
      advanced: true,
    },
    onActiveIdChange: {
      type: "eventHandler",
      displayName: "On active section change",
      argTypes: [
        {
          name: "activeId",
          type: "string",
        },
      ],
      advanced: true,
    },
  },
  defaultStyles: {
    width: "100%",
  },
});

registerComponent<React.ComponentType<any>>(PhosphorIcon, {
  name: "PhosphorIcon",
  displayName: "Phosphor Icon",
  importPath: "./components/PhosphorIcon",
  importName: "PhosphorIcon",
  props: {
    iconName: {
      type: "choice",
      displayName: "Icon",
      options: [...PHOSPHOR_ICON_NAMES],
      defaultValue: "ArrowRight",
    },
    size: {
      type: "number",
      displayName: "Size",
      defaultValue: 24,
    },
    color: {
      type: "color",
      displayName: "Color",
      defaultValue: "currentColor",
    },
    useGradient: {
      type: "boolean",
      displayName: "Use gradient",
      defaultValue: false,
    },
    gradientAngle: {
      type: "number",
      displayName: "Gradient angle",
      defaultValue: 180,
      helpText: "CSS angle in degrees: 180 is top to bottom",
    },
    gradientStops: {
      type: "array",
      displayName: "Gradient stops",
      itemType: {
        type: "object",
        nameFunc: (item: any) =>
          `${item?.offset ?? 0}% ${item?.color ?? "Color"}`,
        fields: {
          color: {
            type: "color",
            displayName: "Color",
          },
          offset: {
            type: "number",
            displayName: "Position, %",
          },
        },
      },
      defaultValue: DEFAULT_PHOSPHOR_GRADIENT_STOPS,
    },
    weight: {
      type: "choice",
      displayName: "Weight",
      options: ["thin", "light", "regular", "bold", "fill", "duotone"],
      defaultValue: "regular",
    },
    mirrored: {
      type: "boolean",
      displayName: "Mirrored",
      defaultValue: false,
    },
    decorative: {
      type: "boolean",
      displayName: "Decorative",
      defaultValue: true,
    },
    ariaLabel: {
      type: "string",
      displayName: "ARIA label",
      helpText: "Used when Decorative is disabled",
      advanced: true,
    },
  },
});

registerComponent<React.ComponentType<any>>(AnimatedFilterGrid, {
  name: "AnimatedFilterGrid",
  displayName: "Animated Filter Grid",

  importPath: "./components/AnimatedFilterGrid",
  importName: "AnimatedFilterGrid",

  props: {
    children: {
      type: "slot",
    },

    duration: {
      type: "number",
      defaultValue: 0.22,
    },

    offsetY: {
      type: "number",
      defaultValue: 8,
    },
  },
});

registerComponent<React.ComponentType<any>>(HoverRevealStack, {
  name: "HoverRevealStack",
  displayName: "Hover Reveal Stack",
  importPath: "./components/HoverRevealStack",
  importName: "HoverRevealStack",
  props: {
    items: {
      type: "slot",
      displayName: "Items",
    },
    autoSize: {
  type: "boolean",
  defaultValue: true,
},
    stackWidth: {
      type: "string",
      displayName: "Stack width",
      defaultValue: "100%",
    },
    stackHeight: {
      type: "number",
      displayName: "Stack height",
      defaultValue: 76,
    },
    itemWidth: {
      type: "number",
      displayName: "Item width",
      defaultValue: 76,
  hidden: (props: { autoSize?: boolean }) =>
  props.autoSize !== false,
    },
    itemHeight: {
      type: "number",
      displayName: "Item height",
      defaultValue: 76,
    },
    itemGap: {
  type: "string",
  defaultValue: "2%",
},
    baseSpacing: {
      type: "string",
      displayName: "Spacing in stack",
      defaultValue: "4%",
      helpText: "Horizontal step between items before hover",
    },
    revealShift: {
      type: "number",
      displayName: "Reveal shift",
      defaultValue: 58,
      helpText: "Additional shift applied to the first item above the hovered one",
    },
    revealedSpacing: {
      type: "number",
      displayName: "Revealed spacing",
      defaultValue: 82,
      helpText: "Horizontal step between items after they move",
    },
    durationMs: {
      type: "number",
      displayName: "Animation duration, ms",
      defaultValue: 420,
    },
    easing: {
      type: "string",
      displayName: "Animation easing",
      defaultValue: "cubic-bezier(.22, 1, .36, 1)",
      advanced: true,
    },
    staggerMs: {
      type: "number",
      displayName: "Item stagger, ms",
      defaultValue: 0,
      advanced: true,
    },
    direction: {
      type: "choice",
      displayName: "Reveal direction",
      options: ["right", "left"],
      defaultValue: "right",
    },
    overflow: {
      type: "choice",
      displayName: "Overflow",
      options: ["visible", "hidden"],
      defaultValue: "visible",
    },
    hoverEnabled: {
      type: "boolean",
      displayName: "Open on hover",
      defaultValue: true,
    },
    focusEnabled: {
      type: "boolean",
      displayName: "Open on focus",
      defaultValue: true,
    },
    clickEnabled: {
      type: "boolean",
      displayName: "Open on click",
      defaultValue: false,
    },
    closeOnMouseLeave: {
      type: "boolean",
      displayName: "Close on mouse leave",
      defaultValue: true,
    },
    defaultActiveIndex: {
      type: "number",
      displayName: "Default active index",
      defaultValue: -1,
      advanced: true,
    },
    activeIndex: {
      type: "number",
      displayName: "Controlled active index",
      advanced: true,
    },
    onActiveIndexChange: {
      type: "eventHandler",
      displayName: "On active index change",
      argTypes: [
        {
          name: "index",
          type: "number",
        },
      ],
      advanced: true,
    },
    itemClassName: {
      type: "class",
      displayName: "Item wrapper",
    },
    ariaLabel: {
      type: "string",
      displayName: "ARIA label",
      defaultValue: "Image stack",
      advanced: true,
    },
  },
  defaultStyles: {
    width: "100%",
  },
});

registerComponent<React.ComponentType<any>>(ViewportTrigger, {
  name: "ViewportTrigger",
  displayName: "Viewport Trigger",

  importPath: "./components/ViewportTrigger",
  importName: "ViewportTrigger",

  props: {
    children: {
      type: "slot",
      displayName: "Content",
    },

    offset: {
      type: "number",
      displayName: "Offset",
      defaultValue: 0,
      control: "slider",
      min: 0,
      max: 1000,
      step: 10,
      helpText:
        "На сколько пикселей раньше компонент должен сработать",
    },

    onViewportEnter: {
      type: "eventHandler",
      displayName: "On viewport enter",
      argTypes: [],
    },
  },
});

const EVENT_NAME = "HistoryEvent";
const TIMELINE_NAME = "HistoryTimeline";
registerComponent<React.ComponentType<any>>(HistoryEvent, {
  name: EVENT_NAME,
  displayName: "История — событие",
  description: "Карточка события внутри компонента «История».",
  props: {
    marker: {
      type: "string",
      displayName: "Метка",
      defaultValue: "2008",
    },
    side: {
      type: "choice",
      displayName: "Сторона карточки",
      options: [
        { label: "Слева", value: "left" },
        { label: "Справа", value: "right" },
      ],
      defaultValue: "left",
    },
    imageSlot: {
      type: "slot",
      displayName: "Изображение",
      description:
        "Поместите сюда OptimizedImage или другой компонент изображения. Для OptimizedImage рекомендуется включить fill.",
      allowedComponents: ["OptimizedImage"],
      hidePlaceholder: false,
    },
    image: {
      type: "imageUrl",
      displayName: "Старое фото (fallback)",
      description:
        "Используется только тогда, когда слот «Изображение» пуст.",
    },
    imageAlt: {
      type: "string",
      displayName: "Описание фото",
      description: "Оставьте пустым только для декоративного изображения.",
    },
    eyebrow: {
      type: "slot",
      displayName: "Надзаголовок",
      hidePlaceholder: true,
    },
    title: {
      type: "slot",
      displayName: "Заголовок",
      defaultValue: {
        type: "text",
        value: "Заголовок события",
      },
    },
    subtitle: {
      type: "slot",
      displayName: "Подзаголовок",
      defaultValue: {
        type: "text",
        value: "Короткое описание важного события.",
      },
    },
    cardPadding: {
      type: "string",
      displayName: "Отступ внутри карточки",
      defaultValue: "24px",
    },
    cardRadius: {
      type: "string",
      displayName: "Скругление карточки",
      defaultValue: "16px",
    },
    cardBackground: {
      type: "color",
      displayName: "Фон карточки",
      defaultValue: "#ffffff",
    },
    imageAspectRatio: {
      type: "choice",
      displayName: "Пропорции фото",
      options: ["16 / 10", "16 / 9", "4 / 3", "1 / 1"],
      defaultValue: "16 / 10",
    },
  },
  importPath: "./components/HistoryTimeline",
  importName: "HistoryEvent",
  parentComponentName: TIMELINE_NAME,
});

registerComponent<React.ComponentType<any>>(HistoryTimeline, {
  name: TIMELINE_NAME,
  displayName: "История",
  description: "Вертикальный таймлайн с карточками и заполнением при скролле.",
  props: {
    points: {
      type: "slot",
      displayName: "Точки",
      description:
        "Добавьте вручную по одному компоненту-точке для каждой карточки. Порядок должен совпадать.",
      hidePlaceholder: false,
    },
    children: {
      type: "slot",
      displayName: "События",
      allowedComponents: [EVENT_NAME],
      defaultValue: [
        {
          type: "component",
          name: EVENT_NAME,
          props: { marker: "2008", side: "left" },
        },
        {
          type: "component",
          name: EVENT_NAME,
          props: { marker: "2015", side: "right" },
        },
        {
          type: "component",
          name: EVENT_NAME,
          props: { marker: "2020", side: "left" },
        },
        {
          type: "component",
          name: EVENT_NAME,
          props: { marker: "2026", side: "right" },
        },
      ],
    },
    activationPoint: {
      type: "number",
      displayName: "Точка активации, %",
      defaultValue: 58,
      min: 0,
      max: 100,
    },
    lineColor: {
      type: "color",
      displayName: "Цвет линии",
      defaultValue: "#d9d9de",
    },
    activeColor: {
      type: "color",
      displayName: "Активный цвет",
      defaultValue: "#6f4bf2",
    },
    lineWidth: {
      type: "string",
      displayName: "Толщина линии",
      defaultValue: "2px",
    },
    eventsGap: {
      type: "string",
      displayName: "Расстояние между событиями",
      defaultValue: "72px",
    },
    mobileBreakpoint: {
      type: "number",
      displayName: "Мобильный breakpoint",
      defaultValue: 680,
      min: 320,
      max: 1200,
    },
    showMarkerLabels: {
      type: "boolean",
      displayName: "Показывать стандартные метки",
      description:
        "Показывает marker из карточки под пользовательской точкой.",
      defaultValue: true,
    },
    onPointActivate: {
      type: "eventHandler",
      displayName: "При активации точки",
      description:
        "Срабатывает, когда точка пересекает линию активации при прокрутке.",
      argTypes: [
        {
          name: "index",
          type: "number",
        },
        {
          name: "marker",
          type: "string",
        },
      ],
    },
    onPointDeactivate: {
      type: "eventHandler",
      displayName: "При деактивации точки",
      description:
        "Срабатывает, когда точка возвращается за линию активации.",
      argTypes: [
        {
          name: "index",
          type: "number",
        },
        {
          name: "marker",
          type: "string",
        },
      ],
    },
    paddingCard: {
      type: "string",
      displayName: "Отступ карточки",
      defaultValue: "16px",
    },
  },
  importPath: "./components/HistoryTimeline",
  importName: "HistoryTimeline",
});

registerComponent<React.ComponentType<any>>(ScrollReveal, {
  name: "TextScrollReval",
  displayName: "ScrollReveal",
  importPath: "./components/ScrollReveal",
  importName: "ScrollReveal",
  props: {
    text: {
      type: "string",
      displayName: "Текст",
      defaultValue: "Текст с анимацией при прокрутке",
    },
    enableBlur: {
    type: "boolean",
    displayName: "Включить размытие",
    defaultValue: true,
  },

    baseOpacity: {
    type: "number",
    displayName: "Начальная прозрачность",
    defaultValue: 0.1,
  },

    baseRotation: {
    type: "number",
    displayName: "Начальный поворот",
    defaultValue: 3,
  },

    blurStrength: {
    type: "number",
    displayName: "Сила размытия",
    defaultValue: 4,
  },

    containerClassName: {
    type: "string",
    displayName: "CSS-класс контейнера",
  },

    textClassName: {
    type: "string",
    displayName: "CSS-класс текста",
  },

    rotationEnd: {
    type: "string",
    displayName: "Конец анимации поворота",
    defaultValue: "bottom bottom",
  },

    wordAnimationEnd: {
    type: "string",
    displayName: "Конец анимации слов",
    defaultValue: "bottom bottom",
  },
  },
});

registerComponent<React.ComponentType<any>>(ScrollSection, {
  name: "ScrollSection",
  importPath: "./components/ScrollSection",

  props: {
    animationClassName: {
      type: "string",
      displayName: "CSS-класс анимации",
      description: "Класс с CSS animation и @keyframes на внутреннем блоке. Без точки. Если пусто, используются старые пропсы анимации. В CSS-режиме easing задаётся в CSS.",
      defaultValue: "",
    },
    children: {
      type: "slot",
      displayName: "Содержимое",
    },

    start: {
      type: "string",
      displayName: "Начало",
      defaultValue: "top bottom",
    },

    end: {
      type: "string",
      displayName: "Конец",
      defaultValue: "bottom top",
    },

    scrub: {
      type: "number",
      displayName: "Сглаживание скролла",
      defaultValue: 0.5,
    },

    pin: {
      type: "boolean",
      displayName: "Закрепить секцию",
      defaultValue: false,
    },

    markers: {
      type: "boolean",
      displayName: "Показать маркеры",
      defaultValue: false,
    },

    ease: {
  type: "choice",
  displayName: "Кривая анимации",
  options: [
    "none",
    "sine.in",
    "sine.out",
    "sine.inOut",
    "power1.in",
    "power1.out",
    "power1.inOut",
    "power2.in",
    "power2.out",
    "power2.inOut",
    "power3.in",
    "power3.out",
    "power3.inOut",
    "expo.in",
    "expo.out",
    "expo.inOut",
    "circ.in",
    "circ.out",
    "circ.inOut",
    "back.in",
    "back.out",
    "back.inOut",
  ],
  defaultValue: "power2.inOut",
},

    fromOpacity: {
      type: "number",
      displayName: "Прозрачность — от",
      defaultValue: 0,
    },

    toOpacity: {
      type: "number",
      displayName: "Прозрачность — до",
      defaultValue: 1,
    },

    fromY: {
      type: "number",
      displayName: "Сдвиг Y — от",
      defaultValue: 80,
    },

    toY: {
      type: "number",
      displayName: "Сдвиг Y — до",
      defaultValue: 0,
    },

    fromX: {
  type: "number",
  displayName: "Сдвиг X — от",
  defaultValue: 0,
  },

  toX: {
  type: "number",
  displayName: "Сдвиг X — до",
  defaultValue: 0,
  },
    fromScale: {
      type: "number",
      displayName: "Масштаб — от",
      defaultValue: 0.95,
    },

    toScale: {
      type: "number",
      displayName: "Масштаб — до",
      defaultValue: 1,
    },

    fromRotation: {
      type: "number",
      displayName: "Поворот Z — от",
      defaultValue: 0,
    },

    toRotation: {
      type: "number",
      displayName: "Поворот Z — до",
      defaultValue: 0,
    },
    fromBlur: {
      type: "number",
      displayName: "Размытие — от (px)",
      defaultValue: 0,
      min: 0,
    },
    toBlur: {
      type: "number",
      displayName: "Размытие — до (px)",
      defaultValue: 0,
      min: 0,
    },
    fromRotationX: {
      type: "number",
      displayName: "Поворот X — от (°)",
      defaultValue: 0,
    },
    toRotationX: {
      type: "number",
      displayName: "Поворот X — до (°)",
      defaultValue: 0,
    },
    fromRotationY: {
      type: "number",
      displayName: "Поворот Y — от (°)",
      defaultValue: 0,
    },
    toRotationY: {
      type: "number",
      displayName: "Поворот Y — до (°)",
      defaultValue: 0,
    },
    perspective: {
      type: "number",
      displayName: "Глубина перспективы (px)",
      description: "Меньше значение — сильнее перспектива. 0 отключает перспективу.",
      defaultValue: 1000,
      min: 0,
    },
    transformOrigin: {
      type: "string",
      displayName: "Точка трансформации",
      description: "CSS transform-origin, например: center center, left top или 50% 100%.",
      defaultValue: "center center",
    },
  },
});

registerComponent<React.ComponentType<any>>(MotionScrollSection, {
  name: "MotionScrollSection",
  displayName: "Motion Scroll Section",
  importPath: "./components/MotionScrollSection",
  props: {
    children: { type: "slot", displayName: "Содержимое" },
    targetSelector: {
      type: "string",
      displayName: "Селектор target",
      description: "CSS-селектор элемента, положение которого управляет анимацией. Пусто — текущая секция.",
    },
    containerSelector: {
      type: "string",
      displayName: "Селектор container",
      description: "CSS-селектор прокручиваемого контейнера. Пусто — окно браузера.",
    },
    trackContentSize: {
      type: "boolean",
      displayName: "Отслеживать размер контента",
      description: "Пересчитывать диапазон прокрутки при изменении размера содержимого.",
      defaultValue: false,
    },
    smoothing: {
      type: "number",
      displayName: "Сглаживание (сек.)",
      description: "Время, за которое анимация догоняет прокрутку. 0 отключает сглаживание.",
      defaultValue: 0.5,
      min: 0,
    },
    offsetStart: {
      type: "string", displayName: "Начало анимации",
      defaultValue: "start end",
    },
    offsetEnd: {
      type: "string", displayName: "Конец анимации",
      defaultValue: "end start",
    },
    ease: {
      type: "choice", displayName: "Кривая анимации",
      options: [
        "none", "sine.in", "sine.out", "sine.inOut",
        "power1.in", "power1.out", "power1.inOut",
        "power2.in", "power2.out", "power2.inOut",
        "power3.in", "power3.out", "power3.inOut",
        "expo.in", "expo.out", "expo.inOut",
        "circ.in", "circ.out", "circ.inOut",
        "back.in", "back.out", "back.inOut",
      ],
      defaultValue: "power2.inOut",
    },
    fromOpacity: { type: "number", displayName: "Прозрачность — от", defaultValue: 0 },
    toOpacity: { type: "number", displayName: "Прозрачность — до", defaultValue: 1 },
    fromY: { type: "number", displayName: "Сдвиг Y — от", defaultValue: 80 },
    toY: { type: "number", displayName: "Сдвиг Y — до", defaultValue: 0 },
    fromX: { type: "number", displayName: "Сдвиг X — от", defaultValue: 0 },
    toX: { type: "number", displayName: "Сдвиг X — до", defaultValue: 0 },
    fromScale: { type: "number", displayName: "Масштаб — от", defaultValue: 0.95 },
    toScale: { type: "number", displayName: "Масштаб — до", defaultValue: 1 },
    fromRotation: { type: "number", displayName: "Поворот Z — от", defaultValue: 0 },
    toRotation: { type: "number", displayName: "Поворот Z — до", defaultValue: 0 },
    fromBlur: { type: "number", displayName: "Размытие — от (px)", defaultValue: 0, min: 0 },
    toBlur: { type: "number", displayName: "Размытие — до (px)", defaultValue: 0, min: 0 },
    fromRotationX: { type: "number", displayName: "Поворот X — от (°)", defaultValue: 0 },
    toRotationX: { type: "number", displayName: "Поворот X — до (°)", defaultValue: 0 },
    fromRotationY: { type: "number", displayName: "Поворот Y — от (°)", defaultValue: 0 },
    toRotationY: { type: "number", displayName: "Поворот Y — до (°)", defaultValue: 0 },
    perspective: {
      type: "number", displayName: "Глубина перспективы (px)",
      description: "Меньше значение — сильнее перспектива. 0 отключает перспективу.",
      defaultValue: 1000, min: 0,
    },
    transformOrigin: {
      type: "string", displayName: "Точка трансформации",
      description: "Например: center center, left top или 50% 100%.",
      defaultValue: "center center",
    },
  },
});

registerComponent<React.ComponentType<any>>(ScrollStorySection, {
  name: "ScrollStorySection",
  importPath: "./components/ScrollStorySection",

  props: {
    children: {
      type: "slot",
      displayName: "Композиция",
    },

    cardSelector: {
      type: "string",
      displayName: "Селектор карточек",
      defaultValue: ".scroll-card",
    },

    scrollDistance: {
      type: "number",
      displayName: "Длина прокрутки",
      defaultValue: 1200,
    },

    scrub: {
      type: "number",
      displayName: "Сглаживание",
      defaultValue: 0.5,
    },

    cardDuration: {
      type: "number",
      displayName: "Длительность появления карточки",
      defaultValue: 0.16,
    },

    staggerAmount: {
      type: "number",
      displayName: "Разброс появления карточек",
      defaultValue: 0.22,
    },

    holdDuration: {
      type: "number",
      displayName: "Пауза после появления",
      defaultValue: 0.12,
    },

    exitDuration: {
      type: "number",
      displayName: "Длительность ухода",
      defaultValue: 0.45,
    },

    cardFromX: {
      type: "number",
      displayName: "Карточки X — от",
      defaultValue: 0,
    },

    cardFromY: {
      type: "number",
      displayName: "Карточки Y — от",
      defaultValue: 60,
    },

    cardFromScale: {
      type: "number",
      displayName: "Масштаб карточек — от",
      defaultValue: 0.92,
    },

    exitX: {
      type: "number",
      displayName: "Уход композиции X",
      defaultValue: 0,
    },

    exitY: {
      type: "number",
      displayName: "Уход композиции Y",
      defaultValue: -160,
    },

    exitOpacity: {
      type: "number",
      displayName: "Прозрачность после ухода",
      defaultValue: 0,
    },

    cardEase: {
      type: "choice",
      displayName: "Кривая карточек",
      options: [
        "none",
        "sine.out",
        "power1.out",
        "power2.out",
        "power3.out",
        "expo.out",
        "back.out(1.2)",
      ],
      defaultValue: "power2.out",
    },

    exitEase: {
      type: "choice",
      displayName: "Кривая ухода",
      options: [
        "none",
        "sine.inOut",
        "power1.inOut",
        "power2.inOut",
        "power3.inOut",
        "expo.inOut",
      ],
      defaultValue: "power2.inOut",
    },

    markers: {
      type: "boolean",
      displayName: "Показать маркеры",
      defaultValue: false,
    },
  },
});


export default function PlasmicHost() { return <PlasmicCanvasHost />; }
