#!/usr/bin/env node
/**
 * designs-water.mjs — "Flowing Water & Creek" tile designs.
 *
 * Four designs using arc rotations to create intentional water-flow movement:
 *   water_thin_creek    — A narrow winding creek through a Birch/Dune landscape
 *   water_wide_river    — A broad river with Dune banks and Denim/Storm depths
 *   water_stepping      — Stepping stones (arcs) across a field of water cuts
 *   water_rain_puddles  — Scattered puddle clusters with radiating arc ripples
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

// Rotation semantics for arcs:
//   0 = default, 1 = 90° CW, 2 = 180°, 3 = 270° CW
// Adjacent arcs with complementary rotations create flowing S-curves.

// Pinwheel helpers
const pinIn = (tr, tc) => [[2, 3], [1, 0]][tr % 2][tc % 2]
const pinOut = (tr, tc) => [[0, 1], [3, 2]][tr % 2][tc % 2]

// Hash-based pseudo-random
const hash = (r, c, seed = 0) => ((r * 31 + c * 47 + seed * 13 + r * c * 7) % 131 + 131) % 131

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
// 1. THIN CREEK — A narrow winding creek flowing from upper-right (door) down
//    to lower-left (stairs). Arc rotations follow the flow direction. Banks are
//    Dune/Birch arcs; creek bed is Surf/Denim cuts with occasional Storm.
// ═══════════════════════════════════════════════════════════════════════════════
designs.water_thin_creek = {
  fn: (r, c) => {
    // Creek center follows a sinusoidal path from upper-right to lower-left.
    // In the upper section (rows 0-11) it starts at ~col 14, by row 33 it's ~col 3.
    const t = r / S.rows
    const creekCenter = 14 - t * 11 + Math.sin(r * 0.45) * 2.2
    const dist = Math.abs(c - creekCenter)

    // Creek bed: narrow band of 1×1 cuts (width ~2.5 cells)
    if (dist < 2.0) {
      const h = hash(r, c, 17)
      // Vary water color along the creek — deeper in center
      if (dist < 0.8) {
        if (h < 40) return { type: cut(G.Storm), rotation: 0 }
        if (h < 90) return { type: cut(G.Denim), rotation: 0 }
        return { type: cut(G.Surf), rotation: 0 }
      }
      // Shallower edges
      if (h < 50) return { type: cut(G.Surf), rotation: 0 }
      if (h < 80) return { type: cut(G.Denim), rotation: 0 }
      return { type: cut(G.Birch), rotation: 0 } // sandy bottom showing through
    }

    // Creek banks: a strip of Dune/Birch arcs with rotation pointing TOWARD the creek
    // This creates the visual effect of the bank curving into the water.
    if (dist < 4.5 && r % 2 === 0 && c % 2 === 0) {
      const onLeft = c < creekCenter
      // Rotation guides the eye along the flow direction (downward-left)
      // Left bank: arcs curve right (toward water), right bank: arcs curve left
      if (dist < 3.0) {
        // Inner bank — Dune/Birch for sandy bank
        const rot = onLeft ? 1 : 3 // point toward creek
        return { type: ARC.DuneBirch, rotation: rot }
      }
      // Outer bank — Birch/Dune, gentler
      const rot = onLeft ? 0 : 2
      return { type: ARC.BirchDune, rotation: rot }
    }

    // Pebbles scattered near banks
    if (dist < 5.5) {
      const h = hash(r, c, 41)
      if (h < 25) return { type: cut(G.Dune), rotation: 0 }
      if (h < 40) return { type: cut(G.Birch), rotation: 0 }
    }

    // Background landscape: Birch/Denim arcs in a calm pinwheel
    if (r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BirchDune, rotation: pinIn(r / 2, c / 2) }
    }
    return null
  },
  grout: '8A8070',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. WIDE RIVER — A broad river filling the center, flowing from top to bottom.
//    Uses arc tiles IN the water with rotations creating current/eddies.
//    Deep center = Storm arcs, shallows = Surf/Sunbeam arcs, banks = Dune rects.
// ═══════════════════════════════════════════════════════════════════════════════
designs.water_wide_river = {
  fn: (r, c) => {
    // River occupies roughly the center third, widening as it descends.
    // Upper section limited to cols 8-17, so river center starts at ~12.
    const t = r / S.rows
    const riverCenter = r < S.upperRows ? 12.5 : 9.0
    const riverWidth = r < S.upperRows ? 3.5 : (5.0 + t * 2.5)
    const dist = Math.abs(c - riverCenter)

    // River flow direction: arcs rotate to suggest downward current.
    // Use a flowing pattern: alternate rotations row-by-row for movement.
    const flowRot = (tr, tc) => {
      // S-curve flow: even tile-rows flow right, odd flow left
      // This creates a meandering current pattern
      const phase = Math.floor(r / 4) % 2
      if (phase === 0) return tc % 2 === 0 ? 0 : 1  // rightward flow
      return tc % 2 === 0 ? 2 : 3  // leftward flow
    }

    // Deep channel (center third of river)
    if (dist < riverWidth * 0.35 && r % 2 === 0 && c % 2 === 0) {
      // Storm/Birch arcs — dark water, flowing
      return { type: ARC.StormBirch, rotation: flowRot(r / 2, c / 2) }
    }

    // Mid-stream (between center and edges)
    if (dist < riverWidth * 0.7 && r % 2 === 0 && c % 2 === 0) {
      // Denim/Birch — medium water
      return { type: ARC.DenimBirch, rotation: flowRot(r / 2, c / 2) }
    }

    // Shallows (outer river)
    if (dist < riverWidth) {
      if (r % 2 === 0 && c % 2 === 0) {
        // Surf/Sunbeam arcs — light sparkling water
        return { type: ARC.SurfSunbeam, rotation: flowRot(r / 2, c / 2) }
      }
      // Fill shallow gaps with surf cuts
      const h = hash(r, c, 7)
      if (h < 60) return { type: cut(G.Surf), rotation: 0 }
      return { type: cut(G.Denim), rotation: 0 }
    }

    // River bank: horizontal rects as sediment layers
    if (dist < riverWidth + 1.5) {
      if (c % 2 === 0) return { type: horiz(G.Dune), rotation: 0 }
      return null
    }

    // Bank transition: vertical rects (like reeds/roots)
    if (dist < riverWidth + 3.0) {
      if (r % 2 === 0) return { type: vert(G.Dune), rotation: 0 }
      return null
    }

    // Dry land: Birch/Dune arcs, calm and static
    if (r % 2 === 0 && c % 2 === 0) {
      return { type: ARC.BirchDune, rotation: 2 } // all same rotation = calm/static
    }
    return null
  },
  grout: '585858',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. STEPPING STONES — Large stepping-stone arcs (Dune/Birch, Basalt/Dune)
//    placed in a diagonal path across a field of water. Water is Surf/Denim
//    cuts flowing around the stones. Stones are 2×2 arcs with rotation
//    oriented to suggest the water parting around them.
// ═══════════════════════════════════════════════════════════════════════════════
designs.water_stepping = {
  fn: (r, c) => {
    // Stepping stones placed along a diagonal path from upper-right to lower-left.
    // Each stone is a 2×2 arc tile. Stones are spaced ~4 rows apart.
    const stones = [
      // [row, col, arcType, rotation] — placed to suggest a walking path
      { r: 0, c: 14, type: ARC.BasaltDune, rot: 2 },
      { r: 2, c: 12, type: ARC.DuneBirch, rot: 1 },
      { r: 4, c: 14, type: ARC.BasaltDune, rot: 0 },
      { r: 6, c: 12, type: ARC.DuneBirch, rot: 3 },
      { r: 8, c: 10, type: ARC.BasaltDune, rot: 2 },
      { r: 10, c: 12, type: ARC.DuneBirch, rot: 1 },
      { r: 12, c: 10, type: ARC.BasaltDune, rot: 0 },
      { r: 14, c: 8, type: ARC.DuneBirch, rot: 3 },
      { r: 16, c: 10, type: ARC.BasaltDune, rot: 2 },
      { r: 18, c: 8, type: ARC.DuneBirch, rot: 1 },
      { r: 20, c: 6, type: ARC.BasaltDune, rot: 0 },
      { r: 22, c: 8, type: ARC.DuneBirch, rot: 3 },
      { r: 24, c: 6, type: ARC.BasaltDune, rot: 2 },
      { r: 26, c: 4, type: ARC.DuneBirch, rot: 1 },
      { r: 28, c: 6, type: ARC.BasaltDune, rot: 0 },
      { r: 30, c: 4, type: ARC.DuneBirch, rot: 3 },
      { r: 32, c: 2, type: ARC.BasaltDune, rot: 2 },
    ]

    // Check if this cell is a stone anchor
    for (const s of stones) {
      if (r === s.r && c === s.c) {
        return { type: s.type, rotation: s.rot }
      }
      // Mark occupied cells as null so buildHash skips them
      if (r >= s.r && r < s.r + 2 && c >= s.c && c < s.c + 2) {
        return null
      }
    }

    // Water: arcs flowing around stones. Use Denim/Birch and Surf/Sunbeam arcs
    // with rotation that suggests horizontal flow (left to right, like a current).
    if (r % 2 === 0 && c % 2 === 0) {
      // Check proximity to any stone to create eddies
      let nearStone = false
      let nearestStone = null
      let minDist = Infinity
      for (const s of stones) {
        const dr = r - s.r
        const dc = c - s.c
        const d = Math.sqrt(dr * dr + dc * dc)
        if (d < minDist) { minDist = d; nearestStone = s }
        if (d < 5) nearStone = true
      }

      if (nearStone && nearestStone) {
        // Eddy: arcs swirl around the stone
        const dr = r - nearestStone.r
        const dc = c - nearestStone.c
        // Determine which quadrant relative to stone -> rotation
        let rot
        if (dr <= 0 && dc >= 0) rot = 1  // above-right: flow down
        else if (dr >= 0 && dc >= 0) rot = 2  // below-right: flow left
        else if (dr >= 0 && dc <= 0) rot = 3  // below-left: flow up
        else rot = 0  // above-left: flow right
        return { type: ARC.DenimBirch, rotation: rot }
      }

      // Open water: gentle flowing arcs
      const phase = Math.floor(r / 6) % 2
      const rot = phase === 0 ? (c % 4 === 0 ? 0 : 1) : (c % 4 === 0 ? 2 : 3)
      const h = hash(r, c, 23)
      const waterType = h < 70 ? ARC.SurfSunbeam : ARC.DenimBirch
      return { type: waterType, rotation: rot }
    }

    // Fill remaining single cells with water cuts
    const h = hash(r, c, 31)
    if (h < 45) return { type: cut(G.Surf), rotation: 0 }
    if (h < 80) return { type: cut(G.Denim), rotation: 0 }
    return { type: cut(G.Storm), rotation: 0 }
  },
  grout: '506068',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RAIN PUDDLES — Scattered puddle clusters on a Dune/Birch ground.
//    Each puddle is a ring of arcs with rotations radiating outward (ripple effect).
//    Puddle centers are Surf/Storm cuts. Ground between puddles uses Dune/Birch
//    rects as pavers and scattered Basalt cuts as wet spots.
// ═══════════════════════════════════════════════════════════════════════════════
designs.water_rain_puddles = {
  fn: (r, c) => {
    // Puddle centers — scattered across the grid
    const puddles = [
      { r: 2, c: 12, size: 3.5 },
      { r: 4, c: 16, size: 2.0 },
      { r: 8, c: 10, size: 2.8 },
      { r: 14, c: 3, size: 4.0 },
      { r: 14, c: 13, size: 3.0 },
      { r: 20, c: 8, size: 3.8 },
      { r: 22, c: 1, size: 2.5 },
      { r: 22, c: 15, size: 2.8 },
      { r: 28, c: 5, size: 3.5 },
      { r: 28, c: 12, size: 2.5 },
      { r: 32, c: 9, size: 2.0 },
    ]

    // Find closest puddle
    let closestDist = Infinity
    let closestPuddle = null
    for (const p of puddles) {
      const dr = r - p.r
      const dc = c - p.c
      const d = Math.sqrt(dr * dr + dc * dc)
      if (d < closestDist) {
        closestDist = d
        closestPuddle = p
      }
    }

    // Inside a puddle
    if (closestPuddle && closestDist < closestPuddle.size) {
      const p = closestPuddle
      const innerRatio = closestDist / p.size

      // Center of puddle: water cuts
      if (innerRatio < 0.4) {
        const h = hash(r, c, 53)
        if (h < 50) return { type: cut(G.Surf), rotation: 0 }
        if (h < 85) return { type: cut(G.Denim), rotation: 0 }
        return { type: cut(G.Storm), rotation: 0 }
      }

      // Ripple ring: arc tiles with rotation radiating outward from center
      if (r % 2 === 0 && c % 2 === 0) {
        const dr = r - p.r
        const dc = c - p.c
        // Determine outward-facing rotation based on angle from puddle center
        let rot
        if (Math.abs(dc) > Math.abs(dr)) {
          rot = dc > 0 ? 1 : 3  // east or west
        } else {
          rot = dr > 0 ? 2 : 0  // south or north
        }
        // Alternate arc types for visual interest
        const h = hash(r, c, 67)
        if (h < 60) return { type: ARC.SurfSunbeam, rotation: rot }
        return { type: ARC.DenimBirch, rotation: rot }
      }

      // Fill remaining ripple cells with transitional cuts
      const h = hash(r, c, 71)
      if (h < 50) return { type: cut(G.Surf), rotation: 0 }
      return { type: cut(G.Dune), rotation: 0 }
    }

    // Ground between puddles: a paver pattern using horizontal/vertical rects
    // Basket-weave style suggests a patio or path surface
    const blockR = Math.floor(r / 2) % 2
    const blockC = Math.floor(c / 2) % 2

    // Occasional wet spots (dark cuts) scattered on the ground
    const h = hash(r, c, 89)
    if (h < 8) return { type: cut(G.Storm), rotation: 0 }
    if (h < 14) return { type: cut(G.Basalt), rotation: 0 }

    // Paver pattern
    if (blockR === blockC) {
      if (c % 2 === 0) return { type: horiz(G.Dune), rotation: 0 }
      return null
    } else {
      if (r % 2 === 0) return { type: vert(G.Birch), rotation: 0 }
      return null
    }
  },
  grout: 'A09880',
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
  const h = buildHash(d.fn, d.grout)
  const output = `/tmp/gen-${key}.png`
  const url = `http://localhost:${port}/TileViewer/#${h}`
  console.log(`HASH_${key}:${h}`)
  try {
    execSync(`shot-scraper "${url}" -s "#canvas" -o "${output}" --width 1400 --height 1000 --wait 600`, { stdio: 'inherit' })
    console.log(`Done: ${output}`)
  } catch { console.error(`Failed: ${key}`) }
}
