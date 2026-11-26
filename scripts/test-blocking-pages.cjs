const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
const routes=['/[locale]/blog/[slug]','/[locale]/cases/[slug]','/[locale]/learning/[slug]'];
const manifest={defaultLocale:'en',locales:['en','lv'],pages:routes.map((route,i)=>({route,collection:['articles','caseStudies','directions'][i],entries:[{params:{locale:'en',slug:'existing'},url:route.replace('[locale]','en').replace('[slug]','existing')+'/'}]}))};
let published=['en','lv'],broken=false,calls=0,field='articles';
const sandbox={exports:{},process:{cwd:()=>'/test',env:{STRAPI_BEARER_TOKEN:'test'}},AbortSignal,require(name){if(name==='node:fs')return {readFileSync:()=>JSON.stringify(manifest)};if(name==='node:path')return require('path');if(name==='@plasmicapp/react-web/lib/prepass')return {extractPlasmicQueryData:async()=>({query:{data:{[field]:[{slug:'new'}]}}})};throw Error(name);},fetch:async(_,options)=>{calls++;const {variables,query}=JSON.parse(options.body);assert(query.includes('status: PUBLISHED'));if(broken)throw Error('offline');return {ok:true,json:async()=>({data:{[field]:published.includes(variables.locale)?[{slug:variables.slug}]:[]}})};}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/localized-static-pages.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,sandbox);
(async()=>{const {getLocalizedStaticPaths:paths,getLocalizedStaticProps:props}=sandbox.exports;
assert.equal(paths(routes[0]).fallback,'blocking');assert.equal(paths(routes[1]).fallback,'blocking');assert.equal(paths(routes[2]).fallback,false);assert.equal(paths(routes[0]).paths.length,1);
for(const [i,collection] of ['articles','caseStudies'].entries()){field=collection;published=['en','lv'];const r=await props(routes[i],{params:{locale:'lv',slug:'new'}},()=>null);assert.equal(r.props.params.slug,'new');assert.equal(r.props.languageLinks.length,2);
published=['en'];assert.equal((await props(routes[i],{params:{locale:'lv',slug:'new'}},()=>null)).notFound,true);
published=[];const missing=await props(routes[i],{params:{locale:'en',slug:'existing'}},()=>null);assert.equal(missing.notFound,true);assert.equal(missing.revalidate,60);
const before=calls;assert.equal((await props(routes[i],{params:{locale:'xx',slug:'new'}},()=>null)).notFound,true);assert.equal(calls,before);
broken=true;await assert.rejects(()=>props(routes[i],{params:{locale:'en',slug:'new'}},()=>null),/offline/);broken=false;}
assert.equal((await props(routes[2],{params:{locale:'en',slug:'new'}},()=>null)).notFound,true);
console.log('PASS: both blocking routes, new slugs, published locales, removed records, retryable 404, invalid locales, Strapi failures, other routes unchanged');})().catch(e=>{console.error(e);process.exitCode=1});
