#!/usr/bin/env node
/**
 * gen.mjs — Design generator for the doubled grid (18×34 staircase).
 * Each cell is half the old tile size. Arc tiles = 2×2, rects = 1×2/2×1, cuts = 1×1.
 *
 * Tile type indices:
 *   0-11:  Arc tiles (2×2) — Birch/Denim, Birch/Dune, Denim/Birch, Dune/Birch,
 *          Basalt/Dune, Storm/Birch, Sunbeam/Denim, Surf/Sunbeam,
 *          Redwood/Coral, Redwood/Dune, Redwood/Sunbeam, Redwood/Surf
 *   12-21: Vertical rects (1×2) — Birch, Dune, Coral, Sunbeam, Poppy, Redwood, Denim, Storm, Surf, Basalt
 *   22-31: Horizontal rects (2×1) — same order
 *   32-41: Cuts (1×1) — same order
 *
 * Glaze index map (for rects/cuts): 0=Birch,1=Dune,2=Coral,3=Sunbeam,4=Poppy,5=Redwood,6=Denim,7=Storm,8=Surf,9=Basalt
 *   vert(i) = 12 + i, horiz(i) = 22 + i, cut(i) = 32 + i
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

/**
 * Build a v3 URL hash from a design function.
 * designFn(r, c) => { type: number, rotation: number } | null
 * Returns null for empty cells. For multi-cell tiles, only return the anchor (top-left).
 * The function should handle placement logic — we just encode anchors.
 */
