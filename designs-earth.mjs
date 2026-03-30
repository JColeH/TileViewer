#!/usr/bin/env node
/**
 * designs-earth.mjs — "Organic Earth" tile designs for mid-century deck house staircase.
 * Forest floor, moss, lichen, bark, soil, fallen leaves, dappled light.
 * 4 genuinely different interpretations of organic earth.
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

// Seeded pseudo-random for reproducible organic randomness
function hashCell(r, c, seed) {
  let h = (r * 2654435761 + c * 40503 + seed * 12345) ^ 0x5f3759df
  h = ((h >> 16) ^ h) * 0x45d9f3b
  h = ((h >> 16) ^ h) * 0x45d9f3b
  return ((h >> 16) ^ h) & 0x7fffffff
}

const pinIn = (tr, tc) => [[2,3],[1,0]][tr%2][tc%2]
const pinOut = (tr, tc) => [[0,1],[3,2]][tr%2][tc%2]

const designs = {}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. EARTH_STRATA — Geological layering: horizontal bands that shift in color
//    and tile size as you move from door (top-right) down toward shoe rack.
//    Top = light birch/dune (sky/canopy), middle = redwood arcs (bark/soil),
//    bottom = basalt/storm cuts (bedrock). Transition zones use rects.
//    The L-shape gap naturally reads as a cliff edge.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_strata = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const pct = r / S.rows
    const h = hashCell(r, c, 1)

    // Layer 1: Canopy light (rows 0-7) — Birch/Dune arcs with dappled Sunbeam cuts
    if (pct < 0.22) {
      if (r % 2 === 0 && c % 2 === 0) {
        if (h % 7 === 0) return { type: ARC.SunbeamDenim, rotation: pinOut(r/2, c/2) }
        return { type: ARC.BirchDune, rotation: pinIn(r/2, c/2) }
      }
      return null
    }

    // Layer 2: Transition — horizontal Dune rects with occasional Birch cuts
    if (pct < 0.30) {
      if (c % 2 === 0) {
        if (h % 5 === 0) return { type: cut(G.Sunbeam), rotation: 0 }
        return { type: horiz(G.Dune), rotation: 0 }
      }
      if (h % 4 === 0) return { type: cut(G.Birch), rotation: 0 }
      return null
    }

    // Layer 3: Bark/soil — Redwood-heavy arcs with mixed rotations
    if (pct < 0.55) {
      if (r % 2 === 0 && c % 2 === 0) {
        const arcChoices = [ARC.RedwoodDune, ARC.RedwoodCoral, ARC.RedwoodSunbeam, ARC.DuneBirch]
        const pick = arcChoices[h % arcChoices.length]
        // Organic rotation: not a strict pinwheel, more chaotic
        const rot = (h >> 4) % 4
        return { type: pick, rotation: rot }
      }
      return null
    }

    // Layer 4: Subsoil transition — vertical Redwood and Storm rects
    if (pct < 0.68) {
      if (r % 2 === 0) {
        const rectColors = [G.Redwood, G.Redwood, G.Storm, G.Dune]
        return { type: vert(rectColors[h % rectColors.length]), rotation: 0 }
      }
      return null
    }

    // Layer 5: Bedrock — dense mix of Basalt/Storm arcs and dark cuts
    if (r % 2 === 0 && c % 2 === 0) {
      if (h % 5 === 0) return { type: ARC.StormBirch, rotation: (h >> 3) % 4 }
      return { type: ARC.BasaltDune, rotation: pinIn(r/2, c/2) }
    }
    // Fill gaps with dark cuts
    if (h % 3 === 0) return { type: cut(G.Basalt), rotation: 0 }
    return { type: cut(G.Storm), rotation: 0 }
  },
  grout: '5C4A3A',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. EARTH_LICHEN — Organic clusters scattered on a warm Dune/Birch field.
//    "Lichen patches" are groups of small cut tiles in Surf/Storm (cool moss tones)
//    growing outward from seed points. The background is warm Redwood/Dune arcs.
//    Uses Perlin-like noise to create organic blob shapes.
//    Sparse — lots of warm arcs with occasional cool disruptions.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_lichen = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const h = hashCell(r, c, 42)

    // Define lichen seed centers (in grid coordinates)
    const seeds = [
      { r: 3, c: 12, radius: 3.5 },
      { r: 8, c: 10, radius: 2.5 },
      { r: 15, c: 5, radius: 4 },
      { r: 14, c: 14, radius: 3 },
      { r: 22, c: 3, radius: 3.5 },
      { r: 22, c: 11, radius: 2.8 },
      { r: 28, c: 8, radius: 3 },
      { r: 30, c: 15, radius: 2.5 },
      { r: 18, c: 9, radius: 2 },
    ]

    // Check if cell is within any lichen patch (with fuzzy edges)
    let inLichen = false
    let closestDist = Infinity
    for (const s of seeds) {
      const dist = Math.sqrt((r - s.r) ** 2 + (c - s.c) ** 2)
      // Fuzzy edge: use hash to jitter the boundary
      const jitter = (h % 10) / 10 - 0.5
      if (dist < s.radius + jitter) {
        inLichen = true
        closestDist = Math.min(closestDist, dist)
        break
      }
    }

    if (inLichen) {
      // Lichen interior: small tiles in cool earth tones
      // Center = more Surf, edge = more Storm/Dune transition
      if (closestDist < 1.5) {
        // Core: vertical rects for texture variety
        if (r % 2 === 0 && h % 3 === 0) return { type: vert(G.Surf), rotation: 0 }
        const coreCuts = [G.Surf, G.Surf, G.Storm, G.Denim]
        return { type: cut(coreCuts[h % coreCuts.length]), rotation: 0 }
      }
      // Edge: transitional
      if (h % 2 === 0) return { type: cut(G.Storm), rotation: 0 }
      return { type: cut(G.Dune), rotation: 0 }
    }

    // Background: warm earth arcs
    if (r % 2 === 0 && c % 2 === 0) {
      const bgArcs = [ARC.RedwoodDune, ARC.RedwoodDune, ARC.DuneBirch, ARC.BirchDune, ARC.RedwoodSunbeam]
      const pick = bgArcs[h % bgArcs.length]
      return { type: pick, rotation: pinIn(r/2, c/2) }
    }
    return null
  },
  grout: '8B7355',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. EARTH_WOVEN_BARK — Basket weave meets tree bark.
//    Alternating blocks of horizontal and vertical rects create a woven texture,
//    but with organic interruptions: some blocks are replaced by 2x2 arcs
//    (knots in the bark) or single cuts (worn patches). The weave is not
//    perfectly regular — it shifts rhythm based on position. Warm palette:
//    Redwood and Dune rects, with Birch/Dune and Redwood arcs as knots.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_woven_bark = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const h = hashCell(r, c, 77)

    // Divide into 2x2 blocks for the weave pattern
    const blockR = Math.floor(r / 2)
    const blockC = Math.floor(c / 2)
    const blockH = hashCell(blockR, blockC, 77)

    // ~15% of blocks become "knots" (arc tiles)
    if (blockH % 100 < 15 && r % 2 === 0 && c % 2 === 0) {
      const knotArcs = [ARC.RedwoodDune, ARC.RedwoodCoral, ARC.DuneBirch, ARC.BirchDune]
      return { type: knotArcs[blockH % knotArcs.length], rotation: (blockH >> 4) % 4 }
    }
    // Skip non-anchor cells within knot blocks
    if (blockH % 100 < 15) return null

    // ~8% of cells become "worn patches" (individual cuts)
    if (h % 100 < 8) {
      const wornColors = [G.Birch, G.Dune, G.Sunbeam]
      return { type: cut(wornColors[h % wornColors.length]), rotation: 0 }
    }

    // Main weave pattern — alternating horizontal and vertical rects
    // Shift the pattern every few rows for organic feel
    const shift = Math.floor(r / 6) % 2
    const weaveH = (blockR + blockC + shift) % 2 === 0

    if (weaveH) {
      // Horizontal rect block
      if (c % 2 === 0) {
        const horizColors = [G.Redwood, G.Redwood, G.Dune, G.Redwood, G.Storm]
        return { type: horiz(horizColors[blockH % horizColors.length]), rotation: 0 }
      }
      return null
    } else {
      // Vertical rect block
      if (r % 2 === 0) {
        const vertColors = [G.Dune, G.Dune, G.Redwood, G.Birch, G.Dune]
        return { type: vert(vertColors[blockH % vertColors.length]), rotation: 0 }
      }
      return null
    }
  },
  grout: '6B5B45',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. EARTH_DAPPLED — Dappled sunlight through forest canopy.
//    Mostly warm Redwood/Dune arcs as the shaded ground, with irregular pools
//    of "light" (Sunbeam/Birch cuts and rects) that fall in organic patterns.
//    Light pools are larger and brighter near the door (upper right, where
//    natural light enters) and fade toward the shoe rack (lower left).
//    The composition draws the eye from the bright doorway inward.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_dappled = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const h = hashCell(r, c, 99)

    // Distance from door (upper right corner at approximately r=0, c=17)
    const doorR = 1, doorC = 17
    const dist = Math.sqrt((r - doorR) ** 2 + (c - doorC) ** 2)
    const maxDist = Math.sqrt(34 ** 2 + 18 ** 2)

    // Light probability decreases with distance from door
    // Near door: ~40% light. Far corner: ~5% light.
    const lightProb = Math.max(5, 40 - (dist / maxDist) * 35)
    const isLight = (h % 100) < lightProb

    if (isLight) {
      // Light pool — mix of tile sizes for organic feel
      const lightH = hashCell(r, c, 200)

      // Try to place light arcs near door for bigger pools
      if (dist < 12 && r % 2 === 0 && c % 2 === 0 && lightH % 3 === 0) {
        return { type: ARC.BirchDune, rotation: pinOut(r/2, c/2) }
      }

      // Horizontal light streaks
      if (c % 2 === 0 && lightH % 4 === 0) {
        return { type: horiz(G.Birch), rotation: 0 }
      }

      // Vertical light shafts
      if (r % 2 === 0 && lightH % 5 === 0) {
        return { type: vert(G.Sunbeam), rotation: 0 }
      }

      // Individual light spots
      const lightCuts = [G.Sunbeam, G.Birch, G.Sunbeam, G.Dune, G.Birch]
      return { type: cut(lightCuts[lightH % lightCuts.length]), rotation: 0 }
    }

    // Shaded ground: warm arcs
    if (r % 2 === 0 && c % 2 === 0) {
      // Vary shade depth based on position
      const shadeH = hashCell(r/2, c/2, 150)
      const shadeArcs = [
        ARC.RedwoodDune, ARC.RedwoodDune, ARC.RedwoodSunbeam,
        ARC.DuneBirch, ARC.StormBirch, ARC.RedwoodCoral
      ]
      return { type: shadeArcs[shadeH % shadeArcs.length], rotation: (shadeH >> 3) % 4 }
    }

    // Fill remaining shade with dark cuts
    if (h % 4 === 0) return { type: cut(G.Redwood), rotation: 0 }
    if (h % 4 === 1) return { type: cut(G.Storm), rotation: 0 }
    return { type: cut(G.Dune), rotation: 0 }
  },
  grout: '6B5B45',
}

// ═══════════════════════════════════════════════════════════════════════════════
// EARTH_LICHEN_V2 — Improved organic lichen patches.
//   Changes: fewer patches near door, more size variation in patches,
//   feathered edges using rects, varied background arc rotations,
//   gradient: sparser near door (upper-right), denser toward lower-left.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_lichen_v2 = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const h = hashCell(r, c, 42)

    // Distance from door (upper-right) — lichen grows more in sheltered areas
    const doorDist = Math.sqrt((r - 1) ** 2 + (c - 17) ** 2)
    const doorFactor = Math.min(1, doorDist / 25) // 0 near door, 1 far away

    // Lichen seed centers — repositioned to favor lower/left areas
    const seeds = [
      { r: 5, c: 11, radius: 2.0 },   // small spot in upper area
      { r: 10, c: 9, radius: 2.2 },    // near L-junction
      { r: 15, c: 3, radius: 4.5 },    // big colony, lower-left
      { r: 15, c: 13, radius: 3.2 },   // medium, center-right
      { r: 21, c: 1, radius: 3.0 },    // left edge
      { r: 22, c: 10, radius: 3.8 },   // large center patch
      { r: 27, c: 6, radius: 3.5 },    // lower center
      { r: 30, c: 14, radius: 2.8 },   // lower right
      { r: 19, c: 16, radius: 1.8 },   // small satellite
      { r: 25, c: 15, radius: 2.0 },   // small satellite right
      { r: 33, c: 3, radius: 2.5 },    // near shoe rack
    ]

    // Check lichen proximity with organic edge
    let inLichen = false
    let closestDist = Infinity
    let patchRadius = 0
    for (const s of seeds) {
      const dx = c - s.c
      const dy = r - s.r
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Wobble the boundary using hash for organic shape
      const wobble = ((hashCell(r, c, s.r * 100 + s.c) % 20) / 20 - 0.5) * 1.8
      const effectiveRadius = s.radius * (0.7 + doorFactor * 0.3) + wobble
      if (dist < effectiveRadius) {
        inLichen = true
        if (dist < closestDist) {
          closestDist = dist
          patchRadius = effectiveRadius
        }
      }
    }

    // Edge zone: transitional ring around patches
    let inEdge = false
    if (!inLichen) {
      for (const s of seeds) {
        const dist = Math.sqrt((r - s.r) ** 2 + (c - s.c) ** 2)
        const wobble = ((hashCell(r, c, s.r * 100 + s.c) % 20) / 20 - 0.5) * 1.5
        const effectiveRadius = s.radius * (0.7 + doorFactor * 0.3) + wobble
        if (dist < effectiveRadius + 1.5 && dist >= effectiveRadius) {
          inEdge = true
          break
        }
      }
    }

    if (inLichen) {
      const depthRatio = closestDist / patchRadius // 0 = center, 1 = edge

      // Deep core: dense Surf with some Denim arcs for texture
      if (depthRatio < 0.35) {
        if (r % 2 === 0 && c % 2 === 0 && h % 4 === 0) {
          // Occasional small arc in core for variety
          return { type: ARC.SurfSunbeam, rotation: (h >> 2) % 4 }
        }
        if (r % 2 === 0 && h % 5 < 2) return { type: vert(G.Surf), rotation: 0 }
        const coreCuts = [G.Surf, G.Surf, G.Denim, G.Storm, G.Surf]
        return { type: cut(coreCuts[h % coreCuts.length]), rotation: 0 }
      }

      // Mid zone: mixed Storm/Surf with rect texture
      if (depthRatio < 0.7) {
        if (c % 2 === 0 && h % 4 === 0) return { type: horiz(G.Storm), rotation: 0 }
        if (r % 2 === 0 && h % 5 === 0) return { type: vert(G.Denim), rotation: 0 }
        const midCuts = [G.Storm, G.Surf, G.Storm, G.Denim]
        return { type: cut(midCuts[h % midCuts.length]), rotation: 0 }
      }

      // Outer lichen: sparse, transitional cuts
      if (h % 3 === 0) return { type: cut(G.Storm), rotation: 0 }
      if (h % 3 === 1) return { type: cut(G.Dune), rotation: 0 }
      // Let some outer cells fall through to background arcs
    }

    // Edge zone: occasional transitional cuts mixed into background
    if (inEdge && h % 3 === 0) {
      const edgeCuts = [G.Dune, G.Storm, G.Dune]
      return { type: cut(edgeCuts[h % edgeCuts.length]), rotation: 0 }
    }

    // Background: warm stone arcs with varied rotation
    if (r % 2 === 0 && c % 2 === 0) {
      const bh = hashCell(r / 2, c / 2, 88)
      // More Redwood/Dune, with occasional Sunbeam warmth
      const bgArcs = [
        ARC.RedwoodDune, ARC.RedwoodDune, ARC.RedwoodDune,
        ARC.DuneBirch, ARC.RedwoodSunbeam, ARC.RedwoodCoral,
        ARC.BirchDune, ARC.RedwoodDune
      ]
      const pick = bgArcs[bh % bgArcs.length]
      // Mix pinwheel with some random rotation for organic stone feel
      const rot = bh % 7 < 5 ? pinIn(r / 2, c / 2) : (bh >> 3) % 4
      return { type: pick, rotation: rot }
    }
    return null
  },
  grout: '7A6B50',  // slightly cooler brown to let warm tiles pop
}

// ═══════════════════════════════════════════════════════════════════════════════
// EARTH_LICHEN_V3 — Better organic balance.
//   Fixes: removed too-small upper patch, reduced lichen density so background
//   stone shows through, more 2x2 arcs in lichen cores, better transition rects,
//   warmer grout, cleaner bottom rows.
// ═══════════════════════════════════════════════════════════════════════════════
designs.earth_lichen_v3 = {
  fn: (r, c) => {
    if (!inMask(r, c)) return null
    const h = hashCell(r, c, 42)

    // Distance from door (upper-right)
    const doorDist = Math.sqrt((r - 1) ** 2 + (c - 17) ** 2)
    const doorFactor = Math.min(1, doorDist / 28)

    // Lichen colonies — fewer, more intentionally placed
    const seeds = [
      { r: 7, c: 12, radius: 2.5 },    // modest upper patch, away from door
      { r: 14, c: 3, radius: 4.0 },     // large left colony
      { r: 15, c: 14, radius: 2.8 },    // medium right
      { r: 21, c: 2, radius: 3.2 },     // left
      { r: 22, c: 10, radius: 3.0 },    // center — reduced from 3.8
      { r: 27, c: 5, radius: 3.2 },     // lower-left
      { r: 29, c: 13, radius: 2.5 },    // lower-right
      { r: 25, c: 16, radius: 1.5 },    // tiny satellite
      { r: 32, c: 8, radius: 2.0 },     // near shoe rack
    ]

    // Check lichen proximity
    let inLichen = false
    let closestDist = Infinity
    let patchRadius = 0
    for (const s of seeds) {
      const dist = Math.sqrt((r - s.r) ** 2 + (c - s.c) ** 2)
      // Organic boundary wobble
      const wobble = ((hashCell(r, c, s.r * 100 + s.c) % 20) / 20 - 0.5) * 1.6
      const effR = s.radius * (0.75 + doorFactor * 0.25) + wobble
      if (dist < effR) {
        inLichen = true
        if (dist < closestDist) { closestDist = dist; patchRadius = effR }
      }
    }

    // Thin transition ring
    let inEdge = false
    if (!inLichen) {
      for (const s of seeds) {
        const dist = Math.sqrt((r - s.r) ** 2 + (c - s.c) ** 2)
        const wobble = ((hashCell(r, c, s.r * 100 + s.c) % 20) / 20 - 0.5) * 1.2
        const effR = s.radius * (0.75 + doorFactor * 0.25) + wobble
        if (dist < effR + 1.2 && dist >= effR) { inEdge = true; break }
      }
    }

    if (inLichen) {
      const depth = closestDist / patchRadius // 0=center, 1=edge

      // CORE (inner 40%): 2x2 arcs + dense Surf cuts — the "thick growth"
      if (depth < 0.4) {
        if (r % 2 === 0 && c % 2 === 0) {
          // ~40% chance of a lichen-colored arc in the core
          if (h % 5 < 2) return { type: ARC.SurfSunbeam, rotation: (h >> 2) % 4 }
          if (h % 5 === 2) return { type: ARC.SunbeamDenim, rotation: (h >> 2) % 4 }
        }
        // Remaining core cells: dense small tiles
        if (r % 2 === 0 && h % 6 < 2) return { type: vert(G.Surf), rotation: 0 }
        const coreCuts = [G.Surf, G.Surf, G.Denim, G.Storm]
        return { type: cut(coreCuts[h % coreCuts.length]), rotation: 0 }
      }

      // MID (40-70%): sparser, more Storm than Surf
      if (depth < 0.7) {
        // Let ~25% of mid cells show background stone underneath
        if (h % 4 === 0 && r % 2 === 0 && c % 2 === 0) {
          return { type: ARC.RedwoodDune, rotation: pinIn(r / 2, c / 2) }
        }
        if (c % 2 === 0 && h % 5 === 0) return { type: horiz(G.Storm), rotation: 0 }
        if (h % 3 === 0) return { type: cut(G.Storm), rotation: 0 }
        return { type: cut(G.Surf), rotation: 0 }
      }

      // OUTER (70-100%): very sparse, mostly warm with lichen freckles
      if (h % 4 === 0) return { type: cut(G.Storm), rotation: 0 }
      if (h % 4 === 1) return { type: cut(G.Dune), rotation: 0 }
      // Else fall through to background
    }

    // Edge halo: occasional Storm/Dune cut to soften boundary
    if (inEdge && h % 4 === 0) {
      return { type: cut(h % 2 === 0 ? G.Storm : G.Dune), rotation: 0 }
    }

    // Background: warm stone arcs
    if (r % 2 === 0 && c % 2 === 0) {
      const bh = hashCell(r / 2, c / 2, 88)
      const bgArcs = [
        ARC.RedwoodDune, ARC.RedwoodDune, ARC.RedwoodDune,
        ARC.DuneBirch, ARC.RedwoodSunbeam, ARC.RedwoodCoral,
        ARC.BirchDune, ARC.RedwoodDune
      ]
      const pick = bgArcs[bh % bgArcs.length]
      const rot = bh % 7 < 5 ? pinIn(r / 2, c / 2) : (bh >> 3) % 4
      return { type: pick, rotation: rot }
    }
    return null
  },
  grout: '6B5840',  // warmer, darker mortar
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
