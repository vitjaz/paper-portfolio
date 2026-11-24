# VITALIY ALEXEEV — PAPER WORLD

An interactive papercraft diorama portfolio of a Senior AI Platform Engineer, built with three.js and the
[`papercraft`](https://github.com/xikhar/papercraft) skill. Every building, sign, tree, robot and road is cut paper:
printed cardstock glued onto a layered kraft platform, lit by one warm key, seen through a macro lens.

The world is the résumé: a central T1 AI factory with an autonomous-agent conveyor, the career road on the left,
R&D and MCP integration on the right, telemetry and a tech-stack workshop at the front, and about/contact in the
quiet corners. Click any object (or use the section chips) to fold open a paper information panel.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build and preview:

```bash
npm run build      # dist/
npm run preview    # serves dist/
```

Type check: `npm run typecheck`.

## What is implemented

- **The diorama** — a three-layer kraft platform (70 × 52 units) with a printed board: plaza tiles, roads with
  centre dashes and crosswalks, a hazard band, a compass rose, printed stamps, torn park patches and planted trees.
- **T1 AI Factory** — a folded hall with two wings, a stepped upper floor, a glowing T1 sign, an AI-core panel,
  rooftop vents, skylights, antennas, a dish and a flag, plus the **agent conveyor** with eight stations
  (Task → Analyst → Requirements → Dev → Sandbox → Tests → PR → Human) and paper robots.
- **Districts** — My Journey (REMTURBO 2021, Квант 2022–24, 1221Системс 2024), the R&D/benchmark lab, the MCP
  tower with three context bridges (Task / Code / Docs), LLM telemetry with storage drums and pipes, the tech-stack
  workshop, the About pavilion and the Contact post station.
- **Interactions** — hover lift + tooltip, click/tap to fly to a district and open its paper panel, Esc to close,
  Reset view, a full "Explore all" list, section chips, deep links (`#about`, `#contact`, …), drag to look around,
  wheel/pinch zoom, and the conveyor demo with live step captions.
- **Content** — English and Russian interface, all facts from the brief only, links open in a new tab, email uses
  `mailto:`, no personal data beyond the public positioning.
- **Care** — paper loading card, WebGL fallback with the full content, keyboard-accessible navigation, visible focus
  rings, `prefers-reduced-motion` disables ambient motion (the conveyor demo still runs on request), no horizontal
  scroll, adapted phone framing with chips to fly into each district.

## Where to edit content

| What | File |
|---|---|
| All copy: masthead, UI labels, hotspot names, panels, links, EN/RU | `src/data/portfolio.ts` |
| Palette, paper spec, light and lens constants | `src/scene/palette.ts` |
| Board print (roads, plaza, stamps), platform layers | `src/scene/board.ts` |
| Buildings, factory, conveyor, stations, signage placement | `src/scene/buildings.ts` |
| Paper kit: signs, trees, bushes, lamps, robots, people, awnings, roof gear, awnings, planters | `src/scene/kit.ts` |
| Print helpers (layered paper parts, windows, screens, text) | `src/scene/print.ts` |
| Camera framing, interactions, demo clock, world assembly | `src/scene/diorama.ts` |
| Page chrome: header, chips, drawer, loader, fallback | `src/ui/ui.ts`, `src/styles.css`, `index.html` |
| Hotspot coordinates and camera distance | `HOTSPOTS` in `src/data/portfolio.ts` |

Hotspot ids are the contract between the scene and the data: the scene places a sign/object for each id, the data
provides its label, hint, camera target and panel.

## Architecture

```
src/
  main.ts                 boot, WebGL check, hash links, loader
  data/portfolio.ts       the only content source (EN + RU)
  ui/ui.ts                page chrome, panels, language, demo caption
  scene/
    palette.ts            PAPER SPEC + palette + light/lens numbers
    board.ts              desk, mat, layered platform, printed ground
    kit.ts                WorldKit (hotspots, hover roots, signs) + prop factories
    print.ts              print helpers for layered ink on card
    buildings.ts          factory, conveyor, districts, rooftop fittings
    diorama.ts            renderer, PaperPost lens, camera director, picking, animation
  papercraft/lib/         vendored from the papercraft skill (paperkit-2d/3d, motion, life, sound)
.opencode/skill/papercraft vendored skill (SKILL.md + references + assets)
```

Repeated props are built once and cloned so a few dozen prints dress 150+ cards. All prints are generated at
runtime from code (no image files), which keeps the world editable and the palette exact.

## Verified

- `npm run typecheck` clean; `npm run build` clean (Vite, ~0.5 s).
- Headless Chromium at 1600×900, 1440×900, 1024×768, 390×844 and with
  `prefers-reduced-motion: reduce`: no page errors, no horizontal scroll.
- Hover tooltip, 3D click → drawer, chip navigation, Esc close, Explore list with keyboard, deep links
  (`#about`, `#workshop`, …), hash sync, demo run, language switch, mailto/external links and the no-WebGL
  fallback (14 content sections) were exercised in the review scripts.
- Papercraft's `measure.py` on the overview frame: 18 PASS / 2 WARN (the two warns are the empty studio desk
  around the physical platform and a shallow depth spread; both are compositions of the brief, not failures).

## Development notes

- The lens is the skill's `PaperPost` (tilt-shift DOF, contact AO, ACES grade, haze, vignette, grain). The camera is
  a purpose-built director: overview fit, eased district focus, bounded drag, zoom, device-adaptive framing.
- Review shots: `node scripts/shot.mjs shots/overview.png 1600 900` and `node scripts/check.mjs mobile|tablet|reduced`
  (require the dev server and Playwright's Chromium; set `PLAYWRIGHT_CHROMIUM` if the browser lives elsewhere).
  Final review frames are in `shots/`.
- Performance: the first build prints the whole world (~3–5 s on a laptop, longer under a software renderer); the
  loading card covers it. The live loop is cheap: static geometry, one shadow map, one post chain.

## Known limits

- The phone view is a cropped, adapted composition of a landscape diorama; every district is reachable through the
  chips and the Explore list, and Reset view zooms out to the whole model.
- No audio: the paper sound library is vendored but unused, to keep the page quiet by default.
