/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type AirplaneTakeoffIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function AirplaneTakeoffIcon(props: AirplaneTakeoffIconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 32 32"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        fill={"currentColor"}
        d={
          "M22 27a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h18a1 1 0 0 1 1 1m8.788-16.155-2.33-2.987-.014-.018a4.98 4.98 0 0 0-6.41-1.14l-6.447 3.847-6.742-2.48a1 1 0 0 0-.699 0l-.896.341-.04.017a2 2 0 0 0-.567 3.308l2.732 2.649-2.522 1.525-3.532-1.193a1 1 0 0 0-.76.05l-.375.184a2 2 0 0 0-.561 3.276l4.5 4.41.015.014a4.97 4.97 0 0 0 5.942.669l18.427-11a1 1 0 0 0 .276-1.473h.003z"
        }
      ></path>
    </svg>
  );
}

export default AirplaneTakeoffIcon;
/* prettier-ignore-end */
