import { createContext, lazy, Suspense, useContext, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  BrainCircuit,
  Check,
  Code2,
  ExternalLink,
  Menu,
  Pause,
  Play,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { projects } from "@/data/projects";
import { whatsappLabel, whatsappUrl } from "@/data/contact";
import "./new-site.css";

const Sculpture = lazy(() => import("./digital-sculpture"));
const KineticWorld = lazy(() => import("./kinetic-world"));
const MotionContext = createContext({ paused: false, toggle: () => {} });

const easing = [0.22, 1, 0.36, 1] as const;

const capabilities = [
  {
    number: "01",
    icon: Code2,
    label: "DESIGN & DESENVOLVIMENTO",
    title: "Sites em outra dimensão.",
    body: "Presença digital para ser lembrada.",
    tags: ["Sites institucionais", "Landing pages", "Experiências interativas"],
    visual: "sites",
    contact: "um site ou landing page",
  },
  {
    number: "02",
    icon: Workflow,
    label: "PYTHON & INTEGRAÇÕES",
    title: "Automação em movimento.",
    body: "O trabalho repetitivo sai de cena.",
    tags: ["Automações", "Integrações", "Fluxos internos"],
    visual: "automation",
    contact: "uma automação em Python",
  },
  {
    number: "03",
    icon: BrainCircuit,
    label: "INTELIGÊNCIA ARTIFICIAL",
    title: "Inteligência que age.",
    body: "IA aplicada a um problema real.",
    tags: ["Assistentes", "Recursos com IA", "Produtos digitais"],
    visual: "ai",
    contact: "uma solução com inteligência artificial",
  },
] as const;

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduced ? 0 : 0.85, delay, ease: easing }}
    >
      {children}
    </motion.div>
  );
}

function ArrowLink({ children, href, light = false, className = "" }: { children: ReactNode; href: string; light?: boolean; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.a
      className={`ns-arrow-link ${light ? "ns-arrow-link-light" : ""} ${className}`}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      whileHover={reduced ? undefined : { y: -3 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
    >
      <span>{children}</span>
      <span className="ns-link-icon"><ArrowUpRight size={20} aria-hidden="true" /></span>
    </motion.a>
  );
}

function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 130, damping: 20 });
  const sy = useSpring(my, { stiffness: 130, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7]);
  return (
    <motion.div
      className={`ns-tilt ${className}`}
      style={reduced ? undefined : { rotateX, rotateY }}
      onPointerMove={(event) => {
        if (reduced || event.pointerType === "touch") return;
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left) / rect.width - 0.5);
        my.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
    >
      {children}
    </motion.div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="ns-header">
      <a className="ns-logo" href="#inicio" aria-label="Lucas, início">LUCAS<span>®</span><i /></a>
      <nav className={open ? "ns-nav ns-nav-open" : "ns-nav"} aria-label="Navegação principal">
        <a href="#projetos" onClick={() => setOpen(false)}>Projetos <span>02</span></a>
        <a href="#servicos" onClick={() => setOpen(false)}>O que faço</a>
        <a href="#sobre" onClick={() => setOpen(false)}>Sobre</a>
        <a className="ns-mobile-contact" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Vamos conversar <ArrowUpRight size={17} /></a>
      </nav>
      <a className="ns-header-cta" href={whatsappUrl()} target="_blank" rel="noopener noreferrer">Seu projeto começa aqui <ArrowUpRight size={16} /></a>
      <button type="button" className="ns-menu" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </header>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const { paused, toggle } = useContext(MotionContext);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 115]);
  return (
    <section id="inicio" className="ns-hero" ref={ref}>
      <div className="ns-hero-grid" aria-hidden="true" />
      <div className="ns-hero-top ns-wrap">
        <span><i className="ns-live-dot" /> DISPONÍVEL PARA NOVOS PROJETOS</span>
        <span>DESENVOLVIMENTO INDEPENDENTE · BRASIL</span>
      </div>
      <div className="ns-hero-main ns-wrap">
        <div className="ns-hero-copy">
          <motion.p className="ns-kicker" initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>LUCAS / DESIGN, CÓDIGO E VISÃO</motion.p>
          <h1 aria-label="Ideias que movem.">
            {["IDEIAS", "QUE", "MOVEM."].map((line, index) => (
              <span className="ns-title-line" key={line}>
                <motion.span initial={reduced ? false : { y: "115%" }} animate={{ y: 0 }} transition={{ duration: reduced ? 0 : 1.1, delay: index * 0.13 + 0.12, ease: easing }}>{line}</motion.span>
              </span>
            ))}
          </h1>
          <Reveal className="ns-hero-sub" delay={0.45}>
            <p>SITES · AUTOMAÇÃO · IA</p>
            <ArrowLink href={whatsappUrl()} light>Vamos construir o seu</ArrowLink>
          </Reveal>
        </div>
        <motion.div className="ns-hero-object" style={{ y: reduced ? 0 : y }} aria-label="Escultura digital tridimensional interativa">
          <div className="ns-object-halo" />
          <span className="ns-object-ghost" aria-hidden="true">L<span>.</span></span>
          <Suspense fallback={<div className="ns-object-fallback" aria-hidden="true" />}>
            <Sculpture paused={Boolean(reduced) || paused} />
          </Suspense>
          <span className="ns-object-caption"><Asterisk size={13} /> CRIATIVIDADE EM TODAS AS DIMENSÕES</span>
        </motion.div>
        <button type="button" className="ns-motion-toggle" onClick={toggle} disabled={Boolean(reduced)} aria-label={reduced ? "Animação desativada pela preferência de movimento reduzido" : paused ? "Reproduzir animação 3D" : "Pausar animação 3D"}>{paused || reduced ? <Play size={13} /> : <Pause size={13} />} <span>{reduced ? "MOVIMENTO REDUZIDO" : paused ? "REPRODUZIR MOTION" : "PAUSAR MOTION"}</span></button>
      </div>
      <div className="ns-hero-bottom ns-wrap">
        <span>01 — 05 / PORTFÓLIO DE LUCAS</span>
        <a href="#manifesto">ROLE PARA EXPLORAR <ArrowDown size={15} /></a>
        <span>EST. 2026</span>
      </div>
    </section>
  );
}

