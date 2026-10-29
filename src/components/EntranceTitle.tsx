import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { content } from '../data/profile';

// App also uses these localized labels for the control that replays this dialog.
// eslint-disable-next-line react-refresh/only-export-components
export const entranceCopy = {
  uz: { label: 'Portfolio taqdimoti', eyebrow: 'SMM / Kontent marketing', lead: 'Har bir brendning', accent: 'o‘z ovozi bor.', signal: ['Strategiya', 'Kontent', 'Xarakter'], skip: 'Portfolioga o‘tish', replay: 'Kirish titrini qayta ko‘rish', footer: 'Strategiya · Kontent · Xarakter', stage: 'Portfolio' },
  ru: { label: 'Вступление в портфолио', eyebrow: 'SMM / Контент-маркетинг', lead: 'У каждого бренда', accent: 'есть свой голос.', signal: ['Стратегия', 'Контент', 'Характер'], skip: 'Перейти к портфолио', replay: 'Посмотреть вступительный титр', footer: 'Стратегия · Контент · Характер', stage: 'Портфолио' },
  en: { label: 'Portfolio introduction', eyebrow: 'SMM / Content marketing', lead: 'Every brand has', accent: 'a voice of its own.', signal: ['Strategy', 'Content', 'Character'], skip: 'Explore the portfolio', replay: 'Replay the introduction', footer: 'Strategy · Content · Character', stage: 'Portfolio' },
} as const;

type EntrancePhase = 'signal' | 'name' | 'signature' | 'exit';

export function EntranceTitle({ lang, onComplete }: { lang: keyof typeof entranceCopy; onComplete: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const completedRef = useRef(false);
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState<EntrancePhase>(reducedMotion ? 'signature' : 'signal');
  const copy = entranceCopy[lang];
  const firstName = content[lang].lastName;
  const lastName = content[lang].firstName;

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    completedRef.current = false;
    let started = false;
    let timers: number[] = [];
    const start = () => {
      if (started || document.visibilityState === 'hidden') return;
      started = true;
      if (dialog && !dialog.open) dialog.showModal();
      skipRef.current?.focus({ preventScroll: true });
      document.body.style.overflow = 'hidden';
      timers = reducedMotion
        ? [window.setTimeout(complete, 1200)]
        : [
            window.setTimeout(() => setPhase('name'), 950),
            window.setTimeout(() => setPhase('signature'), 2550),
            window.setTimeout(() => setPhase('exit'), 3900),
            window.setTimeout(complete, 4600),
          ];
    };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => { if (event.matches) complete(); };
    motionQuery.addEventListener('change', handleMotionChange);
    document.addEventListener('visibilitychange', start);
    start();
    return () => {
      timers.forEach(timer => window.clearTimeout(timer));
      document.removeEventListener('visibilitychange', start);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (dialog?.open) dialog.close();
      if (started) {
        document.body.style.overflow = previousOverflow;
        if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
      }
    };
  }, [complete, reducedMotion]);

  return (
    <dialog
      ref={dialogRef}
      className={`entrance-dialog${phase === 'exit' ? ' is-exiting' : ''}`}
      data-phase={phase}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      aria-label={copy.label}
      onCancel={event => { event.preventDefault(); complete(); }}
    >
      <div className="entrance-curtains" aria-hidden="true">
        <span className="entrance-curtain curtain-top" />
        <span className="entrance-curtain curtain-bottom" />
      </div>
      <div className="entrance-atmosphere" aria-hidden="true">
        <span className="entrance-glow glow-one" />
        <span className="entrance-glow glow-two" />
        <span className="entrance-grid" />
        <span className="entrance-scanline" />
        <span className="entrance-noise" />
      </div>
      <div className="entrance-frame" aria-hidden="true">
        <span className="entrance-corner entrance-corner-tl" />
        <span className="entrance-corner entrance-corner-tr" />
        <span className="entrance-corner entrance-corner-bl" />
        <span className="entrance-corner entrance-corner-br" />
      </div>
      <div className="entrance-orbit" aria-hidden="true">
        <span className="entrance-ring ring-outer" />
        <span className="entrance-ring ring-inner" />
        <span className="entrance-crosshair" />
        <span className="entrance-orbit-point" />
      </div>
      <span className="entrance-mark" aria-hidden="true">ZX</span>
      <div className="entrance-top">
        <span className="entrance-brand">ZX <span>/ PORTFOLIO</span></span>
        <button ref={skipRef} className="entrance-skip" type="button" onClick={complete}>
          {copy.skip}<ArrowUpRight size={17} aria-hidden="true" />
        </button>
      </div>
      <div className="entrance-center">
        <div className="entrance-signal" aria-hidden="true">
          {copy.signal.map((word, index) => <span className="entrance-signal-word" data-index={index} key={index}>{word}</span>)}
        </div>
        <p className="entrance-eyebrow">{copy.eyebrow}</p>
        <h2 className="entrance-name" aria-label={`${firstName} ${lastName}`}>
          <span className="entrance-name-line" aria-hidden="true"><span>{firstName}</span></span>
          <span className="entrance-name-line" aria-hidden="true"><span>{lastName}</span></span>
        </h2>
        <p className="entrance-manifesto"><span>{copy.lead}</span><strong className="handwritten entrance-signature">{copy.accent}</strong></p>
      </div>
      <div className="entrance-bottom">
        <span className="entrance-footer-copy">{copy.footer}</span>
        <div className="entrance-progress" aria-hidden="true">
          <span className="entrance-progress-track"><span className="entrance-progress-fill" /></span>
          <span className="entrance-stage">{copy.stage}</span>
        </div>
        <span className="entrance-location">TASHKENT, UZ</span>
      </div>
    </dialog>
  );
}

