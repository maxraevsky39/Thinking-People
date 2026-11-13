import "../components/plasmic/thinking_people/plasmic.css"; // plasmic-import: 5CArWwg3qxRa1A2Avpz5j5/projectcss
import "@/styles/globals.css";
import { PlasmicRootProvider } from "@plasmicapp/react-web";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { FormWebhookBridge } from "../components/FormWebhookBridge";
import "../styles/ScrollReveal.css";
import GlobalContextsProvider from "../components/plasmic/thinking_people/PlasmicGlobalContextsProvider";
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlasmicRootProvider Head={Head} Link={Link}>
      <Head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png?v=tp1" key="favicon" />
        <link rel="shortcut icon" href="/favicon.ico?v=tp1" />
      </Head>
      <FormWebhookBridge />
      <GlobalContextsProvider>
        <Component {...pageProps} />
      </GlobalContextsProvider>
    </PlasmicRootProvider>
  );
}