function Manifesto() {
  const [paused, setPaused] = useState(false);
  return (
    <section id="manifesto" className="ns-manifesto">
      <div className={`ns-marquee ${paused ? "ns-marquee-paused" : ""}`}><div aria-hidden="true">DESIGN COM INTENÇÃO <Asterisk /> CÓDIGO COM PROPÓSITO <Asterisk /> IDEIAS EM MOVIMENTO <Asterisk /> DESIGN COM INTENÇÃO <Asterisk /> CÓDIGO COM PROPÓSITO <Asterisk /></div><button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Reproduzir faixa animada" : "Pausar faixa animada"}>{paused ? <Play size={16} /> : <Pause size={16} />}</button></div>
      <div className="ns-wrap ns-manifesto-grid">
        <Reveal className="ns-section-marker"><span>01 / PONTO DE PARTIDA</span><i /></Reveal>
        <Reveal className="ns-manifesto-content">
          <h2>UMA IDEIA.<br /><em>UM MUNDO NOVO.</em></h2>
          <div className="ns-manifesto-bottom"><p>Da ideia à experiência.</p><a href="#projetos" aria-label="Ver projetos"><ArrowDown size={27} /></a></div>
        </Reveal>
        <div className="ns-manifesto-kinetic" aria-hidden="true"><span /><span /><span /><span /></div>
      </div>
    </section>
  );
}

function Services() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  return (
    <section id="servicos" className="ns-services">
      <div className="ns-wrap">
        <Reveal className="ns-section-head"><p className="ns-section-label">02 / O QUE POSSO CRIAR</p><h2>ESCOLHA UMA DIMENSÃO.</h2></Reveal>
        <div className="ns-services-grid">
          <div className="ns-service-list">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return <div className={`ns-service ${active === index ? "ns-service-active" : ""}`} key={item.number}>
                <button type="button" aria-expanded={active === index} onClick={() => setActive(index)}>
                  <span className="ns-service-num">{item.number}</span><span className="ns-service-title">{item.title}</span><Icon size={25} strokeWidth={1.4} aria-hidden="true" /><ArrowUpRight size={21} className="ns-service-arrow" aria-hidden="true" />
                </button>
              </div>;
            })}
          </div>
          <div className="ns-service-stage"><span className="ns-stage-label">{capabilities[active].label} / {capabilities[active].number}</span><Suspense fallback={null}><KineticWorld variant={capabilities[active].visual} paused={Boolean(reduced) || paused} /></Suspense><div className="ns-stage-footer"><p>{capabilities[active].body}</p><ArrowLink href={whatsappUrl(capabilities[active].contact)}>Conversar sobre isso</ArrowLink></div></div>
        </div>
      </div>
    </section>
  );
}

