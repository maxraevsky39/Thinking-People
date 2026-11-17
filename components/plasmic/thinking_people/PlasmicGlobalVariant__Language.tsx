/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */

import * as React from "react";
import { createUseScreenVariants } from "@plasmicapp/react-web";

export type LanguageValue = "lv";
export const LanguageContext = React.createContext<LanguageValue | undefined>(
  "PLEASE_RENDER_INSIDE_PROVIDER" as any
);
export function LanguageContextProvider(
  props: React.PropsWithChildren<{ value: LanguageValue | undefined }>
) {
  return (
    <LanguageContext.Provider value={props.value}>
      {props.children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}

export default LanguageContext;
/* prettier-ignore-end */
