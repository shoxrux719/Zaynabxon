import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { designMedia } from '../data/media';
import { content } from '../data/profile';
import { editorial } from '../data/editorial';
import { interaction } from '../data/interaction';
import type { Lang } from '../data/interaction';
import { MediaViewer } from './MediaViewer';

export function StoryStudio({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const c = content[lang];
  const e = editorial[lang];
  const ui = interaction[lang];
  return <>
    <div className="story-studio-layout">
      <div className="story-studio-copy">
        <h3 className="section-heading story-studio-title">{e.storyLead}<em className="handwritten">{e.storyAccent}</em></h3>
        <p className="section-description">{c.storyDescription}</p>
        <ol className="story-studio-steps">{c.storyFeatures.map((feature, index) => <li key={feature}><span>0{index + 1}</span><p>{feature}</p></li>)}</ol>
      </div>
      <div className="story-studio-work">
        <button type="button" className="story-preview" aria-label={`${ui.open}: ${ui.design}`} onClick={() => setOpen(true)}>
          <img className="story-preview-back" src={designMedia[0].thumb} alt="" loading="lazy" width="560" height="700" />
          <img className="story-preview-front" src={designMedia[1].thumb} alt="" loading="lazy" width="560" height="700" />
          <span className="story-preview-cta">{ui.design}<ArrowUpRight size={19} /></span>
        </button>
        <p className="story-preview-caption">RIYAPLAY <span>/</span> CONTENT SERIES</p>
      </div>
    </div>
    {open && <MediaViewer items={designMedia} initialIndex={0} lang={lang} onClose={() => setOpen(false)} />}
  </>;
}
