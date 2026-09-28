// Evolved from the user-supplied Hyperiux Vault timeline: https://vault.hyperiux.com
// Full-width project chapters replace the former horizontal pinned track.
"use client";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Asterisk, MoveUpRight } from "lucide-react";
import { ProjectPreview } from "@/components/project-preview";
import { projects as defaultProjects, type Project } from "@/data/projects";
import { whatsappUrl } from "@/data/contact";
import "./project-showcase.css";

gsap.registerPlugin(ScrollTrigger);
export type TimelineProps = {
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  duration?: number;
  scrollDuration?: number;
  projects?: Project[];
};
export default function Timeline({
  title = "PROJETOS EM DESTAQUE.",
  periodLabel = "02 PROJETOS AUTORAIS",
  textColor,
  mutedTextColor,
  activeColor,
  backgroundColor,
  duration = 0.8,
  scrollDuration,
  projects = defaultProjects,
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = gsap.matchMedia();
    media.add(
      "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
      () => {
        section
          .querySelectorAll<HTMLElement>(".work-chapter")
          .forEach((chapter) => {
            const shot = chapter.querySelector(".work-device");
            const word = chapter.querySelector(".work-backdrop");
            gsap.fromTo(
              shot,
              { y: 95, rotate: -10, rotateY: 24, rotateX: 8, scale: 0.72 },
              {
                y: -35,
                rotate: 0,
                rotateY: 0,
                rotateX: 0,
                scale: 1.035,
                ease: "none",
                scrollTrigger: {
                  trigger: chapter.parentElement,
                  start: "top bottom",
                  end: "bottom bottom",
                  scrub: Math.max(0.2, scrollDuration ?? duration),
                  invalidateOnRefresh: true,
                },
              },
            );
            gsap.fromTo(
              word,
              { xPercent: -2 },
              {
                xPercent: 2,
                ease: "none",
                scrollTrigger: {
                  trigger: chapter.parentElement,
                  start: "top bottom",
                  end: "bottom bottom",
                  scrub: 1,
                },
              },
            );
          });
      },
      section,
    );
    return () => media.revert();
  }, [projects, duration, scrollDuration]);
  const style = {
    color: textColor,
    backgroundColor,
    "--work-muted": mutedTextColor,
    "--work-accent": activeColor,
  } as CSSProperties;
  return (
    <section
      id="projetos"
      ref={sectionRef}
      className="work-showcase"
      style={style}
      aria-labelledby="projects-title"
    >
      <header className="work-heading">
        <div>
          <p className="studio-label">
            <span>02 /</span> IDEIAS COLOCADAS EM PRÁTICA
          </p>
          <h2 id="projects-title">{title}</h2>
        </div>
        <div className="work-heading-aside">
          <span>{periodLabel}</span>
          <p>
            Explore o que já saiu do papel.
            <br />
            Imagine o que podemos criar juntos.
          </p>
          <ArrowDown size={21} aria-hidden="true" />
        </div>
      </header>
      <div className="work-chapters">
        {projects.map((project, index) => {
          const sandbox = project.id === "sandbox";
          return (
            <div className="work-scene" key={project.id}>
              <article
                className={`work-chapter work-${project.id}`}
                aria-labelledby={`work-title-${project.id}`}
              >
                <div className="work-meta">
                  <span>
                    <i /> PROJETO {project.number} /{" "}
                    {String(projects.length).padStart(2, "0")}
                  </span>
                  <span>{project.category.toUpperCase()}</span>
                  <Asterisk size={22} aria-hidden="true" />
                </div>
                <span className="work-backdrop" aria-hidden="true">
                  {sandbox ? "SANDBOX" : "APRENDER."}
                </span>
                <div className="work-composition">
                  <div className="work-story">
                    <span className="work-kicker">
                      {sandbox
                        ? "CADA ESCOLHA MUDA TUDO."
                        : "CONHECIMENTO EM MOVIMENTO."}
                    </span>
                    <h3 id={`work-title-${project.id}`}>
                      {sandbox ? (
                        <>
                          UMA VIDA.
                          <br />
                          INFINITOS
                          <br />
                          <em>CAMINHOS.</em>
                        </>
                      ) : (
                        <>
                          APRENDER.
                          <br />
                          JOGAR.
                          <br />
                          <em>DESCOBRIR.</em>
                        </>
                      )}
                    </h3>
                    <p>
                      {sandbox
                        ? "Decisões reais em uma vida simulada. Um universo de possibilidades, com inteligência artificial para conectar escolhas e consequências."
                        : "O estudo ganha uma nova dinâmica. Três jogos, diferentes matérias e um tutor com IA para acompanhar cada descoberta."}
                    </p>
                    <a
                      className="work-explore"
                      href={`#sobre-${project.id}`}
                      aria-label={`Conhecer o projeto ${project.name}`}
                    >
                      Por dentro do projeto{" "}
                      <ArrowUpRight size={19} aria-hidden="true" />
                    </a>
                  </div>
                  <div className="work-stage">
                    <div className="work-halo" aria-hidden="true" />
                    <div className="work-device">
                      <div className="work-device-camera" aria-hidden="true" />
                      <ProjectPreview id={project.id} />
                      <div className="work-device-base" aria-hidden="true" />
                    </div>
                    <div className="work-floating-note" aria-hidden="true">
                      <MoveUpRight size={23} />
                      <span>
                        {sandbox
                          ? "SUA PRÓXIMA ESCOLHA."
                          : "SEU PRÓXIMO DESAFIO."}
                        <strong>
                          {sandbox
                            ? "Uma nova possibilidade."
                            : "Uma nova descoberta."}
                        </strong>
                      </span>
                    </div>
                    <p className="work-image-caption">
                      {sandbox
                        ? "CAPTURA REAL DO PROJETO"
                        : "REPRESENTAÇÃO DAS FUNCIONALIDADES"}
                    </p>
                  </div>
                </div>
                <footer className="work-bottom">
                  <div>
                    <span className="work-project-name">{project.name}</span>
                    <div className="work-tech">
                      {project.technologies.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={whatsappUrl(
                      `um projeto inspirado no ${project.name}`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vamos criar o seu?{" "}
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                  <span className="work-large-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                </footer>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
