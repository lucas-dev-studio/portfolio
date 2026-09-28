import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Asterisk } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** A native sticky scene: the visitor always owns the scroll. */
export function MotionStory() {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const section = root.current!;
        const particles =
          section.querySelectorAll<HTMLElement>(".idea-particle");
        const radius = () => Math.min(window.innerWidth * 0.28, 190);
        gsap.set(particles, {
          left: "50%",
          top: "50%",
          xPercent: -50,
          yPercent: -50,
        });
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        });
        gsap.set(".idea-core", { scale: 0.2, opacity: 0 });
        gsap.set(".idea-phase", { opacity: 0 });
        gsap.set(".idea-phase:first-child", { opacity: 1 });
        timeline
          .fromTo(
            particles,
            {
              x: (i: number) => ((i % 5) - 2) * radius() * 0.55,
              y: (i: number) => (Math.floor(i / 5) - 2) * radius() * 0.55,
              rotate: 0,
              borderRadius: "12%",
              scale: 0.8,
            },
            {
              x: (i: number) => Math.cos((i / 25) * Math.PI * 2) * radius(),
              y: (i: number) => Math.sin((i / 25) * Math.PI * 2) * radius(),
              rotate: 180,
              borderRadius: "50%",
              scale: 1,
              stagger: { amount: 0.12 },
              duration: 1,
              ease: "power2.inOut",
            },
          )
          .to(".idea-phase:first-child", { opacity: 0, duration: 0.15 }, 0.65)
          .to(".idea-phase:nth-child(2)", { opacity: 1, duration: 0.15 }, 0.8)
          .to(
            ".idea-core",
            { scale: 1, rotate: 90, opacity: 1, duration: 0.5 },
            0.55,
          )
          .to(
            particles,
            {
              x: (i: number) => ((i % 5) - 2) * radius() * 0.48,
              y: (i: number) => (Math.floor(i / 5) - 2) * radius() * 0.48,
              rotate: 360,
              borderRadius: "18%",
              scale: 1.3,
              duration: 1,
              stagger: { amount: 0.15, from: "center" },
              ease: "power2.inOut",
            },
            1.35,
          )
          .to(".idea-core", { scale: 0.4, opacity: 0, duration: 0.4 }, 1.35)
          .to(".idea-phase:nth-child(2)", { opacity: 0, duration: 0.15 }, 1.7)
          .to(".idea-phase:nth-child(3)", { opacity: 1, duration: 0.15 }, 1.85)
          .fromTo(
            ".idea-track-fill",
            { scaleX: 0 },
            { scaleX: 1, duration: 2.5, ease: "none" },
            0,
          );
      },
      root,
    );
    return () => media.revert();
  }, []);
  return (
    <section className="idea-story" ref={root} aria-labelledby="idea-heading">
      <div className="idea-sticky">
        <p className="studio-label">DO PRIMEIRO INSIGHT À ÚLTIMA INTERAÇÃO</p>
        <h2 id="idea-heading">
          IDEIAS GANHAM <em>VIDA.</em>
        </h2>
        <div className="idea-field" aria-hidden="true">
          <span className="idea-orbit" />
          <span className="idea-core">
            <Asterisk size={80} strokeWidth={1} />
          </span>
          {Array.from({ length: 25 }, (_, i) => (
            <i
              key={i}
              className="idea-particle"
              style={{
                left: `${30 + (i % 5) * 10}%`,
                top: `${20 + Math.floor(i / 5) * 15}%`,
              }}
            />
          ))}
        </div>
        <div className="idea-phases" aria-hidden="true">
          <div className="idea-phase">
            <span>01 / IMAGINAR</span>
            <p>Tudo começa com uma possibilidade.</p>
          </div>
          <div className="idea-phase">
            <span>02 / CONECTAR</span>
            <p>Design, código e intenção. Juntos.</p>
          </div>
          <div className="idea-phase">
            <span>03 / CONSTRUIR</span>
            <p>Uma experiência pronta para acontecer.</p>
          </div>
        </div>
        <p className="sr-only">
          Imaginar, conectar e construir: da primeira possibilidade a uma
          experiência digital.
        </p>
        <div className="idea-track" aria-hidden="true">
          <span className="idea-track-fill" />
        </div>
      </div>
    </section>
  );
}
