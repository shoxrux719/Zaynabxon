import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Award, BarChart3, Clapperboard, FileText, Focus, Layers3, Mail, MapPin, Moon, MoveUpRight, Phone, Send, Sun, Users, X } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { EntranceTitle, entranceCopy } from './components/EntranceTitle';
import { content, profile } from './data/profile';
import { editorial } from './data/editorial';
import { ContactForm } from './components/ContactForm';
import { LogoRibbon, WorkGallery } from './components/WorkGallery';
import { interaction } from './data/interaction';
import { StoryStudio } from './components/StoryStudio';
import './App.css';
import './entrance.css';
import './work.css';

type Lang = keyof typeof content;
const certificate = '/assets/zaynabxon/space-academy.webp';
const deliverableIcons = [Clapperboard, FileText, Layers3, BarChart3];
const strategyIcons = [Users, Focus, Layers3];

function CertificateViewer({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const el = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      el?.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={dialog} className="certificate-viewer" aria-label={content[lang].certTitle} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button type="button" className="viewer-close" onClick={onClose} aria-label={editorial[lang].close}><X size={22} /></button>
    <img src={certificate} alt="Space Academy — Xusanova Zaynabxon — SMM Bootcamp, 2023" />
  </dialog>;
}

function App() {
  const reducedMotion = useReducedMotion();
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('zaynabxon-language');
    return stored === 'ru' || stored === 'en' ? stored : 'uz';
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('zaynabxon-theme') === 'dark' ? 'dark' : 'light');
  const [introActive, setIntroActive] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const completeIntro = useCallback(() => setIntroActive(false), []);
  const c = content[lang];
  const e = editorial[lang];
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const reveal = {
    initial: reducedMotion ? false : { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.08 },
    transition: { duration: reducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] as const },
  };

  useEffect(() => {
    localStorage.setItem('zaynabxon-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('zaynabxon-language', lang);
    document.documentElement.lang = lang;
    document.title = `${c.fullName} — SMM & Content Marketing`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', e.intro);
  }, [lang, c.fullName, e.intro]);

  return <div className={`portfolio-page ${theme === 'light' ? 'light-mode' : 'dark-mode'} ${introActive ? 'is-entering' : 'is-entry-ready'}`}>
    {introActive && <EntranceTitle lang={lang} onComplete={completeIntro} />}
    <motion.div className="reading-progress" style={{ scaleX: reducedMotion ? scrollYProgress : progress }} aria-hidden="true" />
    <a className="skip-link" href="#main-content">{e.explore}</a>
    <header className="site-header" id="top">
      <a className="site-wordmark" href="#top" aria-label={c.backToTop}>ZX<span>®</span></a>
      <nav aria-label={e.navigation}>
        <a href="#resume">{c.experienceTitle}</a><a href="#cases">{e.explore}</a><a href="#results">{interaction[lang].results}</a><a href="#certificates">{c.certTitle}</a>
      </nav>
      <a className="header-contact" href="#contact">{c.connectTitle}<ArrowUpRight size={17} /></a>
    </header>

    <main className="portfolio-layout" id="main-content">
      <div className="intro-toolbar">
        <span className="toolbar-note">{c.locationShort} <span>/</span> {c.portfolio} 2026</span>
        <div className="toolbar-controls">
          <div className="lang-switch" aria-label="Language">
            {(['uz', 'ru', 'en'] as Lang[]).map(language => <button type="button" key={language} aria-pressed={lang === language} className={lang === language ? 'active' : ''} onClick={() => setLang(language)}>{language.toUpperCase()}</button>)}
          </div>
          <button className="entrance-replay" type="button" onClick={() => setIntroActive(true)} aria-label={entranceCopy[lang].replay} title={entranceCopy[lang].replay}><Clapperboard size={18} /></button>
          <button type="button" className="theme-btn" onClick={() => setTheme(current => current === 'light' ? 'dark' : 'light')} aria-label={theme === 'dark' ? c.light : c.dark} title={theme === 'dark' ? c.light : c.dark}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
      </div>

      <section className="hero-grid" aria-label={c.portfolio}>
        <motion.div {...reveal} className="portrait-card">
          <img src="/assets/zaynabxon/portrait.webp" alt={c.fullName} fetchPriority="high" width="1024" height="1090" />
          <div className="portrait-caption"><span className="portrait-label">{e.role}</span><h1>{c.lastName}<span>{c.firstName}</span></h1></div>
        </motion.div>
        <article className="hero-panel">
          <div className="eyebrow"><span className="status-dot" /> SMM / CONTENT / MARKETING</div>
          <h2 className="hero-title"><span>{e.hero}</span><em className="handwritten">{e.accent}</em></h2>
          <p className="hero-description">{e.intro}</p>
          <div className="hero-actions"><a className="button-primary" href="#contact-form">{e.discuss}<ArrowUpRight size={20} /></a><a className="text-link" href="#cases">{e.explore}<ArrowDown size={16} /></a></div>
          <div className="stats-strip">{[3, 23, 6].map((value, index) => <div className="stat-card" key={value}><strong>{value.toString().padStart(2, '0')}</strong><span>{c.stats[index]}</span></div>)}</div>
          <a className="hero-scroll" href="#resume"><ArrowDown size={15} />{e.scroll}</a>
        </article>
      </section>

      <motion.section {...reveal} className="profile-details" aria-label={e.details}>
        <div className="profile-contacts"><span className="eyebrow">{c.contactsTitle}</span><a href={profile.phoneHref}><Phone size={16} />{profile.phone}</a><a href={`mailto:${profile.email}`}><Mail size={16} />{profile.email}</a><span><MapPin size={16} />{c.contactCity}</span></div>
        <div className="profile-skills"><span className="eyebrow">{c.skillsTitle}</span><ul>{c.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>
      </motion.section>

      <LogoRibbon lang={lang} />

      <div className="street-ticker" aria-hidden="true"><div className="street-ticker-track">{[0, 1, 2, 3].map(index => <span key={index}>Strategy <em>Content</em> Copywriting <em>Stories</em> Analytics <MoveUpRight size={28} /></span>)}</div></div>

      <motion.article {...reveal} id="resume" className="section-block resume-panel">
        <div className="section-topline"><span>01 / BACKGROUND</span><span>{c.resumeTitle}</span></div>
        <div className="resume-grid"><div><h3 className="section-heading">{e.backgroundLead}<em className="handwritten">{e.backgroundAccent}</em></h3><p className="section-description">{e.backgroundText}</p><div className="experience-note"><span>03</span><p>{c.stats[0]}<small>{e.role}</small></p></div></div>
          <div className="course-list"><p className="eyebrow">{c.coursesTitle}</p>{c.courses.map((course, index) => { const [title, school] = course.split(' — '); return <div className="course-row" key={course}><span className="course-number">0{index + 1}</span><div><h4>{title}</h4><p>{school}</p></div><Award size={22} /></div>; })}</div>
        </div>
      </motion.article>

      <motion.article {...reveal} id="cases" className="section-block cases-panel">
        <div className="section-topline"><span>02 / PROCESS</span><span>{c.casesHeading}</span></div>
        <div className="section-intro"><h3 className="section-heading">{e.workflowLead}<em className="handwritten">{e.workflowAccent}</em></h3><p className="section-description">{e.workflowText}</p></div>
        <h4 className="eyebrow deliverables-label">{c.smmTitle}</h4>
        <div className="deliverables-grid">{c.smmNames.map((name, index) => { const Icon = deliverableIcons[index]; return <motion.div {...reveal} transition={{ ...reveal.transition, delay: reducedMotion ? 0 : index * 0.06 }} className="deliverable-card" key={name}><div className="deliverable-top"><Icon size={26} strokeWidth={1.3} /><span>0{index + 1}</span></div><h5>{name}</h5><p>{c.smmResults[index]}</p></motion.div>; })}</div>
        <div className="strategy-header"><h4>{c.targetTitle}</h4><span className="handwritten">{e.strategyLabel}</span></div>
        <div className="strategy-grid">{c.targetNames.map((name, index) => { const Icon = strategyIcons[index]; return <div className="strategy-card" key={name}><Icon size={20} strokeWidth={1.4} /><h5>{name}</h5><p>{c.targetResults[index]}</p></div>; })}</div>
      </motion.article>

      <motion.article {...reveal} id="results" className="section-block results-panel">
        <div className="section-topline"><span>03 / RESULTS</span><span>{c.resultsTitle}</span></div>
        <WorkGallery lang={lang} />
      </motion.article>

      <motion.article {...reveal} id="certificates" className="section-block certificates-panel">
        <div className="section-topline"><span>04 / EDUCATION</span><span>{c.certTitle}</span></div>
        <div className="certificate-layout"><div className="certificate-copy"><Award size={28} strokeWidth={1.2} /><h3 className="section-heading">Space <br />Academy</h3><span className="certificate-year">SMM BOOTCAMP / 2023</span><p className="handwritten">{e.educationAccent}</p><button className="text-link" type="button" onClick={() => setCertificateOpen(true)}>{e.certificateHint}<ArrowUpRight size={19} /></button></div><button type="button" className="certificate-card" aria-label={`${c.certTitle}: Space Academy`} onClick={() => setCertificateOpen(true)}><img src={certificate} alt="Space Academy — Xusanova Zaynabxon — SMM Bootcamp, 2023" loading="lazy" width="1800" height="1350" /><span className="certificate-zoom"><ArrowUpRight size={24} /></span></button></div>
      </motion.article>

      <motion.article {...reveal} id="stories" className="section-block story-panel">
        <div className="section-topline"><span>05 / CONTENT & STORIES</span><span>{c.storyTitle}</span></div>
        <StoryStudio lang={lang} />
      </motion.article>

      <motion.article {...reveal} id="contact" className="section-block contact-panel">
        <div className="section-topline"><span>06 / LET’S TALK</span><span>{c.connectTitle}</span></div>
        <h3 className="contact-heading">{e.contactLead}<em className="handwritten">{e.contactAccent}</em></h3>
        <div className="contact-bottom"><div><p className="contact-description">{e.contactText}</p><a className="button-primary" href={profile.telegram} target="_blank" rel="noreferrer"><Send size={17} />{profile.telegramUsername}<ArrowUpRight size={20} /></a></div><div className="contact-links"><a href={profile.phoneHref}>{profile.phone}<ArrowUpRight size={18} /></a><a href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={18} /></a><p><MapPin size={15} />{c.contactCity}</p></div></div>
        <ContactForm lang={lang} />
      </motion.article>
    </main>
    <footer className="site-footer"><a className="site-wordmark" href="#top">ZX<span>®</span></a><span>{c.fullName} / {e.footer}</span><a href="#top">{e.back}<ArrowUpRight size={16} /></a></footer>
    <nav className="mobile-dock" aria-label={e.navigation}><a href="#top" aria-label={c.backToTop}>ZX</a><a href="#cases"><Layers3 size={17} /><span>{c.dockCases}</span></a><a href="#results"><BarChart3 size={17} /><span>{interaction[lang].results}</span></a><a href="#certificates"><Award size={17} /><span>{c.dockResults}</span></a><a href="#contact-form"><Send size={17} /><span>{c.dockContact}</span></a></nav>
    {certificateOpen && <CertificateViewer lang={lang} onClose={() => setCertificateOpen(false)} />}
  </div>;
}

export default App;
