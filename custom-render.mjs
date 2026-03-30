#!/usr/bin/env node
/**
 * custom-render.mjs — Generate tile layouts with per-cell type overrides.
 * Takes a JS function that returns {type, rotation} for each cell.
 */
import { execSync } from 'child_process'

const STAIRCASE = { cols: 9, rows: 17, upperOffset: 4, upperRows: 6 }

function inMask(r, c) {
  return r < STAIRCASE.upperRows ? c >= STAIRCASE.upperOffset : true
}

function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${p}/TileViewer/ 2>/dev/null`, { encoding: 'utf-8' })
      return p
    } catch {}
  }
  return null
}

// Design function: (r, c) => { type: number, rotation: number }
// Passed as CLI arg, eval'd
const designName = process.argv[2] || 'gradient'
const output = process.argv[3] || '/tmp/custom-design.png'
const grout = process.argv[4] || '686060'
const tilesize = process.argv[5] || '56'

// ─── Design functions ───────────────────────────────────────────────────────
const designs = {

  // Vertical gradient: Basalt at top → Storm in middle → Birch at bottom
  gradient: (r, c) => {
    const t = r <= 3 ? 4 : r <= 6 ? 5 : r <= 9 ? 0 : 2
    return { type: t, rotation: [[2,3],[1,0]][r%2][c%2] } // pinwheel
  },

  // Border: Basalt/Dune frame, Birch/Denim interior
  border: (r, c) => {
    const isTop = r === (r < STAIRCASE.upperRows ? STAIRCASE.upperRows - 1 : STAIRCASE.upperRows) && r < 6
    const isEdge = (r >= STAIRCASE.upperRows && (c === 0 || c === STAIRCASE.cols - 1)) ||
                   (r < STAIRCASE.upperRows && (c === STAIRCASE.upperOffset || c === STAIRCASE.cols - 1)) ||
                   r === 0 || r === STAIRCASE.rows - 1 ||
                   (r === STAIRCASE.upperRows - 1)
    const isBorder = isEdge || r === STAIRCASE.rows - 1 || r === 0 ||
                     (r >= STAIRCASE.upperRows && (c === 0 || c === STAIRCASE.cols - 1)) ||
                     (r < STAIRCASE.upperRows && c === STAIRCASE.upperOffset)
    const type = isBorder ? 4 : 0
    return { type, rotation: [[0,1],[3,2]][r%2][c%2] }
  },

  // Diagonal river: a flowing band of accent tiles from upper-right to lower-left
  river: (r, c) => {
    const band = Math.abs((c - 4) + (r - 7) * 0.7)
    const type = band < 1.5 ? 7 : band < 3 ? 5 : 0
    return { type, rotation: ((r + c) % 4) }
  },

  // Ombré warm-to-cool: Redwood → Sunbeam → Storm → Denim → Surf
  ombre: (r, c) => {
    const types = [8, 8, 10, 10, 6, 6, 5, 5, 0, 0, 2, 2, 11, 11]
    const type = types[r] ?? 0
    return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
  },

  // Scattered accent: mostly neutral with random pops of color
  scattered: (r, c) => {
    // Deterministic "random" based on position
    const hash = ((r * 17 + c * 31) % 97)
    const isAccent = hash < 15
    const accents = [7, 8, 10, 6]
    const type = isAccent ? accents[hash % accents.length] : 5
    return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
  },
}

const designFn = designs[designName]
if (!designFn) {
  console.error(`Unknown design: ${designName}. Available: ${Object.keys(designs).join(', ')}`)
  process.exit(1)
}

// ─── Build cell string with overrides ───────────────────────────────────────
// Template: 1×1 with type 0 (will be overridden per-cell)
const tStr = '00'
let rStr = ''
for (let r = 0; r < STAIRCASE.rows; r++) {
  for (let c = 0; c < STAIRCASE.cols; c++) {
    if (!inMask(r, c)) {
      rStr += '0-' // masked out, doesn't matter
      continue
    }
    const { type, rotation } = designFn(r, c)
    rStr += (rotation % 4) + type.toString(16)
  }
}

// ─── Build URL ──────────────────────────────────────────────────────────────
const port = detectPort()
if (!port) { console.error('Dev server not running'); process.exit(1) }

const params = new URLSearchParams()
params.set('l', 'staircase')
params.set('ts', '1x1')
params.set('t', tStr)
params.set('g', grout)
params.set('sz', tilesize)
params.set('gw', '3')
params.set('r', rStr)

const url = `http://localhost:${port}/TileViewer/#${params.toString()}`
console.log(`Design: ${designName}`)
console.log(`URL: ${url}`)

try {
  execSync(
    `shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`,
    { stdio: 'inherit' }
  )
  console.log(`Done: ${output}`)
} catch (e) {
  console.error('shot-scraper failed')
  process.exit(1)
}
