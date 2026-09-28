import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
const Sculpture = lazy(() => import("./digital-sculpture"));
export function SculpturePanel({
  variant = "orbit",
  label,
  className = "",
}: {
  variant?: "orbit" | "helix" | "core" | "bloom";
  label: string;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`sculpture-panel ${className}`} ref={host}>
      {visible && (
        <Suspense fallback={<div className="sculpture-placeholder" />}>
          <Sculpture variant={variant} paused={paused || reduced} />
        </Suspense>
      )}
      <div className="sculpture-panel-caption">
        <span>{label}</span>
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          disabled={reduced}
          aria-label={`${paused ? "Reproduzir" : "Pausar"} 3D: ${label}`}
          aria-pressed={paused || reduced}
        >
          {paused || reduced ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>
    </div>
  );
}
