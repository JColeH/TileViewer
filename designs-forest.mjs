#!/usr/bin/env node
/**
 * designs-forest.mjs — "Forest & Canopy" tile designs for the staircase.
 *
 * 4 designs that evoke the feeling of living in a forest:
 *   forest_tree_rings   — Concentric ring patterns from arc tiles, like cross-sections of trees
 *   forest_dappled_light — Dark canopy arcs with bright light patches breaking through
 *   forest_root_network  — Dark rectangles weaving root-like through lighter ground
 *   forest_canopy_above  — Looking up through branches at sky, Redwood arcs radiating from trunks
 */
import { execSync } from 'child_process'

const S = { cols: 18, rows: 34, upperOffset: 8, upperRows: 12 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }

function detectPort() {
  for (const p of [5173, 5174, 5175, 5176]) {
    try { execSync(`curl -s -o /dev/null http://localhost:${p}/TileViewer/ 2>/dev/null`); return p } catch {}
  }
  return null
}

// Glaze helpers
const G = { Birch: 0, Dune: 1, Coral: 2, Sunbeam: 3, Poppy: 4, Redwood: 5, Denim: 6, Storm: 7, Surf: 8, Basalt: 9 }
const vert = i => 12 + i
const horiz = i => 22 + i
const cut = i => 32 + i

// Arc tile indices
const ARC = {
  BirchDenim: 0, BirchDune: 1, DenimBirch: 2, DuneBirch: 3,
  BasaltDune: 4, StormBirch: 5, SunbeamDenim: 6, SurfSunbeam: 7,
  RedwoodCoral: 8, RedwoodDune: 9, RedwoodSunbeam: 10, RedwoodSurf: 11,
}

const pinIn = (tr, tc) => [[2, 3], [1, 0]][tr % 2][tc % 2]
const pinOut = (tr, tc) => [[0, 1], [3, 2]][tr % 2][tc % 2]

function buildHash(designFn, grout) {
  const anchors = []
  const occupied = new Set()
  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      if (!inMask(r, c)) continue
      if (occupied.has(`${r},${c}`)) continue
      const result = designFn(r, c)
      if (!result) continue
      const { type, rotation } = result
      const tileW = type <= 11 ? 2 : type <= 21 ? 1 : type <= 31 ? 2 : 1
      const tileH = type <= 11 ? 2 : type <= 21 ? 2 : type <= 31 ? 1 : 1
      if (r + tileH > S.rows || c + tileW > S.cols) continue
      let fits = true
      for (let dr = 0; dr < tileH; dr++) {
        for (let dc = 0; dc < tileW; dc++) {
          if (occupied.has(`${r + dr},${c + dc}`) || !inMask(r + dr, c + dc)) { fits = false; break }
        }
        if (!fits) break
      }
      if (!fits) continue
      anchors.push(`${r}.${c}.${type}.${rotation}`)
      for (let dr = 0; dr < tileH; dr++) {
        for (let dc = 0; dc < tileW; dc++) {
          occupied.add(`${r + dr},${c + dc}`)
        }
      }
    }
  }
  const params = new URLSearchParams()
  params.set('v', '3')
  params.set('l', 'staircase')
  params.set('g', grout)
  params.set('sz', '56')
  params.set('gw', '3')
  params.set('a', anchors.join(';'))
  return params.toString()
}

