import Image from "next/image";
import * as React from "react";

type ImageFormat = "auto" | "webp" | "avif" | "jpeg" | "png";

export type OptimizedImageProps = {
  className?: string;
  src?: string;
  alt?: string;

  width?: number;
  height?: number;

  fill?: boolean;
  sizes?: string;
  quality?: number;
  format?: ImageFormat;

  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;

  placeholder?: "blur" | "empty";
  blurDataURL?: string;
};

const xmlReplacements: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    character => xmlReplacements[character] ?? character
  );
}

function explicitFormatLoader({
  src,
  width,
  quality,
  format,
}: {
  src: string;
  width: number;
  quality?: number;
  format: Exclude<ImageFormat, "auto">;
}) {
  const params = new URLSearchParams({
    url: src,
    width: String(width),
    quality: String(quality ?? 75),
    format,
  });

  return `/api/optimized-image/?${params.toString()}`;
}

export function OptimizedImage({
  className,
  src,
  alt = "",
  width = 800,
  height = 600,
  fill = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  quality = 75,
  format = "auto",
  loading = "lazy",
  objectFit = "cover",
  objectPosition = "center",
  placeholder = "blur",
  blurDataURL,
}: OptimizedImageProps) {
  if (!src) return null;

  const resolvedBlurDataURL =
    placeholder === "blur"
      ? blurDataURL?.trim() : undefined;

  const loader =
    format === "auto"
      ? undefined
      : ({
          src: loaderSrc,
          width: loaderWidth,
          quality: loaderQuality,
        }: {
          src: string;
          width: number;
          quality?: number;
        }) =>
          explicitFormatLoader({
            src: loaderSrc,
            width: loaderWidth,
            quality: loaderQuality,
            format,
          });

  if (fill) {
    return (
      <div
        className={className}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          quality={quality}
          loader={loader}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={resolvedBlurDataURL}
          style={{
            objectFit,
            objectPosition,
          }}
        />
      </div>
    );
  }

  return (
    <Image
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      loader={loader}
      loading={loading}
      placeholder={placeholder}
      blurDataURL={resolvedBlurDataURL}
      style={{
        width: "100%",
        height: "auto",
        objectFit,
        objectPosition,
      }}
    />
  );
}
