"use client";
// Adapted from the user-provided React Bits Pro Features 4 source.
import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { usePlasmicCanvasContext } from '@plasmicapp/react-web/lib/host';
export interface FeatureCard { id?: string; title?: string; description?: string }
export interface FeatureGroup { id?: string; key?: string; title?: string; description?: string; icon?: {url?: string; alternativeText?: string}; cards?: FeatureCard[] }
export interface Features4Props {
  items?: FeatureGroup[]; className?: string; defaultActiveIndex?: number; activeIndex?: number;
  autoPlay?: boolean; interval?: number; autoPlayDelay?: number; animationDuration?: number;
  showNumbers?: boolean; showIcons?: boolean; showDescriptions?: boolean; showProgress?: boolean;
  navigationClassName?: string; navigationGap?: number;
  pauseOnHover?: boolean; pauseOnFocus?: boolean; stopAfterInteraction?: boolean;
  navigationWidth?: number; columnGap?: number; itemsGap?: number; mobileBreakpoint?: number;
  mobileLayout?: 'accordion'|'tabs'; panelHeightMode?: 'tallest'|'content';
  containerClassName?: string; tabClassName?: string; activeTabClassName?: string; numberClassName?: string;
  titleClassName?: string; descriptionClassName?: string; panelClassName?: string; cardClassName?: string;
  cardTitleClassName?: string; cardDescriptionClassName?: string; progressClassName?: string;
  onActiveChange?: (index: number) => void;
}
const demo: FeatureGroup[] = [{title:'Direction one',cards:[{title:'A challenge your team faces',description:'Describe the situation here.'}]},{title:'Direction two',cards:[{title:'Another challenge',description:'Connect items to your existing query.'}]}];
export function Features4(p: Features4Props) {
  const {
    items = demo, defaultActiveIndex = 0, activeIndex, autoPlay = false,
    interval = 10000, animationDuration = 300, showNumbers = true,
    showIcons = false, showDescriptions = false, showProgress = false,
    navigationWidth = 35, navigationGap = 12, columnGap = 48, itemsGap = 24,
    mobileBreakpoint = 768, mobileLayout = 'accordion', panelHeightMode = 'tallest',
    pauseOnHover = true, pauseOnFocus = true, stopAfterInteraction = false,
  } = p;
  const data = Array.isArray(items) ? items.filter(Boolean) : [];
  const canvas = usePlasmicCanvasContext();
  const editing = !!canvas && !canvas.interactive;
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const prefix = 'f4-' + id;
  const root = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const changeCallback = useRef(p.onActiveChange);
  changeCallback.current = p.onActiveChange;
  const [selected, setSelected] = useState(defaultActiveIndex);
  const [manual, setManual] = useState(false);
  const [restart, setRestart] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const controlled = typeof activeIndex === 'number' && Number.isFinite(activeIndex);
  const active = Math.max(0, Math.min(data.length - 1, Math.floor(controlled ? activeIndex! : selected) || 0));
  const delay = Math.max(1000, p.autoPlayDelay ?? interval);
  const running = autoPlay && !controlled && !editing && !reduced &&
    !(stopAfterInteraction && manual) && !(pauseOnHover && hover) &&
    !(pauseOnFocus && focus) && visible && pageVisible && data.length > 1;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const doc = el.ownerDocument;
    const win = doc.defaultView;
    if (!win) return;
    // Use the section's window: Studio may render it into another document.
    const observer = new win.IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    observer.observe(el);
    const update = () => setPageVisible(!doc.hidden);
    update();
    doc.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); doc.removeEventListener('visibilitychange', update); };
  }, []);

  useEffect(() => {
    const media = root.current?.ownerDocument.defaultView?.matchMedia(`(max-width: ${Math.max(320, mobileBreakpoint)}px)`);
    if (!media) return;
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [mobileBreakpoint]);

  useEffect(() => { setManual(false); }, [autoPlay]);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => {
      const next = (active + 1) % data.length;
      setSelected(next);
      changeCallback.current?.(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [running, active, delay, data.length, restart]);

  const select = (index: number) => {
    setManual(true);
    setRestart(n => n + 1);
    setSelected(index);
    changeCallback.current?.(index);
  };
  const styles = {
    '--nav-width': Math.max(15, Math.min(60, navigationWidth)) + '%',
    '--column-gap': columnGap + 'px', '--item-gap': itemsGap + 'px',
    '--nav-gap': navigationGap + 'px',
  } as React.CSSProperties;
  const panel = (group: FeatureGroup, index: number) => {
    const isActive = index === active;
    // Hidden panels reserve height only in desktop "tallest" mode.
    const omitted = !isActive && (mobile || panelHeightMode === 'content');
    return <motion.div key={group.id || group.key || index}
      id={`${prefix}-panel-${index}`} role="region" aria-labelledby={`${prefix}-tab-${index}`}
      aria-hidden={!isActive} hidden={omitted} data-active={isActive}
      className={'f4-panel ' + (p.panelClassName || '')} initial={false}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
      transition={{ duration: reduced ? 0 : Math.max(0, animationDuration) / 1000 }}>
      {(Array.isArray(group.cards) ? group.cards : []).map((card, i) =>
        <div className={'f4-card ' + (p.cardClassName || '')} key={card.id || i}>
          <h3 className={'f4-card-title ' + (p.cardTitleClassName || '')}>{card.title}</h3>
          {card.description && <p className={'f4-card-description ' + (p.cardDescriptionClassName || '')}>{card.description}</p>}
        </div>)}
    </motion.div>;
  };
  const accordion = mobile && mobileLayout === 'accordion';
  return <div ref={root} data-mobile={mobile} data-mobile-layout={mobileLayout}
    className={[prefix, p.className, p.containerClassName].filter(Boolean).join(' ')} style={styles}
    onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    onFocusCapture={() => setFocus(true)}
    onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocus(false); }}>
    <style>{`
      :where(.${prefix}){width:100%;display:flex;flex-direction:row;gap:var(--column-gap);align-items:flex-start;color:inherit;font-family:inherit}
      :where(.${prefix} .f4-navigation){display:flex;flex-direction:column;gap:var(--nav-gap);width:var(--nav-width);flex-shrink:0;min-width:0}
      :where(.${prefix} .f4-panels){display:grid;flex:1;min-width:0;align-items:start}
      :where(.${prefix} .f4-tab){position:relative;width:100%;box-sizing:border-box;border:0;text-align:left;padding:20px;border-radius:16px;background:#f6f5f3;color:inherit;font:inherit;cursor:pointer;display:flex;gap:16px;align-items:flex-start;overflow:hidden}
      :where(.${prefix} .f4-tab[aria-expanded=true]){background:#f5adb5}
      :where(.${prefix} .f4-tab:focus-visible){outline:2px solid currentColor;outline-offset:3px}
      :where(.${prefix} .f4-number){flex-shrink:0;font-size:14px;line-height:1.5}
      :where(.${prefix} .f4-icon){width:24px;height:24px;object-fit:contain}
      :where(.${prefix} .f4-title){display:block;font-size:18px;font-weight:600;line-height:1.3}
      :where(.${prefix} .f4-description){display:block;margin-top:8px;font-size:14px;line-height:1.5;opacity:.75}
      :where(.${prefix} .f4-panel){grid-area:1 / 1;border:1px solid #deddda;border-radius:24px;padding:32px;min-width:0;display:flex;flex-direction:column;gap:var(--item-gap);box-sizing:border-box;width:100%}
      :where(.${prefix} .f4-panel[data-active=false]){visibility:hidden;pointer-events:none}
      :where(.${prefix} .f4-card){padding:20px;background:#f6f5f3;border-radius:12px}
      :where(.${prefix} .f4-card-title){margin:0;font-size:22px;font-weight:600;line-height:1.3}
      :where(.${prefix} .f4-card-description){margin:12px 0 0;font-size:16px;line-height:1.6;white-space:pre-line}
      :where(.${prefix} .f4-progress){position:absolute;bottom:0;left:0;height:3px;width:100%;background:currentColor;transform-origin:left}
      :where(.${prefix}[data-mobile=true]){flex-direction:column;gap:var(--nav-gap)}
      :where(.${prefix}[data-mobile=true] .f4-navigation){width:100%}
      :where(.${prefix}[data-mobile=true] .f4-panels){width:100%}
      :where(.${prefix}[data-mobile=true] .f4-panel){padding:20px}
      :where(.${prefix}[data-mobile=true][data-mobile-layout=tabs] .f4-navigation){flex-direction:row;flex-wrap:wrap}
      :where(.${prefix}[data-mobile=true][data-mobile-layout=tabs] .f4-tab){width:auto;flex:1 1 40%}
      /* Behavioral hiding must survive user display styles; not visual theming. */
      .${prefix} .f4-panel[hidden]{display:none!important}
    `}</style>
    <div className={'f4-navigation ' + (p.navigationClassName || '')}>
      {data.map((group, index) => {
        const isActive = index === active;
        return <React.Fragment key={group.id || group.key || index}>
          <button ref={el => { buttons.current[index] = el; }} id={`${prefix}-tab-${index}`}
            aria-expanded={isActive} aria-controls={`${prefix}-panel-${index}`} type="button"
            className={['f4-tab', p.tabClassName, isActive ? p.activeTabClassName : ''].filter(Boolean).join(' ')}
            onClick={() => select(index)} onKeyDown={e => {
              let next = index;
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (index + 1) % data.length;
              else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (index - 1 + data.length) % data.length;
              else if (e.key === 'Home') next = 0;
              else if (e.key === 'End') next = data.length - 1;
              else return;
              e.preventDefault(); select(next); buttons.current[next]?.focus();
            }}>
            {showNumbers && <span className={'f4-number ' + (p.numberClassName || '')}>{String(index + 1).padStart(2, '0')}</span>}
            {showIcons && group.icon?.url && <img className={'f4-icon ' + (p.numberClassName || '')} src={group.icon.url} alt={group.icon.alternativeText || ''} />}
            <span><span className={'f4-title ' + (p.titleClassName || '')}>{group.title}</span>
              {showDescriptions && group.description && <span className={'f4-description ' + (p.descriptionClassName || '')}>{group.description}</span>}</span>
            {showProgress && isActive && running && <motion.span key={`${active}-${restart}`} className={'f4-progress ' + (p.progressClassName || '')}
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: delay / 1000, ease: 'linear' }} />}
          </button>
          {accordion && panel(group, index)}
        </React.Fragment>;
      })}
    </div>
    {!accordion && <div className="f4-panels">{data.map(panel)}</div>}
  </div>;
}
export default Features4;
