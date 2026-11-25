/**
 * Flat illustrations for the destination cards, drawn from simple shapes in the five brand
 * colours. Each scene is a background gradient plus SVG layers in a 400 × 220 view box.
 */

export interface SceneLayer {
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface Scene {
  background: string;
  layers: SceneLayer[];
}

const midnight = (alpha: number) => `rgba(14,27,44,${alpha})`;
const porcelain = (alpha: number) => `rgba(249,249,246,${alpha})`;
const brass = (alpha: number) => `rgba(168,132,78,${alpha})`;
const spruce = (alpha: number) => `rgba(47,106,87,${alpha})`;
const garnet = (alpha: number) => `rgba(162,59,63,${alpha})`;
const MIDNIGHT = '#0E1B2C';
const PORCELAIN = '#F9F9F6';
const BRASS = '#A8844E';
const SPRUCE = '#2F6A57';
const GARNET = '#A23B3F';

type Point = readonly [number, number];
type Tower = readonly [x: number, y: number, width: number];

const fill = (d: string, color: string): SceneLayer => ({ d, fill: color, stroke: 'none', strokeWidth: 0 });
const line = (d: string, color: string, width = 1.5): SceneLayer => ({
  d,
  fill: 'none',
  stroke: color,
  strokeWidth: width,
});

const circle = (x: number, y: number, r: number) =>
  `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

function wave(y: number, amplitude: number, wavelength: number, startX = -40): string {
  let d = `M${startX} ${y}Q${startX + wavelength / 4} ${y - amplitude} ${startX + wavelength / 2} ${y}`;
  for (let x = startX + wavelength / 2; x < 440; x += wavelength / 2) d += `T${x + wavelength / 2} ${y}`;
  return d;
}

const sea = (y: number, amplitude: number, wavelength: number, startX = -40) =>
  `${wave(y, amplitude, wavelength, startX)}V260H-60Z`;
const ground = (y: number) => `M-20 ${y}H420V260H-20Z`;

/** A smooth hill line through `points`, closed down to the bottom edge. */
function hills(points: readonly Point[], base = 260): string {
  let d = `M-20 ${base}L-20 ${points[0][1]}L${points[0][0]} ${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [x, y] = points[index];
    const [nextX, nextY] = points[index + 1];
    d += `Q${x} ${y} ${(x + nextX) / 2} ${(y + nextY) / 2}`;
  }
  const [lastX, lastY] = points[points.length - 1];
  return `${d}L${lastX} ${lastY}L420 ${lastY}L420 ${base}Z`;
}

const karst = (x: number, base: number, h: number, w: number) =>
  `M${x - w / 2} ${base}C${x - w / 2} ${base - h * 0.8} ${x - w * 0.36} ${base - h} ${x} ${base - h}C${x + w * 0.36} ${base - h} ${x + w / 2} ${base - h * 0.8} ${x + w / 2} ${base}Z`;

const towers = (base: number, list: readonly Tower[]) =>
  list.map(([x, y, w]) => rect(x, y, w, base - y)).join('');

/** Lit windows, scattered deterministically so the skyline never flickers between renders. */
function windows(base: number, list: readonly Tower[], seed: number): string {
  let d = '';
  list.forEach(([x, y, w], index) => {
    for (let wy = y + 6; wy < base - 6; wy += 7) {
      for (let wx = x + 3; wx < x + w - 4; wx += 6) {
        if ((wx * 7 + wy * 3 + index * 11 + seed) % 9 < 2) d += rect(wx, wy, 2.4, 2.4);
      }
    }
  });
  return d;
}

const prang = (x: number, base: number, h: number, w: number) =>
  `M${x - w / 2} ${base}L${x - w / 2} ${base - h * 0.16}L${x - w * 0.4} ${base - h * 0.16}L${x - w * 0.4} ${base - h * 0.3}L${x - w * 0.33} ${base - h * 0.3}Q${x - w * 0.3} ${base - h * 0.72} ${x} ${base - h}Q${x + w * 0.3} ${base - h * 0.72} ${x + w * 0.33} ${base - h * 0.3}L${x + w * 0.4} ${base - h * 0.3}L${x + w * 0.4} ${base - h * 0.16}L${x + w / 2} ${base - h * 0.16}L${x + w / 2} ${base}Z`;

