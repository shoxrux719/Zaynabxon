import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, Check, Pause, Play } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { designMedia, logosMedia, resultsMedia } from '../data/media';
import { interaction } from '../data/interaction';
import type { Lang } from '../data/interaction';
import { reelsMedia } from '../data/reels';
import { MediaViewer } from './MediaViewer';

export function WorkGallery({ lang }: { lang: Lang }) {
  const [active, setActive] = useState<'results' | 'design' | 'reels'>('results');
  const [counts, setCounts] = useState({ results: 4, design: 3, reels: 3 });
  const [preview, setPreview] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();
  const c = interaction[lang];
  const items = active === 'results' ? resultsMedia : active === 'design' ? designMedia : [...reelsMedia, ...resultsMedia.filter(item => item.kind === 'video')];
  const count = Math.min(counts[active], items.length);
  const batchSize = active === 'results' ? 4 : 3;
  const remaining = Math.min(batchSize, items.length - count);

  return <>
    <div className="work-intro"><h3 className="section-heading">{c.title}<em className="handwritten">{c.accent}</em></h3><p className="section-description">{c.lead}</p></div>
    <div className="work-filter" role="group" aria-label={`${c.results} / ${c.design}`}>
      {(['results', 'design', 'reels'] as const).map(key => <button key={key} type="button" aria-pressed={key === active} onClick={() => setActive(key)} className={key === active ? 'active' : ''}>{key === 'reels' ? 'Reels' : c[key]}<span>{key === 'results' ? resultsMedia.length : key === 'design' ? designMedia.length : reelsMedia.length + 1}</span></button>)}
    </div>
    <div className={`work-grid work-grid--${active}`} key={active}>
      {items.slice(0, count).map((item, index) => <motion.button type="button" key={item.id} className="work-card" aria-label={`${c.open}: ${item.brand}, ${index + 1}`} onClick={() => setPreview(index)} initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.03 }} transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : index % batchSize * 0.055 }}>
        <span className="work-card-preview"><img src={item.thumb} alt={item.brand} loading="lazy" decoding="async" width={item.width} height={item.height} /><span className="work-card-number">{String(index + 1).padStart(2, '0')}</span>{item.kind === 'video' ? <span className="work-card-play"><Play size={25} fill="currentColor" /></span> : <span className="work-card-open"><ArrowUpRight size={23} /></span>}</span>
        <span className="work-card-caption"><strong>{item.brand}</strong><small>{item.kind === 'video' ? c.video : active === 'design' ? c.graphic : c.image}</small></span>
      </motion.button>)}
    </div>
    <div className="work-more"><div className="work-count" aria-live="polite"><span>{c.shown} <strong>{count}</strong> {c.of} {items.length}</span><span className="work-count-track" aria-hidden="true"><span style={{ width: `${count / items.length * 100}%` }} /></span></div>{remaining > 0 ? <button type="button" className="button-outline" onClick={() => setCounts(current => ({ ...current, [active]: Math.min(current[active] + batchSize, items.length) }))}>{c.more}<span>+{remaining}</span><ArrowDown size={17} /></button> : <p className="work-complete"><Check size={17} />{c.allShown}</p>}</div>
    {preview !== null && <MediaViewer items={items} initialIndex={preview} lang={lang} onClose={() => setPreview(null)} />}
  </>;
}

export function LogoRibbon({ lang }: { lang: Lang }) {
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const c = interaction[lang];
  return <section className="logo-section" aria-label={c.logos}>
    <div className="logo-section-header"><button type="button" className="text-link" onClick={() => setOpen(true)}>{c.logos}<ArrowUpRight size={16} /></button>{!reducedMotion && <button type="button" className="ribbon-pause" aria-label={paused ? c.resume : c.pause} title={paused ? c.resume : c.pause} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}</div>
    <div className={`logo-ribbon${paused ? ' is-paused' : ''}`} aria-hidden="true"><div className="logo-track">{[0, 1].map(copy => <div className="logo-group" key={copy}>{logosMedia.map((logo, index) => <div className="brand-card" key={logo.id} style={{ '--brand-tilt': `${index % 2 ? 3 : -3}deg` } as CSSProperties}><img src={logo.thumb} alt="" loading="lazy" decoding="async" width="280" height="280" /><span>{logo.brand}</span></div>)}</div>)}</div></div>
    {open && <MediaViewer items={logosMedia} initialIndex={0} lang={lang} onClose={() => setOpen(false)} />}
  </section>;
}
