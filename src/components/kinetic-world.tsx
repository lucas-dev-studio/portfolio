import { useEffect, useRef } from "react";
import * as THREE from "three";

export type WorldVariant = "sites" | "automation" | "ai" | "monolith" | "burst";

type Props = { variant: WorldVariant; paused?: boolean };

export default function KineticWorld({ variant, paused = false }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      host.dataset.fallback = "true";
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(3, 4, 5);
    scene.add(light);
    const rim = new THREE.PointLight(0x9bff50, 22, 20);
    rim.position.set(-4, -2, 4);
    scene.add(rim);

    const root = new THREE.Group();
    scene.add(root);
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const makeGeometry = <T extends THREE.BufferGeometry>(geometry: T) => { geometries.push(geometry); return geometry; };
    const makeMaterial = <T extends THREE.Material>(material: T) => { materials.push(material); return material; };
    const ink = makeMaterial(new THREE.MeshPhysicalMaterial({ color: 0x151b35, metalness: 0.55, roughness: 0.2, clearcoat: 1 }));
    const cobalt = makeMaterial(new THREE.MeshPhysicalMaterial({ color: 0x5368f3, metalness: 0.42, roughness: 0.22, clearcoat: 1 }));
    const lime = makeMaterial(new THREE.MeshPhysicalMaterial({ color: 0xadff53, metalness: 0.2, roughness: 0.3, clearcoat: 0.8 }));
    const ivory = makeMaterial(new THREE.MeshPhysicalMaterial({ color: 0xf3f2e9, metalness: 0.7, roughness: 0.18, clearcoat: 1 }));
    const glass = makeMaterial(new THREE.MeshPhysicalMaterial({ color: 0x879cff, metalness: 0.35, roughness: 0.12, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false }));
    const moving: THREE.Object3D[] = [];
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Group = root) => {
      const mesh = new THREE.Mesh(geometry, material);
      parent.add(mesh);
      return mesh;
    };

    if (variant === "sites") {
      const panel = makeGeometry(new THREE.BoxGeometry(3.25, 2.25, 0.13));
      const front = add(panel, ink);
      front.rotation.y = -0.25;
      const back = add(panel, glass);
      back.position.set(0.55, 0.34, -0.8);
      back.rotation.y = -0.35;
      const strip = makeGeometry(new THREE.BoxGeometry(2.45, 0.12, 0.06));
      for (let i = 0; i < 3; i++) {
        const bar = add(strip, i === 0 ? lime : ivory);
        bar.position.set(-0.23, 0.42 - i * 0.42, 0.12);
        bar.scale.x = i === 1 ? 0.82 : i === 2 ? 0.62 : 1;
        bar.rotation.y = -0.25;
      }
      for (let i = 0; i < 4; i++) {
        const tile = add(makeGeometry(new THREE.BoxGeometry(0.54, 0.56, 0.22)), i % 2 ? cobalt : ivory);
        tile.position.set(-1.05 + i * 0.7, -0.7, 0.25 + i * 0.05);
      }
      const cursor = add(makeGeometry(new THREE.ConeGeometry(0.25, 0.72, 3)), lime);
      cursor.position.set(1.45, -1.12, 0.8);
      cursor.rotation.z = -0.55;
      moving.push(cursor, back);
    }

    if (variant === "automation") {
      const path = makeGeometry(new THREE.CylinderGeometry(0.025, 0.025, 3.6, 8));
      for (let i = 0; i < 3; i++) {
        const hub = new THREE.Group();
        hub.position.x = (i - 1) * 1.65;
        root.add(hub);
        add(makeGeometry(new THREE.CylinderGeometry(0.56, 0.56, 0.25, 12)), i === 1 ? lime : cobalt, hub).rotation.x = Math.PI / 2;
        for (let tooth = 0; tooth < 12; tooth++) {
          const a = tooth * Math.PI / 6;
          const block = add(makeGeometry(new THREE.BoxGeometry(0.24, 0.25, 0.3)), i === 1 ? lime : cobalt, hub);
          block.position.set(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0);
          block.rotation.z = a;
        }
        add(makeGeometry(new THREE.CylinderGeometry(0.2, 0.2, 0.38, 18)), ink, hub).rotation.x = Math.PI / 2;
        moving.push(hub);
      }
      const rail = add(path, ivory);
      rail.rotation.z = Math.PI / 2;
      rail.position.z = -0.4;
      for (let i = 0; i < 5; i++) {
        const packet = add(makeGeometry(new THREE.BoxGeometry(0.24, 0.24, 0.24)), ivory);
        packet.userData.packet = i;
        moving.push(packet);
      }
    }

    if (variant === "ai") {
      const core = add(makeGeometry(new THREE.IcosahedronGeometry(1.1, 2)), cobalt);
      moving.push(core);
      const wire = makeMaterial(new THREE.MeshBasicMaterial({ color: 0xadff53, wireframe: true, transparent: true, opacity: 0.7 }));
      const shell = add(makeGeometry(new THREE.IcosahedronGeometry(2.05, 1)), wire);
      moving.push(shell);
      const nodeGeo = makeGeometry(new THREE.SphereGeometry(0.11, 12, 12));
      for (let i = 0; i < 18; i++) {
        const a = i * 2.39996;
        const z = 1 - 2 * (i + 0.5) / 18;
        const r = Math.sqrt(1 - z * z);
        const node = add(nodeGeo, i % 3 ? ivory : lime);
        node.position.set(Math.cos(a) * r * 2.3, Math.sin(a) * r * 2.3, z * 2.3);
      }
    }

    if (variant === "monolith") {
      const vertical = add(makeGeometry(new THREE.BoxGeometry(0.68, 3.7, 0.72)), ink);
      vertical.position.x = -0.68;
      const foot = add(makeGeometry(new THREE.BoxGeometry(2.15, 0.68, 0.72)), cobalt);
      foot.position.set(0.04, -1.5, 0);
      const face = add(makeGeometry(new THREE.BoxGeometry(0.2, 3.3, 0.76)), lime);
      face.position.set(-0.2, 0.17, 0);
      for (let i = 0; i < 14; i++) {
        const cube = add(makeGeometry(new THREE.BoxGeometry(0.13, 0.13, 0.13)), i % 2 ? cobalt : ivory);
        cube.userData.orbit = i;
        moving.push(cube);
      }
    }

    if (variant === "burst") {
      const center = add(makeGeometry(new THREE.DodecahedronGeometry(0.8, 1)), ink);
      moving.push(center);
      for (let i = 0; i < 30; i++) {
        const a = i * 2.39996;
        const z = 1 - 2 * (i + 0.5) / 30;
        const r = Math.sqrt(1 - z * z);
        const direction = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z);
        const shard = add(makeGeometry(new THREE.ConeGeometry(i % 4 === 0 ? 0.22 : 0.11, i % 4 === 0 ? 1.4 : 1.0, 3)), i % 4 === 0 ? lime : i % 3 === 0 ? cobalt : ivory);
        shard.position.copy(direction).multiplyScalar(1.35);
        shard.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
      }
    }

    let visible = false;
    let frame = 0;
    let elapsed = 0;
    let last = 0;
    let px = 0;
    let py = 0;
    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = 9;
      camera.updateProjectionMatrix();
      render();
      host.dataset.ready = "true";
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    resize();
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0 });
    visibilityObserver.observe(host);
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const box = host.getBoundingClientRect();
      px = (event.clientX - box.left) / box.width - 0.5;
      py = (event.clientY - box.top) / box.height - 0.5;
    };
    host.addEventListener("pointermove", move);
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const delta = Math.min((time - last) / 1000, 0.04);
      last = time;
      if (!visible || document.hidden || pausedRef.current) return;
      elapsed += delta;
      root.rotation.y += (px * 0.4 + Math.sin(elapsed * 0.25) * 0.23 - root.rotation.y) * 0.04;
      root.rotation.x += (-py * 0.25 - root.rotation.x) * 0.04;
      root.position.y = Math.sin(elapsed * 0.65) * 0.08;
      if (variant === "automation") {
        moving.forEach((part, i) => {
          if (i < 3) part.rotation.z = elapsed * (i === 1 ? -0.46 : 0.46);
          else part.position.set(((elapsed * 0.55 + (i - 3) * 0.82) % 4.6) - 2.3, -1.35, 0.5);
        });
      } else if (variant === "monolith") {
        moving.forEach((part, i) => {
          const a = i * 2.39996 + elapsed * 0.25;
          part.position.set(Math.cos(a) * 2.15, Math.sin(a * 1.2) * 1.8, Math.sin(a) * 1.3);
          part.rotation.set(a, a * 0.5, a * 0.7);
        });
      } else if (variant === "ai") {
        moving[0].rotation.set(elapsed * 0.2, elapsed * 0.35, 0);
        moving[1].rotation.set(-elapsed * 0.1, -elapsed * 0.17, elapsed * 0.08);
      } else if (variant === "sites") {
        moving[0].position.y = -1.12 + Math.sin(elapsed * 0.9) * 0.18;
        moving[1].position.z = -0.8 + Math.sin(elapsed * 0.5) * 0.2;
      } else {
        root.rotation.z = elapsed * 0.09;
        moving[0].rotation.y = -elapsed * 0.25;
      }
      render();
      host.dataset.ready = "true";
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", move);
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return <div className={`ns-world ns-world-${variant}`} data-world={variant} ref={hostRef} aria-hidden="true" />;
}
