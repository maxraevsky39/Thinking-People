import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
if (process.env.TP_STATIC_PREPARED === '1') process.exit(0);
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd(), false);
const root = process.cwd();
const config = JSON.parse(fs.readFileSync('config/static-pages.json', 'utf8'));
const plasmic = JSON.parse(fs.readFileSync('plasmic.json', 'utf8'));
const languageSource = fs.readFileSync(config.languageVariantFile, 'utf8');
const valueType = languageSource.match(/export type LanguageValue\s*=\s*([^;]+);/);
if (!valueType) throw Error('Cannot read LanguageValue from the generated language provider');
const locales = [...new Set([config.defaultLocale, ...[...valueType[1].matchAll(/"([^"]+)"/g)].map(m => m[1])])];
for (const locale of locales) if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(locale)) throw Error(`Invalid language variant: ${locale}`);
const gqlUrl = process.env.STRAPI_GRAPHQL_URL || 'http://127.0.0.1:8080/graphql';
const token = process.env.STRAPI_BEARER_TOKEN;
if (!token) throw Error('STRAPI_BEARER_TOKEN is required for static generation');
async function request(query, variables) {
  const response = await fetch(gqlUrl, {method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({query, variables}), signal:AbortSignal.timeout(30000)});
  if (!response.ok) throw Error(`Strapi HTTP ${response.status}`);
  const body = await response.json();
  if (body.errors?.length) throw Error(body.errors.map(e => e.message).join('; '));
  if (!body.data) throw Error('Strapi returned no data');
  return body.data;
}
const cached = new Map();
async function slugsFor(collection, locale) {
  const key = `${collection}:${locale}`;
  if (cached.has(key)) return cached.get(key);
  const slugs = new Set();
  for (let page = 1;; page++) {
    const filter = config.collectionFilters[collection];
    const data = await request(`query StaticSlugs($locale: I18NLocaleCode!, $page: Int!) { ${collection}(locale: $locale, status: PUBLISHED, pagination: {page: $page, pageSize: 100}, sort: ["slug:asc"]${filter ? `, filters: ${filter}` : ''}) { slug } }`, {locale, page});
    const rows = data[collection];
    if (!Array.isArray(rows)) throw Error(`Invalid ${collection} response`);
    for (const row of rows) {
      if (typeof row.slug !== 'string' || !row.slug || /[\/?#]/.test(row.slug)) throw Error(`Invalid slug in ${collection}/${locale}`);
      if (slugs.has(row.slug)) throw Error(`Duplicate slug in ${collection}/${locale}: ${row.slug}`);
      slugs.add(row.slug);
    }
    if (rows.length < 100) break;
  }
  cached.set(key, [...slugs]);
  return [...slugs];
}
function routeFromFile(file) {
  return '/' + path.relative('pages', file).replace(/\.(tsx?|jsx?)$/, '').replace(/(^|\/)index$/, '').replace(/\/$/, '').replaceAll('[local]', '[locale]');
}
const records = [];
const movedFiles = [];
for (const project of plasmic.projects) for (const component of project.components || []) {
  if (component.componentType !== 'page') continue;
  if (config.unmanagedPages?.[component.id]) continue;
  const originalFile = path.normalize(path.join(plasmic.srcDir, component.importSpec.modulePath));
  if (!originalFile.startsWith('pages/')) throw Error(`Page wrapper outside pages/: ${originalFile}`);
  let route = routeFromFile(originalFile);
  if (route === '/') route = '/[locale]';
  if (!route.includes('[locale]')) route = '/[locale]' + route.replace(new RegExp(`^/(${locales.join('|')})(?=/|$)`), '');
  const file = 'pages' + route + '.tsx';
  const renderFile = path.normalize(path.join(plasmic.srcDir, component.renderModuleFilePath));
  if (!fs.existsSync(renderFile)) throw Error(`Missing synced component ${renderFile}`);
  const collection = config.collectionsByRoute[route];
  const singleType = config.singleTypesByRoute[route];
  const parameters = [...route.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
  if (parameters.some(p => !['locale','slug'].includes(p))) throw Error(`Unsupported route parameter: ${route}; add its static path source explicitly`);
  let fixedSlug;
  if (parameters.includes('slug') && !collection) {
    const sourcePath = component.path || '';
    if (sourcePath.includes('[') || !sourcePath) throw Error(`No Strapi collection or fixed Plasmic URL for ${route}`);
    fixedSlug = sourcePath.split('/').filter(Boolean).at(-1);
  }
  const record = {route, file, renderFile, name:component.name, collection, singleType, fixedSlug, entries:[]};
  for (const locale of locales) {
    if (singleType) {
      const data = await request(`query StaticSingle($locale: I18NLocaleCode!) { ${singleType}(locale:$locale, status:PUBLISHED) { documentId } }`, {locale});
      if (!data[singleType]) continue;
    }
    const slugs = collection ? await slugsFor(collection, locale) : [fixedSlug];
    for (const slug of slugs) {
      const params = {locale, ...(slug ? {slug} : {})};
      const url = route.replace('[locale]', locale).replace('[slug]', encodeURIComponent(slug || '')) + '/';
      record.entries.push({params, url});
    }
  }
  records.push(record);
  if (originalFile !== file && originalFile !== 'pages/index.tsx') movedFiles.push({from:originalFile,to:file});
  // Preserve fixed-page aliases only. Collection templates may retain a stale
  // Plasmic path (e.g. /blog); it must not alias every article to the index.
  if (!collection && component.path && !component.path.includes("[") && component.path !== "/") {
    let alias = (component.path || '').replace(new RegExp(`^/(${locales.join('|')})(?=/|$)`), '/[locale]');
    if (!alias.includes('[locale]')) alias = '/[locale]' + alias;
    if (alias !== route.replace('[slug]', fixedSlug || '')) records.push({...record,route:alias,file:'pages'+alias+'.tsx',entries:record.entries.map(e=>({...e,url:alias.replace('[locale]',e.params.locale)+'/'}))});
  }
}
const routes = new Set(), urls = new Set();
for (const r of records) {
  if (routes.has(r.route)) throw Error(`Duplicate page route ${r.route}`);
  routes.add(r.route);
  for (const e of r.entries) { if (urls.has(e.url)) throw Error(`Duplicate page URL ${e.url}`); urls.add(e.url); }
}
const manifest = {defaultLocale:config.defaultLocale,locales,unmanagedUrls:Object.values(config.unmanagedPages || {}).flat(),pages:records.map(({route,name,collection,singleType,entries})=>({route,name,collection,singleType,entries})),urls:[...urls].sort()};
fs.mkdirSync('.tp-generated',{recursive:true});
fs.writeFileSync('.tp-generated/static-pages.json',JSON.stringify(manifest,null,2)+'\n');
for (const r of records) {
  let importPath = path.relative(path.dirname(r.file),r.renderFile).replace(/\.tsx$/, '');
  if (!importPath.startsWith('.')) importPath='./'+importPath;
  const output = `// Managed by scripts/prepare-static-pages.mjs. Edit the Plasmic design or shared page helpers.\nimport * as React from "react";\nimport type { GetStaticPaths, GetStaticProps } from "next";\nimport PlasmicPage from ${JSON.stringify(importPath)};\nimport { LocalizedPage, type LocalizedPageProps } from "@/components/LocalizedPage";\nimport { getLocalizedStaticPaths, getLocalizedStaticProps } from "@/lib/localized-static-pages";\nconst route = ${JSON.stringify(r.route)};\nexport const getStaticPaths: GetStaticPaths = async () => getLocalizedStaticPaths(route);\nexport const getStaticProps: GetStaticProps = async (context) => getLocalizedStaticProps(route, context, (props) => <Page {...props} />);\nexport default function Page(props: LocalizedPageProps) {\n  return <LocalizedPage {...props} route={route}><PlasmicPage /></LocalizedPage>;\n}\n`;
  fs.mkdirSync(path.dirname(r.file),{recursive:true});
  fs.writeFileSync(r.file,output);
}
// Remove only wrappers owned by this generator; synced and handwritten pages stay intact.
const activeFiles = new Set(records.map(r => r.file));
function removeObsoleteManagedWrappers(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) removeObsoleteManagedWrappers(file);
    else if (/\.tsx$/.test(file) && !activeFiles.has(file) &&
      fs.readFileSync(file, 'utf8').startsWith('// Managed by scripts/prepare-static-pages.mjs.')) {
      fs.unlinkSync(file);
      console.log(`Removed obsolete managed wrapper: ${file}`);
    }
  }
}
removeObsoleteManagedWrappers('pages');
for (const {from,to} of movedFiles) {
  if (fs.existsSync(from) && !records.some(r=>r.file===from)) {
    fs.unlinkSync(from);
    const parent = path.dirname(from);
    if (fs.readdirSync(parent).length===0) fs.rmdirSync(parent);
  }
  console.log(`Normalized wrapper: ${from} -> ${to}`);
}
console.log(`Static pages: ${manifest.urls.length} URLs; languages: ${locales.join(', ')}; ${records.length} templates.`);
for(const r of records) console.log(`${r.route}: ${r.entries.length}`);