const designs = {}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 1: forest_tree_rings
// Concentric arc-tile rings emanating from "tree centers" placed across the
// staircase. Each center uses Redwood arcs (the heartwood), surrounded by
// progressively lighter rings — Storm, Basalt/Dune, then Birch/Dune at the
// outer edge. The quarter-circle arc tiles literally read as growth rings.
// Between the ring clusters, Dune/Birch cuts fill as bark or ground.
// ═══════════════════════════════════════════════════════════════════════════════
designs.forest_tree_rings = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    // Define tree centers (in tile-pair coords, so multiply by 2 for cell coords)
    // Placed to create overlapping ring patterns across the L-shape
    const centers = [
      { cr: 4, cc: 12 },   // upper section
      { cr: 16, cc: 4 },   // mid-left
      { cr: 16, cc: 14 },  // mid-right
      { cr: 28, cc: 9 },   // lower section
    ]

    // For arc tiles: only anchor at even coords
    if (r % 2 === 0 && c % 2 === 0) {
      // Find distance to nearest tree center
      let minDist = Infinity
      for (const { cr, cc } of centers) {
        const dr = r - cr
        const dc = c - cc
        const d = Math.sqrt(dr * dr + dc * dc)
        if (d < minDist) minDist = d
      }

      // Determine ring and rotation based on nearest center
      // Rotation: orient the arc curve to face the center (creates ring effect)
      let bestCenter = centers[0]
      let bestDist = Infinity
      for (const ctr of centers) {
        const d = Math.sqrt((r - ctr.cr) ** 2 + (c - ctr.cc) ** 2)
        if (d < bestDist) { bestDist = d; bestCenter = ctr }
      }

      // Quadrant relative to center determines rotation so arcs curve around it
      const dr = r - bestCenter.cr
      const dc = c - bestCenter.cc
      let rot
      if (dr <= 0 && dc <= 0) rot = 0      // top-left of center: curve faces bottom-right
      else if (dr <= 0 && dc > 0) rot = 1   // top-right: curve faces bottom-left
      else if (dr > 0 && dc > 0) rot = 2    // bottom-right: curve faces top-left
      else rot = 3                            // bottom-left: curve faces top-right

      // Ring layers: heartwood -> sapwood -> bark -> outer bark
      if (bestDist < 3) return { type: ARC.RedwoodDune, rotation: rot }
      if (bestDist < 6) return { type: ARC.RedwoodSunbeam, rotation: rot }
      if (bestDist < 9) return { type: ARC.StormBirch, rotation: rot }
      if (bestDist < 13) return { type: ARC.BasaltDune, rotation: rot }
      // Outermost: light ground between trees
      return { type: ARC.DuneBirch, rotation: rot }
    }

    return null
  },
  grout: '5C4A3A',  // warm dark brown — like bark
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 2: forest_dappled_light
// A predominantly dark field of Storm/Birch and Basalt/Dune arcs (the canopy
// overhead) with irregular bright "holes" where sunlight breaks through —
// scattered Sunbeam and Birch cut tiles. A few Redwood arcs mark where thick
// branches cross overhead. The overall effect is looking down at a forest
// floor dappled with light patches.
// ═══════════════════════════════════════════════════════════════════════════════
designs.forest_dappled_light = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    // Pseudo-random hash for organic scattering
    const h = ((r * 37 + c * 59 + r * c * 13) % 211)
    const h2 = ((r * 53 + c * 29 + (r + 3) * (c + 7) * 11) % 179)

    // Light patches: irregular clusters of bright cut tiles
    // Use a second hash to create organic clusters (not uniform scatter)
    const clusterSeed = ((Math.floor(r / 3) * 71 + Math.floor(c / 3) * 43) % 97)
    const isLightZone = clusterSeed < 22  // ~22% of 3x3 regions are "light zones"

    if (isLightZone) {
      // Within a light zone, mostly bright cuts with some dark gaps
      if (h < 70) return { type: cut(G.Sunbeam), rotation: 0 }
      if (h < 120) return { type: cut(G.Birch), rotation: 0 }
      if (h < 150) return { type: cut(G.Dune), rotation: 0 }
      // Even in light zones, some shadow
      return { type: cut(G.Storm), rotation: 0 }
    }

    // Canopy: dark arc tiles
    if (r % 2 === 0 && c % 2 === 0) {
      // Occasional Redwood arcs as thick branches overhead
      if (h < 18) return { type: ARC.RedwoodDune, rotation: h % 4 }
      if (h < 30) return { type: ARC.RedwoodSurf, rotation: h2 % 4 }
      // Main canopy: dark arcs
      if (h < 100) return { type: ARC.StormBirch, rotation: pinIn(r / 2, c / 2) }
      if (h < 160) return { type: ARC.BasaltDune, rotation: pinOut(r / 2, c / 2) }
      return { type: ARC.DenimBirch, rotation: pinIn(r / 2, c / 2) }
    }

    // Between arcs in non-light zones: dark ground cuts
    if (h < 60) return { type: cut(G.Storm), rotation: 0 }
    if (h < 100) return { type: cut(G.Basalt), rotation: 0 }
    if (h < 130) return { type: cut(G.Denim), rotation: 0 }
    // Occasional small light speck even in dark zones
    if (h < 140) return { type: cut(G.Sunbeam), rotation: 0 }
    return { type: cut(G.Storm), rotation: 0 }
  },
  grout: '3A3530',  // very dark — deep shadow
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 3: forest_root_network
// Dark Redwood and Storm vertical rects weave downward like roots from the
// upper section (where a "tree" stands) into lighter Birch/Dune ground below.
// Horizontal Redwood rects create lateral root runs. Bright Birch/Dune arcs
// form the earth between the roots. Cuts fill the remaining gaps as soil and
// small stones. The roots branch and spread as they descend the staircase.
// ═══════════════════════════════════════════════════════════════════════════════
designs.forest_root_network = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    const h = ((r * 41 + c * 67 + r * c * 5) % 149)

    // Define root paths: columns where roots run vertically, shifting as they descend
    // Main taproot from upper section
    const rootPaths = [
      // Each root: { col, startRow, endRow, branches }
      // Taproot 1 from upper area
      { col: r => 12, startRow: 0, endRow: 33 },
      // Taproot 2
      { col: r => 14, startRow: 0, endRow: 28 },
      // Left spreading root
      { col: r => Math.max(0, 10 - Math.floor((r - 12) / 4)), startRow: 12, endRow: 33 },
      // Right spreading root
      { col: r => Math.min(17, 14 + Math.floor((r - 10) / 5)), startRow: 10, endRow: 30 },
      // Deep left root
      { col: r => Math.max(0, 8 - Math.floor((r - 16) / 3)), startRow: 16, endRow: 33 },
      // Far left root
      { col: r => 3, startRow: 20, endRow: 33 },
      // Shallow right root
      { col: r => 16, startRow: 14, endRow: 24 },
      // Mid root
      { col: r => 7, startRow: 18, endRow: 33 },
    ]

    // Check if current cell is on a root path
    let onRoot = false
    for (const rp of rootPaths) {
      if (r >= rp.startRow && r <= rp.endRow) {
        const rootCol = rp.col(r)
        if (c === rootCol || c === rootCol + 1) { onRoot = true; break }
      }
    }

    // Lateral root connections (horizontal)
    const isLateral = (
      (r === 16 && c >= 8 && c <= 14) ||
      (r === 22 && c >= 3 && c <= 12) ||
      (r === 26 && c >= 2 && c <= 16) ||
      (r === 30 && c >= 1 && c <= 8) ||
      (r === 19 && c >= 12 && c <= 16)
    )

    // Root tiles: vertical rects for main roots
    if (onRoot && r % 2 === 0) {
      if (h < 80) return { type: vert(G.Redwood), rotation: 0 }
      return { type: vert(G.Storm), rotation: 0 }
    }
    if (onRoot) return null  // occupied by vert above

    // Lateral roots: horizontal rects
    if (isLateral && c % 2 === 0) {
      if (h < 90) return { type: horiz(G.Redwood), rotation: 0 }
      return { type: horiz(G.Storm), rotation: 0 }
    }
    if (isLateral) return null  // occupied by horiz above

    // Earth between roots: lighter arcs
    if (r % 2 === 0 && c % 2 === 0) {
      if (h < 50) return { type: ARC.DuneBirch, rotation: pinIn(r / 2, c / 2) }
      if (h < 90) return { type: ARC.BirchDune, rotation: pinOut(r / 2, c / 2) }
      if (h < 110) return { type: ARC.BirchDenim, rotation: pinIn(r / 2, c / 2) }
      // Some darker earth patches
      return { type: ARC.StormBirch, rotation: h % 4 }
    }

    // Soil fill: cut tiles in earth tones
    if (h < 50) return { type: cut(G.Dune), rotation: 0 }
    if (h < 85) return { type: cut(G.Birch), rotation: 0 }
    if (h < 105) return { type: cut(G.Storm), rotation: 0 }
    return { type: cut(G.Dune), rotation: 0 }
  },
  grout: '5C4A3A',  // bark brown
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN 4: forest_canopy_above
// Looking straight up into the canopy. A central "trunk" column of Redwood
// vertical rects rises through the middle, with Redwood arc tiles radiating
// outward as major branches. Between branches, Storm and Denim arcs form
// dense leaf cover. Scattered Sunbeam cuts are glimpses of sky. The effect
// is radial and organic — a view from the forest floor looking up.
// ═══════════════════════════════════════════════════════════════════════════════
designs.forest_canopy_above = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    const h = ((r * 47 + c * 31 + r * c * 9) % 193)

    // Central trunk — a column of Redwood verts running through the staircase
    // Trunk center shifts for the L-shape: col 12-13 in upper, col 8-9 in lower
    const trunkCol = r < S.upperRows ? 12 : 8
    const onTrunk = (c === trunkCol || c === trunkCol + 1)

    if (onTrunk) {
      if (r % 2 === 0) return { type: vert(G.Redwood), rotation: 0 }
      return null
    }

    // Second smaller trunk
    const trunk2Col = r < S.upperRows ? 16 : 14
    const onTrunk2 = (c === trunk2Col)
    if (onTrunk2 && r >= 4) {
      if (r % 2 === 0) return { type: vert(G.Redwood), rotation: 0 }
      return null
    }

    // Distance from main trunk for branch/leaf logic
    const dist = Math.abs(c - trunkCol)

    // Branches: Redwood arcs radiating from trunk at intervals
    if (r % 2 === 0 && c % 2 === 0) {
      // Branch zones: every ~6 rows, arcs near the trunk are Redwood
      const isBranchRow = (r % 6 < 2)

      if (isBranchRow && dist <= 6) {
        // Rotation: branches radiate outward from trunk
        const rot = c < trunkCol ? (r % 4 === 0 ? 3 : 0) : (r % 4 === 0 ? 2 : 1)
        if (dist <= 3) return { type: ARC.RedwoodSunbeam, rotation: rot }
        return { type: ARC.RedwoodDune, rotation: rot }
      }

      // Dense leaf canopy
      if (h < 55) return { type: ARC.StormBirch, rotation: pinIn(r / 2, c / 2) }
      if (h < 100) return { type: ARC.DenimBirch, rotation: pinOut(r / 2, c / 2) }
      if (h < 130) return { type: ARC.BasaltDune, rotation: pinIn(r / 2, c / 2) }
      // Lighter patches deeper in canopy
      if (h < 150) return { type: ARC.SurfSunbeam, rotation: pinOut(r / 2, c / 2) }
      return { type: ARC.StormBirch, rotation: h % 4 }
    }

    // Gaps between arcs: sky glimpses and leaf fragments
    if (h < 25) return { type: cut(G.Sunbeam), rotation: 0 }  // sky!
    if (h < 45) return { type: cut(G.Birch), rotation: 0 }    // bright leaf
    if (h < 90) return { type: cut(G.Storm), rotation: 0 }    // dark leaf
    if (h < 120) return { type: cut(G.Denim), rotation: 0 }   // shadow
    return { type: cut(G.Basalt), rotation: 0 }                // deep shade
  },
  grout: '3A3530',  // deep forest shadow
}

// ─── Run ────────────────────────────────────────────────────────────────────
const port = detectPort()
if (!port) { console.error('Dev server not running'); process.exit(1) }

const which = process.argv[2]
const entries = which ? [[which, designs[which]]] : Object.entries(designs)
if (which && !designs[which]) {
  console.error(`Unknown: ${which}. Available: ${Object.keys(designs).join(', ')}`)
  process.exit(1)
}

for (const [key, d] of entries) {
  if (!d) continue
  const hash = buildHash(d.fn, d.grout)
  const output = `/tmp/gen-${key}.png`
  const url = `http://localhost:${port}/TileViewer/#${hash}`
  console.log(`HASH_${key}:${hash}`)
  try {
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 600`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  } catch { console.error(`Failed: ${key}`) }
}