function EducationVisual() {
  return <div className="ns-education-ui" role="img" aria-label="Representação visual do Sistema Educacional com quiz, forca, caça-palavras e tutor de IA; o projeto original é uma aplicação desktop em Python.">
    <div className="ns-education-bar"><span>EDUCA<span>+</span></span><span>APRENDER PODE SER DIFERENTE</span><i /></div>
    <div className="ns-education-body"><span>SEU ESPAÇO DE DESCOBERTA</span><h4>Aprenda<br />jogando<span>.</span></h4><div className="ns-game-grid"><div><span>01</span><b>QUIZ</b><ArrowUpRight size={17} /></div><div><span>02</span><b>FORCA</b><ArrowUpRight size={17} /></div><div><span>03</span><b>CAÇA-PALAVRAS</b><ArrowUpRight size={17} /></div></div><div className="ns-tutor"><Sparkles size={18} /><span>UM TUTOR DE IA PARA CADA DESCOBERTA</span><span>↗</span></div></div>
  </div>;
}

function Projects() {
  const sandbox = projects[0];
  const education = projects[1];
  return <section id="projetos" className="ns-projects">
    <div className="ns-wrap"><Reveal className="ns-project-intro"><p className="ns-section-label">03 / TRABALHO SELECIONADO</p><h2>VEJA O QUE<br /><span>GANHOU VIDA.</span></h2><p>Dois projetos. Duas experiências.</p></Reveal></div>
    <article className="ns-project ns-project-sandbox" id="sobre-sandbox"><div className="ns-wrap ns-project-frame"><Reveal className="ns-project-info"><div className="ns-project-top"><span>01 / PROJETO REAL</span><span>SIMULAÇÃO + IA</span></div><div className="ns-project-title-row"><div><h3>SANDBOX<span>®</span></h3><p className="ns-project-lead">ESCOLHAS QUE MUDAM TUDO.</p></div><ArrowLink href={whatsappUrl("um projeto inspirado no SANDBOX")}>Quero criar algo assim</ArrowLink></div></Reveal><Reveal className="ns-project-showcase"><Tilt className="ns-sandbox-screen"><div className="ns-screen-bar"><span /><span /><span /><small>PROJETO REAL / SANDBOX</small></div><img src="/images/sandbox.png" alt="Captura real do SANDBOX: bairro ilustrado, saldo e controles da simulação financeira." width="1280" height="720" loading="lazy" /></Tilt><div className="ns-floating-stamp"><span>PROJETO<br />REAL</span><ExternalLink size={21} /></div><p className="ns-image-note">CAPTURA REAL DO PROJETO · INTERFACE INTERATIVA</p></Reveal><details className="ns-project-details"><summary>Conheça o projeto <ArrowDown size={17} /></summary><div><p>{sandbox.description}</p><div><span>O DESAFIO</span><p>{sandbox.problem}</p></div><div><span>A SOLUÇÃO</span><p>{sandbox.solution}</p></div><div className="ns-project-tags">{sandbox.technologies.map(item => <span key={item}>{item}</span>)}</div></div></details></div></article>
    <article className="ns-project ns-project-education" id="sobre-educacional"><div className="ns-wrap ns-project-frame"><Reveal className="ns-project-info"><div className="ns-project-top"><span>02 / PROJETO REAL</span><span>EDUCAÇÃO + IA</span></div><div className="ns-project-title-row"><div><h3>APRENDER<span>+</span></h3><p className="ns-project-lead">APRENDER VIROU JOGO.</p></div><ArrowLink href={whatsappUrl("um projeto inspirado no Sistema Educacional")}>Vamos fazer o seu projeto</ArrowLink></div></Reveal><Reveal className="ns-project-showcase"><Tilt className="ns-education-screen"><EducationVisual /></Tilt><p className="ns-image-note">REPRESENTAÇÃO VISUAL · APLICAÇÃO ORIGINAL EM TKINTER</p></Reveal><details className="ns-project-details"><summary>Conheça o projeto <ArrowDown size={17} /></summary><div><p>{education.description}</p><div><span>O DESAFIO</span><p>{education.problem}</p></div><div><span>A SOLUÇÃO</span><p>{education.solution}</p></div><div className="ns-project-tags">{education.technologies.map(item => <span key={item}>{item}</span>)}</div></div></details></div></article>
  </section>;
}

