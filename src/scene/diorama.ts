/**
 * Diorama: the renderer, the camera director, the world assembly, picking and the
 * conveyor demo clock. Everything visual is built from the paper kit; this file wires it.
 */
import * as THREE from 'three';
import * as PK3 from '../papercraft/lib/paperkit-3d.js';
const { paperTextures, paperLights, enableSoftShadows, PaperPost, setPrintScale, PAPER_LIGHT, paperMaterial } = PK3 as any;
import { C, LENS, LIGHT } from './palette';
import { buildBoard, BOARD } from './board';
import { WorldKit, makeSign, treeTemplate, bushTemplate, lampTemplate, personTemplate, printedBox, cloudTemplate, robotTemplate, planter, bench, barrel, crossRect, roundRect } from './kit';
import { buildFactory, buildJourney, buildLabAndTower, buildTelemetry, buildWorkshop, buildAbout, buildContact, type Conveyor } from './buildings';
import { HOTSPOTS, type Locale } from '../data/portfolio';
import type { UI } from '../ui/ui';

const rad = THREE.MathUtils.degToRad;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface CamState { target: THREE.Vector3; dist: number; yaw: number; pitch: number }

export class Diorama {
  host: HTMLElement;
  ui: UI;
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  post!: any;
  lights: any;
  kit!: WorldKit;
  conveyor!: Conveyor;
  ready = false;
  hoverId: string | null = null;
  activeId: string | null = null;
  hotspots = HOTSPOTS;

  private cam: CamState = { target: new THREE.Vector3(0, 6.6, 0.6), dist: 110, yaw: 0, pitch: 45 };
  private goal: CamState = { target: new THREE.Vector3(0, 6.6, 0.6), dist: 110, yaw: 0, pitch: 45 };
  private tween: { t: number; dur: number; from: CamState; to: CamState } | null = null;
  private overviewDist = 110;
  private overviewTarget = new THREE.Vector3(0, 6.6, 0.6);
  private baseYaw = 0;
  private px = 0; private py = 0;
  private par = { x: 0, y: 0, tx: 0, ty: 0 };
  private pointer = { down: false, x: 0, y: 0, moved: 0, id: -1 };
  private raycaster = new THREE.Raycaster();
  private lastRay = 0;
  private t = 0;
  private last = performance.now();
  private reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private demoRunning = false;
  private demoHideAt = 0;
  private pinch: { d: number; dist: number } | null = null;
  private pinchUsed = false;
  private pointers = new Map<number, { x: number; y: number }>();
  private mobile = matchMedia('(max-width: 780px)').matches;

  constructor(host: HTMLElement, ui: UI) {
    this.host = host;
    this.ui = ui;
    this.mobile = matchMedia('(max-width: 780px)').matches;
  }

  /* ------------------------------------------------------------------ build */

