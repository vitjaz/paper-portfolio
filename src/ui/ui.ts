/**
 * The page around the model: paper chips, a paper drawer, a paper loading card.
 * All copy comes from src/data/portfolio.ts; this file only renders it.
 */
import { HOTSPOTS, PANELS, SITE, UI as COPY, type Bi, type Locale, EXPERIENCE_ORDER } from '../data/portfolio';

export interface UIOptions {
  onNavigate: (hotspotId: string) => void;
  onReset: () => void;
  onToggleDemo: () => void;
  onLocale: (locale: Locale) => void;
}

const $ = (id: string) => document.getElementById(id)!;

export class UI {
  locale: Locale = 'en';
  private opts: UIOptions;
  private activeHotspot: string | null = null;
  private openPanelId: string | null = null;

  constructor(opts: UIOptions) {
    this.opts = opts;
    const saved = localStorage.getItem('paper-world-locale');
    if (saved === 'ru' || saved === 'en') this.locale = saved;
    else if ((navigator.language || '').toLowerCase().startsWith('ru')) this.locale = 'ru';
  }

  t(b: Bi | string | undefined | null): string {
    if (!b) return '';
    return typeof b === 'string' ? b : b[this.locale] || b.en;
  }

  init() {
    this.renderChrome();

    $('lang').addEventListener('click', () => {
      this.setLocale(this.locale === 'en' ? 'ru' : 'en');
    });
    $('reset').addEventListener('click', () => this.opts.onReset());
    $('panel-close').addEventListener('click', () => this.closePanel(true));
    $('explore-toggle').addEventListener('click', () => this.toggleExplore());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.openPanelId) { this.closePanel(true); }
        else if (!$('explore-panel').hidden) this.toggleExplore(false);
      }
    });
    document.addEventListener('click', (e) => {
      const el = e.target as HTMLElement;
      if (!el.closest('.explore-panel') && !el.closest('#explore-toggle') && !$('explore-panel').hidden) this.toggleExplore(false);
    });
  }

  setLocale(l: Locale) {
    this.locale = l;
    localStorage.setItem('paper-world-locale', l);
    this.renderChrome();
    if (this.openPanelId) this.renderPanel(this.openPanelId);
    this.opts.onLocale(l);
    const lang = $('lang');
    lang.textContent = l === 'en' ? 'RU' : 'EN';
    lang.setAttribute('aria-label', l === 'en' ? 'Switch to Russian' : 'Переключить на английский');
    document.documentElement.lang = l;
  }

  private renderChrome() {
    $('masthead-claim').textContent = this.t(SITE.claim);
    $('masthead-welcome').textContent = this.t(SITE.welcome);
    $('masthead-cta').textContent = this.t(SITE.cta);
    const role = document.querySelector('.masthead .role');
    if (role) role.textContent = this.t(SITE.role);
    $('lang').textContent = this.locale === 'en' ? 'RU' : 'EN';
    $('reset').textContent = this.t(COPY.reset);
    $('explore-toggle').textContent = this.t(COPY.explore);
    $('hint').textContent = matchMedia('(pointer: coarse)').matches ? this.t(COPY.hintTouch) : `${this.t(SITE.cta)}  ·  ${this.t(COPY.hint)}`;
    $('panel-close').setAttribute('aria-label', this.t(COPY.close));
    $('loader-title').textContent = this.t(COPY.loading.title);
    $('loader-hint').textContent = this.t(COPY.loading.hint);
    $('fallback-text').textContent = this.t(COPY.loading.fallback);

    const chips = $('chips');
    chips.innerHTML = '';
    const nav: { id: string; label: Bi }[] = [
      { id: 'about', label: COPY.nav.about },
      { id: 'journey', label: COPY.nav.experience },
      { id: 'factory', label: COPY.nav.t1 },
      { id: 'workshop', label: COPY.nav.stack },
      { id: 'contact', label: COPY.nav.contact },
    ];
    for (const n of nav) {
      const b = document.createElement('button');
      b.className = 'chip';
      b.type = 'button';
      b.dataset.hotspot = n.id;
      b.innerHTML = `<span class="chip__dot" aria-hidden="true"></span>${this.t(n.label)}`;
      b.addEventListener('click', () => this.opts.onNavigate(n.id));
      chips.appendChild(b);
    }

    const list = $('explore-list');
    list.innerHTML = '';
    const ordered = [...HOTSPOTS].sort((a, b) => this.t(a.label).localeCompare(this.t(b.label)));
    for (const h of ordered) {
      const b = document.createElement('button');
      b.className = 'explore-item';
      b.type = 'button';
      b.innerHTML = `<span>${this.t(h.label)}</span><span>${this.t(h.hint)}</span>`;
      b.addEventListener('click', () => { this.toggleExplore(false); this.opts.onNavigate(h.id); });
      list.appendChild(b);
    }
    this.setActiveChip(this.activeHotspot);
  }

  private toggleExplore(force?: boolean) {
    const el = $('explore-panel');
    const open = force ?? el.hidden;
    el.hidden = !open;
    $('explore-toggle').setAttribute('aria-expanded', String(open));
    if (open) {
      el.scrollTop = 0;
      // move focus into the list for keyboard users
      const first = el.querySelector<HTMLButtonElement>('.explore-item');
      first?.focus({ preventScroll: true });
    }
  }

  setActiveChip(hotspotId: string | null) {
    this.activeHotspot = hotspotId;
    const panelId = hotspotId ? HOTSPOTS.find((h) => h.id === hotspotId)?.panel : null;
    document.querySelectorAll<HTMLElement>('.chip').forEach((c) => {
      const id = c.dataset.hotspot!;
      const sameSection =
        id === hotspotId ||
        (panelId && id === 'journey' && panelId === 'experience') ||
        (panelId && id === 'factory' && ['t1', 'ide', 'agents', 'bench', 'security', 'mcp'].includes(panelId)) ||
        (panelId && id === 'workshop' && panelId === 'stack');
      c.setAttribute('aria-current', sameSection ? 'true' : 'false');
    });
  }

  showTooltip(title: string, hint: string, x: number, y: number) {
    const el = $('tooltip');
    $('tooltip-kicker').textContent = this.t(COPY.explore);
    $('tooltip-title').textContent = title;
    $('tooltip-hint').textContent = hint;
    el.hidden = false;
    const pad = 16;
    const w = 250;
    el.style.left = Math.min(window.innerWidth - w - pad, Math.max(pad, x)) + 'px';
    el.style.top = Math.min(window.innerHeight - 90, Math.max(pad, y)) + 'px';
  }

  hideTooltip() { $('tooltip').hidden = true; }

  openPanel(panelId: string, hotspotId: string | null = null) {
    this.openPanelId = panelId;
    this.renderPanel(panelId);
    this.setActiveChip(hotspotId);
    const el = $('panel');
    el.hidden = false;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    $('panel-scroll').scrollTop = 0;
    this.hideTooltip();
    // focus the close button for keyboard users (but not on touch, where it steals the scroll)
    if (!matchMedia('(pointer: coarse)').matches) setTimeout(() => $('panel-close').focus({ preventScroll: true }), 30);
  }

  closePanel(notify = false) {
    const was = this.openPanelId;
    this.openPanelId = null;
    $('panel').hidden = true;
    this.setActiveChip(null);
    if (notify && was) this.opts.onReset();
  }

  get currentPanel() { return this.openPanelId; }

  private renderPanel(panelId: string) {
    const p = PANELS[panelId];
    if (!p) return;
    $('panel-eyebrow').textContent = this.t(p.eyebrow);
    $('panel-title').textContent = this.t(p.title);
    $('panel-lead').textContent = this.t(p.lead);

    const body = $('panel-body');
    body.innerHTML = '';
    for (const block of p.blocks) {
      if (block.kind === 'p' && block.text) {
        const el = document.createElement('p');
        el.textContent = this.t(block.text);
        body.appendChild(el);
      } else if (block.kind === 'list' && block.items) {
        const ul = document.createElement('ul');
        for (const it of block.items) {
          const li = document.createElement('li');
          const txt = this.t(it);
          const m = txt.match(/^([^—:.]{3,42})(\s*[—:]\s*)(.+)$/);
          if (m) li.innerHTML = `<b>${escapeHtml(m[1])}</b>${escapeHtml(m[2])}${escapeHtml(m[3])}`;
          else li.textContent = txt;
          ul.appendChild(li);
        }
        body.appendChild(ul);
      } else if (block.kind === 'metrics' && block.metrics) {
        const grid = document.createElement('div');
        grid.className = 'metrics';
        for (const m of block.metrics) {
          const d = document.createElement('div');
          d.className = 'metric';
          d.innerHTML = `<span class="metric__value">${escapeHtml(m.value)}</span><span class="metric__label">${escapeHtml(this.t(m.label))}</span>`;
          grid.appendChild(d);
        }
        body.appendChild(grid);
      } else if (block.kind === 'tags' && block.tags) {
        const wrap = document.createElement('div');
        wrap.className = 'tags';
        if (block.tagLabel) {
          const lb = document.createElement('p');
          lb.className = 'tags__label';
          lb.textContent = this.t(block.tagLabel);
          wrap.appendChild(lb);
        }
        const list = document.createElement('div');
        list.className = 'tags__list';
        for (const tag of block.tags) {
          const s = document.createElement('span');
          s.className = 'tag';
          s.textContent = tag;
          list.appendChild(s);
        }
        wrap.appendChild(list);
        body.appendChild(wrap);
      } else if (block.kind === 'note' && block.text) {
        const el = document.createElement('div');
        el.className = 'note';
        el.textContent = this.t(block.text);
        body.appendChild(el);
      }
    }

    // the experience panel gets the career timeline as buttons
    if (panelId === 'experience') {
      const ul = document.createElement('div');
      ul.className = 'tags';
      const lb = document.createElement('p');
      lb.className = 'tags__label';
      lb.textContent = this.locale === 'en' ? 'Positions' : 'Позиции';
      ul.appendChild(lb);
      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.gap = '6px';
      for (const job of EXPERIENCE_ORDER) {
        const hp = HOTSPOTS.find((h) => h.panel === job.panel);
        const b = document.createElement('button');
        b.className = 'related-btn';
        b.type = 'button';
        b.style.textAlign = 'left';
        b.innerHTML = `<b>${escapeHtml(job.job)}</b><br><span style="font-weight:400;opacity:.7">${escapeHtml(job.period)}</span>`;
        b.addEventListener('click', () => hp && this.opts.onNavigate(hp.id));
        list.appendChild(b);
      }
      ul.appendChild(list);
      body.appendChild(ul);
    }

    const rel = $('panel-related');
    rel.innerHTML = '';
    if (p.related?.length) {
      const label = document.createElement('p');
      label.className = 'tags__label';
      label.textContent = this.locale === 'en' ? 'Continue' : 'Дальше';
      label.style.width = '100%';
      rel.appendChild(label);
      for (const id of p.related) {
        const target = PANELS[id];
        const hp = HOTSPOTS.find((h) => h.panel === id);
        if (!target) continue;
        const b = document.createElement('button');
        b.className = 'related-btn';
        b.type = 'button';
        b.textContent = this.t(target.title);
        b.addEventListener('click', () => hp && this.opts.onNavigate(hp.id));
        rel.appendChild(b);
      }
    }

    const links = $('panel-links');
    links.innerHTML = '';
    if (p.links?.length) {
      for (const l of p.links) {
        const a = document.createElement('a');
        a.href = l.href;
        a.target = l.href.startsWith('mailto:') ? '_self' : '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `<span>${escapeHtml(l.label)}</span><span>↗</span>`;
        links.appendChild(a);
      }
    }
  }

  setDemo(state: { running: boolean; stage: number; label: string; progress: number }) {
    // a small live caption at the bottom left, so the conveyor can be watched with the drawer closed
    let cap = document.getElementById('demo-caption');
    if (!cap) {
      cap = document.createElement('div');
      cap.id = 'demo-caption';
      cap.className = 'demo-caption';
      document.body.appendChild(cap);
    }
    if (!state.running && state.progress <= 0) { cap.hidden = true; return; }
    cap.hidden = false;
    const title = this.t(COPY.conveyor.title);
    const st = this.t(COPY.conveyor.step);
    const total = 8;
    cap.innerHTML = `<b>${escapeHtml(title)}</b><span>${st} ${Math.max(1, state.stage + 1)}/${total} · ${escapeHtml(state.label)}</span>`;
    cap.style.setProperty('--p', `${Math.round(state.progress * 100)}%`);
  }

  loader(progress: number, title?: string) {
    $('loader-bar').style.width = `${Math.round(progress * 100)}%`;
    if (title) $('loader-title').textContent = title;
  }

  hideLoader() {
    $('loader').classList.add('is-done');
    setTimeout(() => { $('loader').hidden = true; }, 600);
  }

  fallback() {
    $('loader').hidden = true;
    const f = $('fallback');
    f.hidden = false;
    const list = $('fallback-list');
    list.innerHTML = '';
    for (const id of Object.keys(PANELS)) {
      const p = PANELS[id];
      const art = document.createElement('article');
      art.style.margin = '18px 0';
      art.innerHTML = `<h3 style="font-family:Georgia,serif">${escapeHtml(this.t(p.eyebrow))} — ${escapeHtml(this.t(p.title))}</h3><p>${escapeHtml(this.t(p.lead))}</p>`;
      list.appendChild(art);
    }
    const links = document.createElement('p');
    links.innerHTML = '<a href="mailto:jameshudsonrandall@gmail.com">Email</a> · <a href="https://github.com/vitjaz" target="_blank" rel="noopener">GitHub</a> · <a href="https://t.me/vlad_ik_ok" target="_blank" rel="noopener">Telegram</a> · <a href="https://me.alexeev-blog.ru/" target="_blank" rel="noopener">Website</a>';
    list.appendChild(links);
  }

  updateDemoButton(running: boolean) {
    const b = document.querySelector<HTMLButtonElement>('#panel-body .demo-btn');
    if (b) b.textContent = this.t(running ? COPY.conveyor.stop : COPY.conveyor.play);
  }

  injectDemoControls(running: boolean, onToggle: () => void) {
    if (this.openPanelId !== 'agents') return;
    const body = $('panel-body');
    const btn = document.createElement('button');
    btn.className = 'related-btn demo-btn';
    btn.type = 'button';
    btn.style.margin = '4px 0 12px';
    btn.textContent = this.t(running ? COPY.conveyor.stop : COPY.conveyor.play);
    btn.addEventListener('click', onToggle);
    body.appendChild(btn);
    const note = document.createElement('p');
    note.style.fontSize = '11px';
    note.style.opacity = '0.7';
    note.textContent = this.t(COPY.conveyor.demo);
    body.appendChild(note);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}
