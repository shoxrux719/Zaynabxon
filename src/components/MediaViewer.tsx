import { useLayoutEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react';
import type { MediaItem } from '../data/media';
import { interaction } from '../data/interaction';
import type { Lang } from '../data/interaction';

function MediaSlide({ item, lang, zoomed }: { item: MediaItem; lang: Lang; zoomed: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const c = interaction[lang];
  return <div className={`media-viewer-frame${zoomed ? ' is-zoomed' : ''}`}>
    {item.kind === 'video' ? <video key={item.id} src={item.src} poster={item.thumb} controls playsInline preload="metadata" aria-label={`${c.video}: ${item.brand}`} /> : <>
      {!loaded && !failed && <span className="media-loading" role="status"><LoaderCircle size={24} className="submit-spinner" /><span className="sr-only">{c.loading}</span></span>}
      {failed && <div className="media-load-error" role="alert"><p>{c.imageError}</p><button type="button" onClick={() => { setFailed(false); setRetry(value => value + 1); }}><RotateCcw size={17} />{c.retry}</button></div>}
      <img key={retry} src={item.src} alt={item.brand} style={{ width: zoomed ? Math.min(item.width, 1600) : undefined, visibility: loaded ? 'visible' : 'hidden' }} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
    </>}
  </div>;
}

export function MediaViewer({ items, initialIndex, lang, onClose }: { items: MediaItem[]; initialIndex: number; lang: Lang; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const c = interaction[lang];
  const item = items[index];
  const navigate = (direction: number) => { setZoomed(false); setIndex(current => (current + direction + items.length) % items.length); };

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialogRef} className="media-viewer" aria-label={c.open} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
    if ((event.target as HTMLElement).tagName === 'VIDEO') return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
  }}>
    <div className="media-viewer-top"><div><span>{item.brand}</span><small>{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</small></div><div>{item.kind === 'image' && <button type="button" onClick={() => setZoomed(value => !value)} aria-label={zoomed ? c.zoomOut : c.zoomIn} title={zoomed ? c.zoomOut : c.zoomIn}>{zoomed ? <ZoomOut size={21} /> : <ZoomIn size={21} />}</button>}<button type="button" onClick={onClose} aria-label={c.close}><X size={22} /></button></div></div>
    <MediaSlide key={item.id} item={item} lang={lang} zoomed={zoomed} />
    <div className="media-viewer-bottom"><button type="button" onClick={() => navigate(-1)} aria-label={c.previous}><ChevronLeft size={20} /><span>{c.previous}</span></button><span>{item.kind === 'video' ? c.video : item.category === 'education' ? c.logos : c.open}</span><button type="button" onClick={() => navigate(1)} aria-label={c.next}><span>{c.next}</span><ChevronRight size={20} /></button></div>
  </dialog>;
}
