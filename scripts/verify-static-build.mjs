import fs from 'node:fs';
import assert from 'node:assert/strict';
const expected=JSON.parse(fs.readFileSync('.tp-generated/static-pages.json','utf8'));
const prerender=JSON.parse(fs.readFileSync('.next/prerender-manifest.json','utf8'));
const results=[];
function findField(value,field){
  if(!value || typeof value!=='object') return undefined;
  if(Object.hasOwn(value,field)) return value[field];
  for(const child of Object.values(value)){const found=findField(child,field);if(found!==undefined)return found;}
}
function plain(value){return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();}

for(const url of expected.urls){
  const key=url.replace(/\/$/,'')||'/';
  assert(prerender.routes[key],`Not prerendered: ${url}`);
  const file='.next/server/pages'+(key==='/'?'/index':key)+'.html';
  assert(fs.existsSync(file),`Missing HTML: ${file}`);
  const html=fs.readFileSync(file,'utf8');
  const locale=url.split('/')[1];
  assert(html.includes(`lang="${locale}"`),`Wrong HTML language: ${url}`);
  const m=html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  assert(m,`Missing page data: ${url}`);
  const props=JSON.parse(m[1]).props.pageProps;
  assert.equal(props.locale,locale);
  assert(!html.includes('PLEASE_RENDER_INSIDE_PROVIDER'),`Missing language provider: ${url}`);
  const page=expected.pages.find(p=>p.entries.some(e=>e.url===url));
  const field=page.collection||page.singleType;
  if(field){
    const data=findField(props.queryCache,field);
    const item=Array.isArray(data)?(data.find(x=>x.slug===props.params.slug)||(data.length===1?data[0]:undefined)):data;
    assert(item,`Missing localized source data: ${url}`);
    const title=item.name||item.hero?.title||item.title||item.h1;
    assert(typeof title==='string' && title.length,`Missing primary text: ${url}`);
    assert(plain(html).includes(plain(title)),`Primary text absent from rendered HTML: ${url}`);
  }
  results.push({url,locale,bytes:Buffer.byteLength(html)});
}
const blockingRoutes = new Set(['/[locale]/blog/[slug]', '/[locale]/cases/[slug]']);
for(const page of expected.pages) assert.equal(prerender.dynamicRoutes[page.route]?.fallback, blockingRoutes.has(page.route) ? null : false, `Unexpected fallback mode: ${page.route}`);
fs.writeFileSync('.tp-generated/build-report.json',JSON.stringify({verified:true,count:results.length,locales:expected.locales,pages:results},null,2)+'\n');
console.log(`Verified ${results.length} prerendered HTML pages across ${expected.locales.join(', ')}.`);
