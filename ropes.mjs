#!/usr/bin/env node
/**
 * Rope/braid variations. The braided effect comes from connected arcs —
 * rotation 0 and 2 (or 1 and 3) link adjacent tiles into smooth curves.
 */
import { execSync } from 'child_process'

const S = { cols: 9, rows: 14, upperOffset: 3, upperRows: 5 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }
function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try { execSync(`curl -s -o /dev/null http://localhost:${p}/TileViewer/ 2>/dev/null`); return p } catch {}
  }
  return null
}

// Template-based hash builder
function buildTemplateHash(tRows, tCols, tmpl, grout, cellRot) {
  // tmpl: array of [typeIndex, rotation] for each template cell, row-major
  let tStr = ''
  for (const [t, r] of tmpl) { tStr += t.toString(16) + (r % 4) }
  // cellRot: either a number (uniform) or function(r,c)=>rotation
  let rStr = ''
  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      const rot = typeof cellRot === 'function' ? cellRot(r, c) : cellRot
      rStr += (rot % 4) + '-'
    }
  }
  const params = new URLSearchParams()
  params.set('l', 'staircase'); params.set('ts', `${tRows}x${tCols}`)
  params.set('t', tStr); params.set('g', grout)
  params.set('sz', '56'); params.set('gw', '3'); params.set('r', rStr)
  return params.toString()
}

// Per-cell hash builder
function buildCellHash(designFn, grout) {
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

const designs = {

  // ── Reference: original braid (4×4 template, Birch/Denim, all rot 0/2 checker) ──
  // Already have this one, skip

  // 1. Tight Braid — 2×2 template, denser rope lines
  tight: {
    type: 'template',
    tRows: 2, tCols: 2,
    tmpl: [[0,0],[0,2],[0,2],[0,0]],
    grout: 'C0BDB8', cellRot: 0,
  },

  // 2. Wide Braid — 4×4 with 2-wide same-rotation bands = thicker rope
  wide: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [0,0],[0,0],[0,2],[0,2],
      [0,0],[0,0],[0,2],[0,2],
      [0,2],[0,2],[0,0],[0,0],
      [0,2],[0,2],[0,0],[0,0],
    ],
    grout: 'C0BDB8', cellRot: 0,
  },

  // 3. Color Braid — Birch/Denim + Denim/Birch (inverted pair), the rope becomes visible
  color: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [0,2],[2,0],[0,2],[2,0],
      [2,0],[0,2],[2,0],[0,2],
      [0,2],[2,0],[0,2],[2,0],
      [2,0],[0,2],[2,0],[0,2],
    ],
    grout: 'C0BDB8', cellRot: 0,
  },

  // 4. Teal Rope — Surf/Sunbeam rope on Birch/Denim background
  teal: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [7,2],[0,0],[7,2],[0,0],
      [0,0],[7,2],[0,0],[7,2],
      [7,2],[0,0],[7,2],[0,0],
      [0,0],[7,2],[0,0],[7,2],
    ],
    grout: '484040', cellRot: 0,
  },

  // 5. Warm Rope — Redwood/Coral on Dune/Birch cream
  warm: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [8,2],[3,0],[8,2],[3,0],
      [3,0],[8,2],[3,0],[8,2],
      [8,2],[3,0],[8,2],[3,0],
      [3,0],[8,2],[3,0],[8,2],
    ],
    grout: 'C8B890', cellRot: 0,
  },

  // 6. Dark Rope — Basalt/Dune on Storm/Birch, dramatic
  dark: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [4,2],[5,0],[4,2],[5,0],
      [5,0],[4,2],[5,0],[4,2],
      [4,2],[5,0],[4,2],[5,0],
      [5,0],[4,2],[5,0],[4,2],
    ],
    grout: '484040', cellRot: 0,
  },

  // 7. Triple Braid — 3 colors interweaving in 3×3 template
  triple: {
    type: 'template',
    tRows: 3, tCols: 3,
    tmpl: [
      [7,2],[0,0],[8,2],
      [0,0],[8,2],[7,0],
      [8,2],[7,0],[0,2],
    ],
    grout: '484040', cellRot: 0,
  },

  // 8. Diagonal Braid — rotations 1/3 instead of 0/2 for diagonal flow
  diagonal: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [0,1],[0,3],[0,1],[0,3],
      [0,3],[0,1],[0,3],[0,1],
      [0,1],[0,3],[0,1],[0,3],
      [0,3],[0,1],[0,3],[0,1],
    ],
    grout: 'C0BDB8', cellRot: 0,
  },

  // 9. Cross Braid — horizontal AND vertical ropes crossing
  cross: {
    type: 'template',
    tRows: 4, tCols: 4,
    tmpl: [
      [0,0],[0,1],[0,2],[0,3],
      [0,3],[0,0],[0,1],[0,2],
      [0,2],[0,3],[0,0],[0,1],
      [0,1],[0,2],[0,3],[0,0],
    ],
    grout: 'C0BDB8', cellRot: 0,
  },

  // 10. Serpentine — per-cell, a single thick rope that snakes left-right
  serpentine: {
    type: 'cell',
    fn: (r, c) => {
      // Rope center oscillates left/right
      const centerCol = 4.5 + Math.sin(r * 0.8) * 3
      const dist = Math.abs(c - centerCol)
      const isRope = dist < 1.8
      // Rotation follows the rope direction
      const slope = Math.cos(r * 0.8) * 3 * 0.8 // derivative of center
      const rot = slope > 0.5 ? 1 : slope < -0.5 ? 3 : (r % 2 === 0 ? 0 : 2)
      return { type: isRope ? 7 : 0, rotation: rot }
    },
    grout: '484040',
  },

  // 11. Converging Ropes — ropes get closer together toward the door
  converge: {
    type: 'cell',
    fn: (r, c) => {
      // Multiple rope strands that converge toward upper-right (door)
      const spacing = 1.5 + (13 - r) * 0.15 // wider at bottom, tight at top
      const phase = c % spacing
      const isRope = phase < 0.8 || phase > spacing - 0.8
      const rot = (r % 2 === 0) ? 0 : 2
      return { type: isRope ? 7 : 5, rotation: rot }
    },
    grout: '484040',
  },

  // 12. Helix — two ropes twisting around each other
  helix: {
    type: 'cell',
    fn: (r, c) => {
      const center = 4.5
      const offset1 = Math.sin(r * 0.7) * 2.5
      const offset2 = Math.sin(r * 0.7 + Math.PI) * 2.5
      const d1 = Math.abs(c - (center + offset1))
      const d2 = Math.abs(c - (center + offset2))
      let type = 0 // Birch/Denim background
      if (d1 < 1) type = 7       // Surf/Sunbeam strand 1
      else if (d2 < 1) type = 8  // Redwood/Coral strand 2
      else if (d1 < 1.8) type = 6 // Sunbeam/Denim edge 1
      else if (d2 < 1.8) type = 9 // Redwood/Dune edge 2
      const rot = (r + c) % 2 === 0 ? 0 : 2
      return { type, rotation: rot }
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
  let hash
  if (d.type === 'template') {
    hash = buildTemplateHash(d.tRows, d.tCols, d.tmpl, d.grout, d.cellRot)
  } else {
    hash = buildCellHash(d.fn, d.grout)
  }
  const output = `/tmp/rope-${key}.png`
  const url = `http://localhost:${port}/TileViewer/#${hash}`
  console.log(`HASH_${key}:${hash}`)
  try {
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  } catch { console.error(`Failed: ${key}`) }
}
