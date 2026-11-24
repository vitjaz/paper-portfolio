import './styles.css';
import version from './scene/version';
import { UI } from './ui/ui';
import { Diorama } from './scene/diorama';
import { paperSheet } from './papercraft/lib/paperkit-2d.js';

const ui = new UI({
  onNavigate: (id) => diorama?.focus(id),
  onReset: () => { diorama?.overview(); ui.setActiveChip(null); },
  onToggleDemo: () => diorama?.toggleDemo(),
  onLocale: () => {
    if (!diorama) return;
    if (ui.currentPanel === 'agents') ui.injectDemoControls(diorama.conveyor.running, () => diorama.toggleDemo());
    if (diorama.hoverId) {
      const h = diorama.hotspots.find((x) => x.id === diorama!.hoverId);
      if (h) ui.showTooltip(ui.t(h.label), ui.t(h.hint), 0, 0);
    }
  },
});

let diorama: Diorama | null = null;

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2')) || !!c.getContext('webgl');
  } catch { return false; }
}

function paperTextureVar() {
  try {
    const c = paperSheet({ size: 256, color: '#fffaf0', seed: 12, fibres: 0.9, mottle: 0.05 }) as HTMLCanvasElement;
    document.documentElement.style.setProperty('--paper-tex', `url(${c.toDataURL('image/png')})`);
  } catch { /* the page still reads as paper without it */ }
}

async function boot() {
  paperTextureVar();
  ui.init();
  ui.setLocale(ui.locale);
  ui.loader(0.02);

  if (!webglAvailable()) {
    ui.fallback();
    console.warn(`paper world: WebGL unavailable (${version})`);
    return;
  }

  diorama = new Diorama(document.getElementById('stage')!, ui);
  try {
    await diorama.build((p, label) => ui.loader(p, label));
    ui.hideLoader();
    // deep links: #about, #contact … open the matching district once the world is up
    const hash = location.hash.replace('#', '');
    if (hash && diorama.hotspots.some((h) => h.id === hash)) {
      setTimeout(() => diorama!.focus(hash), 500);
    }
    console.info(`PAPER WORLD ${version} — ${diorama.hotspots.length} places · build ${Math.round(performance.now())} ms`);
  } catch (err) {
    console.error('paper world: build failed', err);
    ui.fallback();
  }
}

addEventListener('hashchange', () => {
  const id = location.hash.replace('#', '');
  if (id && diorama?.hotspots.some((h) => h.id === id)) diorama.focus(id);
  else if (!id) diorama?.overview();
});

boot();
