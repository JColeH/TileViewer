#!/usr/bin/env node
/**
 * designs-texture.mjs — "Texture & Material Contrast" designs.
 *
 * Four designs that use ZONES of different tile sizes to create visual texture
 * contrast. Mid-century modern: clean zones, intentional transitions.
 *
 * Tile reference:
 *   Arc 2×2 (0-11), Vert 1×2 (12-21), Horiz 2×1 (22-31), Cut 1×1 (32-41)
 *   Glaze: 0=Birch,1=Dune,2=Coral,3=Sunbeam,4=Poppy,5=Redwood,6=Denim,7=Storm,8=Surf,9=Basalt
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

const G = { Birch: 0, Dune: 1, Coral: 2, Sunbeam: 3, Poppy: 4, Redwood: 5, Denim: 6, Storm: 7, Surf: 8, Basalt: 9 }
const vert = i => 12 + i
const horiz = i => 22 + i
const cut = i => 32 + i

const ARC = {
  BirchDenim: 0, BirchDune: 1, DenimBirch: 2, DuneBirch: 3,
  BasaltDune: 4, StormBirch: 5, SunbeamDenim: 6, SurfSunbeam: 7,
  RedwoodCoral: 8, RedwoodDune: 9, RedwoodSunbeam: 10, RedwoodSurf: 11,
}

const pinIn = (tr, tc) => [[2,3],[1,0]][tr%2][tc%2]
const pinOut = (tr, tc) => [[0,1],[3,2]][tr%2][tc%2]

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

const designs = {}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TEXTURE_FRAMED_PANELS
//    Rect border frames an arc interior, with cut-tile corner accents.
//    Think mid-century picture frames: clean rect perimeter, smooth arc fill.
// ═══════════════════════════════════════════════════════════════════════════════
designs.texture_framed_panels = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    // L-shape edges: define the border precisely for each cell
    const inUpper = r < S.upperRows
    const leftEdge = inUpper ? S.upperOffset : 0
    const rightEdge = S.cols - 1
    const topEdge = 0
    const botEdge = S.rows - 1
    // The inner corner of the L: horizontal step at row 12, cols 0-7
    // and vertical step at col 8, rows 0-11

    // Distance from each L-shape edge
    const dTop = r - topEdge
    const dBot = botEdge - r
    const dLeft = c - leftEdge
    const dRight = rightEdge - c
    // Inner corner edges (only relevant near the step)
    const dStepH = inUpper ? Infinity : r - S.upperRows  // dist from horizontal step edge (row 12) going down
    const dStepV = (!inUpper && c < S.upperOffset) ? Infinity : (inUpper ? Infinity : Infinity)

    // For cells in the lower section near the step
    const nearStepTop = !inUpper && r < S.upperRows + 2 && c < S.upperOffset  // top of lower-left area

    // Outer border (ring 0-1): Redwood rects
    const distToEdge = Math.min(
      dTop, dBot, dLeft, dRight,
      // Step edges for the inner corner
      (!inUpper && c < S.upperOffset) ? (r - S.upperRows) : Infinity,
    )

    const isOuterBorder = distToEdge <= 1
    // Inner accent line (ring 2): Sunbeam cut tiles
    const isInnerAccent = distToEdge === 2

    if (isOuterBorder) {
      // Horizontal rects along top/bottom/step-horizontal edges
      const onHorizEdge = dTop <= 1 || dBot <= 1 || nearStepTop
      const onVertEdge = dLeft <= 1 || dRight <= 1

      if (onHorizEdge && c % 2 === 0) {
        return { type: horiz(G.Redwood), rotation: 0 }
      }
      if (onVertEdge && r % 2 === 0) {
        return { type: vert(G.Redwood), rotation: 0 }
      }
      // Fill remaining border cells with Redwood cuts
      return { type: cut(G.Redwood), rotation: 0 }
    }

    if (isInnerAccent) {
      // Thin accent line of Sunbeam cuts just inside the border
      return { type: cut(G.Sunbeam), rotation: 0 }
    }

    // Interior: smooth arc field with tonal variation
    if (r % 2 === 0 && c % 2 === 0) {
      const tr = r / 2, tc = c / 2
      const pattern = (tr + tc) % 3
      if (pattern === 0) return { type: ARC.BirchDune, rotation: pinIn(tr, tc) }
      if (pattern === 1) return { type: ARC.DuneBirch, rotation: pinIn(tr, tc) }
      return { type: ARC.BirchDune, rotation: pinOut(tr, tc) }
    }
    return null
  },
  grout: 'C0BDB8',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TEXTURE_RUNWAY
//    A central "runway" path of smooth arc tiles flanked by rough cut-tile
//    fields on each side. Like a polished walkway through gravel.
//    Mid-century: strong central axis, bilateral symmetry.
// ═══════════════════════════════════════════════════════════════════════════════
designs.texture_runway = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    // For the upper L-shape, shift the center
    const minC = r < S.upperRows ? S.upperOffset : 0
    const localCols = S.cols - minC
    const center = minC + localCols / 2

    // Runway is 6 cells wide (3 arc tiles across)
    const distFromCenter = Math.abs(c - center + 0.5)

    // Runway edge: single column of vertical rects as a crisp border
    if (distFromCenter >= 2.5 && distFromCenter < 3.5) {
      if (r % 2 === 0) return { type: vert(G.Dune), rotation: 0 }
      return null
    }

    // Runway center: arc tiles
    if (distFromCenter < 2.5) {
      if (r % 2 === 0 && c % 2 === 0) {
        // Alternate between two arc types for subtle rhythm
        const tr = r / 2, tc = c / 2
        const alt = (tr + tc) % 2 === 0
        return {
          type: alt ? ARC.BirchDune : ARC.DuneBirch,
          rotation: pinIn(tr, tc)
        }
      }
      return null
    }

    // Flanking fields: cut tile "gravel" in muted tones
    const hash = ((r * 29 + c * 41 + r * c * 3) % 97)
    if (hash < 30) return { type: cut(G.Storm), rotation: 0 }
    if (hash < 55) return { type: cut(G.Basalt), rotation: 0 }
    if (hash < 75) return { type: cut(G.Denim), rotation: 0 }
    return { type: cut(G.Birch), rotation: 0 }
  },
  grout: '686060',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. TEXTURE_GRADIENT
//    Horizontal bands that transition from fine cut-tile texture at the top
//    (near the door) through rect texture in the middle to smooth arc texture
//    at the bottom (near shoe rack). A gradient of coarseness.
//    Clean mid-century horizontal banding.
// ═══════════════════════════════════════════════════════════════════════════════
designs.texture_gradient = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    const pct = r / (S.rows - 1)

    // Zone 1 (top ~30%): fine cut-tile texture — Birch and Dune mosaic
    if (pct < 0.28) {
      const hash = ((r * 19 + c * 37) % 53)
      if (hash < 20) return { type: cut(G.Birch), rotation: 0 }
      if (hash < 35) return { type: cut(G.Dune), rotation: 0 }
      return { type: cut(G.Storm), rotation: 0 }
    }

    // Transition strip 1: single row of horizontal rects
    if (pct >= 0.28 && pct < 0.32) {
      if (c % 2 === 0) return { type: horiz(G.Redwood), rotation: 0 }
      return null
    }

    // Zone 2 (~32-62%): vertical rect field — medium texture
    if (pct < 0.60) {
      if (r % 2 === 0) {
        // Alternate columns between two rect colors
        const alt = Math.floor(c / 2) % 3
        const colors = [G.Dune, G.Birch, G.Surf]
        return { type: vert(colors[alt]), rotation: 0 }
      }
      return null
    }

    // Transition strip 2: horizontal rects again
    if (pct >= 0.60 && pct < 0.64) {
      if (c % 2 === 0) return { type: horiz(G.Redwood), rotation: 0 }
      return null
    }

    // Zone 3 (bottom ~36%): smooth arc field — large, calm texture
    if (r % 2 === 0 && c % 2 === 0) {
      const tr = r / 2, tc = c / 2
      // Gentle alternation between warm arcs
      const alt = (tr + tc) % 3
      if (alt === 0) return { type: ARC.BirchDune, rotation: pinIn(tr, tc) }
      if (alt === 1) return { type: ARC.DuneBirch, rotation: pinOut(tr, tc) }
      return { type: ARC.StormBirch, rotation: pinIn(tr, tc) }
    }
    return null
  },
  grout: '908880',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. TEXTURE_CHECKERBOARD
//    Large-scale checkerboard of texture zones: alternating 4×4 blocks of
//    arc tiles and cut tiles. Each "square" on the checkerboard has a
//    completely different tactile quality. Rect borders at zone boundaries.
//    Bold mid-century geometric pattern.
// ═══════════════════════════════════════════════════════════════════════════════
designs.texture_checkerboard = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null

    const blockSize = 4
    const blockR = Math.floor(r / blockSize)
    const blockC = Math.floor(c / blockSize)
    const localR = r % blockSize
    const localC = c % blockSize

    // Zone boundary: if on the edge of a block, use rect tiles as mortar lines
    const isBlockEdgeH = localR === 0  // top edge of each block
    const isBlockEdgeV = localC === 0  // left edge of each block

    if (isBlockEdgeH && isBlockEdgeV) {
      // Corner of block boundary — cut tile accent
      return { type: cut(G.Redwood), rotation: 0 }
    }
    if (isBlockEdgeH) {
      // Horizontal seam between blocks
      if (c % 2 === 0) return { type: horiz(G.Dune), rotation: 0 }
      return null
    }
    if (isBlockEdgeV) {
      // Vertical seam between blocks
      if (r % 2 === 0) return { type: vert(G.Dune), rotation: 0 }
      return null
    }

    // Interior of each block: alternate texture
    const checker = (blockR + blockC) % 2 === 0

    if (checker) {
      // Arc zone — smooth, flowing
      if (r % 2 === 0 && c % 2 === 0) {
        return { type: ARC.StormBirch, rotation: pinIn(r / 2, c / 2) }
      }
      // Odd cells within arc blocks that don't get an arc anchor:
      // fill with a matching cut so no gaps
      if (r % 2 !== 0 || c % 2 !== 0) {
        // Only fill if this cell wouldn't be covered by an arc above/left
        // The arc at (r-r%2, c-c%2) covers this cell if it was placed
        // Let buildHash handle it — return null so the arc claims it
        return null
      }
      return null
    } else {
      // Cut zone — fine, granular texture
      const hash = ((r * 23 + c * 31) % 47)
      if (hash < 15) return { type: cut(G.Birch), rotation: 0 }
      if (hash < 28) return { type: cut(G.Basalt), rotation: 0 }
      return { type: cut(G.Storm), rotation: 0 }
    }
  },
  grout: '585050',
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