  async build(setProgress: (p: number, label?: string) => void) {
    setProgress(0.04);
    await nextFrame();

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.5 : 1.85));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    renderer.setSize(innerWidth, innerHeight);
    this.host.appendChild(renderer.domElement);
    renderer.domElement.tabIndex = 0;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Interactive paper diorama. Use the section buttons or the Explore all list to open each district.');
    this.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.desk);
    this.scene = scene;

    const camera = new THREE.PerspectiveCamera(26, innerWidth / innerHeight, 4, 900);
    this.camera = camera;
    setPrintScale(1);
    this.overviewDist = this.fitDistance();
    const homeDist = this.mobile ? this.mobileHomeDist() : this.overviewDist;
    const homeTarget = this.mobile ? new THREE.Vector3(0, 5.2, 3.0) : this.overviewTarget.clone();
    this.cam = { target: homeTarget.clone(), dist: homeDist, yaw: 0, pitch: this.mobile ? 54 : 45 };
    this.goal = { target: this.cam.target.clone(), dist: this.cam.dist, yaw: 0, pitch: this.cam.pitch };
    this.placeCamera();

    const paper = paperTextures(renderer, { color: '#f8f3e8', seed: 4, unitsPerTile: 5.2, fibres: 1.3, mottle: 0.07, normalStrength: 2.8 });
    this.paper = paper;
    PAPER_LIGHT.leak.value.set(LIGHT.leak);
    PAPER_LIGHT.transTint.value.set('#ffc48c');
    PAPER_LIGHT.trans.value = 0.26;

    const lights = paperLights(scene, {
      key: LIGHT.key, keyIntensity: LIGHT.keyIntensity, keyDir: [...LIGHT.keyDir],
      fill: LIGHT.fill, fillIntensity: LIGHT.fillIntensity, fillDir: [...LIGHT.fillDir],
      sky: LIGHT.sky, ground: LIGHT.ground, skyIntensity: LIGHT.skyIntensity,
      target: new THREE.Vector3(0, 3, 0), shadowExtent: 95, mapSize: 2048, distance: 150,
    });
    this.lights = lights;
    enableSoftShadows(lights.key, { softness: 0.1, maxPenumbra: 1.0, sheet: 0.3, blockerSamples: 14, filterSamples: 20 });

    this.kit = new WorldKit(scene, paper);

    // 1. the platform and its printed ground
    setProgress(0.12);
    await nextFrame();
    buildBoard(scene, paper);

    // 2. the factory and its agent conveyor
    setProgress(0.3);
    await nextFrame();
    const { conveyor } = buildFactory(this.kit);
    this.conveyor = conveyor;

    // 3. the career road
    setProgress(0.5);
    await nextFrame();
    buildJourney(this.kit);

    // 4. right-hand districts
    setProgress(0.64);
    await nextFrame();
    buildLabAndTower(this.kit);
    buildTelemetry(this.kit);

    // 5. front districts
    setProgress(0.74);
    await nextFrame();
    buildWorkshop(this.kit);
    buildAbout(this.kit);
    buildContact(this.kit);

    // 6. signs, greenery and life
    setProgress(0.84);
    await nextFrame();
    this.addSigns();
    this.addGreenery();
    this.addDressing();
    this.addLife();

    // 7. lens and demo callbacks
    setProgress(0.9);
    await nextFrame();
    this.post = new PaperPost(renderer, scene, camera, {
      focusBand: LENS.focusBand, ramp: LENS.ramp, maxBlur: LENS.maxBlur, nearGain: LENS.nearGain, farGain: LENS.farGain,
      depthWeight: LENS.depthWeight, exposure: LENS.exposure, contrast: LENS.contrast, saturation: LENS.saturation,
      tint: [...LENS.tint] as [number, number, number], greenDesat: LENS.greenDesat, shadowTint: LENS.shadowTint, shadowLift: LENS.shadowLift,
      ao: LENS.ao, aoRadius: LENS.aoRadius, aoTint: LIGHT.ao, haze: LIGHT.haze, hazeStart: LENS.hazeStart, hazeEnd: LENS.hazeEnd,
      hazeAmount: LENS.hazeAmount, vignette: LENS.vignette, vignetteColor: LENS.vignetteColor, grain: LENS.grain,
      falloff: LENS.falloff, edgeLine: LENS.edgeLine, edgeLineColor: '#c8ae8e', edgeLinePx: 1.2, sharpen: 0.25,
    });
    this.post.setSize(innerWidth, innerHeight);
    this.post.focus.copy(this.cam.target);

    this.conveyor.onStage = (i, label) => {
      this.ui.setDemo({ running: true, stage: i, label, progress: this.conveyor.progress });
    };
    this.conveyor.onDone = () => {
      this.demoRunning = false;
      this.ui.setDemo({ running: false, stage: 7, label: 'PR READY', progress: 1 });
      this.ui.updateDemoButton(false);
      this.demoHideAt = this.t + 6;
    };

    this.bindInput();
    addEventListener('resize', () => this.onResize());

    // the paper settles: a slow camera ease from a touch further out into the authored view
    this.tweenTo(homeTarget.clone(), homeDist, 0, this.mobile ? 54 : 45, 2.2);
    this.cam.dist = homeDist * 1.08;
    this.cam.pitch = (this.mobile ? 54 : 45) + 2;
    this.cam.target.copy(homeTarget);
    this.tween = { t: 0, dur: 2.2, from: { target: homeTarget.clone(), dist: homeDist * 1.08, yaw: 0, pitch: (this.mobile ? 54 : 45) + 2 }, to: { target: homeTarget.clone(), dist: homeDist, yaw: 0, pitch: this.mobile ? 54 : 45 } };

    setProgress(1);
    await nextFrame();
    this.ready = true;
    this.renderer.setAnimationLoop((now) => this.frame(now));
    (window as any).__paperworld = {
      ready: true, scene, camera, post: this.post, kit: this.kit, focus: (id: string) => this.focus(id), overview: () => this.overview(),
      conveyor: this.conveyor, hotspots: HOTSPOTS,
      /** Debug/capture: jump the camera straight to a place (no tween). */
      jump: (id: string) => {
        const h = HOTSPOTS.find((x) => x.id === id);
        if (!h) return;
        this.tween = null;
        this.cam = { target: new THREE.Vector3(...h.target), dist: h.dist, yaw: 0, pitch: 44 };
        this.goal = { target: this.cam.target.clone(), dist: h.dist, yaw: 0, pitch: 44 };
        this.placeCamera();
      },
      settle: () => { this.tween = null; this.cam.dist = this.goal.dist; this.cam.target.copy(this.goal.target); this.cam.yaw = this.goal.yaw; this.cam.pitch = this.goal.pitch; this.placeCamera(); },
      stats: () => ({ cards: this.kit.pickables.length, roots: this.kit.roots.length }),
      /** Debug: screen position (CSS px) of a hotspot's sign, for scripted clicks. */
      screenOf: (id: string) => {
        const root = this.kit.signs[id];
        const p = new THREE.Vector3();
        if (root) { root.getWorldPosition(p); p.y += 1.6; }
        else { const h = HOTSPOTS.find((x) => x.id === id); if (!h) return null; p.set(...h.target); }
        p.project(this.camera);
        const r = this.renderer.domElement.getBoundingClientRect();
        return { x: r.left + (p.x * 0.5 + 0.5) * r.width, y: r.top + (-p.y * 0.5 + 0.5) * r.height };
      },
    };
  }

  private paper: any = null;

  /* ------------------------------------------------------------------ camera */

  private fitDistance(): number {
    const aspect = innerWidth / innerHeight;
    const target = new THREE.Vector3(0, 6.6, 0.6);
    const pts: THREE.Vector3[] = [];
    for (const x of [-36.4, 36.4]) for (const z of [-27.4, 27.4]) for (const y of [0, 7, 12]) pts.push(new THREE.Vector3(x, y, z));
    return this.fitPoints(target, pts, 45);
  }

  /** A closer portrait framing: the factory, the conveyor and the front plaza fill the phone. */
  private mobileHomeDist(): number {
    const target = new THREE.Vector3(0, 5.2, 3.0);
    const pts: THREE.Vector3[] = [];
    for (const x of [-25, 25]) for (const z of [-23, 24]) for (const y of [0, 7, 12]) pts.push(new THREE.Vector3(x, y, z));
    return this.fitPoints(target, pts, 54);
  }

  private fitPoints(target: THREE.Vector3, pts: THREE.Vector3[], pitchDeg: number): number {
    const aspect = innerWidth / innerHeight;
    const cam = new THREE.PerspectiveCamera(26, aspect, 1, 2000);
    const pitch = rad(pitchDeg);
    let d = 70;
    for (let i = 0; i < 90; i++) {
      cam.position.set(target.x, target.y + Math.sin(pitch) * d, target.z + Math.cos(pitch) * d);
      cam.lookAt(target);
      cam.updateMatrixWorld();
      cam.updateProjectionMatrix();
      let ok = true;
      for (const p of pts) {
        const v = p.clone().project(cam);
        if (Math.abs(v.x) > 0.975 || Math.abs(v.y) > 0.955) { ok = false; break; }
      }
      if (ok) break;
      d *= 1.045;
    }
    return d;
  }

  private placeCamera() {
    const yaw = rad(this.cam.yaw + this.par.x);
    const pitch = rad(clamp(this.cam.pitch + this.par.y, 36, 55));
    const cp = Math.cos(pitch);
    this.camera.position.set(
      this.cam.target.x + Math.sin(yaw) * cp * this.cam.dist,
      this.cam.target.y + Math.sin(pitch) * this.cam.dist,
      this.cam.target.z + Math.cos(yaw) * cp * this.cam.dist,
    );
    this.camera.lookAt(this.cam.target);
  }

  private tweenTo(target: THREE.Vector3, dist: number, yaw = 0, pitch = 45, dur = 1.0) {
    this.tween = {
      t: 0, dur,
      from: { target: this.cam.target.clone(), dist: this.cam.dist, yaw: this.cam.yaw, pitch: this.cam.pitch },
      to: { target: target.clone(), dist, yaw, pitch },
    };
    this.goal = { target: target.clone(), dist, yaw, pitch };
  }

  overview() {
    this.activeId = null;
    document.body.classList.remove('is-focused');
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    this.tweenTo(this.overviewTarget.clone(), this.overviewDist, 0, 45, 1.1);
    this.ui.setActiveChip(null);
  }

  focus(id: string, open = true) {
    const h = HOTSPOTS.find((x) => x.id === id);
    if (!h) return;
    this.activeId = id;
    document.body.classList.add('is-focused');
    const target = new THREE.Vector3(...h.target);
    // with the drawer open on a wide screen, aim right of the subject so it stays in the free left half
    if (open && innerWidth > 900) {
      const halfW = h.dist * Math.tan(rad(this.camera.fov) / 2) * this.camera.aspect;
      target.x += halfW * 0.3;
    }
    this.tweenTo(target, h.dist, 0, h.id === 'agents' ? 40 : 44, 0.95);
    for (const r of this.kit.roots) if (r.id === id) r.kickAt = this.t;
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    if (open) this.openPanel(h.panel, id);
    this.ui.setActiveChip(id);
  }

  private openPanel(panelId: string, hotspotId: string) {
    this.ui.openPanel(panelId, hotspotId);
    if (panelId === 'agents') {
      this.ui.injectDemoControls(this.demoRunning, () => this.toggleDemo());
      if (!this.demoRunning) this.startDemo();
    }
  }

  private onResize() {
    const w = innerWidth, h = innerHeight;
    this.mobile = w <= 780;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.mobile ? 1.5 : 1.85));
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post?.setSize(w, h);
    this.overviewDist = this.fitDistance();
    if (!this.activeId && !this.tween) {
      this.cam.dist = this.goal.dist = this.overviewDist;
    }
  }

  /* ------------------------------------------------------------------ signs + dressing */

  private addSigns() {
    const signs: any[] = [
      { id: 'factory', x: -17.6, z: 15.8, title: 'T1 AI FACTORY', sub: 'Internal AI platform', kicker: 'T1', accent: C.terracotta, yaw: 0.24, scale: 0.86 },
      { id: 'journey', x: -30.8, z: 20.6, title: 'MY JOURNEY', sub: 'Frontend → AI systems', kicker: 'Experience', accent: C.terracotta, yaw: 0.52, scale: 0.8 },
      { id: 'workshop', x: -26.2, z: 24.0, title: 'TECH STACK', sub: 'Tools by craft', kicker: 'Workshop', accent: C.ochre, yaw: 0.05, scale: 0.78 },
      { id: 'about', x: -22.4, z: -11.2, title: 'ABOUT ME', sub: 'The engineer', kicker: 'Paper & code', accent: C.sageDeep, yaw: 0.16, scale: 0.8 },
      { id: 'contact', x: 31.0, z: 22.4, title: 'CONTACT', sub: 'Send a letter', kicker: 'Post station', accent: C.terracotta, yaw: -0.9, scale: 0.78 },
      { id: 'mcp', x: 31.2, z: 5.8, title: 'MCP INTEGRATION', sub: 'Task · code · docs', kicker: 'Context', accent: C.blueDeep, yaw: -0.55, scale: 0.78 },
      { id: 'bench', x: 31.4, z: -5.0, title: 'R&D LAB', sub: 'Benchmarks · Spine', kicker: 'Research', accent: C.blueDeep, yaw: -0.42, scale: 0.78 },
      { id: 'telemetry', x: 30.6, z: 17.4, title: 'LLM TELEMETRY', sub: 'HTTP → PG → Kafka → S3', kicker: 'Analytics', accent: C.blueDeep, yaw: -0.75, scale: 0.78 },
    ];
    for (const s of signs) makeSign(this.kit, s);
  }

  private addGreenery() {
    const k = this.kit;
    const trees: [number, number, number, number][] = [
      [-33.2, -20.4, 1.15, 1], [-31.6, 10.6, 1.0, 2], [-33.4, -5.2, 1.1, 3], [-32.6, 19.4, 0.9, 4],
      [33.2, 18.6, 1.0, 5], [33.4, 6.6, 1.12, 6], [33.0, -7.6, 0.95, 7], [31.4, -21.0, 1.05, 8],
      [20.4, -22.6, 1.0, 9], [8.4, -22.4, 1.15, 10], [-10.6, -22.8, 0.95, 11], [13.4, -22.6, 1.0, 12],
      [-6.4, 23.4, 0.9, 13], [6.6, 23.8, 0.95, 14],
      [-30.2, -23.0, 1.1, 15], [-27.0, -22.4, 0.9, 16], [-19.4, -23.2, 1.0, 17], [-16.2, -21.8, 0.8, 18],
      [-31.6, -17.4, 0.85, 19], [-19.6, -18.2, 0.75, 20], [27.6, -22.8, 1.05, 21], [24.4, -23.2, 0.85, 22],
      [-31.8, 15.2, 0.95, 23], [-21.6, 10.6, 0.9, 24], [-24.4, 12.6, 0.8, 25], [21.2, 19.4, 0.9, 26],
    ];
    for (const [x, z, s, seed] of trees) {
      const t = treeTemplate(k, seed, seed % 3 === 0 ? 'conifer' : 'broad');
      t.position.set(x, 0, z);
      t.scale.setScalar(s * 1.38);
      t.rotation.y = (seed * 1.7) % 6.28;
      k.add(t);
    }
    const bushes: [number, number, number, number][] = [
      [-18.6, 6.6, 0.85, 21], [18.4, 6.8, 0.8, 22], [-32.4, 2.4, 0.75, 23], [31.8, -1.6, 0.7, 24],
      [-26.8, 20.8, 0.8, 25], [22.0, 18.0, 0.75, 26], [-21.4, -20.6, 0.7, 27], [15.6, -18.6, 0.65, 28],
      [-13.6, 21.8, 0.7, 29],
    ];
    for (const [x, z, s, seed] of bushes) {
      const b = bushTemplate(k, seed);
      b.position.set(x, 0, z);
      b.scale.setScalar(s * 1.15);
      b.rotation.y = seed * 0.7;
      k.add(b);
    }
    const lamps: [number, number][] = [
      [-23.4, 19.4], [-18.6, 7.4], [-19.6, -4.4], [13.6, 18.8], [20.4, 13.4], [22.6, 3.2], [18.4, -11.4], [-27.0, -4.6], [-12.0, 22.4], [11.2, 22.6],
    ];
    lamps.forEach(([x, z], i) => {
      const l = lampTemplate(k, i + 1);
      l.position.set(x, 0, z);
      l.rotation.y = i * 0.6;
      k.add(l);
    });
    // two small engineers walking the plaza
    const walkerA = personTemplate(k, C.terracotta, 31);
    const walkerB = personTemplate(k, C.blueDeep, 32);
    walkerA.scale.setScalar(1.1); walkerB.scale.setScalar(1.05);
    k.add(walkerA); k.add(walkerB);
    const pathA = [new THREE.Vector3(-19.2, 0, 3.2), new THREE.Vector3(-12.4, 0, 4.6), new THREE.Vector3(-11.6, 0, -0.6), new THREE.Vector3(-18.8, 0, -1.8)];
    const pathB = [new THREE.Vector3(18.8, 0, 4.2), new THREE.Vector3(13.6, 0, 5.0)];
    const walkOn = (w: THREE.Object3D, path: THREE.Vector3[], speed: number, phase: number) => {
      k.onStep((t) => {
        const per = path.length;
        const u = ((t * speed + phase) % per);
        const i = Math.floor(u), f = u - i;
        const a = path[i], b = path[(i + 1) % per];
        w.position.lerpVectors(a, b, f);
        w.position.y = Math.abs(Math.sin(t * 5.4 + phase)) * 0.05;
        w.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
        w.rotation.x = Math.sin(t * 5.4 + phase) * 0.015;
      });
    };
    walkOn(walkerA, pathA, 0.24, 0);
    walkOn(walkerB, pathB, 0.14, 1.3);

    // a delivery cart on the front apron
    const cart = new THREE.Group();
    const body = printedBox(k, {
      w: 2.6, h: 1.5, d: 1.5, seed: 41,
      front: (P: any) => {
        P.fill('#d9c9a8'); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 8 });
        P.layer((g: CanvasRenderingContext2D) => { g.fillStyle = C.blueDeep; g.fillRect(-1.05, 0.55, 2.1, 0.42); }, C.blueDeep, { rim: 0, shadow: 1 });
        P.layer((g: CanvasRenderingContext2D) => { g.fillStyle = C.terracotta; g.fillRect(-0.2, 0.2, 0.4, 0.22); }, C.terracotta, { rim: 0, shadow: 1 });
      },
      top: '#c6a87f',
    });
    cart.add(body);
    for (const [wx, wz] of [[-0.85, 0.62], [0.85, 0.62], [-0.85, -0.62], [0.85, -0.62]]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 10), k.kraft('#4a4136'));
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.3, wz);
      cart.add(wheel);
    }
    cart.position.set(16.6, 0, 22.2);
    cart.rotation.y = -0.5;
    k.add(cart);
  }

  private addDressing() {
    const k = this.kit;

    // the front plaza: a printed paper medallion, the model's welcome mat
    const mc = document.createElement('canvas');
    mc.width = mc.height = 512;
    const mg = mc.getContext('2d')!;
    mg.fillStyle = '#e0cfae'; mg.fillRect(0, 0, 512, 512);
    mg.translate(256, 256);
    for (const [r, col, lw] of [[246, 'rgba(150,112,72,0.55)', 4], [212, 'rgba(255,247,228,0.7)', 10], [176, 'rgba(150,112,72,0.4)', 3], [120, 'rgba(176,86,58,0.5)', 6]] as [number, string, number][]) {
      mg.strokeStyle = col; mg.lineWidth = lw;
      mg.beginPath(); mg.arc(0, 0, r, 0, Math.PI * 2); mg.stroke();
    }
    mg.strokeStyle = 'rgba(150,112,72,0.3)'; mg.lineWidth = 2;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      mg.beginPath(); mg.moveTo(Math.cos(a) * 128, Math.sin(a) * 128); mg.lineTo(Math.cos(a) * 244, Math.sin(a) * 244); mg.stroke();
    }
    mg.fillStyle = 'rgba(150,112,72,0.55)';
    mg.font = '700 26px Menlo, monospace'; mg.textAlign = 'center';
    mg.fillText('PAPER WORLD', 0, 8);
    const medTex = new THREE.CanvasTexture(mc);
    medTex.colorSpace = THREE.SRGBColorSpace;
    medTex.anisotropy = k.paper.map.anisotropy;
    const med = new THREE.Mesh(new THREE.CircleGeometry(6.4, 48), paperMaterial({ map: medTex, normalMap: k.paper.normalMap, normalScale: 0.4 }));
    med.rotation.x = -Math.PI / 2;
    med.position.set(0, 0.03, 19.6);
    med.receiveShadow = true;
    k.add(med);

    // planters and benches round the plaza and the front apron
    const planters: [number, number, number][] = [
      [-11.6, 16.8, 1], [12.6, 18.2, 2], [-20.8, 12.6, 3], [18.4, 15.4, 4],
      [-6.4, 24.4, 5], [6.4, 24.4, 6], [-6.6, 6.2, 7], [6.8, 6.2, 8],
      [-7.0, 14.8, 9], [7.0, 14.8, 10], [-12.4, 22.8, 11], [12.2, 22.6, 12], [16.4, 20.0, 13],
    ];
    for (const [x, z, seed] of planters) planter(k, { x, z, seed, scale: seed % 2 ? 1 : 0.85 });
    bench(k, { x: -7.4, z: 20.4, yaw: 1.25, seed: 41 });
    bench(k, { x: 7.4, z: 20.4, yaw: -1.25, seed: 42 });
    bench(k, { x: -24.4, z: 11.2, yaw: 1.3, seed: 43 });
    // barrels and crates at the working edges
    barrel(k, { x: -26.6, z: 12.8, seed: 51 });
    barrel(k, { x: -27.6, z: 13.6, seed: 52, h: 1.2 });
    barrel(k, { x: 30.2, z: 10.4, seed: 53 });
    barrel(k, { x: 31.0, z: 11.4, seed: 54, h: 1.25 });
    const crate = (x: number, z: number, s: number, seed: number) => {
      const c = printedBox(k, {
        w: 1.3, h: 1.0, d: 1.0, seed,
        front: (P: any) => {
          P.fill(C.kraft); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 8 });
          P.marks('panel', { color: 'rgba(255,244,222,0.5)', size: 0.14, density: 0.8 });
          P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.fillRect(-0.55, 0.36, 1.1, 0.16); }, C.cream, { rim: 0, shadow: 1 });
        },
        top: '#bb9468',
      });
      c.position.set(x, 0, z); c.scale.setScalar(s); c.rotation.y = seed * 0.3; k.add(c);
    };
    crate(-16.8, 20.8, 1.05, 61); crate(-15.6, 21.4, 0.8, 62); crate(-17.4, 21.9, 0.7, 63);
    crate(28.6, -9.8, 0.95, 64); crate(27.6, -10.4, 0.75, 65);
    crate(30.0, 18.4, 0.9, 66); crate(8.0, 15.8, 0.8, 67);
    crate(-9.6, 22.2, 0.85, 68); crate(-10.6, 22.9, 0.65, 69); crate(10.2, 22.4, 0.8, 70);

    // the message stone: a paper plinth with the site's one-line manifesto
    const mono = new THREE.Group();
    const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.05, 0.36, 16), k.kraft('#b99568'));
    base1.position.y = 0.18; base1.castShadow = base1.receiveShadow = true; mono.add(base1);
    const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.3, 16), k.kraft('#cba87a'));
    base2.position.y = 0.5; base2.castShadow = true; mono.add(base2);
    const stone = makeSign(k, {
      id: 'about', x: 0, z: 0, title: 'I BUILD SYSTEMS', sub: 'that help engineers build software', kicker: 'Paper World', accent: C.terracotta,
      w: 5.6, h: 3.2, postH: 0.6, scale: 1,
    });
    stone.position.set(0, 0.55, 0);
    mono.add(stone);
    mono.position.set(0, 0, 19.6);
    mono.rotation.y = 0.06;
    mono.scale.setScalar(1.12);
    k.add(mono);

    // a few people standing about: the model's scale figures
    const people: [number, number, string, number][] = [
      [-13.6, 15.4, C.sageDeep, 1.2], [3.4, 16.2, C.terracotta, 2.4], [19.0, 17.4, C.blueDeep, -1.4],
      [-26.0, 18.4, C.kraftDeep, 0.8], [8.6, -6.2, C.terracotta, 3.0],
    ];
    for (const [x, z, coat, yaw] of people) {
      const p = personTemplate(k, coat, Math.round(x * 3 + z));
      p.position.set(x, 0, z); p.rotation.y = yaw; p.scale.setScalar(1.0 + ((Math.abs(x) + Math.abs(z)) % 3) * 0.04);
      k.add(p);
    }

    // three small paper cars on the ring road (their own wheels, no prints: a cheap life cue)
    const car = (x: number, z: number, yaw: number, body: string, seed: number) => {
      const c = new THREE.Group();
      const base = printedBox(k, {
        w: 1.9, h: 0.62, d: 0.95, seed,
        front: (P: any) => { P.fill(body); P.innerShade('#3a2418', { alpha: 0.3, blurPx: 6 }); P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#dfeef4'; g2.fillRect(-0.55, 0.22, 0.5, 0.22); g2.fillRect(0.05, 0.22, 0.5, 0.22); }, '#dfeef4', { rim: 0, shadow: 1 }); },
        top: body,
      });
      c.add(base);
      const cab = printedBox(k, {
        w: 1.0, h: 0.5, d: 0.82, seed: seed + 1,
        front: (P: any) => { P.fill(body); P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#cfe6ef'; g2.fillRect(-0.4, 0.12, 0.8, 0.26); }, '#cfe6ef', { rim: 0, shadow: 1 }); },
        top: body,
      });
      cab.position.set(-0.1, 0.62, 0);
      c.add(cab);
      for (const [wx, wz] of [[-0.66, 0.5], [0.66, 0.5], [-0.66, -0.5], [0.66, -0.5]]) {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.14, 8), k.kraft('#3f3a33'));
        wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.26, wz);
        c.add(wh);
      }
      c.position.set(x, 0, z); c.rotation.y = yaw;
      k.add(c);
    };
    car(-24.6, 18.2, 0.3, C.terracotta, 81);
    car(18.6, -10.6, -1.2, C.sageDeep, 82);
    car(21.8, 7.6, 1.9, C.blueDeep, 83);

    // big blurred foreground plants at the front corners: the macro lens's near edge
    const bigPlant = treeTemplate(k, 77, 'broad');
    bigPlant.position.set(-33.4, 0, 24.6); bigPlant.scale.setScalar(1.7); bigPlant.rotation.y = 0.6; k.add(bigPlant);
    const bigBush = bushTemplate(k, 78);
    bigBush.position.set(28.2, 0, 25.2); bigBush.scale.setScalar(1.65); k.add(bigBush);
    const bigBush2 = bushTemplate(k, 79);
    bigBush2.position.set(-28.6, 0, 25.4); bigBush2.scale.setScalar(1.3); k.add(bigBush2);
  }

  private addLife() {
    const k = this.kit;
    // paper clouds drifting over the model
    const clouds: { m: THREE.Object3D; y: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const c = cloudTemplate(k, 60 + i, 0.8 + (i % 3) * 0.3);
      c.position.set(i < 3 ? -46 + i * 12 : 26 + (i - 3) * 10, 29 + (i % 3) * 2.4, -24 + (i % 4) * 11);
      c.traverse((o: any) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
      k.add(c);
      clouds.push({ m: c, y: c.position.y, speed: 0.28 + (i % 3) * 0.13 });
    }
    k.onStep((t, dt) => {
      clouds.forEach((cl, i) => {
        cl.m.position.x += dt * cl.speed;
        if (cl.m.position.x > 46) cl.m.position.x = -46;
        cl.m.position.y = cl.y + Math.sin(t * 0.22 + i) * 0.35;
        cl.m.rotation.z = Math.sin(t * 0.14 + i) * 0.012;
      });
    });

    // steam from the factory stacks: small paper curls, three per stack
    const stacks: [number, number, number][] = [[-8.8, 4.35, -2.6], [8.8, 3.5, -1.4]];
    stacks.forEach(([x, top, z], si) => {
      for (let i = 0; i < 3; i++) {
        const puff = makeSignPuff(k, si * 3 + i);
        puff.position.set(x, top + 4.6, z);
        k.add(puff);
        const phase = i / 3 + si * 0.17;
        const startY = top + 0.2;
        k.onStep((t) => {
          const cycle = 4.5;
          const u = ((t / cycle + phase) % 1);
          puff.position.y = startY + u * 4.2;
          puff.position.x = x + Math.sin(u * 5 + phase * 9) * 0.25;
          puff.rotation.y = u * 2.4 + phase * 3;
          puff.visible = u < 0.92;
        });
      }
    });

    // idle robots near the lab and the workshop
    const r1 = robotTemplate(k, C.blueDeep);
    r1.position.set(21.4, 0.02, -5.6); r1.rotation.y = 2.6;
    k.add(r1);
    const r2 = robotTemplate(k, C.terracotta);
    r2.position.set(-17.6, 0.02, 20.2); r2.rotation.y = -2.2;
    k.add(r2);
    k.onStep((t) => {
      r1.rotation.y = 2.6 + Math.sin(t * 0.5) * 0.25;
      r2.rotation.y = -2.2 + Math.sin(t * 0.4 + 2) * 0.2;
      r1.position.y = 0.02 + Math.abs(Math.sin(t * 1.2)) * 0.01;
    });
  }

  /* ------------------------------------------------------------------ input */

  private bindInput() {
    const el = this.renderer.domElement;
    el.addEventListener('pointermove', (e) => this.onPointerMove(e));
    el.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    el.addEventListener('pointerup', (e) => this.onPointerUp(e));
    el.addEventListener('pointercancel', () => { this.pointers.clear(); this.pointer.down = false; this.pinch = null; });
    el.addEventListener('pointerleave', () => { if (!this.pointer.down) this.setHover(null); this.ui.hideTooltip(); });
    el.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private ndc(e: PointerEvent): [number, number] {
    const r = this.renderer.domElement.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
  }

  private pick(e: PointerEvent): string | null {
    const [nx, ny] = this.ndc(e);
    this.raycaster.setFromCamera(new THREE.Vector2(nx, ny), this.camera);
    const hits = this.raycaster.intersectObjects(this.kit.pickables, false);
    if (!hits.length) return null;
    let o: any = hits[0].object;
    while (o && !o.userData.hotspot) o = o.parent;
    return o?.userData.hotspot ?? null;
  }

  private setHover(id: string | null) {
    if (id === this.hoverId) return;
    this.hoverId = id;
    const el = this.renderer.domElement;
    el.style.cursor = id ? 'pointer' : this.pointer.down ? 'grabbing' : 'grab';
    if (!id) this.ui.hideTooltip();
    else {
      const h = HOTSPOTS.find((x) => x.id === id)!;
      this.ui.showTooltip(this.ui.t(h.label), this.ui.t(h.hint), this.px, this.py);
    }
  }

  private onPointerMove(e: PointerEvent) {
    this.px = e.clientX; this.py = e.clientY;
    this.par.tx = (e.clientX / innerWidth - 0.5) * 2;
    this.par.ty = (e.clientY / innerHeight - 0.5) * 2;
    if (this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (!this.pinch) { this.pinch = { d, dist: this.cam.dist }; this.pinchUsed = true; }
      else {
        const k = clamp(this.pinch.d / Math.max(30, d), 0.75, 1.35);
        this.goal.dist = this.pinch.dist * k;
        this.tween = null;
      }
      return;
    }
    if (this.pointer.down) {
      const dx = e.clientX - this.pointer.x, dy = e.clientY - this.pointer.y;
      this.pointer.x = e.clientX; this.pointer.y = e.clientY;
      this.pointer.moved += Math.abs(dx) + Math.abs(dy);
      this.tween = null;
      this.cam.yaw = clamp(this.cam.yaw - dx * 0.05, -13, 13);
      this.cam.pitch = clamp(this.cam.pitch + dy * 0.035, 37, 53);
      this.goal.yaw = this.cam.yaw; this.goal.pitch = this.cam.pitch;
      return;
    }
    const now = performance.now();
    if (now - this.lastRay < 45) return;
    this.lastRay = now;
    const id = this.pick(e);
    this.setHover(id);
    if (id && this.hoverId === id) {
      const h = HOTSPOTS.find((x) => x.id === id)!;
      this.ui.showTooltip(this.ui.t(h.label), this.ui.t(h.hint), e.clientX, e.clientY);
    }
  }

  private onPointerDown(e: PointerEvent) {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    this.renderer.domElement.setPointerCapture(e.pointerId);
    if (this.pointers.size === 1) {
      this.pointer.down = true;
      this.pointer.x = e.clientX; this.pointer.y = e.clientY;
      this.pointer.moved = 0;
    }
  }

  private onPointerUp(e: PointerEvent) {
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    const wasDown = this.pointer.down && this.pointer.moved < 8 && !this.pinchUsed;
    this.pointer.down = this.pointers.size > 0;
    this.renderer.domElement.style.cursor = 'grab';
    if (this.pointers.size === 0) this.pinchUsed = false;
    if (!wasDown) return;
    const id = this.pick(e);
    if (id) this.focus(id);
    else {
      this.ui.closePanel(false);
      this.overview();
    }
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const base = this.activeId ? (HOTSPOTS.find((h) => h.id === this.activeId)?.dist ?? this.cam.dist) : this.overviewDist;
    this.goal.dist = clamp(this.goal.dist * Math.pow(1.0012, e.deltaY), base * 0.62, base * 1.5);
    this.tween = null;
  }

  /* ------------------------------------------------------------------ demo */

  startDemo() {
    this.conveyor.run();
    this.demoRunning = true;
    this.ui.setDemo({ running: true, stage: 0, label: 'TASK', progress: 0 });
    this.ui.updateDemoButton(true);
  }

  stopDemo() {
    this.conveyor.stop();
    this.demoRunning = false;
    this.ui.setDemo({ running: false, stage: 0, label: '', progress: 0 });
    this.ui.updateDemoButton(false);
  }

  toggleDemo() {
    if (this.demoRunning) this.stopDemo();
    else this.startDemo();
  }

  /* ------------------------------------------------------------------ loop */

  private frame(now: number) {
    const dt = clamp((now - this.last) / 1000, 0, 0.05);
    this.last = now;
    this.t += dt;

    // camera tween
    if (this.tween) {
      const tw = this.tween;
      tw.t += dt;
      const k = easeInOut(clamp(tw.t / tw.dur, 0, 1));
      this.cam.target.lerpVectors(tw.from.target, tw.to.target, k);
      this.cam.dist = tw.from.dist + (tw.to.dist - tw.from.dist) * k;
      this.cam.yaw = tw.from.yaw + (tw.to.yaw - tw.from.yaw) * k;
      this.cam.pitch = tw.from.pitch + (tw.to.pitch - tw.from.pitch) * k;
      if (tw.t >= tw.dur) { this.tween = null; this.goal = { target: this.cam.target.clone(), dist: this.cam.dist, yaw: this.cam.yaw, pitch: this.cam.pitch }; }
    } else {
      this.cam.dist += (this.goal.dist - this.cam.dist) * (1 - Math.exp(-dt * 8));
    }

    // bobbing / drag offsets
    if (!this.reduced) {
      const amp = this.tween ? 0 : 1;
      this.par.x += ((this.par.tx * 1.1 * amp) - this.par.x) * (1 - Math.exp(-dt * 2.2));
      this.par.y += ((-this.par.ty * 0.55 * amp) - this.par.y) * (1 - Math.exp(-dt * 2.2));
    }

    // hover lifts
    for (const r of this.kit.roots) {
      const target = this.hoverId === r.id ? r.lift : 0;
      r.hover += (target - r.hover) * (1 - Math.exp(-dt * 14));
      const age = this.t - r.kickAt;
      const kick = age >= 0 && age < 1.4 ? Math.sin(age * 19) * Math.exp(-age * 4.2) * 0.22 : 0;
      if (r.lift > 0 || kick) r.obj.position.y = r.baseY + r.hover + kick;
    }

    // demo caption auto-hide
    if (this.demoHideAt && this.t > this.demoHideAt) {
      this.demoHideAt = 0;
      this.ui.setDemo({ running: false, stage: 0, label: '', progress: 0 });
    }

    this.placeCamera();
    for (const s of this.kit.steps) { if (this.reduced && s.ambient && !this.demoRunning) continue; s.fn(this.t, dt); }
    if (this.post) {
      this.post.focus.lerp(this.cam.target, 1 - Math.exp(-dt * 6));
      this.post.render(this.t);
    }
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

/** A small printed paper puff for steam (kept separate from signs: no hotspot, no lift). */
function makeSignPuff(kit: WorldKit, seed: number) {
  const g = new THREE.Group();
  // build a tiny lobed cloud from the kit's cloud template at a smaller scale
  const c = cloudTemplate(kit, 200 + seed, 0.22 + (seed % 3) * 0.04);
  c.rotation.x = -0.2;
  c.traverse((o: any) => { if (o.isMesh) { o.castShadow = false; } });
  g.add(c);
  return g;
}
