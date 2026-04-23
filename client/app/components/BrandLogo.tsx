import type { CSSProperties } from "react";
import logoSvg from "../../assets/logo.svg";
import logopSvg from "../../assets/logopb.svg";

type BrandLogoProps = {
  ariaLabel?: string;
  color?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
};

export function BrandLogoC({
  ariaLabel = "Krea logo",
  width,
  height,
  className,
}: BrandLogoProps) {
  const style: CSSProperties = {
    display: "inline-block",
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(width === undefined && height === undefined ? { width: 160 } : {}),
  };

  return (
    <img
      src={logopSvg}
      alt={ariaLabel}
      className={className}
      style={style}
    />
  );
}

export function BrandLogo({
  ariaLabel = "Krea logo",
  color = "currentColor",
  width,
  height,
  className,
}: BrandLogoProps) {
  const style: CSSProperties = {
    display: "inline-block",
    aspectRatio: "640 / 400",
    backgroundColor: color,
    WebkitMaskImage: `url(${logoSvg})`,
    maskImage: `url(${logoSvg})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(width === undefined && height === undefined ? { width: 160 } : {}),
  };

  return <span role="img" aria-label={ariaLabel} className={className} style={style} />;
}