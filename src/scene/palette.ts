/**
 * PAPER SPEC — VITALIY ALEXEEV / PAPER WORLD
 *
 * BRIEF      An isometric handcrafted paper diorama of an engineering career: a central AI factory,
 *            districts for the journey, R&D, MCP, telemetry, tools, about and contact, standing on a
 *            layered card platform, photographed with a long macro lens. Warm studio light, no neon,
 *            no glassmorphism, no flat SVG stand-ins. Must be explorable and readable by recruiters.
 * SUBJECT    A paper technology city where engineers and small robots work; the T1 factory is the
 *            largest object and the conveyor of agents its main attraction.
 * STOCK      Cream cardstock cards, kraft board bases, kraft backs, one quiet fibre everywhere.
 * PALETTE    Derived from the brief: ivory/cream ground board, kraft platform, warm cream buildings,
 *            muted sage parks, terracotta roofs and accents, soft orange awnings, graphite ink,
 *            cold blue ONLY on lit screens and AI indicators.
 * LIGHT      Warm low key from the upper left (#ffd9ac), frontal fill ~1/3 of the key, warm amber
 *            shadows and AO (#5a3a20), sky cream, shadow box over the whole board.
 * LENS       fov 26, pitch 44-47 deg, focus band ~0.3 of the frame, max blur ~12 px @1080, big near
 *            blurred props at the bottom edge, printed desk sheet past every frame edge.
 * FORMAT     Web page first, 16:9 desktop authored; tablet and phone reframe by fitting the board.
 * GROUND     A three-layer kraft platform with a printed cream board on top: stone plaza round the
 *            factory, tan roads with dashes, sage parks, terracotta paths, torn paper region borders.
 * LAYOUT     One leading road from the front-left journey stops, round the factory plaza, to the
 *            right-hand lab and telemetry; factory centre, conveyor stage in front, three MCP bridges
 *            from the right tower into the factory.
 * MOTION     Hinges rise with one overshoot; hover lifts a card 0.2 units; conveyor robots move by
 *            rotating and stepping, screens flicker, clouds drift, fans turn. Reduced motion respected.
 * LIFE       Drifting paper clouds, two small workers walking the plaza, one delivery cart, steam
 *            from the factory stacks, a slow flag on the roof.
 * TYPES      Cards, layered cards, half crosses (signs, trees), box folds (houses, lab), prism folds
 *            (factory wings, telemetry drums), platforms (conveyor stage, plaza steps), printed board.
 * SOUND      Soft paper flaps on open/close (toggleable, off by default).
 * BANNED     Neon, gloss, glass, gradients as decoration, floating UI cards, sticker rims, flat SVG,
 *            clipped text, medical-white, video-game green, grey shadows.
 * QA         Overview 1600x900, mid-rise, a district close-up, a panel open, 390x844 phone, 1024x768.
 */

export const C = {
  /* ground + platform */
  desk: '#b8a98c',
  deskInk: '#cbb897',
  board: '#e2d4b8',
  boardLight: '#f3e8d2',
  boardWash: '#ddceb0',
  plaza: '#dccaa8',
  plazaLine: '#bda584',
  road: '#cbb187',
  roadEdge: '#9d7f57',
  roadDash: '#f6eeda',
  grass: '#8a976e',
  grassDeep: '#6c7a55',
  grassLight: '#9fae7f',
  path: '#c99a68',

  /* paper family */
  cream: '#eedfbf',
  creamDeep: '#dfcba6',
  ivory: '#f7edd6',
  kraft: '#c2996a',
  kraftDeep: '#a87c4c',
  kraftDark: '#87603a',
  kraftEdge: '#7d5834',

  /* accents */
  terracotta: '#b0563a',
  terracottaDeep: '#8b3f26',
  orange: '#d0803f',
  ochre: '#cb9a4b',
  sage: '#7d8a66',
  sageDeep: '#5f6c4d',
  graphite: '#3d3831',
  ink: '#33251a',

  /* cold accents, screens only */
  blue: '#47778f',
  blueDeep: '#2b4e62',
  blueLight: '#86b8cc',
  blueGlow: '#a9e2f7',

  /* interaction */
  focus: '#b75f40',
} as const;

export const LIGHT = {
  key: '#fff5e8',
  keyIntensity: 4.0,
  fill: '#d6e0ee',
  fillIntensity: 0.58,
  sky: '#f4f6f4',
  ground: '#9c9a90',
  skyIntensity: 0.19,
  keyDir: [-0.86, 0.95, 0.3],
  fillDir: [0.45, 0.5, 1.0],
  leak: '#7d4e33',
  ao: '#5a3a20',
  haze: '#dccdb4',
} as const;

export const LENS = {
  exposure: 0.81,
  tint: [0.985, 1.0, 1.035] as [number, number, number],
  saturation: 1.18,
  contrast: 1.22,
  greenDesat: 0.18,
  shadowTint: '#33251a',
  shadowLift: 0.028,
  hazeStart: 46,
  hazeEnd: 150,
  hazeAmount: 0.07,
  focusBand: 0.3,
  ramp: 0.38,
  maxBlur: 11.5,
  nearGain: 1.4,
  farGain: 0.9,
  depthWeight: 0.8,
  vignette: 0.06,
  vignetteColor: '#3a2513',
  grain: 0.01,
  ao: 1.45,
  aoRadius: 2.0,
  falloff: 0.1,
  edgeLine: 0.26,
} as const;