const balloon = (x: number, y: number, r: number) =>
  `M${x - r} ${y}A${r} ${r} 0 1 1 ${x + r} ${y}Q${x + r} ${y + r * 0.9} ${x + r * 0.26} ${y + r * 1.36}L${x - r * 0.26} ${y + r * 1.36}Q${x - r} ${y + r * 0.9} ${x - r} ${y}Z`;

const sail = (x: number, base: number, h: number, w: number) =>
  `M${x} ${base}Q${x + w * 0.28} ${base - h * 0.88} ${x + w} ${base - h}Q${x + w * 0.74} ${base - h * 0.45} ${x + w * 0.86} ${base}Z`;

function lanterns(): string {
  let d = '';
  [0, 220].forEach((offset) => {
    for (let index = 1; index < 6; index += 1) {
      const t = index / 6;
      d += circle(-10 + offset + 220 * t, 198 + 40 * t * (1 - t) + 5, 3.4);
    }
  });
  return d;
}

/** Vertical hangers of the harbour bridge arch. */
function hangers(): string {
  let d = '';
  for (let t = 0.12; t < 0.9; t += 0.07) {
    const x = (1 - t) * (1 - t) * -20 + 2 * (1 - t) * t * 90 + t * t * 200;
    const y = (1 - t) * (1 - t) * 158 + 2 * (1 - t) * t * 58 + t * t * 158;
    if (y < 142) d += `M${x.toFixed(1)} ${y.toFixed(1)}V146`;
  }
  return d;
}

/** A split temple gate, mirrored around the centre. */
function splitGate(): string {
  const half: Point[] = [
    [100, 196],
    [100, 176],
    [110, 176],
    [110, 158],
    [121, 158],
    [121, 142],
    [132, 142],
    [132, 124],
    [143, 124],
    [143, 108],
    [154, 108],
    [154, 92],
    [165, 92],
    [165, 78],
    [174, 78],
    [174, 64],
    [182, 64],
    [182, 196],
  ];
  const left = `M${half.map((point) => point.join(' ')).join('L')}Z`;
  const right = `M${half.map(([x, y]) => `${400 - x} ${y}`).join('L')}Z`;
  return left + right;
}

const HONG_KONG_TOWERS: readonly Tower[] = [
  [20, 108, 18],
  [44, 96, 22],
  [72, 118, 16],
  [96, 84, 20],
  [124, 104, 24],
  [158, 92, 18],
  [182, 116, 20],
  [214, 52, 22],
  [244, 88, 18],
  [270, 104, 24],
  [302, 80, 20],
  [330, 112, 22],
  [360, 96, 18],
  [384, 120, 20],
];

const gradient = (top: string, bottom: string) => `linear-gradient(180deg, ${top}, ${bottom})`;