function buildHash(designFn, grout) {
  // Build the grid by calling designFn for each cell
  // designFn returns { type, rotation } for anchor cells, null for non-anchors/empty
  const anchors = []
  const occupied = new Set()

  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      if (!inMask(r, c)) continue
      if (occupied.has(`${r},${c}`)) continue
      const result = designFn(r, c)
      if (!result) continue
      const { type, rotation } = result
      // Look up tile dimensions
      const tileW = type <= 11 ? 2 : type <= 21 ? 1 : type <= 31 ? 2 : 1
      const tileH = type <= 11 ? 2 : type <= 21 ? 2 : type <= 31 ? 1 : 1
      // Check bounds
      if (r + tileH > S.rows || c + tileW > S.cols) continue
      // Check all cells are unoccupied and in mask
      let fits = true
      for (let dr = 0; dr < tileH; dr++) {
        for (let dc = 0; dc < tileW; dc++) {
          if (occupied.has(`${r+dr},${c+dc}`) || !inMask(r+dr, c+dc)) { fits = false; break }
        }
        if (!fits) break
      }
      if (!fits) continue
      anchors.push(`${r}.${c}.${type}.${rotation}`)
      for (let dr = 0; dr < tileH; dr++) {
        for (let dc = 0; dc < tileW; dc++) {
          occupied.add(`${r+dr},${c+dc}`)
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

// Helper: fill entire grid with 2×2 arc tiles
function allArcs(type, rotFn) {
  return (r, c) => {
    if (r % 2 !== 0 || c % 2 !== 0) return null
    return { type, rotation: rotFn ? rotFn(r/2, c/2) : 2 }
  }
}

// Helper: pinwheel rotation
const pinIn = (tr, tc) => [[2,3],[1,0]][tr%2][tc%2]
const pinOut = (tr, tc) => [[0,1],[3,2]][tr%2][tc%2]

const designs = {}

// ═══ BASELINE: Re-establish proven designs at doubled resolution ═══

designs.baseline_birch_denim = {
  fn: allArcs(ARC.BirchDenim, pinIn),
  grout: 'C0BDB8',
}

designs.baseline_rope = {
  fn: (r, c) => {
    if (r % 2 !== 0 || c % 2 !== 0) return null
    const tr = r/2, tc = c/2
    const checker = (tr + tc) % 2 === 0
    return { type: ARC.BirchDenim, rotation: checker ? 0 : 2 }
  },
  grout: 'C0BDB8',
}

// ═══ MIXED: Rectangles + arcs ═══

// Forest Floor: arc tiles as canopy, vertical rect "trunks", cut "stones"
designs.forest_floor = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    // Tree trunks: vertical rects at specific columns
    const isTrunk = (c === 3 || c === 7 || c === 11 || c === 15) && r >= 6
    if (isTrunk && r % 2 === 0) return { type: vert(G.Redwood), rotation: 0 }
    if (isTrunk) return null // claimed by vert above

    // Canopy: arc tiles in upper area
    if (r < 14 && r % 2 === 0 && c % 2 === 0) {
      const dist = r / 14
      if (dist < 0.3) return { type: ARC.SurfSunbeam, rotation: pinIn(r/2, c/2) }
      if (dist < 0.6) return { type: ARC.StormBirch, rotation: pinIn(r/2, c/2) }
      return { type: ARC.BirchDune, rotation: pinIn(r/2, c/2) }
    }

    // Ground: scattered cut tiles
    if (r >= 14) {
      const hash = ((r * 23 + c * 41) % 97)
      if (hash < 15) return { type: cut(G.Sunbeam), rotation: 0 }
      if (hash < 30) return { type: cut(G.Dune), rotation: 0 }
      if (hash < 50) return { type: cut(G.Storm), rotation: 0 }
      return { type: cut(G.Birch), rotation: 0 }
    }
    if (r % 2 === 0 && c % 2 === 0) return { type: ARC.StormBirch, rotation: pinIn(r/2, c/2) }
    return null
  },
  grout: '484040',
}

// Birch Bark: horizontal rects creating bark-like horizontal lines with arc accents
designs.birch_bark = {
  fn: (r, c) => {
    // Horizontal bands of birch rects with occasional dark accent
    if (r % 2 === 0 && c % 2 === 0) {
      // Every 6 rows, place arc tiles
      if (r % 6 === 0) return { type: ARC.BirchDenim, rotation: pinIn(r/2, c/2) }
    }
    // Fill with horizontal rects
    if (r % 2 === 0 && c % 2 === 0) return null // skip — let horiz below handle
    if (c % 2 === 0) {
      const band = Math.floor(r / 3) % 3
      const glazes = [G.Birch, G.Dune, G.Birch]
      return { type: horiz(glazes[band]), rotation: 0 }
    }
    return null
  },
  grout: 'E0D8C8',
}

// Moss & Stone: arcs as stones, cuts + verts as moss between them
designs.moss_stone = {
  fn: (r, c) => {
    // Scattered "stones" (arc tiles) with moss (green-toned cuts) between
    const hash = ((r * 31 + c * 47 + r * c * 7) % 131)
    if (r % 2 === 0 && c % 2 === 0) {
      // Place stone ~60% of the time
      if (hash < 80) {
        const stones = [ARC.StormBirch, ARC.BasaltDune, ARC.DenimBirch, ARC.DuneBirch]
        return { type: stones[hash % stones.length], rotation: hash % 4 }
      }
      return null // gap for moss
    }
    // Fill gaps with moss-colored cuts
    if (hash < 40) return { type: cut(G.Surf), rotation: 0 }
    if (hash < 70) return { type: cut(G.Storm), rotation: 0 }
    return { type: cut(G.Dune), rotation: 0 }
  },
  grout: '484040',
}

// Moss & Stone v2: clustered stones, path logic, DuneBirch cohesion
designs.moss_stone_v2 = {
  fn: (r, c) => {
    const hash = ((r * 31 + c * 47 + r * c * 7) % 131)
    const hash2 = ((r * 53 + c * 29 + r * c * 11) % 97)

    // Define a path from door (upper-right, ~col 16, row 0) to stairs down (gap)
    // and stairs up (lower-left, ~col 2, row 33)
    // Path curves through the middle
    const pathCenterCol = r < 12
      ? 13 + Math.sin(r * 0.3) * 2   // upper section: near col 13
      : 13 - (r - 12) * 0.5 + Math.sin(r * 0.2) * 1.5  // curves left as we go down
    const distFromPath = Math.abs(c - pathCenterCol)
    const onPath = distFromPath < 3.5
    const nearPath = distFromPath < 5.5

    // Shoe rack area: bottom 4 rows — mostly small cuts
    const isShoeRack = r >= 30

    // Edge detection: near the boundary of the L-shape
    const isEdge = (r < 12 && (c <= 9 || c >= 16)) || r <= 1 || r >= 32 || c <= 1 || c >= 16

    // Stone clustering: use a cellular pattern to create clusters
    // Cluster centers at pseudo-random positions
    const clusterX = Math.floor(c / 4) * 4 + 2
    const clusterY = Math.floor(r / 4) * 4 + 2
    const clusterDist = Math.sqrt((r - clusterY) ** 2 + (c - clusterX) ** 2)
    const inCluster = clusterDist < 2.5 && hash2 < 70

    // Arc stones: place on even grid positions
    if (r % 2 === 0 && c % 2 === 0) {
      // Shoe rack: no stones, all cuts
      if (isShoeRack) return null

      // On path: high stone density, larger clusters
      if (onPath && (hash < 95 || inCluster)) {
        // Primarily DuneBirch for cohesion, occasional StormBirch for variety
        if (hash2 < 75) return { type: ARC.DuneBirch, rotation: hash % 4 }
        return { type: ARC.StormBirch, rotation: hash % 4 }
      }

      // Near path: medium density
      if (nearPath && hash < 65) {
        if (hash2 < 60) return { type: ARC.DuneBirch, rotation: hash % 4 }
        if (hash2 < 85) return { type: ARC.StormBirch, rotation: hash % 4 }
        return { type: ARC.BasaltDune, rotation: hash % 4 }
      }

      // Edges: sparse stones, smaller fragments preferred (skip arcs more)
      if (isEdge && hash < 30) {
        return { type: ARC.DuneBirch, rotation: hash % 4 }
      }

      // General area: moderate density
      if (!isEdge && hash < 55) {
        if (hash2 < 65) return { type: ARC.DuneBirch, rotation: hash % 4 }
        return { type: ARC.StormBirch, rotation: hash % 4 }
      }

      return null // gap for moss
    }

    // Vertical rect "cracks" between stones — like thick moss seams
    if (c % 2 === 0 && r % 2 === 1 && !isShoeRack) {
      // Place vertical cracks occasionally between stone clusters
      if (hash < 20 && nearPath) {
        return { type: vert(hash2 < 50 ? G.Surf : G.Storm), rotation: 0 }
      }
    }

    // Moss fills — vary between green (Surf) and gray (Storm) with some Dune
    if (isShoeRack) {
      // Shoe rack: earth-toned cuts that hide dirt
      if (hash < 35) return { type: cut(G.Storm), rotation: 0 }
      if (hash < 65) return { type: cut(G.Dune), rotation: 0 }
      return { type: cut(G.Basalt), rotation: 0 }
    }

    // Near path: more green moss (Surf)
    if (onPath) {
      if (hash < 45) return { type: cut(G.Surf), rotation: 0 }
      if (hash < 75) return { type: cut(G.Storm), rotation: 0 }
      return { type: cut(G.Dune), rotation: 0 }
    }

    // Edges: more gray/storm moss
    if (isEdge) {
      if (hash < 30) return { type: cut(G.Surf), rotation: 0 }
      if (hash < 70) return { type: cut(G.Storm), rotation: 0 }
      return { type: cut(G.Dune), rotation: 0 }
    }

    // General: balanced moss
    if (hash < 40) return { type: cut(G.Surf), rotation: 0 }
    if (hash < 70) return { type: cut(G.Storm), rotation: 0 }
    return { type: cut(G.Dune), rotation: 0 }
  },
  grout: '4A3F35',
}

// River Stones: a flowing path of cut tiles through arc tile field
designs.river_stones = {
  fn: (r, c) => {
    const centerCol = 9 + Math.sin(r * 0.25) * 4
    const dist = Math.abs(c - centerCol)

    // River bed: cuts and small tiles
    if (dist < 2.5) {
      const hash = ((r * 17 + c * 31) % 67)
      if (hash < 20) return { type: cut(G.Surf), rotation: 0 }
      if (hash < 35) return { type: cut(G.Denim), rotation: 0 }
      if (hash < 50) return { type: cut(G.Storm), rotation: 0 }
      return { type: cut(G.Birch), rotation: 0 }
    }

    // River bank: vertical rects as reeds
    if (dist < 4 && r % 2 === 0) {
      return { type: vert(dist < 3 ? G.Dune : G.Storm), rotation: 0 }
    }

    // Field: arc tiles
    if (r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BirchDune, rotation: pinIn(r/2, c/2) }
    }
    return null
  },
  grout: '686060',
}

