// Managed by scripts/prepare-static-pages.mjs. Edit the Plasmic design or shared page helpers.
import * as React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import PlasmicPage from "../../components/plasmic/thinking_people/PlasmicLeadershipDevelopmentOnTrial";
import { LocalizedPage, type LocalizedPageProps } from "@/components/LocalizedPage";
import { getLocalizedStaticPaths, getLocalizedStaticProps } from "@/lib/localized-static-pages";
const route = "/[locale]/leadership-on-trial";
export const getStaticPaths: GetStaticPaths = async () => getLocalizedStaticPaths(route);
export const getStaticProps: GetStaticProps = async (context) => getLocalizedStaticProps(route, context, (props) => <Page {...props} />);
export default function Page(props: LocalizedPageProps) {
  return <LocalizedPage {...props} route={route}><PlasmicPage /></LocalizedPage>;
}