const SCENES: Record<string, () => Scene> = {
  CEB: () => ({
    background: gradient(brass(0.34), brass(0.06)),
    layers: [
      fill(circle(290, 88, 30), BRASS),
      fill('M28 152Q92 100 164 152Z', spruce(0.5)),
      fill('M214 154Q256 126 312 154Z', spruce(0.8)),
      fill(sea(152, 3, 64), SPRUCE),
      line(
        [168, 186, 204].map((y, index) => wave(y, 2.4, 46, -40 - index * 14)).join(''),
        porcelain(0.32),
        1.2,
      ),
      line('M98 190H190', MIDNIGHT, 1.6),
      fill('M114 182L176 182L166 191L124 191Z', MIDNIGHT),
      fill('M144 180L144 138L170 180Z', PORCELAIN),
    ],
  }),
  IAO: () => ({
    background: gradient(spruce(0.18), spruce(0.04)),
    layers: [
      fill(circle(94, 70, 24), BRASS),
      fill(sea(128, 9, 130, -60), spruce(0.3)),
      fill(sea(152, 11, 104, -20), spruce(0.6)),
      line(wave(150, 11, 104, -20), porcelain(0.55), 1.4),
      fill(sea(182, 10, 90, -70), SPRUCE),
      line(wave(180, 10, 90, -70), porcelain(0.7), 1.4),
      line('M356 236Q346 166 318 112', MIDNIGHT, 5),
      line(
        'M318 112Q292 98 268 114M318 112Q300 84 278 80M318 112Q326 84 348 76M318 112Q348 100 366 118M318 112Q342 120 352 144',
        MIDNIGHT,
        3.6,
      ),
    ],
  }),
  PPS: () => ({
    background: gradient(brass(0.26), brass(0.04)),
    layers: [
      fill(circle(252, 82, 22), BRASS),
      fill(
        [
          karst(62, 162, 96, 72),
          karst(118, 162, 70, 58),
          karst(332, 162, 84, 64),
          karst(380, 162, 58, 52),
        ].join(''),
        spruce(0.42),
      ),
      fill(
        [
          karst(14, 162, 70, 60),
          karst(176, 162, 122, 60),
          karst(212, 162, 84, 46),
          karst(296, 162, 62, 52),
        ].join(''),
        SPRUCE,
      ),
      fill(ground(162), MIDNIGHT),
      line('M226 178h52M236 192h32M246 206h12', BRASS, 2),
      line('M150 178h40M160 192h18M300 184h28', porcelain(0.18), 2),
    ],
  }),
  TPE: () => ({
    background: gradient(MIDNIGHT, midnight(0.86)),
    layers: [
      fill(
        [
          circle(36, 36, 1.4),
          circle(88, 22, 1.2),
          circle(146, 50, 1.4),
          circle(262, 18, 1.2),
          circle(336, 30, 1.2),
          circle(380, 62, 1.4),
          circle(60, 80, 1),
        ].join(''),
        porcelain(0.7),
      ),
      fill(circle(318, 72, 15), porcelain(0.9)),
      fill(
        hills([
          [0, 146],
          [60, 116],
          [130, 138],
          [214, 100],
          [292, 130],
          [360, 110],
          [400, 122],
        ]),
        porcelain(0.07),
      ),
      fill(
        towers(200, [
          [10, 168, 22],
          [36, 176, 18],
          [60, 160, 26],
          [120, 170, 24],
          [150, 162, 18],
          [246, 166, 22],
          [274, 156, 26],
          [306, 172, 18],
          [330, 164, 24],
          [362, 174, 30],
        ]),
        porcelain(0.14),
      ),
      fill(
        [rect(186, 176, 28, 24)]
          .concat(
            [0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
              const bottom = 176 - level * 13;
              const top = bottom - 13;
              return `M192 ${bottom}L208 ${bottom}L211 ${top}L189 ${top}Z`;
            }),
          )
          .join('') + 'M193 72h14v-8h-14zM199 64h2v-26h-2z',
        BRASS,
      ),
      fill(ground(200), MIDNIGHT),
      line('M-10 198Q100 238 210 198Q320 238 430 198', porcelain(0.22), 1),
      fill(lanterns(), BRASS),
    ],
  }),
  HKG: () => ({
    background: gradient(MIDNIGHT, midnight(0.9)),
    layers: [
      fill(circle(352, 40, 12), porcelain(0.85)),
      fill(
        hills([
          [0, 118],
          [80, 82],
          [150, 104],
          [236, 66],
          [326, 98],
          [400, 86],
        ]),
        porcelain(0.07),
      ),
      fill(
        towers(162, [
          [8, 128, 14],
          [30, 120, 16],
          [60, 132, 18],
          [110, 124, 14],
          [150, 116, 16],
          [196, 128, 14],
          [232, 112, 12],
          [290, 122, 16],
          [318, 130, 14],
          [346, 118, 16],
          [376, 126, 18],
        ]),
        porcelain(0.12),
      ),
      fill(towers(162, HONG_KONG_TOWERS) + 'M218 52l7-12l7 12z', porcelain(0.28)),
      fill(windows(162, HONG_KONG_TOWERS, 3), brass(0.85)),
      fill(ground(162), MIDNIGHT),
      line(
        'M24 172h12M50 176h16M98 172h18M128 180h14M216 172h16M220 184h10M272 174h18M306 180h12M338 172h18M388 178h12',
        brass(0.7),
        2,
      ),
      line('M60 196h24M150 204h30M250 198h22M330 206h30', porcelain(0.14), 2),
    ],
  }),
  ICN: () => ({
    background: gradient(brass(0.16), brass(0.02)),
    layers: [
      fill(circle(106, 74, 20), BRASS),
      fill(
        hills([
          [0, 118],
          [70, 94],
          [150, 112],
          [232, 78],
          [310, 102],
          [400, 90],
        ]),
        garnet(0.2),
      ),
      fill(
        hills([
          [0, 150],
          [90, 120],
          [170, 140],
          [252, 110],
          [334, 136],
          [400, 124],
        ]),
        garnet(0.48),
      ),
      line('M252 112V62', MIDNIGHT, 3),
      fill('M245 70h14v8h-14zM248 62h8v8h-8z', MIDNIGHT),
      line('M252 62V42', MIDNIGHT, 1.4),
      fill(
        hills([
          [0, 180],
          [110, 152],
          [200, 174],
          [292, 150],
          [400, 172],
        ]),
        GARNET,
      ),
      fill('M22 212Q48 206 56 194L132 194Q140 206 166 212ZM44 212h100v18h-100z', MIDNIGHT),
    ],
  }),
  HND: () => ({
    background: gradient(PORCELAIN, garnet(0.1)),
    layers: [
      fill(circle(200, 92, 48), GARNET),
      fill('M24 220Q138 152 178 100L222 100Q262 152 376 220Z', MIDNIGHT),
      fill(
        'M178 100L222 100Q232 113 241 126L229 120L216 132L204 120L192 132L180 120L159 126Q168 113 178 100Z',
        PORCELAIN,
      ),
      line('M302 54q6 -6 12 0q6 -6 12 0M332 72q4 -4 8 0q4 -4 8 0', MIDNIGHT, 1.5),
      fill(
        hills([
          [0, 204],
          [80, 190],
          [160, 208],
          [260, 192],
          [340, 206],
          [400, 196],
        ]),
        SPRUCE,
      ),
      line('M30 224h40M120 230h60M240 226h50M330 232h40', porcelain(0.3), 1.5),
    ],
  }),
  SIN: () => ({
    background: gradient(brass(0.36), garnet(0.08)),
    layers: [
      fill(circle(108, 120, 28), BRASS),
      fill(
        'M196 168L200 94L214 94L216 168ZM232 168L236 94L250 94L252 168ZM268 168L272 94L286 94L288 168Z',
        MIDNIGHT,
      ),
      fill('M184 86Q240 80 304 84L308 92L190 94Z', MIDNIGHT),
      line('M56 168V124M90 168V112M126 168V130M156 168V120', SPRUCE, 3),
      fill(
        'M42 120L70 120L61 130L51 130ZM74 108L106 108L96 118L84 118ZM114 126L138 126L130 135L122 135ZM142 116L170 116L161 126L151 126Z',
        SPRUCE,
      ),
      fill(ground(168), MIDNIGHT),
      line('M86 182h44M94 194h28M102 206h12', brass(0.9), 2),
      line('M198 182h18M234 186h16M270 182h18', porcelain(0.2), 2),
    ],
  }),
  BKK: () => ({
    background: gradient(MIDNIGHT, midnight(0.8)),
    layers: [
      fill(circle(328, 56, 16), BRASS),
      fill(
        [circle(40, 30, 1.2), circle(120, 22, 1.4), circle(250, 40, 1.2), circle(372, 100, 1.2)].join(''),
        porcelain(0.6),
      ),
      fill(
        [
          prang(200, 178, 132, 78),
          prang(112, 178, 72, 44),
          prang(288, 178, 72, 44),
          prang(56, 178, 44, 28),
          prang(344, 178, 44, 28),
        ].join(''),
        BRASS,
      ),
      line('M200 46V30M112 106V96M288 106V96', BRASS, 1.6),
      fill(ground(178), MIDNIGHT),
      line('M150 192h100M170 204h60M186 216h28', brass(0.45), 2),
      line('M40 196h40M320 200h50', porcelain(0.14), 2),
    ],
  }),
  DPS: () => ({
    background: gradient(garnet(0.22), brass(0.26)),
    layers: [
      fill(circle(200, 132, 32), BRASS),
      fill(
        hills([
          [0, 170],
          [90, 156],
          [200, 166],
          [310, 152],
          [400, 168],
        ]),
        midnight(0.3),
      ),
      fill(splitGate(), MIDNIGHT),
      fill(ground(196), MIDNIGHT),
      fill('M182 196L218 196L262 240L138 240Z', brass(0.4)),
      line('M60 210h50M300 214h60', porcelain(0.16), 2),
    ],
  }),
  SYD: () => ({
    background: gradient(SPRUCE, spruce(0.8)),
    layers: [
      fill(circle(330, 60, 18), BRASS),
      line('M-20 158Q90 58 200 158', porcelain(0.4), 3),
      line('M-20 146H206', porcelain(0.4), 2),
      line(hangers(), porcelain(0.22), 1),
      fill(ground(174), MIDNIGHT),
      fill('M200 174L384 174L376 162L208 162Z', MIDNIGHT),
      fill([sail(214, 162, 46, 52), sail(300, 162, 50, 52)].join(''), PORCELAIN),
      fill([sail(252, 162, 62, 60), sail(338, 162, 34, 40)].join(''), porcelain(0.8)),
      line('M226 188h40M250 200h30M304 188h48M318 200h20', porcelain(0.24), 2),
    ],
  }),
  MEL: () => ({
    background: gradient(brass(0.28), brass(0.04)),
    layers: [
      fill(circle(300, 196, 30), brass(0.6)),
      fill(balloon(104, 84, 22), GARNET),
      fill(balloon(184, 44, 15), SPRUCE),
      fill(balloon(262, 94, 19), MIDNIGHT),
      fill(balloon(330, 58, 11), BRASS),
      fill(
        [rect(99, 117, 10, 7), rect(180, 66, 8, 6), rect(257, 124, 10, 7), rect(327, 75, 6, 5)].join(''),
        MIDNIGHT,
      ),
      fill(
        towers(222, [
          [0, 196, 26],
          [30, 186, 20],
          [56, 200, 28],
          [96, 180, 18],
          [120, 192, 24],
          [150, 128, 16],
          [170, 176, 22],
          [198, 190, 30],
          [234, 182, 18],
          [258, 198, 26],
          [290, 186, 22],
          [318, 194, 30],
          [354, 182, 20],
          [378, 196, 24],
        ]) + 'M154 128h8l-4 -22z',
        midnight(0.9),
      ),
      fill(ground(220), MIDNIGHT),
    ],
  }),
};

/** A plain sunset for destinations without their own illustration. */
const FALLBACK_SCENE = (): Scene => ({
  background: gradient(brass(0.24), brass(0.04)),
  layers: [
    fill(circle(200, 120, 34), BRASS),
    fill(
      hills([
        [0, 170],
        [120, 150],
        [240, 168],
        [400, 156],
      ]),
      SPRUCE,
    ),
  ],
});

export function sceneFor(destinationCode: string): Scene {
  return (SCENES[destinationCode] ?? FALLBACK_SCENE)();
}
