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

// River helper: given a center-line function and width, produce type
function riverType(dist, coreW, edgeW) {
  if (Math.abs(dist) < coreW) return 7        // Surf/Sunbeam — core
  if (Math.abs(dist) < coreW + edgeW) return 6 // Sunbeam/Denim — edge
  return 5                                      // Storm/Birch — field
}

const designs = {

  // 1. Thin River — narrower band, same diagonal from upper-right toward lower-left
  thin: {
    fn: (r, c) => {
      // Line from (row=0, col=8) toward (row=13, col=0)
      const dist = (c - 8) + (r * 8/13)
      const type = Math.abs(dist) < 1.0 ? 7 : Math.abs(dist) < 2.0 ? 6 : 5
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
    name: 'thin',
  },

  // 2. Split River — enters from door (upper right), splits: one branch toward
  //    downstairs (left gap), one branch continues down toward lower-left (upstairs)
  split: {
    fn: (r, c) => {
      // Main river from door: diagonal from upper-right
      const mainDist = (c - 8) + (r * 0.65)
      // Split point around row 6-7
      // Branch A: curves left toward the gap (upward-left)
      const branchA = r < 7 ? Infinity : (c - 1) + (r - 7) * 0.3
      // Branch B: continues steeper toward lower-left
      const branchB = r < 7 ? Infinity : (c - 5) + (r - 7) * 0.8

      const distA = Math.abs(branchA)
      const distB = Math.abs(branchB)
      const distMain = r <= 8 ? Math.abs(mainDist) : Infinity

      const minDist = Math.min(distMain, distA, distB)

      let type = 5
      if (minDist < 1.2) type = 7
      else if (minDist < 2.2) type = 6
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
    name: 'split',
  },

  // 3. Door Flow — river originates right at the front door (upper right, row 0-1, col 7-8)
  //    and fans outward as it flows deeper into the space
  doorflow: {
    fn: (r, c) => {
      // Fan from upper-right corner
      const centerLine = 8 - r * 0.5
      const dist = c - centerLine
      // Width increases as we go down
      const width = 0.8 + r * 0.15
      const edgeW = 0.8 + r * 0.1
      let type = 5
      if (Math.abs(dist) < width) type = 7
      else if (Math.abs(dist) < width + edgeW) type = 6
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
    name: 'doorflow',
  },

  // 4. Meander — sinusoidal river path, organic and playful
  meander: {
    fn: (r, c) => {
      const centerCol = 4.5 + Math.sin(r * 0.6) * 2.5
      const dist = c - centerCol
      let type = 5
      if (Math.abs(dist) < 1.2) type = 7
      else if (Math.abs(dist) < 2.3) type = 6
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
    name: 'meander',
  },

  // 5. Confluence — two thin rivers meeting in the center of the lower section
  //    One from front door (upper right), one from lower-left, meeting ~row 8
  confluence: {
    fn: (r, c) => {
      // River A: from upper-right (door) flowing down-left
      const distA = Math.abs((c - 8) + r * 0.55)
      // River B: from lower-left flowing up-right
      const distB = Math.abs((c - 0) - (14 - r) * 0.55)
      const minDist = Math.min(distA, distB)
      // Where they meet (around r=7-8, c=4), make it wider
      const meetDist = Math.sqrt(Math.pow(r - 8, 2) + Math.pow(c - 4, 2))
      const meetBonus = meetDist < 2 ? -0.5 : meetDist < 3.5 ? -0.3 : 0

      let type = 5
      if (minDist + meetBonus < 1.0) type = 7
      else if (minDist + meetBonus < 2.0) type = 6
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040',
    name: 'confluence',
  },

  // 6. Warm River — same diagonal as original but using Redwood/Surf as the river
  //    and Redwood/Dune as transition, Birch/Dune as field. Warm earthy palette.
  warmriver: {
    fn: (r, c) => {
      const dist = (c * 1.0) - (r * 0.55) + 1.5
      let type
      if (dist > 2.5 && dist < 5.5) type = 11      // Redwood/Surf — core (burgundy + teal)
      else if (dist > 1.5 && dist < 6.5) type = 9   // Redwood/Dune — edge (burgundy + sand)
      else type = 1                                   // Birch/Dune — field (warm cream)
      return { type, rotation: ((r + c) % 4) }
    },
    grout: 'C8B890',
    name: 'warmriver',
  },
}

// ─── Run ────────────────────────────────────────────────────────────────────
const port = detectPort()
if (!port) { console.error('Dev server not running'); process.exit(1) }

const which = process.argv[2]
if (which && designs[which]) {
  const d = designs[which]
  const hash = buildHash(d.fn, d.grout)
  const output = process.argv[3] || `/tmp/river-${d.name}.png`
  const url = `http://localhost:${port}/TileViewer/#${hash}`
  console.log(`HASH:${hash}`)
  execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
  console.log(`Done: ${output}`)
} else {
  // Run all
  for (const [key, d] of Object.entries(designs)) {
    const hash = buildHash(d.fn, d.grout)
    const output = `/tmp/river-${key}.png`
    const url = `http://localhost:${port}/TileViewer/#${hash}`
    console.log(`HASH_${key}:${hash}`)
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 500`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  }
}