// Woven Earth: alternating horizontal and vertical rects creating a basket weave
designs.woven_earth = {
  fn: (r, c) => {
    const blockR = Math.floor(r / 2) % 2
    const blockC = Math.floor(c / 2) % 2
    if (blockR === blockC) {
      // Horizontal pair
      if (c % 2 === 0) return { type: horiz(G.Dune), rotation: 0 }
      return null
    } else {
      // Vertical pair
      if (r % 2 === 0) return { type: vert(G.Redwood), rotation: 0 }
      return null
    }
  },
  grout: 'C8B890',
}

// Autumn Leaves: arc tiles with scattered warm cut accents
designs.autumn_leaves = {
  fn: (r, c) => {
    const hash = ((r * 29 + c * 43 + r * c * 11) % 157)
    if (r % 2 === 0 && c % 2 === 0) {
      // Mostly Storm/Birch arcs
      if (hash < 100) return { type: ARC.StormBirch, rotation: pinIn(r/2, c/2) }
      // Occasional warm arc
      if (hash < 120) return { type: ARC.RedwoodCoral, rotation: pinIn(r/2, c/2) }
      return { type: ARC.SunbeamDenim, rotation: pinIn(r/2, c/2) }
    }
    return null
  },
  grout: '484040',
}

// Mountain Ridge: gradient from dark basalt at bottom to birch at top, with rect transitions
designs.mountain_ridge = {
  fn: (r, c) => {
    const pct = r / S.rows
    // Summit: birch arcs
    if (pct < 0.25 && r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BirchDenim, rotation: pinOut(r/2, c/2) }
    }
    // Treeline: mix of rects
    if (pct >= 0.25 && pct < 0.45) {
      if (r % 2 === 0) return { type: vert(G.Surf), rotation: 0 }
      return null
    }
    // Midslope: storm arcs
    if (pct >= 0.45 && pct < 0.65 && r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.StormBirch, rotation: pinIn(r/2, c/2) }
    }
    // Base: horizontal rects (earth layers)
    if (pct >= 0.65 && pct < 0.8) {
      if (c % 2 === 0) return { type: horiz(G.Redwood), rotation: 0 }
      return null
    }
    // Foundation: basalt arcs
    if (pct >= 0.8 && r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BasaltDune, rotation: 2 }
    }
    return null
  },
  grout: '484040',
}

