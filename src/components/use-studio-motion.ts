import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

export function useStudioMotion(root: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    let disposed = false;
    const media = gsap.matchMedia();
    const cleanup: (() => void)[] = [];
    void document.fonts.ready.then(() => {
      if (disposed || !root.current) return;
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 900px)",
        },
        (ctx) => {
          if (!ctx.conditions?.motion) return;
          const scope = root.current!;
          const desktop = Boolean(ctx.conditions.desktop);
          const splits: SplitText[] = [];
          scope
            .querySelectorAll<HTMLElement>(
              "h1, .services-intro h2, .work-heading h2, .work-story h3, .case-title h2, .studio-about-copy h2, .studio-process h2, .studio-faq h2, .studio-contact h2",
            )
            .forEach((heading) => {
              splits.push(
                SplitText.create(heading, {
                  type: "lines",
                  mask: "lines",
                  autoSplit: true,
                  onSplit(self) {
                    return gsap.from(self.lines, {
                      yPercent: 110,
                      rotate: desktop ? 2 : 0,
                      opacity: 0.2,
                      duration: 0.95,
                      stagger: 0.12,
                      ease: "power4.out",
                      scrollTrigger: {
                        trigger: heading,
                        start: "top 93%",
                        once: true,
                      },
                    });
                  },
                }),
              );
            });
          const reveal = (selector: string, stagger = 0.1) => {
            scope.querySelectorAll<HTMLElement>(selector).forEach((el) => {
              gsap.from(el, {
                y:
                  el.matches("a, button, details") ||
                  el.querySelector("a, button, summary")
                    ? 0
                    : desktop
                      ? 36
                      : 20,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out",
                stagger,
                scrollTrigger: { trigger: el, start: "top 96%", once: true },
              });
            });
          };
          reveal(
            ".hero-kicker, .hero-statement > p, .hero-conversion, .stage-tag, .studio-label, .service-item, .work-meta, .work-story > p, .work-explore, .work-bottom, .case-intro, .case-features > div, .studio-about-copy > p, .studio-steps > div, .studio-faq details, .contact-bottom, .studio-footer > *",
          );
          gsap.from(".studio-header > *", {
            y: -22,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
          });
          gsap.from(".sculpture-entrance", {
            scale: 0.6,
            opacity: 0,
            rotate: -12,
            duration: 1.5,
            ease: "power3.out",
            delay: 0.15,
          });
          gsap.to(".studio-ribbon > *", {
            x: desktop ? -150 : -60,
            rotate: (i: number) => (i % 2 ? 90 : 0),
            ease: "none",
            scrollTrigger: {
              trigger: ".studio-ribbon",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          });
          gsap.fromTo(
            ".about-sculpture",
            { rotate: -16, scale: 0.7 },
            {
              rotate: 12,
              scale: 1.15,
              ease: "none",
              scrollTrigger: {
                trigger: ".studio-about",
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
          gsap.fromTo(
            ".contact-orbit",
            { scale: 0.25, rotate: -60 },
            {
              scale: 1.5,
              rotate: 100,
              ease: "none",
              scrollTrigger: {
                trigger: ".studio-contact",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 0.7,
              },
            },
          );
          gsap.fromTo(
            ".process-line-fill",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ".studio-steps",
                start: "top 85%",
                end: "bottom 55%",
                scrub: 0.5,
              },
            },
          );
          gsap.fromTo(
            ".page-progress",
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: scope,
                start: "top top",
                end: "bottom bottom",
                scrub: true,
              },
            },
          );
          if (desktop && window.innerHeight >= 650) {
            const heroScene = gsap.timeline({
              scrollTrigger: {
                trigger: ".hero-sequence",
                start: "top top",
                end: "bottom bottom",
                scrub: 0.8,
              },
            });
            heroScene
              .to(
                ".hero-statement",
                {
                  yPercent: -70,
                  scale: 0.82,
                  opacity: 0,
                  duration: 0.35,
                  ease: "power2.in",
                },
                0,
              )
              .to(
                ".hero-kicker, .stage-tag, .stage-note, .stage-watermark, .hero-scroll-label",
                { opacity: 0, duration: 0.2 },
                0,
              )
              .to(
                ".digital-stage",
                {
                  y: -90,
                  scale: 1.65,
                  rotate: 18,
                  duration: 1,
                  ease: "power2.inOut",
                },
                0,
              )
              .fromTo(
                ".hero-second-scene",
                { clipPath: "inset(100% 0 0 0)", y: 70 },
                {
                  clipPath: "inset(0% 0 0 0)",
                  y: 0,
                  duration: 0.5,
                  ease: "power3.out",
                },
                0.4,
              )
              .to(".hero-conversion > p", { opacity: 0, duration: 0.2 }, 0)
              .to(".digital-stage", { opacity: 0.28, duration: 0.3 }, 0.65);
            scope
              .querySelectorAll<HTMLElement>(".work-scene")
              .forEach((scene) => {
                const chapter = scene.querySelector(".work-chapter");
                gsap.fromTo(
                  chapter,
                  { clipPath: "inset(7% 4% round 32px)" },
                  {
                    clipPath: "inset(0% 0% round 0px)",
                    ease: "none",
                    scrollTrigger: {
                      trigger: scene,
                      start: "top bottom",
                      end: "top top",
                      scrub: 0.7,
                    },
                  },
                );
              });
            gsap.fromTo(
              ".studio-contact",
              { clipPath: "circle(18% at 50% 100%)" },
              {
                clipPath: "circle(150% at 50% 100%)",
                ease: "none",
                scrollTrigger: {
                  trigger: ".studio-contact",
                  start: "top bottom",
                  end: "top 12%",
                  scrub: 0.6,
                },
              },
            );
          }
          const refresh = () => ScrollTrigger.refresh();
          const resize = new ResizeObserver(refresh);
          scope
            .querySelectorAll(".service-list, .studio-faq")
            .forEach((el) => resize.observe(el));
          return () => {
            resize.disconnect();
            splits.forEach((split) => split.revert());
          };
        },
        root,
      );
      ScrollTrigger.refresh();
    });
    // Keyboard navigation completes the relevant entrance immediately.
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(":focus-visible"))
        return;
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.once && trigger.trigger?.contains(target))
          trigger.animation?.progress(1);
      });
    };
    root.current?.addEventListener("focusin", onFocus);
    const node = root.current;
    cleanup.push(() => node?.removeEventListener("focusin", onFocus));
    return () => {
      disposed = true;
      media.revert();
      cleanup.forEach((fn) => fn());
    };
  }, [root]);
}
