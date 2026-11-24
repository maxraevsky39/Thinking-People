/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type ShareIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function ShareIcon(props: ShareIconProps) {
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
          "m18.567 9.192-6.25 6.25A.624.624 0 0 1 11.25 15v-3.107c-4.461.253-7.52 3.146-8.378 4.062a.938.938 0 0 1-1.616-.748c.29-2.52 1.67-4.945 3.888-6.826 1.841-1.563 4.08-2.554 6.106-2.727V2.5a.625.625 0 0 1 1.067-.443l6.25 6.25a.626.626 0 0 1 0 .885"
        }
      ></path>
    </svg>
  );
}

export default ShareIcon;
/* prettier-ignore-end */
