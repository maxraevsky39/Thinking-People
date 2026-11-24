import * as React from 'react';
import { usePlasmicCanvasContext } from '@plasmicapp/react-web/lib/host';
import { pose, type ScrollStackVariant } from './scrollStackPose';

export interface ScrollStackProps {
  children?: React.ReactNode; className?: string; scrollMode?: 'stage' | 'flow'; flowGap?: number; variant?: ScrollStackVariant;
  scrollLength?: number; stickyTop?: number; peek?: number; scaleStep?: number;
  blur?: number; dim?: number; smooth?: number; depth?: number;
  fullWidth?: boolean; cardWidth?: number; cardHeight?: number; borderRadius?: number; perspective?: number;
  sidePadding?: number; showProgress?: boolean; showCounter?: boolean;
  progressColor?: string; listGap?: number; disabled?: boolean;
  mobileBreakpoint?: number; mobileMode?: 'list' | 'animate';
  previewInEditor?: boolean; respectReducedMotion?: boolean; cardSelector?: string;
  frameClassName?: string; hudClassName?: string; onIndexChange?: (index:number)=>void;
}
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const finite=(n:number|undefined,f:number)=>Number.isFinite(n)?n!:f;
export function ScrollStackCard({children,className}: {children?:React.ReactNode;className?:string}) {
  return <div data-tp-stack-card="" className={className} style={{width:'100%',minWidth:0,display:'flex',flexDirection:'column',alignItems:'stretch'}}>{children}</div>;
}
export function ScrollStack(p:ScrollStackProps) {
 const {children,className,variant='stack',showProgress=true,showCounter=true,mobileMode='list',previewInEditor=false,respectReducedMotion=true,disabled=false}=p;
 const canvas=usePlasmicCanvasContext();
 const editing=!!canvas&&!canvas.interactive;
 const root=React.useRef<HTMLElement>(null),content=React.useRef<HTMLDivElement>(null);
 const callback=React.useRef(p.onIndexChange);callback.current=p.onIndexChange;
 const [cards,setCards]=React.useState<HTMLElement[]>([]),[lead,setLead]=React.useState(0);
 const [geometry,setGeometry]=React.useState({height:800,width:1200,ready:false});
 const [reduced,setReduced]=React.useState(false);
 const scroller=React.useRef<HTMLElement|null>(null),rail=React.useRef<HTMLSpanElement>(null);
 const count=cards.length;
 const top=Math.max(0,finite(p.stickyTop,80)),available=Math.max(100,geometry.height-top);
 const mobile=geometry.width<=finite(p.mobileBreakpoint,767);
 const animate=geometry.ready&&count>1&&!disabled&&!(editing&&!previewInEditor)&&!(respectReducedMotion&&reduced)&&!(mobile&&mobileMode==='list');
 const flowMode=p.scrollMode==='flow',staged=animate&&!flowMode;
 const reach=Math.max(.2,finite(p.scrollLength,1)),height=clamp(finite(p.cardHeight,68),20,95)/100;
 const radius=Math.max(0,finite(p.borderRadius,22)),gap=Math.max(0,finite(flowMode?p.flowGap:p.listGap,24));
 const [selectorError,setSelectorError]=React.useState(false);
 React.useEffect(()=>{
  const host=content.current;if(!host)return;
  const collect=()=>{
   let found:HTMLElement[]=[];
   try {
    found=Array.from(host.querySelectorAll<HTMLElement>(p.cardSelector?.trim()||'[data-tp-stack-card]')).filter(el=>el.closest('[data-tp-stack-root]')===root.current);
    if(!p.cardSelector?.trim()&&!found.length)found=Array.from(host.children).filter(el=>el.nodeType===1&&!['STYLE','SCRIPT'].includes(el.tagName)) as HTMLElement[];
    // A selected parent and its descendant must never become two animated cards.
    found=found.filter(el=>!found.some(other=>other!==el&&other.contains(el)));
    setSelectorError(false);
   }catch{setSelectorError(true);}
   setCards(old=>old.length===found.length&&old.every((el,i)=>el===found[i])?old:found);
  };
  collect();const win=host.ownerDocument.defaultView;if(!win)return;
  const observer=new win.MutationObserver(collect);observer.observe(host,{childList:true,subtree:true});
  return ()=>observer.disconnect();
 },[p.cardSelector,children]);
 React.useEffect(()=>{
  const el=root.current;if(!el)return;const doc=el.ownerDocument,win=doc.defaultView;if(!win)return;
  const measure=()=>{
   let parent=el.parentElement;scroller.current=null;
   while(parent&&parent!==doc.documentElement){
    if(parent!==doc.body&&/auto|scroll|overlay/.test(win.getComputedStyle(parent).overflowY)&&parent!==doc.scrollingElement){scroller.current=parent;break;}
    parent=parent.parentElement;
   }
   const container=scroller.current;
   const next={height:container?.clientHeight||win.innerHeight,width:container?.clientWidth||win.innerWidth,ready:true};
   setGeometry(old=>old.height===next.height&&old.width===next.width&&old.ready?old:next);
  };
  measure();const media=win.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduced(media.matches);sync();
  const observer=new win.ResizeObserver(measure);observer.observe(el);if(scroller.current)observer.observe(scroller.current);
  win.addEventListener('resize',measure);media.addEventListener('change',sync);
  return ()=>{observer.disconnect();win.removeEventListener('resize',measure);media.removeEventListener('change',sync);};
 },[top]);
 React.useEffect(()=>{
  if(!staged)return;const el=root.current,host=content.current;if(!el||!host)return;
  const doc=el.ownerDocument,win=doc.defaultView;if(!win)return;
  // Studio slots/Repeat can add positioned wrappers. Absolute cards must use
  // the stack frame, not a now-empty wrapper, as their containing block.
  const wrappers=new Set<HTMLElement>();
  cards.forEach(card=>{let parent=card.parentElement;while(parent&&parent!==host){wrappers.add(parent);parent=parent.parentElement;}});
  const wrapperStyles=Array.from(wrappers,element=>({element,style:element.getAttribute('style')}));
  wrappers.forEach(element=>element.style.setProperty('display','contents'));
  const original=cards.map(c=>({style:c.getAttribute('style'),hidden:c.getAttribute('aria-hidden'),inert:c.hasAttribute('inert')}));
  let raf=0,live=false,previous=0,shown=0,lastIndex=-1;
  const recipe={peek:Math.max(0,finite(p.peek,26)),scaleStep:clamp(finite(p.scaleStep,.07),0,.15),blur:clamp(finite(p.blur,4),0,30),dim:clamp(finite(p.dim,.28),0,1),radius,enter:((1+1/height)/2)*100+3};
  const depth=clamp(Math.round(finite(p.depth,3)),1,6),smooth=clamp(finite(p.smooth,.16),0,.95);
  const measure=()=>{
   const container=scroller.current;const origin=container?container.getBoundingClientRect().top+container.clientTop:0;
   return clamp((origin+top-el.getBoundingClientRect().top)/Math.max(1,el.offsetHeight-available),0,1)*(count-1);
  };
  const paint=(progress:number)=>{
   const active=clamp(Math.round(progress),0,count-1);
   cards.forEach((card,i)=>{
    const offset=progress-i;const shot=pose(variant,clamp(offset,-2,depth),i,recipe);
    Object.assign(card.style,{position:'absolute',inset:'0',width:'100%',height:'100%',margin:'0',zIndex:String(i),backfaceVisibility:'hidden',willChange:'transform,opacity',visibility:offset < -1.0005||offset>depth?'hidden':'visible',transform:shot.transform,opacity:String(shot.opacity),filter:shot.filter,clipPath:shot.clip,pointerEvents:i===active?'auto':'none'});
    card.setAttribute('aria-hidden',String(i!==active));card.toggleAttribute('inert',i!==active);
   });
   if(rail.current)rail.current.style.transform=`scaleX(${progress/(count-1)})`;
   if(lastIndex!==active){lastIndex=active;setLead(active);callback.current?.(active);}
  };
  const frame=(stamp:number)=>{
   const delta=previous?Math.min(50,stamp-previous):16.67;previous=stamp;const target=measure();
   const alpha=smooth===0?1:1-Math.exp(-delta/(30+smooth*470));shown+=(target-shown)*alpha;
   if(Math.abs(target-shown)<.0004){shown=target;live=false;}paint(shown);
   if(live)raf=win.requestAnimationFrame(frame);
  };
  const wake=()=>{if(!live){live=true;previous=0;raf=win.requestAnimationFrame(frame);}};
  shown=measure();paint(shown);
  doc.addEventListener('scroll',wake,{passive:true,capture:true});win.addEventListener('scroll',wake,{passive:true});win.addEventListener('resize',wake);
  const observer=new win.ResizeObserver(wake);observer.observe(el);
  return ()=>{
   win.cancelAnimationFrame(raf);observer.disconnect();doc.removeEventListener('scroll',wake,true);win.removeEventListener('scroll',wake);win.removeEventListener('resize',wake);
   wrapperStyles.forEach(({element,style})=>style===null?element.removeAttribute('style'):element.setAttribute('style',style));
   cards.forEach((c,i)=>{const o=original[i];o.style===null?c.removeAttribute('style'):c.setAttribute('style',o.style);o.hidden===null?c.removeAttribute('aria-hidden'):c.setAttribute('aria-hidden',o.hidden);c.toggleAttribute('inert',o.inert);});
  };
 },[staged,cards,count,variant,top,available,height,radius,reach,p.peek,p.scaleStep,p.blur,p.dim,p.depth,p.smooth]);
 // Flow mode keeps real card heights and document flow. Sticky positioning
 // provides the overlap without adding viewport-sized scroll spacers.
 React.useEffect(()=>{
  if(!animate||!flowMode)return;
  const host=content.current,el=root.current;if(!host||!el)return;
  const doc=host.ownerDocument,win=doc.defaultView;if(!win)return;
  const wrappers=new Set<HTMLElement>();
  cards.forEach(card=>{for(let parent=card.parentElement;parent&&parent!==host;parent=parent.parentElement)wrappers.add(parent);});
  const originals=Array.from(new Set([...Array.from(wrappers),...cards]),element=>({element,style:element.getAttribute('style')}));
  wrappers.forEach(element=>element.style.setProperty('display','contents'));
  cards.forEach((card,i)=>Object.assign(card.style,{position:'sticky',top:`${top}px`,bottom:'auto',left:'auto',right:'auto',width:'100%',height:'auto',flexShrink:'0',margin:'0',zIndex:String(i)}));
  const depth=clamp(Math.round(finite(p.depth,3)),1,6),smooth=clamp(finite(p.smooth,.16),0,.95);
  const recipe={peek:Math.max(0,finite(p.peek,26)),scaleStep:clamp(finite(p.scaleStep,.07),0,.15),blur:clamp(finite(p.blur,4),0,30),dim:clamp(finite(p.dim,.28),0,1),radius,enter:0};
  let raf=0,live=false,previous=0,shown=0,lastIndex=-1;
  const measure=()=>{
   const container=scroller.current;
   const origin=container?container.getBoundingClientRect().top+container.clientTop:0;
   const scroll=origin+top-host.getBoundingClientRect().top;
   // Read untransformed layout heights, not animated bounding boxes or sticky
   // offsetTop. This also supports cards of different heights without feedback.
   let start=parseFloat(win.getComputedStyle(host).paddingTop)||0;
   for(let i=0;i<cards.length-1;i++){
    const distance=Math.max(1,cards[i].offsetHeight+gap);
    if(scroll<start+distance)return i+clamp((scroll-start)/distance,0,1);
    start+=distance;
   }
   return cards.length-1;
  };
  const paint=(progress:number)=>{
   cards.forEach((card,i)=>{
    const offset=clamp(progress-i,0,depth);
    const shot=pose('stack',offset,i,recipe);
    Object.assign(card.style,{transform:shot.transform,transformOrigin:'center top',opacity:'1',filter:shot.filter,clipPath:shot.clip,willChange:'transform,filter'});
   });
   const active=clamp(Math.floor(progress+.0001),0,cards.length-1);
   if(active!==lastIndex){lastIndex=active;setLead(active);callback.current?.(active);}
  };
  const frame=(stamp:number)=>{
   const delta=previous?Math.min(50,stamp-previous):16.67;previous=stamp;
   const target=measure(),alpha=smooth===0?1:1-Math.exp(-delta/(30+smooth*470));
   shown+=(target-shown)*alpha;
   if(Math.abs(target-shown)<.0004){shown=target;live=false;}
   paint(shown);if(live)raf=win.requestAnimationFrame(frame);
  };
  const wake=()=>{if(!live){live=true;previous=0;raf=win.requestAnimationFrame(frame);}};
  shown=measure();paint(shown);
  doc.addEventListener('scroll',wake,{passive:true,capture:true});win.addEventListener('resize',wake);
  const observer=new win.ResizeObserver(wake);observer.observe(host);cards.forEach(card=>observer.observe(card));
  return ()=>{win.cancelAnimationFrame(raf);observer.disconnect();doc.removeEventListener('scroll',wake,true);win.removeEventListener('resize',wake);originals.forEach(({element,style})=>style===null?element.removeAttribute('style'):element.setAttribute('style',style));};
 },[animate,flowMode,cards,top,gap,radius,p.peek,p.scaleStep,p.blur,p.dim,p.depth,p.smooth]);

 return <section ref={root} data-tp-stack-root="" className={className} aria-label="Scrolling card stack" style={{position:'relative',width:'100%',height:staged?available+(count-1)*available*reach:undefined}}>
  <div style={{position:staged?'sticky':'relative',top:staged?top:undefined,height:staged?available:undefined,width:'100%',minWidth:0,flexShrink:0,alignSelf:'stretch',display:'flex',alignItems:'center',justifyContent:'center',boxSizing:'border-box',paddingInline:Math.max(0,finite(p.sidePadding,24)),perspective:Math.max(200,finite(p.perspective,1400)),overflow:staged?'clip':'visible'}}>
   <div ref={content} className={p.frameClassName} style={{position:'relative',width:'100%',maxWidth:p.fullWidth?'none':Math.max(200,finite(p.cardWidth,880)),minWidth:0,height:staged?available*height:undefined,display:staged?'block':'flex',flexDirection:'column',gap}}>{children}</div>
   {staged&&(showCounter||showProgress)&&<div className={p.hudClassName} style={{position:'absolute',bottom:16,left:0,right:0,display:'flex',justifyContent:'center',alignItems:'center',gap:16,pointerEvents:'none',color:p.progressColor||'inherit'}}>
    {showProgress&&<span style={{position:'relative',width:150,height:2,background:'color-mix(in srgb, currentColor 20%, transparent)',overflow:'hidden'}}><span ref={rail} style={{position:'absolute',inset:0,background:'currentColor',transformOrigin:'left',transform:'scaleX(0)'}}/></span>}
    {showCounter&&<span style={{fontSize:12,fontVariantNumeric:'tabular-nums'}}>{String(Math.min(lead+1,count)).padStart(2,'0')} / {String(count).padStart(2,'0')}</span>}
   </div>}
  </div>
  {canvas&&selectorError&&<p>Scroll Stack: неверный CSS-селектор карточек.</p>}
 </section>;
}
export default ScrollStack;
