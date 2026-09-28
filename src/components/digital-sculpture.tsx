import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createSculptureGeometry,
  satellitePosition,
} from "./sculpture-geometry";
import { createVariant, type SculptureVariant } from "./sculpture-variants";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Original real-time sculpture. No third-party models or remote textures.
export default function DigitalSculpture({
  paused,
  variant = "orbit",
}: {
  paused: boolean;
  variant?: SculptureVariant;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(paused);
  useEffect(() => {
    pauseRef.current = paused;
  }, [paused]);
  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.8);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    const group = new THREE.Group();
    scene.add(group);
    const silver = new THREE.MeshPhysicalMaterial({
      color: 0xf1f0eb,
      side: THREE.DoubleSide,
      metalness: 1,
      roughness: 0.17,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    });
    const blue = new THREE.MeshPhysicalMaterial({
      color: 0x2346ff,
      metalness: 0.45,
      roughness: 0.21,
      clearcoat: 1,
      emissive: 0x081a80,
      emissiveIntensity: 0.18,
    });
    const dark = new THREE.MeshPhysicalMaterial({
      color: 0x25252c,
      metalness: 0.95,
      roughness: 0.2,
    });
    // Disjoint spherical shells remain separated under ANY rotation.
    // Outer shell [1.72, 2.08]; inner [1.09, 1.41]; core radius .52.
    const geometries = createSculptureGeometry(variant === "core" ? 0 : 1);
    const ringGeometry = geometries.outer;
    const innerGeometry = geometries.inner;
    const primary = new THREE.Mesh(ringGeometry, silver);
    primary.rotation.set(0.7, 0.65, -0.6);

    group.add(primary);
    const second = new THREE.Mesh(innerGeometry, blue);
    second.rotation.set(-0.75, -0.4, 0.8);

    group.add(second);
    const coreGeometry = geometries.core;
    const core = new THREE.Mesh(coreGeometry, dark);
    group.add(core);
    const satelliteGeometry = geometries.satellite;
    const satellites: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) {
      const dot = new THREE.Mesh(satelliteGeometry, i % 2 ? blue : silver);
      dot.position.copy(satellitePosition(i));
      dot.scale.setScalar(i % 3 === 0 ? 1.7 : 0.8);
      group.add(dot);
      satellites.push(dot);
    }
    const helixGeometry = geometries.helix;
    const alternate = createVariant(variant, silver, blue);
    if (variant !== "orbit") {
      primary.visible = second.visible = core.visible = false;
      satellites.forEach((dot) => {
        dot.visible = false;
      });
      group.add(alternate.group);
    }
    const warm = new THREE.PointLight(0x536cff, 24, 20);
    warm.position.set(-3, -2, 3);
    scene.add(warm);
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(2, 4, 5);
    scene.add(key);
    group.rotation.z = variant === "helix" ? 0.5 : -0.2;
    let active = true,
      frame = 0,
      t = 0,
      last = 0,
      px = 0,
      py = 0;
    const resize = () => {
      const w = host.clientWidth,
        h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.position.z = w < 600 ? 10.5 : 8.8;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    const visibility = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibility.observe(host);
    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width - 0.5;
      py = (event.clientY - rect.top) / rect.height - 0.5;
    };
    const leave = () => {
      px = 0;
      py = 0;
    };
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    let scrollProgress = 0;
    const onScroll = () => {
      const section = host.closest("section");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      scrollProgress = Math.max(0, Math.min(1, -rect.top / rect.height));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    let first = true;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      const delta = Math.min((time - last) / 1000, 0.04);
      last = time;
      if (!active || document.hidden || (pauseRef.current && !first)) return;
      if (!pauseRef.current) {
        t += delta;
        alternate.update(t, scrollProgress);
        group.rotation.y +=
          (px * 0.5 +
            scrollProgress * 2.5 +
            Math.sin(t * 0.22) * 0.2 +
            (variant === "helix" ? t * 0.16 : 0) -
            group.rotation.y) *
          0.035;
        group.rotation.x += (py * 0.2 - group.rotation.x) * 0.035;
        group.position.y = Math.sin(t * 0.6) * 0.09;
        core.rotation.y = t * 0.25 + scrollProgress * 4;
        primary.rotation.z = -0.6 + scrollProgress * 3.5 + t * 0.12;
        second.rotation.x = -0.75 - scrollProgress * 4 - t * 0.2;
        const expansion = 1 + scrollProgress * 0.35;
        group.scale.setScalar(expansion);
      }
      renderer.render(scene, camera);
      first = false;
      host.dataset.ready = "true";
    };
    frame = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      alternate.dispose();
      ringGeometry.dispose();
      innerGeometry.dispose();
      helixGeometry.dispose();
      coreGeometry.dispose();
      satelliteGeometry.dispose();
      silver.dispose();
      blue.dispose();
      dark.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.ready;
    };
  }, [variant]);
  return (
    <div
      ref={mount}
      className="sculpture-canvas"
      data-variant={variant}
      aria-hidden="true"
    >
      <div className="sculpture-fallback">
        <span />
        <span />
      </div>
    </div>
  );
}
