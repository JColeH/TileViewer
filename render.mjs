#!/usr/bin/env node
/**
 * render.mjs — Generate tile layout images from the command line.
 *
 * Usage:
 *   node render.mjs [options]
 *
 * Options:
 *   --layout    staircase | grid                (default: staircase)
 *   --template  JSON array of [typeIndex, rotation] pairs, row-major
 *               e.g. '[[0,0],[1,2],[3,0],[0,1]]' for a 2×2 template
 *   --trows     template rows                   (default: inferred from template)
 *   --tcols     template cols                   (default: inferred from template)
 *   --pattern   allTL|allTR|allBR|allBL|pinIn|pinOut|diag|rows|cols|checker|random
 *               (default: allBR)
 *   --grout     hex color without #             (default: C0BDB8)
 *   --tilesize  tile size in px                 (default: 56)
 *   --groutwidth grout width in px              (default: 3)
 *   --port      dev server port                 (default: auto-detect)
 *   --output    output file path                (default: /tmp/tile-design.png)
 *   --width     viewport width                  (default: 1400)
 *   --height    viewport height                 (default: 1000)
 *
 * Tile types (by index):
 *   0: Birch / Denim       1: Birch / Dune       2: Denim / Birch
 *   3: Dune / Birch        4: Basalt / Dune      5: Storm / Birch
 *   6: Sunbeam / Denim     7: Surf / Sunbeam     8: Redwood / Coral
 *   9: Redwood / Dune     10: Redwood / Sunbeam 11: Redwood / Surf
 *
 * Examples:
 *   # 2×2 pinwheel with Birch/Denim and Dune/Birch
 *   node render.mjs --template '[[0,0],[3,0],[0,0],[3,0]]' --trows 2 --tcols 2 --pattern pinIn
 *
 *   # All Redwood/Coral, diagonal pattern
 *   node render.mjs --template '[[8,0]]' --pattern diag
 *
 *   # 2×3 mixed template
 *   node render.mjs --template '[[0,0],[4,1],[7,2],[3,0],[0,2],[4,0]]' --trows 2 --tcols 3
 */

import { execSync } from 'child_process'
import { parseArgs } from 'util'

// ─── Layouts ────────────────────────────────────────────────────────────────
const LAYOUTS = {
  staircase: { cols: 9, rows: 17 },
  grid:      { cols: 8, rows: 8 },
}

// ─── Patterns ───────────────────────────────────────────────────────────────
const PATTERNS = {
  allTL:   (r, c) => 0,
  allTR:   (r, c) => 1,
  allBR:   (r, c) => 2,
  allBL:   (r, c) => 3,
  pinIn:   (r, c) => [[2,3],[1,0]][r%2][c%2],
  pinOut:  (r, c) => [[0,1],[3,2]][r%2][c%2],
  diag:    (r, c) => (r+c)%4,
  rows:    (r, c) => r%2===0 ? 0 : 2,
  cols:    (r, c) => c%2===0 ? 1 : 3,
  checker: (r, c) => (r+c)%2===0 ? 0 : 2,
  random:  (r, c) => Math.floor(Math.random() * 4),
}

// ─── Auto-detect dev server port ────────────────────────────────────────────
function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try {
      execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${p}/TileViewer/ 2>/dev/null`, { encoding: 'utf-8' })
      return p
    } catch {}
  }
  return null
}

// ─── Parse args ─────────────────────────────────────────────────────────────
const { values } = parseArgs({
  options: {
    layout:     { type: 'string', default: 'staircase' },
    template:   { type: 'string', default: '[[0,0]]' },
    trows:      { type: 'string', default: '' },
    tcols:      { type: 'string', default: '' },
    pattern:    { type: 'string', default: 'allBR' },
    grout:      { type: 'string', default: 'C0BDB8' },
    tilesize:   { type: 'string', default: '56' },
    groutwidth: { type: 'string', default: '3' },
    port:       { type: 'string', default: '' },
    output:     { type: 'string', default: '/tmp/tile-design.png' },
    width:      { type: 'string', default: '1400' },
    height:     { type: 'string', default: '1000' },
  },
})

// ─── Build template ─────────────────────────────────────────────────────────
const tmplFlat = JSON.parse(values.template)  // [[typeIdx, rot], ...]
let tRows = Number(values.trows)
let tCols = Number(values.tcols)

// Infer dimensions if not provided
if (!tRows || !tCols) {
  const total = tmplFlat.length
  if (!tRows && !tCols) {
    tCols = Math.ceil(Math.sqrt(total))
    tRows = Math.ceil(total / tCols)
  } else if (!tRows) {
    tRows = Math.ceil(total / tCols)
  } else {
    tCols = Math.ceil(total / tRows)
  }
}

// Encode template: each cell as hex(typeIndex) + rotation
let tStr = ''
for (let r = 0; r < tRows; r++) {
  for (let c = 0; c < tCols; c++) {
    const idx = r * tCols + c
    const [typeIdx, rot] = tmplFlat[idx] ?? [0, 0]
    tStr += typeIdx.toString(16) + (rot % 4)
  }
}

// ─── Build cell rotations ───────────────────────────────────────────────────
const layout = LAYOUTS[values.layout] ?? LAYOUTS.staircase
const patternFn = PATTERNS[values.pattern] ?? PATTERNS.allBR

let rStr = ''
for (let r = 0; r < layout.rows; r++) {
  for (let c = 0; c < layout.cols; c++) {
    const rot = patternFn(r, c) % 4
    rStr += rot + '-'  // rotation + no override
  }
}

// ─── Build hash ─────────────────────────────────────────────────────────────
const port = values.port ? Number(values.port) : detectPort()
if (!port) {
  console.error('Could not find dev server. Start it with: npm run dev')
  process.exit(1)
}

const params = new URLSearchParams()
params.set('l', values.layout)
params.set('ts', `${tRows}x${tCols}`)
params.set('t', tStr)
params.set('g', values.grout)
params.set('sz', values.tilesize)
params.set('gw', values.groutwidth)
params.set('r', rStr)

const hash = params.toString()
const url = `http://localhost:${port}/TileViewer/#${hash}`

console.log(`URL: ${url}`)
console.log(`Rendering to ${values.output}...`)

// ─── Screenshot ─────────────────────────────────────────────────────────────
try {
  execSync(
    `shot-scraper "${url}" -s "#canvas" -o "${values.output}" --width ${values.width} --height ${values.height} --wait 500`,
    { stdio: 'inherit' }
  )
  console.log(`Done: ${values.output}`)
} catch (e) {
  console.error('shot-scraper failed.')
  process.exit(1)
}
