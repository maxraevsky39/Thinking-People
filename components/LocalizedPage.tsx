import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageParamsProvider } from "@plasmicapp/react-web/lib/host";
import { PlasmicQueryDataProvider } from "@plasmicapp/react-web/lib/query";
import GlobalContextsProvider from "./plasmic/thinking_people/PlasmicGlobalContextsProvider";
import { LanguageContextProvider, type LanguageValue } from "./plasmic/thinking_people/PlasmicGlobalVariant__Language";

export type LocalizedPageProps = {
  locale: string;
  defaultLocale: string;
  params: Record<string, string>;
  queryCache?: Record<string, any>;
  canonicalUrl: string;
  languageLinks: Array<{ locale: string; url: string }>;
};

export function LocalizedPage({ children, route, ...props }: React.PropsWithChildren<LocalizedPageProps & { route: string }>) {
  let router: ReturnType<typeof useRouter> | undefined;
  try { router = useRouter(); } catch { /* No Next router during the data prepass. */ }
  // Static params take precedence: neither query strings nor hydration can change the page language.
  const params = { ...props.params, local: props.locale, locale: props.locale };
  const query = { ...(router?.query || {}), ...params };
  return (
    <LanguageContextProvider value={props.locale === props.defaultLocale ? undefined : props.locale as LanguageValue}>
      <GlobalContextsProvider>
        <PlasmicQueryDataProvider prefetchedCache={props.queryCache}>
          <PageParamsProvider route={route} params={params} query={query}>
            <Head>
              <link key="canonical" rel="canonical" href={props.canonicalUrl} />
              {props.languageLinks.map(link => <link key={`alternate-${link.locale}`} rel="alternate" hrefLang={link.locale} href={link.url} />)}
            </Head>
            {children}
          </PageParamsProvider>
        </PlasmicQueryDataProvider>
      </GlobalContextsProvider>
    </LanguageContextProvider>
  );
}
