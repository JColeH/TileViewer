#!/usr/bin/env node
import { execSync } from 'child_process'

const S = { cols: 9, rows: 14, upperOffset: 3, upperRows: 5 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }
function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try { execSync(`curl -s -o /dev/null http://localhost:${p}/TileViewer/ 2>/dev/null`); return p } catch {}
  }
  return null
}

const designs = {

  // River v2: wider, softer edges, better diagonal angle
  river2: (r, c) => {
    const dist = (c * 1.0) - (r * 0.55) + 1.5
    let type
    if (dist > 2.5 && dist < 5.5) type = 7        // core: Surf/Sunbeam
    else if (dist > 1.5 && dist < 6.5) type = 6    // edge: Sunbeam/Denim (warm mediator)
    else type = 5                                    // field: Storm/Birch
    return { type, rotation: ((r + c) % 4) }
  },

  // Border v2: double-width border on bottom/sides, single on top
  border2: (r, c) => {
    const isLeft = r >= S.upperRows && c <= 1
    const isRight = c >= S.cols - 2
    const isBottom = r >= S.rows - 2
    const isTopEdge = r < S.upperRows && c === S.upperOffset
    const isUpperTop = r === 0
    const isStepEdge = r === S.upperRows && c < S.upperOffset
    const outerBorder = isLeft || isRight || isBottom || isUpperTop || isTopEdge ||
                        (r < S.upperRows && c === S.cols - 1) ||
                        (r === S.upperRows - 1 && c >= S.upperOffset)
    const innerBorder = (r >= S.upperRows && c === 2) || (c === S.cols - 3) ||
                        (r === S.rows - 3) || (r === 1 && c >= S.upperOffset) ||
                        (r < S.upperRows && c === S.upperOffset + 1)
    let type
    if (outerBorder) type = 4    // Basalt/Dune
    else if (innerBorder) type = 9  // Redwood/Dune (accent inner border)
    else type = 1                // Birch/Dune (warm cream field)
    return { type, rotation: [[0,1],[3,2]][r%2][c%2] }
  },

  // Scattered v2: better distribution, 3 accent colors, calmer base
  scattered2: (r, c) => {
    const hash = ((r * 23 + c * 41 + r * c * 7) % 113)
    let type
    if (hash < 6) type = 7       // Surf/Sunbeam — teal pop
    else if (hash < 11) type = 10 // Redwood/Sunbeam — warm pop
    else if (hash < 15) type = 6  // Sunbeam/Denim — gold pop
    else if (hash < 40) type = 0  // Birch/Denim — lighter neutral
    else type = 5                  // Storm/Birch — base
    return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
  },

  // Tritone v2: 2×3 with Basalt, Storm, Birch/Denim — refined with allBR
  // (this one uses template, handled separately)

  // Diamond: concentric diamond pattern radiating from center
  diamond: (r, c) => {
    const cr = 9, cc = 4 // center of lower portion
    const dist = Math.abs(r - cr) + Math.abs(c - cc)
    let type
    if (dist <= 2) type = 7       // Surf/Sunbeam — center jewel
    else if (dist <= 4) type = 6  // Sunbeam/Denim — inner ring
    else if (dist <= 6) type = 5  // Storm/Birch — mid ring
    else type = 4                  // Basalt/Dune — outer
    return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
  },
}

const designName = process.argv[2] || 'river2'
const output = process.argv[3] || '/tmp/custom-design.png'
const grout = process.argv[4] || '484040'

const designFn = designs[designName]
if (!designFn) { console.error(`Unknown: ${designName}. Have: ${Object.keys(designs).join(', ')}`); process.exit(1) }

let rStr = ''
for (let r = 0; r < S.rows; r++) {
  for (let c = 0; c < S.cols; c++) {
    if (!inMask(r, c)) { rStr += '0-'; continue }
    const { type, rotation } = designFn(r, c)
    rStr += (rotation % 4) + type.toString(16)
  }
}

const port = detectPort()
if (!port) { console.error('Dev server not running'); process.exit(1) }

const params = new URLSearchParams()
params.set('l', 'staircase')
params.set('ts', '1x1')
params.set('t', '00')
params.set('g', grout)
params.set('sz', '56')
params.set('gw', '3')
params.set('r', rStr)

const url = `http://localhost:${port}/TileViewer/#${params.toString()}`
console.log(`Design: ${designName} → ${output}`)

try {
  execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
  console.log(`Done: ${output}`)
} catch (e) { console.error('Failed'); process.exit(1) }
