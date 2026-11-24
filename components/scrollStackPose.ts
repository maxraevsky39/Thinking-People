export type ScrollStackVariant = "stack" | "deck" | "fade" | "flip" | "zoom" | "reveal";
const clamp = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, value));

const glide = (t: number) => t * t * (3 - 2 * t);

interface Shot {
  transform: string;
  opacity: number;
  filter: string;
  clip: string;
}

interface Recipe {
  peek: number;
  scaleStep: number;
  blur: number;
  dim: number;
  radius: number;
  enter: number;
}

const shade = (v: number, dim: number, blur: number) => {
  const parts: string[] = [];
  if (blur > 0.01) parts.push(`blur(${(v * blur).toFixed(2)}px)`);
  if (dim > 0.001) parts.push(`brightness(${(1 - v * dim).toFixed(3)})`);
  return parts.length ? parts.join(" ") : "none";
};

export const pose = (
  variant: ScrollStackVariant,
  offset: number,
  index: number,
  cfg: Recipe,
): Shot => {
  const full = `inset(0 0 0 0 round ${cfg.radius}px)`;
  const lean = index % 2 === 0 ? 1 : -1;

  if (offset < 0) {
    const u = clamp(offset + 1, 0, 1);
    const e = glide(u);
    switch (variant) {
      case "fade":
        return {
          transform: `translate3d(0,0,0) scale(${(1.06 - 0.06 * e).toFixed(4)})`,
          opacity: e,
          filter: "none",
          clip: full,
        };
      case "flip":
        return {
          transform: `translate3d(0,${((1 - e) * 26).toFixed(2)}%,0) rotateX(${((1 - e) * -72).toFixed(2)}deg)`,
          opacity: clamp(e * 1.6, 0, 1),
          filter: "none",
          clip: full,
        };
      case "zoom":
        return {
          transform: `translate3d(0,0,0) scale(${(0.52 + 0.48 * e).toFixed(4)})`,
          opacity: clamp(e * 1.4, 0, 1),
          filter:
            cfg.blur > 0.01
              ? `blur(${((1 - e) * cfg.blur).toFixed(2)}px)`
              : "none",
          clip: full,
        };
      case "reveal":
        return {
          transform: "translate3d(0,0,0)",
          opacity: 1,
          filter: "none",
          clip: `inset(${((1 - u) * 100).toFixed(2)}% 0 0 0 round ${cfg.radius}px)`,
        };
      case "deck":
        return {
          transform: `translate3d(0,${((1 - u) * (cfg.enter + 6)).toFixed(2)}%,0) rotate(${((1 - e) * 4 * lean).toFixed(2)}deg)`,
          opacity: 1,
          filter: "none",
          clip: full,
        };
      default:
        return {
          transform: `translate3d(0,${((1 - u) * cfg.enter).toFixed(2)}%,0)`,
          opacity: 1,
          filter: "none",
          clip: full,
        };
    }
  }

  const v = offset;
  const e = glide(clamp(v, 0, 1));
  switch (variant) {
    case "fade":
      return {
        transform: `translate3d(0,0,0) scale(${(1 - e * 0.06).toFixed(4)})`,
        opacity: 1 - e,
        filter: shade(e, cfg.dim, cfg.blur),
        clip: full,
      };
    case "flip":
      return {
        transform: `translate3d(0,${(-e * 26).toFixed(2)}%,0) rotateX(${(e * 72).toFixed(2)}deg)`,
        opacity: 1 - e,
        filter: shade(e, cfg.dim, 0),
        clip: full,
      };
    case "zoom":
      return {
        transform: `translate3d(0,0,0) scale(${(1 + e * 0.42).toFixed(4)})`,
        opacity: 1 - e,
        filter:
          cfg.blur > 0.01
            ? `blur(${(e * cfg.blur * 1.4).toFixed(2)}px)`
            : "none",
        clip: full,
      };
    case "reveal":
      return {
        transform: `translate3d(0,${(-v * cfg.peek * 0.5).toFixed(2)}px,0) scale(${(1 - v * cfg.scaleStep * 0.7).toFixed(4)})`,
        opacity: 1,
        filter: shade(v, cfg.dim, cfg.blur),
        clip: full,
      };
    case "deck":
      return {
        transform: `translate3d(0,${(-v * cfg.peek * 0.75).toFixed(2)}px,0) rotate(${(v * 4.5 * lean).toFixed(2)}deg) scale(${(1 - v * cfg.scaleStep * 0.85).toFixed(4)})`,
        opacity: 1,
        filter: shade(v, cfg.dim, cfg.blur),
        clip: full,
      };
    default:
      return {
        transform: `translate3d(0,${(-v * cfg.peek).toFixed(2)}px,0) scale(${(1 - v * cfg.scaleStep).toFixed(4)})`,
        opacity: 1,
        filter: shade(v, cfg.dim, cfg.blur),
        clip: full,
      };
  }
};

