import { useEffect, useLayoutEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMobileBlade, createRibbonRib, MOBILE_BLADE_SCALE, MOBILE_BLADE_SPACING, RIB_COUNT, RIB_SPACING } from './studio-geometry';

type Chapter = 'hero' | 'sandbox' | 'education' | 'systems' | 'contact';
type Service = 'sites' | 'automation' | 'ai';
export interface StudioSceneProps { chapter: Chapter; paused?: boolean; progress?: number | MotionValue<number>; className?: string; service?: Service }

function studioEnvironment() {
  const faces = Array.from({ length: 6 }, (_, i) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = i === 3 ? '#292a27' : '#70716b'; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = i === 2 ? '#ffffff' : '#dddcd6'; ctx.fillRect(8, 4, 13, 56);
    ctx.fillStyle = '#b5b5ad'; ctx.fillRect(43, 11, 6, 43);
    return c;
  });
  const map = new THREE.CubeTexture(faces); map.colorSpace = THREE.SRGBColorSpace; map.needsUpdate = true;
  return map;
}

function makeArtwork(chapter: Chapter, service: Service, textures: THREE.Texture[], requestRender: () => void) {
  const root = new THREE.Group();
  const porcelain = new THREE.MeshStandardMaterial({ color: '#e9e6df', roughness: .32, metalness: .13 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#bdbdb7', roughness: .23, metalness: .91 });
  const orange = new THREE.MeshStandardMaterial({ color: '#ff5b24', roughness: .28, metalness: .24 });
  const dark = new THREE.MeshStandardMaterial({ color: '#242623', roughness: .42, metalness: .45 });
  const moving: THREE.Object3D[] = [];
  function mesh(g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) {
    const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o;
  }
  function box(w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0, parent: THREE.Object3D = root) {
    return mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(.08, d / 3)), m, x, y, z, parent);
  }
  function rod(a: THREE.Vector3, b: THREE.Vector3, radius = .025, m: THREE.Material = chrome) {
    const o = mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 10), m);
    o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); return o;
  }
  function screen(w: number, h: number, x: number, y: number, z: number, texture?: THREE.Texture) {
    const group = new THREE.Group(); group.position.set(x, y, z); root.add(group);
    box(w + .17, h + .17, .15, dark, 0, 0, 0, group);
    box(w + .23, h + .23, .07, chrome, 0, 0, -.07, group);
    mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, color: texture ? 0xffffff : '#e9e6df', toneMapped: false }), 0, 0, .081, group);
    return group;
  }
  function graphic(kind: number) {
    const c = document.createElement('canvas'); c.width = 768; c.height = 512;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#e9e6df'; ctx.fillRect(0, 0, 768, 512);
    ctx.fillStyle = '#161715'; ctx.font = 'bold 26px sans-serif'; ctx.fillText(kind === 3 ? 'STUDIO / DIGITAL' : kind === 0 ? 'QUIZ / 01' : kind === 1 ? 'PALAVRAS' : 'DESCOBERTA', 35, 50);
    ctx.fillStyle = '#ff5b24'; ctx.fillRect(35, 72, 698, 5);
    if (kind === 3) {
      ctx.font = 'bold 68px sans-serif'; ctx.fillStyle = '#161715'; ctx.fillText('Ideias em', 35, 178); ctx.fillText('movimento.', 35, 252);
      ctx.fillStyle = '#ff5b24'; ctx.fillRect(35, 300, 190, 54);
      ctx.fillStyle = '#161715'; ctx.font = 'bold 19px sans-serif'; ctx.fillText('EXPLORAR →', 52, 333);
      ctx.fillStyle = '#cbc9c1'; ctx.fillRect(35, 401, 210, 70); ctx.fillRect(268, 401, 210, 70); ctx.fillRect(501, 401, 232, 70);
      ctx.fillStyle = '#161715'; ctx.font = '18px sans-serif'; ctx.fillText('Estratégia', 52, 441); ctx.fillText('Design', 285, 441); ctx.fillText('Experiência', 518, 441);
    } else if (kind === 0) {
      ctx.fillStyle = '#161715'; ctx.font = 'bold 40px sans-serif'; ctx.fillText('Vamos pensar?', 35, 165);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 1 ? '#ff5b24' : '#d4d2ca'; ctx.fillRect(35, 212 + i * 75, 698, 56); }
    } else if (kind === 1) {
      const letters = 'CRIARIDEIAPENSARJOGARAPRENDER'; ctx.font = 'bold 30px monospace';
      for (let y = 0; y < 6; y++) for (let x = 0; x < 10; x++) { ctx.fillStyle = y === 2 ? '#ff5b24' : '#161715'; ctx.fillText(letters[(y * 10 + x) % letters.length], 47 + x * 69, 139 + y * 59); }
    } else {
      ctx.strokeStyle = '#161715'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(150, 365); ctx.lineTo(150, 145); ctx.lineTo(380, 145); ctx.lineTo(380, 195); ctx.stroke();
      ctx.beginPath(); ctx.arc(380, 233, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ff5b24'; ctx.font = 'bold 50px monospace'; ctx.fillText('C R I _ R', 170, 440);
    }
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture); return texture;
  }
  if (chapter === 'hero') {
    // A family of disjoint solid lamellae: a folded architectural shell, open at its ends.
    const g = createRibbonRib();
    for (let i = 0; i < RIB_COUNT; i++) {
      const z = (i - 14) * RIB_SPACING;
      const fin = mesh(g, i > 21 ? orange : i === 0 || i === 20 ? chrome : porcelain, 0, 0, z);
      fin.position.y = Math.sin(i / 28 * Math.PI) * .12; fin.rotation.z = (i - 14) * .006;
    }
    root.rotation.set(.10, -.42, -.12);
  } else if (chapter === 'sandbox') {
    const texture = new THREE.TextureLoader().load('/images/sandbox.png', requestRender); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
    const display = screen(4.5, 2.53, 0, .55, 0, texture); display.rotation.y = -.13;
    box(.18, .9, .2, chrome, 0, -.9, -.2); box(1.8, .12, .85, chrome, 0, -1.39, -.04);
    box(5.8, .16, 2.6, dark, 0, -1.55, 0);
    for (let i = 0; i < 9; i++) box(.07, .75 + i * .09, .14, i > 5 ? orange : chrome, -2.65 + i * .12, -1 + i * .045, -.6);
    for (let i = 0; i < 4; i++) { const coin = mesh(new THREE.CylinderGeometry(.31, .31, .09, 40), i === 3 ? orange : chrome, 2.1, -1.4 + i * .1, .8); coin.rotation.z = .08; }
    root.rotation.set(.02, -.15, 0);
  } else if (chapter === 'education') {
    for (let side = 0; side < 2; side++) {
      const page = new THREE.Group(); page.position.set(side ? 1.17 : -1.17, .15, 0); page.rotation.y = side ? -.3 : .3; root.add(page);
      box(2.42, 3.15, .13, orange, 0, 0, -.14, page);
      box(2.32, 3.04, .16, porcelain, 0, 0, .015, page);
      for (let j = 0; j < 5; j++) box(2.30, .014, .14, dark, 0, -1.42 + j * .025, .019, page);
      mesh(new THREE.PlaneGeometry(2.08, 1.39), new THREE.MeshBasicMaterial({ map: graphic(side ? 1 : 0), toneMapped: false }), 0, .62, .101, page);
      if (!side) mesh(new THREE.PlaneGeometry(1.65, 1.10), new THREE.MeshBasicMaterial({ map: graphic(2), toneMapped: false }), 0, -.75, .101, page);
      else {
        for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
          const tile = box(.43, .43, .10, i === j ? orange : porcelain, -.75 + i * .5, -.40 - j * .53, .17, page);
          const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d')!;
          ctx.clearRect(0, 0, 64, 64); ctx.fillStyle = '#161715'; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center'; ctx.fillText('APRENDER!'[j * 4 + i], 32, 47);
          const tex = new THREE.CanvasTexture(c); textures.push(tex);
          const face = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })); face.position.z = .055; tile.add(face);
        }
      }
    }
    mesh(new THREE.CylinderGeometry(.09, .09, 3.16, 24), orange, 0, .15, -.27);
    root.rotation.set(-.14, -.15, -.06);
  } else if (chapter === 'systems' && service === 'sites') {
    const display = screen(3.4, 2.22, -.42, .27, -.15, graphic(3)); display.rotation.y = .13;
    box(4.5, .12, 1.6, chrome, -.42, -1.25, .05);
    const mobile = screen(.9, 1.7, 1.88, -.45, .9, graphic(3)); mobile.rotation.y = -.2;
    for (let i = 0; i < 5; i++) box(.055, 2.8, .8, i === 4 ? orange : dark, -2.35 + i * .14, .12, -.7);
  } else if (chapter === 'systems' && service === 'automation') {
    const pts = [new THREE.Vector3(-2.4, -.8, .4), new THREE.Vector3(-1.05, .55, -.3), new THREE.Vector3(.7, -.15, .4), new THREE.Vector3(2.4, 1.05, -.35)];
    pts.forEach((p, i) => { const o = box(.87, 1.16, .64, i === 2 ? orange : porcelain, p.x, p.y, p.z); o.rotation.y = -.35; });
    for (let i = 0; i < 3; i++) { rod(pts[i], pts[i + 1], .044); const bead = mesh(new THREE.CapsuleGeometry(.115, .22, 4, 12), orange); bead.userData.start = pts[i]; bead.userData.end = pts[i + 1]; moving.push(bead); }
  } else if (chapter === 'systems') {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 13; i++) { const a = i * 2.399; const p = new THREE.Vector3(Math.cos(a) * (1.2 + i % 3 * .35), (i / 12 - .5) * 3, Math.sin(a) * .9); points.push(p); const node = mesh(new THREE.OctahedronGeometry(i === 6 ? .48 : .25, 1), i % 4 === 0 ? orange : chrome, p.x, p.y, p.z); moving.push(node); }
    for (let i = 1; i < points.length; i++) { rod(points[i - 1], points[i]); if (i > 2) rod(points[i - 3], points[i], .014, porcelain); }
  } else {
    rod(new THREE.Vector3(-2.92, .75, 0), new THREE.Vector3(2.92, 1.05, 0), .035);
    const hinge = mesh(new THREE.CylinderGeometry(.10, .10, .22, 24), orange, 0, .92, 0); hinge.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * MOBILE_BLADE_SPACING; const top = .75 + (x + 2.92) / 5.84 * .30; const y = -.13 - Math.sin(i * 1.6) * .32;
      rod(new THREE.Vector3(x, top, 0), new THREE.Vector3(x, y, 0), .012);
      const wing = mesh(createMobileBlade(), i === 3 ? orange : i % 2 ? chrome : porcelain, x, y - .775 * MOBILE_BLADE_SCALE, 0); wing.scale.setScalar(MOBILE_BLADE_SCALE); wing.rotation.set(.1, -.35 + i * .16, -.2 + i * .10); moving.push(wing);
    }
    rod(new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, .92, 0), .014);
    root.rotation.set(.12, -.3, -.08);
  }
  const baseRotation = root.rotation.clone();
  return { root, materials: [porcelain, chrome, orange, dark], viewport(aspect: number) {
    const portrait = aspect < .9;
    root.rotation.z = baseRotation.z + (portrait && chapter === 'hero' ? -.53 : portrait && chapter === 'contact' ? .65 : 0);
    root.scale.x = portrait && chapter === 'contact' ? .65 : 1;
  }, animate(time: number, progress: number, pointer: THREE.Vector2) {
    root.rotation.y = baseRotation.y + pointer.x * .11 + (progress - .5) * .55 + Math.sin(time * .22) * .035;
    root.rotation.x = baseRotation.x + pointer.y * .05;
    moving.forEach((o, i) => {
      if (chapter === 'systems' && service === 'automation') o.position.lerpVectors(o.userData.start, o.userData.end, (time * .32 + i * .23) % 1);
      else if (chapter === 'contact') o.rotation.y = -.35 + i * .16 + Math.sin(time * .55 + i) * .23;
      else if (chapter === 'education') o.position.y = 1.64 + Math.sin(time * .7 + i) * .10;
      else o.rotation.y = time * .15 + i * .3;
    });
  } };
}

