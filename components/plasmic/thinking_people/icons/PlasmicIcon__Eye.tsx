/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type EyeIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function EyeIcon(props: EyeIconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 20 20"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"currentColor"}
        fillOpacity={".6"}
        d={
          "M19.321 9.747c-.027-.062-.689-1.53-2.16-3C15.2 4.785 12.725 3.75 10 3.75S4.8 4.786 2.84 6.746C1.368 8.217.703 9.687.679 9.746a.63.63 0 0 0 0 .509c.027.061.689 1.529 2.16 3 1.96 1.96 4.436 2.995 7.161 2.995s5.2-1.036 7.16-2.995c1.472-1.471 2.134-2.939 2.161-3a.63.63 0 0 0 0-.508M10 13.125a3.125 3.125 0 1 1 0-6.25 3.125 3.125 0 0 1 0 6.25"
        }
      ></path>
    </svg>
  );
}

export default EyeIcon;
/* prettier-ignore-end */