function About() {
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  return <section id="sobre" className="ns-about"><div className="ns-wrap ns-about-grid"><div className="ns-about-visual" aria-label="Monograma L tridimensional em movimento"><Suspense fallback={<span>L</span>}><KineticWorld variant="monolith" paused={Boolean(reduced) || paused} /></Suspense><i>IDEIA<br />→<br />IMPACTO</i></div><Reveal className="ns-about-copy"><p className="ns-section-label">04 / QUEM ESTÁ POR TRÁS</p><h2>OI, EU SOU<br /><em>LUCAS.</em></h2><p>Crio sites, automações e experiências com IA. Você fala direto comigo.</p><div className="ns-about-facts"><span><Check size={17} /> CONVERSA DIRETA</span><span><Check size={17} /> SOLUÇÃO SOB MEDIDA</span><span><Check size={17} /> DO CONCEITO À ENTREGA</span></div><a href="https://github.com/lucas-dev-studio" target="_blank" rel="noopener noreferrer" className="ns-inline-link">Meu GitHub <ArrowUpRight size={17} /></a></Reveal></div></section>;
}

function Process() {
  return <section className="ns-process"><div className="ns-wrap"><Reveal className="ns-process-header"><p className="ns-section-label">05 / COMO ACONTECE</p><h2>DA IDEIA<br /><span>AO IMPACTO.</span></h2></Reveal><div className="ns-process-grid">{[
    ["01", "Conversar."],
    ["02", "Criar."],
    ["03", "Lançar."],
  ].map(([num, title], index) => <Reveal className="ns-process-step" delay={index * 0.12} key={num}><span className="ns-process-num">{num}</span><div className="ns-process-line" /><h3>{title}</h3><span className="ns-process-orb" aria-hidden="true" /></Reveal>)}</div></div></section>;
}

function Contact() {
  const reduced = useReducedMotion();
  const { paused } = useContext(MotionContext);
  return <section id="contato" className="ns-contact"><div className="ns-wrap"><Reveal className="ns-contact-inner"><div className="ns-contact-top"><span><i className="ns-live-dot" /> AGENDA ABERTA PARA NOVAS IDEIAS</span><span>LUCAS / 2026</span></div><div className="ns-contact-world"><Suspense fallback={null}><KineticWorld variant="burst" paused={Boolean(reduced) || paused} /></Suspense></div><h2>AGORA É<br /><span>A SUA VEZ</span><span className="ns-contact-dot">.</span></h2><div className="ns-contact-bottom"><p>Uma conversa. O próximo projeto.</p><ArrowLink href={whatsappUrl()} light>Falar com Lucas no WhatsApp</ArrowLink></div></Reveal></div></section>;
}

export default function NewSite() {
  const [paused, setPaused] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <MotionContext.Provider value={{ paused, toggle: () => setPaused(value => !value) }}><div className={`ns-site ${paused ? "ns-motion-paused" : ""}`}><a className="ns-skip" href="#conteudo">Pular para o conteúdo</a><motion.div className="ns-progress" style={{ scaleX }} aria-hidden="true" /><Header /><main id="conteudo"><Hero /><Manifesto /><Services /><Projects /><About /><Process /><Contact /></main><footer className="ns-footer"><div className="ns-wrap"><a href="#inicio" className="ns-footer-logo">LUCAS<span>®</span></a><span>DESIGN. CÓDIGO. POSSIBILIDADE.</span><div><a href="https://github.com/lucas-dev-studio" target="_blank" rel="noopener noreferrer">GITHUB <ArrowUpRight size={14} /></a><a href={`mailto:contato.lucadevstudio@gmail.com`}>E-MAIL <ArrowUpRight size={14} /></a><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">{whatsappLabel} <ArrowUpRight size={14} /></a></div><span>© {new Date().getFullYear()} LUCAS DEV STUDIO</span></div></footer></div></MotionContext.Provider>;
}
