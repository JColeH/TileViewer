#!/usr/bin/env node
/**
 * 5 rounds of OUT OF THE BOX designs. Break every rule.
 * Context: door=upper-right, stairs-down=gap, stairs-up=lower-left, shoes=bottom
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
  params.set('l', 'staircase'); params.set('ts', '1x1'); params.set('t', '00')
  params.set('g', grout); params.set('sz', '56'); params.set('gw', '3'); params.set('r', rStr)
  return params.toString()
}

const pin = (r,c) => [[2,3],[1,0]][r%2][c%2]

const designs = {

  // ═══ Round 1: OPTICAL ILLUSIONS ═══

  // Tumbling blocks — 3D cube illusion using 3 tile values
  tumbling: {
    fn: (r, c) => {
      const phase = ((r + c * 2) % 3)
      const types = [4, 5, 0] // dark, mid, light = 3D cube faces
      // Rotation creates the angular face effect
      const rots = [0, 1, 2]
      return { type: types[phase], rotation: rots[phase] }
    },
    grout: '484040',
  },

  // Spiral — tiles rotate to form a spiral emanating from center
  spiral: {
    fn: (r, c) => {
      const cr = 8, cc = 4
      const angle = Math.atan2(r - cr, c - cc)
      const dist = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(c - cc, 2))
      const spiralPhase = (angle / Math.PI + dist * 0.3) % 1
      const rot = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 4) % 4
      let type = dist < 2 ? 7 : dist < 4.5 ? 6 : dist < 7 ? 5 : 4
      return { type, rotation: rot }
    },
    grout: '201818',
  },

  // Vortex — all rotations point toward a single focal point, creating swirl
  vortex: {
    fn: (r, c) => {
      const cr = 6, cc = 5
      const angle = Math.atan2(r - cr, c - cc)
      const rot = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 4 + 0.5) % 4
      const dist = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(c - cc, 2))
      let type = dist < 3 ? 7 : 0
      return { type, rotation: rot }
    },
    grout: '484040',
  },

  // ═══ Round 2: NATURE ═══

  // Topography — contour lines like a topographic map
  topo: {
    fn: (r, c) => {
      // Two "peaks" — one near door, one in lower area
      const d1 = Math.sqrt(Math.pow(r - 2, 2) * 0.8 + Math.pow(c - 7, 2))
      const d2 = Math.sqrt(Math.pow(r - 10, 2) + Math.pow(c - 3, 2) * 0.8)
      const elevation = Math.min(d1, d2)
      const contour = Math.floor(elevation) % 3
      const types = [7, 5, 0]
      return { type: types[contour], rotation: ((r + c) % 4) }
    },
    grout: '484040',
  },

  // Tide pools — circular pools of color scattered organically
  tidepools: {
    fn: (r, c) => {
      const pools = [
        { r: 1, c: 6, rad: 2, type: 7 },   // teal pool near door
        { r: 5, c: 2, rad: 1.8, type: 11 }, // burgundy/teal pool near stairs
        { r: 8, c: 6, rad: 2.2, type: 6 },  // gold pool center-right
        { r: 11, c: 1, rad: 1.5, type: 8 }, // coral pool lower-left
        { r: 10, c: 7, rad: 1.3, type: 10 },// warm accent
        { r: 4, c: 4, rad: 1.5, type: 7 },  // small teal
      ]
      let bestDist = Infinity, bestType = 5
      for (const p of pools) {
        const d = Math.sqrt(Math.pow(r - p.r, 2) + Math.pow(c - p.c, 2))
        if (d < p.rad && d < bestDist) { bestDist = d; bestType = p.type }
        else if (d < p.rad + 0.8 && d < bestDist + 0.5) { bestType = 0 } // edge ring
      }
      return { type: bestType, rotation: pin(r, c) }
    },
    grout: '686060',
  },

  // Fern — fractal-ish fern frond growing from bottom-left (staircase) upward
  fern: {
    fn: (r, c) => {
      // Main stem: vertical up the left-center
      const stemCol = 3 + Math.sin(r * 0.4) * 0.8
      const stemDist = Math.abs(c - stemCol)
      // Fronds branching right at intervals
      const frondRow = r % 3 === 0
      const frondDist = frondRow ? Math.max(0, c - stemCol) : Infinity
      const isStem = stemDist < 0.8 && r > 2
      const isFrond = frondDist < (3.5 - (r % 3)) && frondDist >= 0 && r > 2
      let type = 5 // Storm field
      if (isStem) type = 11  // Redwood/Surf = dark stem
      else if (isFrond && frondDist < 1.5) type = 7  // Surf/Sunbeam = bright frond
      else if (isFrond) type = 6  // Sunbeam/Denim = frond edge
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
  },

  // ═══ Round 3: CULTURAL PATTERNS ═══

  // Sashiko — Japanese stitching pattern, geometric with offset repeats
  sashiko: {
    fn: (r, c) => {
      // Cross-hatch pattern: lines every 3 tiles, offset
      const isHLine = r % 3 === 0
      const isVLine = (c + Math.floor(r / 3)) % 3 === 0
      const isNode = isHLine && isVLine
      let type = isNode ? 7 : (isHLine || isVLine) ? 2 : 0
      return { type, rotation: isHLine ? 1 : isVLine ? 0 : pin(r, c) }
    },
    grout: 'F2F0EC',
  },

  // Zellige — Moroccan mosaic, rich colors in irregular-feeling arrangement
  zellige: {
    fn: (r, c) => {
      const hash = ((r * 47 + c * 29 + r * c * 13) % 157)
      const palette = [7, 7, 11, 11, 10, 6, 6, 8, 4, 4, 5]
      const type = palette[hash % palette.length]
      // Vary rotations more aggressively
      return { type, rotation: hash % 4 }
    },
    grout: 'E0D8C8',
  },

  // Kilim — woven rug pattern with horizontal bands and triangular motifs
  kilim: {
    fn: (r, c) => {
      const band = Math.floor(r / 2)
      const bandType = [8, 6, 5, 7, 5, 6, 8][band % 7]
      // Triangle motifs within bands
      const triPhase = (c + (band % 2)) % 4
      let type = bandType
      if (triPhase === 0 && band % 3 === 0) type = 4 // dark accent triangles
      return { type, rotation: triPhase < 2 ? 0 : 2 }
    },
    grout: '484040',
  },

  // ═══ Round 4: CONCEPTUAL ═══

  // Erosion — ordered pattern at top (door) that breaks down/erodes toward bottom
  erosion: {
    fn: (r, c) => {
      // Top: perfect pinwheel in Basalt/Birch
      // Bottom: increasingly "broken" — random tiles intrude
      const chaos = Math.max(0, (r - 4) / 10) // 0 at top, ~1 at bottom
      const hash = ((r * 37 + c * 53) % 97) / 97
      if (hash < chaos * 0.6) {
        // Eroded: random warm tile
        const types = [8, 10, 7, 6]
        return { type: types[Math.floor(hash * 100) % types.length], rotation: Math.floor(hash * 4) }
      }
      // Intact: alternating Basalt + Birch/Denim
      const isA = (r + c) % 2 === 0
      return { type: isA ? 4 : 0, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // Pixel art — a simple house/door icon made of tiles (meta!)
  pixelart: {
    fn: (r, c) => {
      // Arrow pointing inward from the door, like a "come in" sign
      // Arrow body: cols 5-7, rows 1-10
      // Arrow head: wider at rows 5-7
      const isBody = c >= 5 && c <= 7 && r >= 1 && r <= 4
      const isHead = r >= 5 && r <= 8 &&
        (Math.abs(c - 6) <= (r - 4))
      const isPoint = r >= 8 && r <= 9 && c >= 5 && c <= 7
      let type = 5 // Storm field
      if (isBody) type = 7       // Surf/Sunbeam arrow body
      else if (isHead) type = 7  // arrow head
      else if (isPoint) type = 7
      return { type, rotation: 2 } // all pointing same direction for cohesion
    },
    grout: '484040',
  },

  // Gravity — tiles "fall" to the bottom, accumulating in layers, top is sparse
  gravity: {
    fn: (r, c) => {
      // Bottom rows: dense, full color
      // Top rows: sparse, mostly neutral with occasional "floating" tile
      const hash = ((r * 31 + c * 43 + r * c * 7) % 131)
      const fillProb = Math.pow(r / 13, 2) // 0 at top, 1 at bottom
      const isFilled = (hash / 131) < fillProb
      if (!isFilled) return { type: 5, rotation: pin(r, c) } // Storm = empty space
      // Filled tiles settle in warm-to-cool layers
      let type
      if (r > 11) type = 4      // Basalt = heavy bottom
      else if (r > 9) type = 8  // Redwood/Coral
      else if (r > 7) type = 10 // Redwood/Sunbeam
      else if (r > 5) type = 6  // Sunbeam/Denim
      else type = 7              // Surf/Sunbeam = lightest floating
      return { type, rotation: pin(r, c) }
    },
    grout: '484040',
  },

  // ═══ Round 5: MAXIMUM DRAMA ═══

  // Eclipse — dark circle with a bright crescent (like a solar eclipse)
  eclipse: {
    fn: (r, c) => {
      const cr = 7, cc = 4
      const dist = Math.sqrt(Math.pow(r - cr, 2) + Math.pow((c - cc) * 1.2, 2))
      // Offset bright disc
      const brightDist = Math.sqrt(Math.pow(r - cr + 1.5, 2) + Math.pow((c - cc - 1) * 1.2, 2))
      let type
      if (dist < 3 && brightDist > 2.5) type = 10  // Redwood/Sunbeam crescent
      else if (dist < 3) type = 4                    // Basalt dark disc
      else if (dist < 4.5) type = 6                  // Sunbeam corona
      else type = 2                                   // Denim/Birch = night sky
      return { type, rotation: pin(r, c) }
    },
    grout: '201818',
  },

  // Stained glass — bold color blocks separated by dark "lead" lines
  stainedglass: {
    fn: (r, c) => {
      // Dark grid lines every 3-4 tiles
      const isVLead = c % 4 === 0
      const isHLead = r % 3 === 0
      if (isVLead || isHLead) return { type: 4, rotation: isVLead ? 0 : 1 }
      // Color panels
      const panel = Math.floor(r / 3) * 3 + Math.floor(c / 4)
      const colors = [7, 8, 10, 6, 11, 0, 7, 10, 8, 6, 11, 0, 7, 8]
      return { type: colors[panel % colors.length], rotation: pin(r, c) }
    },
    grout: '201818',
  },

  // Supernova — explosion of all colors from a single bright point
  supernova: {
    fn: (r, c) => {
      const cr = 5, cc = 5
      const dist = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(c - cc, 2))
      const angle = Math.atan2(r - cr, c - cc)
      const ray = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 8) % 8
      const rayColors = [7, 10, 8, 6, 11, 7, 10, 8]
      let type
      if (dist < 1.5) type = 6       // Sunbeam core (bright)
      else if (dist < 5) type = rayColors[ray]  // color rays
      else type = 4                    // Basalt deep space
      const rot = Math.floor(((angle + Math.PI) / (Math.PI * 2)) * 4) % 4
      return { type, rotation: rot }
    },
    grout: '201818',
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
  const output = `/tmp/wild-${key}.png`
  const url = `http://localhost:${port}/TileViewer/#${hash}`
  console.log(`HASH_${key}:${hash}`)
  try {
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  } catch { console.error(`Failed: ${key}`) }
}
