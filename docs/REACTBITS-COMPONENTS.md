# Plasmic components: ContactSheet and About13

Both are registered in pages/plasmic-host.tsx via components/registerReactBits.tsx.

ContactSheet: set a height (default 600px); edit items (src, alt, title, subtitle), animation speed, geometry, captions and mouse controls. onOpen receives item and index; onClose has no arguments. The supplied demo images remain the defaults.

About13: edit heading, description and values (word, name, line). Empty values use the supplied demo content. CSS Modules replace Tailwind utilities. An ancestor .dark enables dark styling. A static word is shown if WebGL cannot initialize.

Dependencies: three and @types/three added; existing motion retained. Both components export named and default exports and support className for Plasmic layout. CSS is bundled with the component, including generated pages.

Validation: TypeScript and production release build; public Plasmic host availability. Reload Plasmic Studio to discover the new components.

## About13 controls

Plasmic style controls are available for the main word, heading, description, inner container, upper layout, values grid, cards/buttons, progress track/fill, all names/lines and their active states. These are native class controls with typography, spacing and other style panels. Main word rendering refreshes after font loading and style changes.

Animation controls: interval and morph duration (seconds), stagger, travel, goo, swell, softness, zoom, flash intensity and flash colors for light/dark backgrounds. Pause, hover selection and entrance animation are configurable. Invalid numeric animation values are clamped to safe ranges.
