"use client";
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, MotionConfig, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Plus,
  Minus,
  Code2,
  Workflow,
  BrainCircuit,
  Pause,
  Play,
  MessageCircle,
  Check,
  Asterisk,
} from "lucide-react";
import Timeline from "@/components/ui/timeline";
import { projects } from "@/data/projects";
import { whatsappUrl, whatsappLabel } from "@/data/contact";
import "./studio.css";
import "./studio-motion.css";
import "./cinematic.css";
import { useStudioMotion } from "./use-studio-motion";
import { SculpturePanel } from "./sculpture-panel";
import { MotionStory } from "./motion-story";

const Sculpture = lazy(() => import("@/components/digital-sculpture"));
const services = [
  {
    id: "sites",
    number: "01",
    icon: Code2,
    title: "Sites que fazem presença.",
    subtitle: "DESIGN + DESENVOLVIMENTO",
    text: "Uma presença digital à altura do seu trabalho. Sites e landing pages com identidade, navegação clara e uma experiência que funciona do celular ao desktop.",
    deliverables: [
      "Sites institucionais e portfólios",
      "Landing pages para serviços e produtos",
      "Interfaces responsivas e animações",
    ],
    message: "um site ou landing page",
  },
  {
    id: "automacao",
    number: "02",
    icon: Workflow,
    title: "Menos tarefas. Mais tempo.",
    subtitle: "PYTHON + AUTOMAÇÃO",
    text: "Transforme processos repetitivos em fluxos mais simples. Desenvolvo scripts e ferramentas sob medida para organizar dados e conectar etapas do seu trabalho.",
    deliverables: [
      "Scripts e ferramentas em Python",
      "Organização e processamento de dados",
      "Integração entre sistemas e APIs",
    ],
    message: "uma automação em Python",
  },
  {
    id: "ia",
    number: "03",
    icon: BrainCircuit,
    title: "Inteligência que faz sentido.",
    subtitle: "IA APLICADA AO SEU NEGÓCIO",
    text: "IA integrada a uma necessidade real. Assistentes, chatbots e recursos inteligentes para apoiar seus usuários e os processos do seu negócio.",
    deliverables: [
      "Assistentes e chatbots personalizados",
      "Integração com modelos de IA",
      "Recursos inteligentes em aplicações",
    ],
    message: "uma solução com inteligência artificial",
  },
];
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`reveal-group ${className}`}>{children}</div>;
}
function ContactLink({
  children = "Vamos conversar",
  service,
  className = "",
}: {
  children?: ReactNode;
  service?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.a
      className={`studio-cta ${className}`}
      href={whatsappUrl(service)}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={reduced ? undefined : { y: -4, scale: 1.025 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
    >
      {children}
      <ArrowUpRight size={19} aria-hidden="true" />
    </motion.a>
  );
}
function Hero() {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  return (
    <section className="hero-sequence" id="inicio" ref={hero}>
      <div className="studio-hero">
        <div className="hero-kicker">
          <span>
            <i /> DESENVOLVIMENTO INDEPENDENTE
          </span>
          <span>SITES · AUTOMAÇÕES · INTELIGÊNCIA ARTIFICIAL</span>
        </div>
        <div className="hero-statement">
          <h1>
            SEU PRÓXIMO
            <br />
            <span>GRANDE PROJETO.</span>
          </h1>
          <p>
            Você traz a ideia. <br />
            Eu transformo em uma <br />
            <strong>experiência digital.</strong>
          </p>
        </div>
        <div className="digital-stage">
          <span className="stage-ambient" aria-hidden="true" />
          <span className="stage-watermark" aria-hidden="true">
            BEYOND.
          </span>
          <motion.div
            className="sculpture-layer"
            style={{ y: reduced ? 0 : y }}
          >
            <div className="sculpture-entrance">
              <Suspense
                fallback={
                  <div className="sculpture-fallback">
                    <span />
                    <span />
                  </div>
                }
              >
                <Sculpture paused={Boolean(reduced) || paused} />
              </Suspense>
            </div>
          </motion.div>
          <div className="stage-tag tag-left">
            <span className="tag-icon">
              <Code2 size={20} />
            </span>
            <div>
              DESIGN QUE ATRAI.
              <br />
              <strong>CÓDIGO QUE ENTREGA.</strong>
            </div>
          </div>
          <div className="stage-tag tag-right">
            <span className="tag-dot" />
            <span>
              DA SUA IDEIA
              <br />
              <strong>PARA O MUNDO.</strong>
            </span>
            <ArrowUpRight size={25} />
          </div>
          <div className="stage-note">
            <span className="stage-cross">+</span> CRIATIVIDADE EM TODAS AS
            DIMENSÕES
          </div>
          <button
            type="button"
            className="motion-toggle"
            onClick={() => setPaused(!paused)}
            disabled={Boolean(reduced)}
            aria-label={
              reduced
                ? "Animação desativada pela preferência de movimento reduzido"
                : paused
                  ? "Reproduzir animação 3D"
                  : "Pausar animação 3D"
            }
          >
            {paused || reduced ? <Play size={13} /> : <Pause size={13} />}
            <span>
              {reduced
                ? "MOVIMENTO REDUZIDO"
                : paused
                  ? "REPRODUZIR 3D"
                  : "PAUSAR 3D"}
            </span>
          </button>
        </div>
        <div className="hero-conversion">
          <p>
            Sites, automações e soluções com IA.
            <br />
            <span>Feitos para o que o seu negócio precisa.</span>
          </p>
          <div>
            <ContactLink>Começar meu projeto</ContactLink>
            <a className="studio-text-link" href="#projetos">
              Explorar projetos <ArrowDown size={15} />
            </a>
          </div>
        </div>
        <div className="hero-scroll-label">
          <span>LUCA / DESENVOLVIMENTO & IA</span>
          <span>
            ROLE PARA DESCOBRIR <ArrowDown size={12} />
          </span>
          <span>CRIADO PARA IR ALÉM.</span>
        </div>
        <div className="hero-second-scene" aria-hidden="true">
          <span>DESIGN + CÓDIGO + INTENÇÃO</span>
          <p>
            DO IMAGINADO.
            <br />
            <em>AO INESPERADO.</em>
          </p>
          <small>Uma presença digital impossível de ignorar.</small>
        </div>
        <span className="hero-scene-index" aria-hidden="true">
          01 — 02 / CONTINUE EXPLORANDO
        </span>
      </div>
    </section>
  );
}
function Services() {
  const [selected, setSelected] = useState("sites");
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [selected]);
  return (
    <section className="studio-services" id="servicos">
      <Reveal className="services-intro">
        <p className="studio-label">
          <span>01 /</span> O QUE POSSO CRIAR PARA VOCÊ
        </p>
        <h2>
          TECNOLOGIA.
          <br />
          <span>COM INTENÇÃO.</span>
        </h2>
        <p>
          Do primeiro contato com a sua marca ao processo que acontece nos
          bastidores. Vamos construir a solução certa.
        </p>
      </Reveal>
      <SculpturePanel
        variant="core"
        label="PEÇAS QUE CONSTROEM SISTEMAS"
        className="service-sculpture"
      />
      <div className="service-list">
        {services.map((service) => {
          const open = selected === service.id;
          const Icon = service.icon;
          return (
            <div
              className={`service-item ${open ? "is-open" : ""}`}
              key={service.id}
            >
              <h3>
                <button
                  className="service-trigger"
                  type="button"
                  aria-expanded={open}
                  aria-controls={`painel-${service.id}`}
                  onClick={() => setSelected(open ? "" : service.id)}
                >
                  <span className="service-number">{service.number}</span>
                  <span>{service.title}</span>
                  {open ? <Minus size={22} /> : <Plus size={22} />}
                </button>
              </h3>
              <div
                id={`painel-${service.id}`}
                hidden={!open}
                className="service-content"
              >
                <div className="service-art" aria-hidden="true">
                  <div className="service-art-ring" />
                  <Icon strokeWidth={1} />
                </div>
                <div>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <p>{service.text}</p>
                  <ul>
                    {service.deliverables.map((item) => (
                      <li key={item}>
                        <Check size={13} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    className="service-contact"
                    href={whatsappUrl(service.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Conversar sobre este serviço{" "}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default function TimelineDemo() {
  const root = useRef<HTMLDivElement>(null);
  useStudioMotion(root);
  return (
    <MotionConfig reducedMotion="user">
      <div className="studio-shell" ref={root}>
        <div className="page-progress" aria-hidden="true" />
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <header className="studio-header">
          <a className="studio-logo" href="#inicio" aria-label="Lucas, início">
            lucas
            <Asterisk size={22} aria-hidden="true" />
          </a>
          <nav aria-label="Navegação principal">
            <a href="#servicos">Serviços</a>
            <a href="#projetos">
              Projetos <sup>02</sup>
            </a>
            <a href="#sobre">Sobre</a>
          </nav>
          <a
            className="header-contact"
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Vamos conversar <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </header>
        <main id="conteudo">
          <Hero />
          <div className="studio-ribbon" aria-hidden="true">
            <span>IDEIA.</span>
            <Asterisk />
            <span>CÓDIGO.</span>
            <Asterisk />
            <span>IMPACTO.</span>
            <Asterisk />
            <span>IDEIA.</span>
            <Asterisk />
            <span>CÓDIGO.</span>
            <Asterisk />
          </div>
          <Services />
          <MotionStory />
          <Timeline
            title="PROJETOS EM DESTAQUE."
            periodLabel="02 PROJETOS AUTORAIS"
          />
          <section className="studio-cases" aria-label="Detalhes dos projetos">
            {projects.map((project) => (
              <article
                key={project.id}
                id={`sobre-${project.id}`}
                className="studio-case"
              >
                <Reveal>
                  <p className="studio-label">
                    <span>{project.number} /</span> {project.name.toUpperCase()}
                  </p>
                  <div className="case-title">
                    <h2>{project.title}</h2>
                    <ArrowUpRight aria-hidden="true" />
                  </div>
                  <p className="case-intro">{project.solution}</p>
                  <div className="case-features">
                    {project.features.map((feature, i) => (
                      <div key={feature.title}>
                        <span>0{i + 1}</span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                  <a
                    className="studio-text-link"
                    href={whatsappUrl(
                      `um projeto inspirado no ${project.name}`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Quero criar algo com você <ArrowUpRight size={17} />
                  </a>
                </Reveal>
              </article>
            ))}
          </section>
          <section className="studio-about" id="sobre">
            <Reveal className="about-art">
              <span className="about-art-corner">
                DESENVOLVEDOR INDEPENDENTE
              </span>
              <SculpturePanel
                variant="helix"
                label="CONEXÕES QUE CONSTROEM"
                className="about-sculpture"
              />
              <span className="about-art-bottom">
                <span>LUCA</span>
                <span>SOFTWARE + IA</span>
              </span>
            </Reveal>
            <Reveal className="studio-about-copy">
              <p className="studio-label">
                <span>03 /</span> QUEM VAI CONSTRUIR COM VOCÊ
              </p>
              <h2>
                UMA PESSOA.
                <br />
                <span>MUITAS POSSIBILIDADES.</span>
              </h2>
              <p>
                Sou Lucas. Estudo Desenvolvimento de Sistemas na ETEC e conecto
                minha experiência com automação ao desenvolvimento de software e
                inteligência artificial.
              </p>
              <p>
                Gosto de entender o problema, construir uma solução e testar até
                fazer sentido para quem vai usar. Você conversa diretamente
                comigo, da primeira ideia aos próximos ajustes.
              </p>
              <ContactLink>Me conte sua ideia</ContactLink>
            </Reveal>
          </section>
          <section className="studio-process" id="processo">
            <Reveal>
              <p className="studio-label">
                <span>04 /</span> UM CAMINHO CLARO ATÉ A ENTREGA
              </p>
              <h2>
                DA CONVERSA
                <br />
                <span>AO CLIQUE.</span>
              </h2>
            </Reveal>
            <div className="process-line" aria-hidden="true">
              <span className="process-line-fill" />
            </div>
            <div className="studio-steps">
              {[
                {
                  n: "01",
                  title: "A gente conversa.",
                  text: "Você me conta o que precisa. Alinhamos objetivo, escopo, prazo e orçamento antes de começar.",
                },
                {
                  n: "02",
                  title: "A ideia ganha forma.",
                  text: "Desenvolvo a solução e compartilho a evolução para alinharmos os detalhes ao longo do projeto.",
                },
                {
                  n: "03",
                  title: "Hora de colocar no mundo.",
                  text: "Testamos os fluxos e preparamos a entrega, com as orientações para usar o que foi construído.",
                },
              ].map((item) => (
                <Reveal key={item.n}>
                  <span>{item.n}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </section>
          <section className="studio-faq" aria-labelledby="faq-title">
            <div>
              <p className="studio-label">ANTES DE COMEÇAR</p>
              <h2 id="faq-title">
                ALGUMA
                <br />
                DÚVIDA?
              </h2>
            </div>
            <div>
              {[
                {
                  q: "Quanto custa um projeto?",
                  a: "O orçamento depende do escopo, das funcionalidades e das integrações. Me conte sua ideia pelo WhatsApp para alinharmos uma proposta.",
                },
                {
                  q: "Preciso ter a ideia toda pronta?",
                  a: "Não. Podemos começar pelo problema que você quer resolver e definir juntos o que precisa ser construído.",
                },
                {
                  q: "Você trabalha com projetos personalizados?",
                  a: "Sim. Sites, automações em Python e aplicações com IA são desenvolvidos de acordo com os requisitos que combinarmos.",
                },
              ].map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <Plus size={18} aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="studio-contact" id="contato">
            <span className="contact-orbit" aria-hidden="true" />
            <SculpturePanel
              variant="bloom"
              label="A PRÓXIMA IDEIA É SUA"
              className="contact-sculpture"
            />
            <p className="studio-label">
              SUA IDEIA NÃO PRECISA FICAR SÓ NA IDEIA.
            </p>
            <Reveal>
              <h2>
                VAMOS FAZER
                <br />
                <span>ACONTECER?</span>
              </h2>
            </Reveal>
            <div className="contact-bottom">
              <p>
                Me conte o que você tem em mente.
                <br />O próximo passo começa com uma conversa.
              </p>
              <ContactLink className="contact-large">
                <MessageCircle size={20} aria-hidden="true" /> Falar no WhatsApp
              </ContactLink>
              <span>
                {whatsappLabel}
                <br />
                <small>CONTATO DIRETO COMIGO.</small>
              </span>
            </div>
          </section>
        </main>
        <footer className="studio-footer">
          <a href="#inicio" className="studio-logo">
            lucas
            <Asterisk size={20} aria-hidden="true" />
          </a>
          <p>
            DESENVOLVIMENTO INDEPENDENTE.
            <br />
            IDEIAS AMBICIOSAS SÃO BEM-VINDAS.
          </p>
          <a href="#inicio">
            Voltar ao topo <ArrowUp size={15} aria-hidden="true" />
          </a>
        </footer>
      </div>
    </MotionConfig>
  );
}