export default function StudioScene({ chapter, paused = false, progress = .5, className = '', service = 'sites' }: StudioSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const inputs = useRef({ paused, progress });
  const wakeRef = useRef<() => void>(() => {});
  useLayoutEffect(() => { inputs.current = { paused, progress }; wakeRef.current(); }, [paused, progress]);
  useEffect(() => {
    if (typeof progress === 'number') return;
    return progress.on('change', () => wakeRef.current());
  }, [progress]);
  useEffect(() => {
    const host = hostRef.current; if (!host) return;
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene; let camera: THREE.PerspectiveCamera;
    let art: ReturnType<typeof makeArtwork> | undefined;
    let frame = 0; let visible = false; let initialized = false; let disposed = false; let elapsed = 0; let last = 0;
    const textures: THREE.Texture[] = []; const pointer = new THREE.Vector2(); const smooth = new THREE.Vector2();
    const posePointer = new THREE.Vector2(); let poseProgress = .5; let cameraDistance = 7.2;
    const cameraTarget = new THREE.Vector3();
    delete host.dataset.fallback;
    const render = (now = performance.now()) => {
      frame = 0; if (!renderer || !art || !visible || document.hidden || disposed) return;
      const stopped = inputs.current.paused;
      if (!stopped) { elapsed += last ? Math.min((now - last) / 1000, .05) : 0; smooth.lerp(pointer, .045); posePointer.copy(smooth); const p = inputs.current.progress; poseProgress = THREE.MathUtils.clamp(typeof p === 'number' ? p : p.get(), 0, 1); }
      last = now;
      art.animate(elapsed, poseProgress, posePointer);
      camera.position.z = cameraTarget.z + cameraDistance * (1 + (poseProgress - .5) * .045);
      camera.position.y = cameraTarget.y + cameraDistance * .16 + (poseProgress - .5) * .35; camera.lookAt(cameraTarget);
      renderer.render(scene, camera); host.dataset.ready = 'true';
      if (!stopped) frame = requestAnimationFrame(render);
    };
    const wake = () => { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; if (visible && initialized && !document.hidden) frame = requestAnimationFrame(render); };
    wakeRef.current = wake;
    const resize = () => {
      if (!renderer) return; const w = host.clientWidth; const h = host.clientHeight; if (!w || !h) return;
      camera.aspect = w / h;
      if (!inputs.current.paused) { const p = inputs.current.progress; poseProgress = THREE.MathUtils.clamp(typeof p === 'number' ? p : p.get(), 0, 1); }
      art!.viewport(camera.aspect); art!.animate(elapsed, poseProgress, posePointer); art!.root.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(art!.root); const size = bounds.getSize(new THREE.Vector3()); bounds.getCenter(cameraTarget);
      const tangent = Math.tan(THREE.MathUtils.degToRad(34 / 2));
      let distance = Math.max(size.y / (2 * tangent), size.x / (2 * tangent * camera.aspect));
      // Fit projected bounds, instead of adding the entire depth to an already conservative fit.
      // This keeps the sculpture physically large while retaining a margin around its silhouette.
      const corners: THREE.Vector3[] = [];
      for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) corners.push(new THREE.Vector3(x, y, z));
      if (chapter === 'hero') {
        // Empty corners of the rotated lamella envelope overestimate the actual shell.
        // Sample the authored surface itself so its silhouette occupies the intended frame.
        corners.length = 0;
        art!.root.traverse(object => {
          if (!(object instanceof THREE.Mesh)) return;
          const vertices = object.geometry.getAttribute('position');
          const stride = Math.max(1, Math.floor(vertices.count / 1200));
          for (let i = 0; i < vertices.count; i += stride) corners.push(new THREE.Vector3().fromBufferAttribute(vertices, i).applyMatrix4(object.matrixWorld));
        });
      }
      camera.updateProjectionMatrix();
      const occupancy = chapter === 'hero' ? .94 : .91;
      let high = Math.max(30, distance * 3);
      const projected = new THREE.Vector3();
      for (let pass = 0; pass < (chapter === 'hero' ? 2 : 1); pass++) {
        let low = .5; high = Math.max(30, distance * 3);
        for (let i = 0; i < 20; i++) {
          distance = (low + high) / 2;
          camera.position.set(cameraTarget.x + .18, cameraTarget.y + distance * .16, cameraTarget.z + distance); camera.lookAt(cameraTarget); camera.updateMatrixWorld();
          let extent = 0;
          for (const corner of corners) { projected.copy(corner).project(camera); extent = Math.max(extent, Math.abs(projected.x), Math.abs(projected.y)); }
          if (extent > occupancy || distance < size.z * .55) low = distance; else high = distance;
        }
        if (chapter === 'hero' && pass === 0) {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
          for (const corner of corners) { projected.copy(corner).project(camera); minX = Math.min(minX, projected.x); maxX = Math.max(maxX, projected.x); minY = Math.min(minY, projected.y); maxY = Math.max(maxY, projected.y); }
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
          const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
          cameraTarget.addScaledVector(right, (minX + maxX) * .5 * high * tangent * camera.aspect);
          cameraTarget.addScaledVector(up, (minY + maxY) * .5 * high * tangent);
        }
      }
      cameraDistance = high;
      camera.position.set(cameraTarget.x + .18, cameraTarget.y + high * .16, cameraTarget.z + high); camera.lookAt(cameraTarget); camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, w < 600 ? 1.25 : 1.5)); renderer.setSize(w, h); wake();
    };
    const initialize = () => {
      if (initialized || disposed) return; initialized = true;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;'; host.appendChild(renderer.domElement);
        scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
        const environment = studioEnvironment(); textures.push(environment); scene.environment = environment; scene.environmentIntensity = .85;
        scene.add(new THREE.HemisphereLight('#ffffff', '#37352d', 2.1));
        const key = new THREE.DirectionalLight('#fff5e5', 4); key.position.set(-3, 6, 5); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.camera.left = key.shadow.camera.bottom = -5; key.shadow.camera.right = key.shadow.camera.top = 5; key.shadow.bias = -.001; scene.add(key);
        const rim = new THREE.DirectionalLight('#ffffff', 3.2); rim.position.set(4, 3, -4); scene.add(rim);
        art = makeArtwork(chapter, service, textures, wake); scene.add(art.root);
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .27 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.75; floor.receiveShadow = true; scene.add(floor);
        resize();
      } catch { host.dataset.fallback = 'true'; host.dataset.ready = 'true'; }
    };
    const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) initialize(); }, { rootMargin: '300px' }); near.observe(host);
    const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) { initialize(); wake(); } else { cancelAnimationFrame(frame); frame = 0; last = 0; } }); view.observe(host);
    const observer = new ResizeObserver(resize); observer.observe(host);
    const move = (e: PointerEvent) => { if (e.pointerType === 'touch') return; const rect = host.getBoundingClientRect(); pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, (e.clientY - rect.top) / rect.height * 2 - 1); };
    const leave = () => pointer.set(0, 0);
    const visibility = () => { cancelAnimationFrame(frame); frame = 0; wake(); };
    host.addEventListener('pointermove', move); host.addEventListener('pointerleave', leave); document.addEventListener('visibilitychange', visibility);
    return () => {
      disposed = true; wakeRef.current = () => {}; cancelAnimationFrame(frame); near.disconnect(); view.disconnect(); observer.disconnect();
      host.removeEventListener('pointermove', move); host.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', visibility);
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>(art?.materials ?? []);
      scene?.traverse(o => { if (o instanceof THREE.Mesh) { geometries.add(o.geometry); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); } });
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove(); delete host.dataset.ready;
    };
  }, [chapter, service]);
  return <div ref={hostRef} className={`studio-scene ${className}`} data-scene={chapter} data-service={chapter === 'systems' ? service : undefined} data-paused={paused ? 'true' : 'false'} style={{ width: '100%', height: '100%', position: 'relative' }}><div className="studio-scene-fallback" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div></div>;
}
