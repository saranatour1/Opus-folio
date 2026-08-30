/** Every drawing on the page, generated at build time from one seeded stream.
 *  Nothing here ships to the browser — only the path data it returns. */

export type Stroke = { d: string; w: number };
export type Bud = { x: number; y: number; r: number };
export type Branch = { strokes: Stroke[]; buds: Bud[] };

export type Drawing = ReturnType<typeof drawing>;

const round = (v: number) => Math.round(v * 100) / 100;

/** Same seed, same art, every build. Call order matters — keep it. */
export function drawing(seed = 1337) {
  let s = seed;
  const r = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rr = (a: number, b: number) => a + r() * (b - a);

  /** Recursive branch in a 1000x1000 box: ink strokes, blossoms at the tips. */
  const branch = (x: number, y: number, angle: number, len: number, depth: number): Branch => {
    const strokes: Stroke[] = [];
    const buds: Bud[] = [];
    const grow = (x: number, y: number, a: number, l: number, d: number) => {
      const bend = rr(-0.28, 0.28);
      const ex = x + Math.cos(a + bend) * l;
      const ey = y + Math.sin(a + bend) * l;
      strokes.push({
        d: `M${round(x)} ${round(y)}Q${round(x + Math.cos(a) * l * 0.5)} ${round(
          y + Math.sin(a) * l * 0.5,
        )} ${round(ex)} ${round(ey)}`,
        w: round(d * 0.55 + 0.35),
      });
      if (d <= 1) {
        for (let i = 0, k = Math.round(rr(2, 5)); i < k; i++)
          buds.push({ x: round(ex + rr(-14, 14)), y: round(ey + rr(-14, 14)), r: round(rr(1.6, 4.2)) });
        return;
      }
      for (let i = 0, forks = r() > 0.35 ? 2 : 1; i < forks; i++)
        grow(ex, ey, a + rr(-0.62, 0.62), l * rr(0.6, 0.8), d - 1);
    };
    grow(x, y, angle, len, depth);
    return { strokes, buds };
  };

  const bough = branch(60, 980, -1.05, 240, 5);
  const sprig = branch(940, 40, 2.1, 150, 4);
  /* fills the right of the hero on wide screens */
  const boughRight = branch(960, 1000, -2.15, 230, 5);
  const grove = {
    bloom: branch(980, 900, -1.9, 165, 4),
    rules: branch(30, 60, 1.25, 140, 4),
    absences: branch(950, 980, -1.6, 190, 4),
  };

  /** Terrace band: tiny strokes, the way a rice field reads from a ridge. */
  const field = Array.from({ length: 460 }, () => {
    const x = round(r() * 1000);
    const y = round(24 + Math.pow(r(), 0.6) * 62);
    const h = round(rr(4, 10) * (0.5 + y / 120));
    return `M${x} ${round(y + h)}Q${round(x + rr(-3, 3))} ${round(y + h / 2)} ${round(
      x + rr(-5, 5),
    )} ${y}`;
  }).join("");

  /** The thread that runs the whole page, drawn top to bottom as you scroll. */
  const squiggle = (() => {
    const half = 20;
    let d = "M50 0";
    for (let y = 0, dir = 1; y < 1000; y += half, dir *= -1)
      d += `Q${round(50 + dir * rr(7, 12))} ${round(y + half / 2)} 50 ${round(y + half)}`;
    return d;
  })();

  const petals = Array.from({ length: 18 }, (_, i) => ({
    phase: i * 47,
    x: round(r() * 100),
    dur: round(rr(15, 30)),
    delay: round(-r() * 30),
    drift: round(rr(-6, 18)),
    size: round(rr(5, 11)),
  }));

  return { bough, boughRight, sprig, grove, field, squiggle, petals };
}
