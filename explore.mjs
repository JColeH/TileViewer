#!/usr/bin/env node
/**
 * Design exploration — 5 themed rounds.
 * Context: front door = upper-right, stairs down = left gap, stairs up = lower-left,
 * shoe rack/coats = bottom. Bottom will be partially obscured.
 */
import { execSync } from 'child_process'

const S = { cols: 9, rows: 17, upperOffset: 4, upperRows: 6 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }
function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try { execSync(`curl -s -o /dev/null http://localhost:${p}/TileViewer/ 2>/dev/null`); return p } catch {}
  }
  return null
}

function buildHash(designFn, grout) {
  let rStr = ''
  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      if (!inMask(r, c)) { rStr += '0-'; continue }
      const { type, rotation } = designFn(r, c)
      rStr += (rotation % 4) + type.toString(16)
    }
  }
  const params = new URLSearchParams()
  params.set('l', 'staircase')
  params.set('ts', '1x1')
  params.set('t', '00')
  params.set('g', grout)
  params.set('sz', '56')
  params.set('gw', '3')
  params.set('r', rStr)
  return params.toString()
}

const pin = (r,c) => [[2,3],[1,0]][r%2][c%2]
const pinOut = (r,c) => [[0,1],[3,2]][r%2][c%2]

const designs = {

  // ═══ Round 1: THRESHOLD — designs that honor the front door as entry point ═══

  // Welcome mat: bold accent zone at the door, calming as you move inward
  welcome: {
    fn: (r, c) => {
      const doorDist = Math.sqrt(Math.pow(r - 1, 2) + Math.pow(c - 7, 2))
      let type = doorDist < 2.5 ? 7 : doorDist < 4 ? 6 : doorDist < 6 ? 0 : 5
      return { type, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // Spotlight: single dramatic accent at the exact door landing, everything else quiet
  spotlight: {
    fn: (r, c) => {
      const doorDist = Math.sqrt(Math.pow(r - 1, 2) + Math.pow(c - 7, 2))
      let type = doorDist < 1.5 ? 10 : 5 // Redwood/Sunbeam spotlight
      return { type, rotation: pin(r, c) }
    },
    grout: '686060',
  },

  // Runway: a path from front door down to the lower area, like a carpet runner
  runway: {
    fn: (r, c) => {
      // Vertical strip from door area (col 6-7) flowing down, then shifting left
      let centerCol = r < 5 ? 6.5 : 6.5 - (r - 5) * 0.3
      const dist = Math.abs(c - centerCol)
      let type = dist < 1.2 ? 4 : dist < 2.2 ? 0 : 5 // Basalt runner, Birch/Denim border
      return { type, rotation: pinOut(r, c) }
    },
    grout: '686060',
  },

  // ═══ Round 2: GEOMETRY — pure pattern exploration ═══

  // Chevron: V-shapes pointing down (toward stairs)
  chevron: {
    fn: (r, c) => {
      const v = (r + Math.abs(c - 4)) % 4
      let type = v < 1 ? 4 : v < 2 ? 5 : v < 3 ? 0 : 5
      return { type, rotation: (r + c) % 4 }
    },
    grout: '484040',
  },

  // Zigzag: alternating diagonal stripes
  zigzag: {
    fn: (r, c) => {
      const stripe = Math.floor((r + c) / 2) % 3
      const types = [7, 5, 0]
      return { type: types[stripe], rotation: ((r + c) % 4) }
    },
    grout: '484040',
  },

  // Houndstooth: 2×2 blocks alternating with offset
  houndstooth: {
    fn: (r, c) => {
      const blockR = Math.floor(r / 2)
      const blockC = Math.floor(c / 2)
      const inner = (r % 2) + (c % 2) * 2
      const isLight = (blockR + blockC) % 2 === 0
      // Houndstooth tooth: one corner of each block is flipped
      let type
      if (isLight) {
        type = inner === 3 ? 4 : 0  // Birch/Denim with one Basalt tooth
      } else {
        type = inner === 0 ? 0 : 4  // Basalt with one Birch tooth
      }
      return { type, rotation: pin(r, c) }
    },
    grout: '686060',
  },

  // ═══ Round 3: MOOD — emotional/atmospheric designs ═══

  // Ember: warm core fading to cool edges (fire in the hearth feeling)
  ember: {
    fn: (r, c) => {
      const center = Math.sqrt(Math.pow(r - 7, 2) + Math.pow(c - 4, 2))
      let type
      if (center < 2) type = 8       // Redwood/Coral — hot core
      else if (center < 3.5) type = 10 // Redwood/Sunbeam
      else if (center < 5) type = 6   // Sunbeam/Denim
      else type = 5                    // Storm/Birch — cool edge
      return { type, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // Frost: cool palette, icy feeling. Denim base with Birch accents
  frost: {
    fn: (r, c) => {
      const hash = ((r * 19 + c * 37 + r * c * 11) % 97)
      let type
      if (hash < 12) type = 0  // Birch/Denim — lighter frost
      else if (hash < 20) type = 1  // Birch/Dune — warm breath
      else type = 2  // Denim/Birch — icy field
      return { type, rotation: pin(r, c) }
    },
    grout: 'C0BDB8',
  },

  // Dusk: gradient from warm sunset (top/door) to cool night (bottom/shoes area)
  dusk: {
    fn: (r, c) => {
      const types = [10, 10, 8, 8, 6, 6, 5, 5, 0, 0, 2, 2, 4, 4]
      let type = types[r] ?? 4
      // Add some horizontal variation
      if (c < 2 && r > 5) type = r > 10 ? 4 : 5
      return { type, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // ═══ Round 4: LUXE — high-end, sophisticated combinations ═══

  // Parquet: alternating rotation blocks mimicking wood parquet floors
  parquet: {
    fn: (r, c) => {
      const block = (Math.floor(r / 3) + Math.floor(c / 3)) % 2
      const type = 1  // Birch/Dune throughout — let rotation do the work
      return { type, rotation: block === 0 ? 0 : 2 }
    },
    grout: 'E0D8C8',
  },

  // Tuxedo: crisp Basalt/Dune and Birch/Dune, strict geometric division
  tuxedo: {
    fn: (r, c) => {
      // Upper half and border = dark, interior lower = light
      const isDark = r < 5 || c === 0 || c === 8 || r === 13
      return { type: isDark ? 4 : 1, rotation: pinOut(r, c) }
    },
    grout: '484040',
  },

  // Inlay: a decorative inlay motif in the center, formal and precise
  inlay: {
    fn: (r, c) => {
      const cr = 8, cc = 4
      const dr = Math.abs(r - cr), dc = Math.abs(c - cc)
      let type
      if (dr <= 1 && dc <= 1) type = 10       // Redwood/Sunbeam center
      else if (dr <= 2 && dc <= 2) type = 6    // Sunbeam/Denim inner
      else if (dr <= 3 && dc <= 3) type = 0    // Birch/Denim mid
      else type = 4                             // Basalt/Dune field
      return { type, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // ═══ Round 5: WILD — maximalist, unexpected, rule-breaking ═══

  // Glitch: structured pattern with deliberate "errors" — digital art feel
  glitch: {
    fn: (r, c) => {
      const base = pin(r, c)
      const hash = ((r * 31 + c * 17) % 67)
      // Mostly ordered pinwheel with Birch/Denim
      let type = 0
      let rot = base
      // Glitch rows — sudden color/rotation breaks
      if (r === 3 || r === 7 || r === 11) {
        type = hash < 20 ? 7 : hash < 40 ? 8 : 4
        rot = (base + 1) % 4
      }
      // Glitch pixels
      if (hash < 5) { type = 7; rot = (rot + 2) % 4 }
      return { type, rotation: rot }
    },
    grout: '201818',
  },

  // Mosaic: maximum color variety, every tile different but harmonious
  mosaic: {
    fn: (r, c) => {
      const allTypes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      const hash = ((r * 41 + c * 23 + r * c * 3) % allTypes.length)
      return { type: allTypes[hash], rotation: ((r + c) % 4) }
    },
    grout: '484040',
  },

  // Horizon: landscape scene — dark earth at bottom (shoes hidden anyway),
  // mid-tone middle, bright sky at top near the door
  horizon: {
    fn: (r, c) => {
      // Sky (top, near door)
      if (r <= 2) return { type: 0, rotation: pin(r, c) }  // Birch/Denim = sky
      if (r <= 4) return { type: 6, rotation: pin(r, c) }  // Sunbeam/Denim = golden hour
      // Treeline
      if (r <= 6) {
        const tree = (c + r) % 3 === 0
        return { type: tree ? 11 : 5, rotation: pin(r, c) } // Redwood/Surf trees + Storm
      }
      // Earth
      if (r <= 9) return { type: 9, rotation: pin(r, c) }  // Redwood/Dune
      // Deep ground (hidden by shoes)
      return { type: 4, rotation: pin(r, c) }  // Basalt/Dune
    },
    grout: '484040',
  },
}

// ─── Run ────────────────────────────────────────────────────────────────────
const port = detectPort()
if (!port) { console.error('Dev server not running'); process.exit(1) }

const which = process.argv[2]
const entries = which ? [[which, designs[which]]] : Object.entries(designs)

if (which && !designs[which]) {
  console.error(`Unknown: ${which}. Have: ${Object.keys(designs).join(', ')}`)
  process.exit(1)
}

for (const [key, d] of entries) {
  const hash = buildHash(d.fn, d.grout)
  const output = `/tmp/explore-${key}.png`
  const url = `http://localhost:${port}/TileViewer/#${hash}`
  console.log(`HASH_${key}:${hash}`)
  try {
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  } catch { console.error(`Failed: ${key}`) }
}