// Fern Pattern: vertical rect stems with cut tile fronds
designs.fern_v2 = {
  fn: (r, c) => {
    // Three fern stems
    const stems = [4, 9, 14]
    for (const sc of stems) {
      if (c === sc && r % 2 === 0 && r >= 4) return { type: vert(G.Basalt), rotation: 0 }
      // Fronds: cuts extending right from stem
      const frondDist = c - sc
      if (frondDist > 0 && frondDist <= 3 && r >= 4) {
        if (r % 3 === 0 && frondDist <= (3 - (r % 6) / 2)) {
          return { type: cut(G.Surf), rotation: 0 }
        }
      }
      // Fronds left
      const lDist = sc - c
      if (lDist > 0 && lDist <= 3 && r >= 4) {
        if ((r + 1) % 3 === 0 && lDist <= (3 - ((r+1) % 6) / 2)) {
          return { type: cut(G.Dune), rotation: 0 }
        }
      }
    }
    // Background: birch arcs
    if (r % 2 === 0 && c % 2 === 0) return { type: ARC.BirchDune, rotation: 2 }
    return null
  },
  grout: 'C0BDB8',
}

// Pebble Beach: all cuts in varied earth tones
designs.pebble_beach = {
  fn: (r, c) => {
    const hash = ((r * 37 + c * 53 + r * c * 3) % 113)
    const colors = [G.Birch, G.Dune, G.Storm, G.Denim, G.Surf, G.Birch, G.Dune, G.Birch]
    return { type: cut(colors[hash % colors.length]), rotation: 0 }
  },
  grout: '686060',
}

// Woodland Border: arc field with a decorative rect border
designs.woodland_border = {
  fn: (r, c) => {
    const isBorder = r <= 1 || r >= S.rows - 2 || c <= 1 || c >= S.cols - 2 ||
                     (r < S.upperRows && c <= S.upperOffset + 1)
    if (isBorder) {
      // Alternate vert and horiz rects for the border
      if (r <= 1 || r >= S.rows - 2) {
        if (c % 2 === 0) return { type: horiz(G.Redwood), rotation: 0 }
        return null
      }
      if (r % 2 === 0) return { type: vert(G.Redwood), rotation: 0 }
      return null
    }
    // Interior: arc tiles
    if (r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BirchDenim, rotation: pinIn(r/2, c/2) }
    }
    return null
  },
  grout: '484040',
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
