import { createContext, lazy, Suspense, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight, Menu, Pause, Play, X, Plus } from 'lucide-react';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import { projects, type Project } from '@/data/projects';
import { whatsappUrl, whatsappLabel } from '@/data/contact';
import './new-site.css';

const StudioScene = lazy(() => import('./studio-scene'));
const MotionContext = createContext({ paused: false });
const ease = [0.22, 1, 0.36, 1] as const;
const services = [
  { key: 'sites', title: 'Sites', copy: 'Uma presença digital feita para transformar atenção em oportunidade.', inquiry: 'um site ou landing page' },
  { key: 'automation', title: 'Automação', copy: 'Menos tarefas repetidas. Mais tempo para o que faz seu negócio avançar.', inquiry: 'uma automação em Python' },
  { key: 'ai', title: 'IA', copy: 'Inteligência artificial conectada a um problema concreto do seu negócio.', inquiry: 'uma solução com inteligência artificial' },
] as const;

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  return <motion.div className={className} initial={reduced || paused ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced || paused ? 0 : 0.8, ease }}>{children}</motion.div>;
}
function Link({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const external = href.startsWith('https:');
  return <a className={`ns-link ${className}`} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}><span>{children}</span><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" /></a>;
}
function Stage({ chapter, service, className = '' }: { chapter: 'hero' | 'sandbox' | 'education' | 'systems' | 'contact'; service?: 'sites' | 'automation' | 'ai'; className?: string }) {
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.97, 1, 0.97]);
  return <motion.div ref={stageRef} className={`ns-stage ${className}`} style={reduced || paused || (chapter !== 'sandbox' && chapter !== 'education') ? undefined : { scale }} aria-hidden="true"><Suspense fallback={<div className="ns-stage-loading"><span /><span /><span /></div>}><StudioScene chapter={chapter} service={service} progress={reduced ? 0.5 : scrollYProgress} paused={paused || reduced} /></Suspense>{chapter === 'sandbox' && <img className="ns-sandbox-fallback" src="/images/sandbox.png" alt="" loading="lazy" />}</motion.div>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <header className="ns-header"><a href="#inicio" className="ns-logo" aria-label="Lucas, início">lucas<span>®</span></a><span className="ns-header-note">Desenvolvedor independente</span><nav id="studio-navigation" className={`ns-nav ${open ? 'ns-nav-open' : ''}`} aria-label="Navegação principal"><a href="#projetos" onClick={() => setOpen(false)}>Projetos <sup>02</sup></a><a href="#servicos" onClick={() => setOpen(false)}>Serviços</a><a href="#sobre" onClick={() => setOpen(false)}>Sobre</a><a href="#contato" onClick={() => setOpen(false)}>Contato <ArrowUpRight size={14} aria-hidden="true" /></a></nav><button ref={button} className="ns-menu" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-controls="studio-navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></header>;
}
function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  return <section id="inicio" ref={ref} className="ns-hero"><motion.div className="ns-hero-art" style={reduced || paused ? undefined : { y }}><Stage chapter="hero" /></motion.div><div className="ns-hero-index"><span>Design · Código · Possibilidades</span><span>Portfolio / 2026</span></div><div className="ns-hero-copy"><p className="ns-eyebrow">Lucas — sites, automação e IA</p><h1 aria-label="Seu próximo salto."><span className="ns-heading-mask"><motion.span initial={reduced || paused ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease }}>Seu próximo</motion.span></span><span className="ns-heading-mask"><motion.span initial={reduced || paused ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.12, ease }}>salto<span className="ns-orange">.</span></motion.span></span></h1><p className="ns-hero-description">Da sua ideia a uma experiência que faz diferença.</p><div className="ns-hero-actions"><Link href={whatsappUrl()} className="ns-link-primary">Começar um projeto</Link><a className="ns-explore" href="#projetos">Explorar projetos <ArrowDown size={15} aria-hidden="true" /></a></div></div><div className="ns-hero-footer"><span className="ns-desktop-hint">Mova o cursor. Role para explorar.</span><span className="ns-mobile-hint">Role para explorar.</span><a href="#projetos" aria-label="Ir aos projetos selecionados"><ArrowDown size={20} aria-hidden="true" /></a></div></section>;
}
function ProjectChapter({ project, chapter }: { project: Project; chapter: 'sandbox' | 'education' }) {
  return <article id={chapter === 'sandbox' ? 'sobre-sandbox' : 'sobre-educacional'} data-project={project.id} className={`studio-project ns-project ns-project-${chapter}`}><div className="ns-project-heading ns-wrap"><Reveal><p className="ns-eyebrow">{project.number} / {project.category}</p><h3>{project.name}</h3></Reveal><Reveal className="ns-project-value"><p>{chapter === 'sandbox' ? 'Decisões do dia a dia. Consequências que você pode explorar.' : 'Jogos e um tutor de IA para transformar estudo em descoberta.'}</p><Link href={whatsappUrl(`um projeto inspirado no ${project.name}`)}>Criar algo assim</Link></Reveal></div><figure className="ns-project-figure"><Stage chapter={chapter} /><figcaption><span>{chapter === 'sandbox' ? 'Captura real do SANDBOX em uma composição 3D.' : 'Representação visual conceitual em 3D. Original em Python / Tkinter.'}</span><span>{chapter === 'sandbox' ? 'Simulação financeira' : 'Quiz · Forca · Caça-palavras'}</span></figcaption></figure><div className="ns-project-bottom ns-wrap"><p className="ns-technologies">{project.technologies.join(' / ')}</p><details className="ns-details"><summary>Por dentro do projeto <Plus size={17} aria-hidden="true" /></summary><div className="ns-details-content"><p>{project.description}</p><div><h4>O desafio</h4><p>{project.problem}</p></div><div><h4>A solução</h4><p>{project.solution}</p></div></div></details></div></article>;
}
function Projects() {
  return <section id="projetos" className="ns-projects"><div className="ns-section-title ns-wrap"><p className="ns-eyebrow">01 / Trabalho selecionado</p><h2>Ideias em operação.</h2><span>Dois projetos reais.</span></div>{projects.map((project, index) => <ProjectChapter key={project.id} project={project} chapter={index === 0 ? 'sandbox' : 'education'} />)}</section>;
}
function Services() {
  const [active, setActive] = useState(0);
  const current = services[active];
  return <section id="servicos" className="ns-services"><div className="ns-section-title ns-wrap"><p className="ns-eyebrow">02 / O que posso criar</p><h2>O próximo movimento.</h2></div><div className="ns-service-composition"><Stage chapter="systems" service={current.key} /><div className="ns-service-panel"><div className="ns-service-options" role="group" aria-label="Escolha um serviço">{services.map((service, index) => <button type="button" key={service.key} aria-label={service.title} aria-pressed={index === active} onClick={() => setActive(index)}><span>0{index + 1}</span>{service.title}<ArrowUpRight size={19} aria-hidden="true" /></button>)}</div><div className="ns-service-description" aria-live="polite"><p>{current.copy}</p><Link href={whatsappUrl(current.inquiry)}>Conversar sobre {current.title === 'IA' ? 'IA' : current.title.toLowerCase()}</Link></div></div><span className="ns-service-caption">Sistemas que se conectam. Possibilidades que se abrem.</span></div></section>;
}
function About() {
  return <section id="sobre" className="ns-about ns-wrap"><p className="ns-eyebrow">03 / Lucas — criação independente</p><Reveal className="ns-about-copy"><h2>Você fala com quem cria.</h2><div><p>Sites, automação e IA, da primeira conversa à entrega.</p><Link href={whatsappUrl()}>Conhecer sua ideia</Link></div></Reveal></section>;
}
function Contact() {
  return <section id="contato" className="ns-contact"><Stage chapter="contact" /><div className="ns-contact-copy"><p className="ns-eyebrow">04 / Próximo capítulo</p><h2>Vamos dar<br />forma à sua ideia<span className="ns-orange">.</span></h2><Link className="ns-link-primary" href={whatsappUrl()}>Falar com Lucas no WhatsApp</Link><span className="ns-contact-number">{whatsappLabel}</span></div><span className="ns-contact-caption">Uma conversa é o primeiro movimento.</span></section>;
}
export default function NewSite() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const label = reduced ? 'Movimento reduzido' : paused ? 'Reproduzir animações' : 'Pausar animações';
  return <MotionContext.Provider value={{ paused }}><div className={`studio-site ns-site ${paused || reduced ? 'ns-motion-paused' : ''}`}><a className="ns-skip" href="#conteudo">Pular para o conteúdo</a><Header /><main id="conteudo"><Hero /><Projects /><Services /><About /><Contact /></main><footer className="ns-footer"><a className="ns-logo" href="#inicio">lucas<span>®</span></a><span>© {new Date().getFullYear()} Lucas Dev Studio</span><div><a href="https://github.com/lucas-dev-studio" target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={14} aria-hidden="true" /></a><a href="mailto:contato.lucadevstudio@gmail.com">E-mail <ArrowUpRight size={14} aria-hidden="true" /></a></div><a href="#inicio">Voltar ao início ↑</a></footer><button className="ns-motion-toggle" type="button" disabled={reduced} aria-label={label} onClick={() => setPaused(!paused)}>{paused || reduced ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{label}</span></button></div></MotionContext.Provider>;
}
