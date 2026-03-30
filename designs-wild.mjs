/**
 * designs-wild.mjs — Wild Card designs: break the rules.
 * 4 designs that depart from nature themes.
 */

const S = { cols: 18, rows: 34, upperOffset: 8, upperRows: 12 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }

// Glaze helpers
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

const designs = {}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. NEGATIVE SPACE — "One Stone in Snow"
//    Vast field of uniform Birch cuts. A single asymmetric cluster of warm arcs
//    placed off-center (lower-left area), like a single rock garden arrangement.
//    Inspired by Japanese ma (間) — the beauty of emptiness.
// ═══════════════════════════════════════════════════════════════════════════════
designs.wild_one_stone = {
  fn: (r, c) => {
    // The cluster: an irregular grouping around row 22-27, col 3-8
    // (intentionally off-center, in the wider lower portion)
    const clusterPieces = [
      // Large anchor stones (arc tiles)
      { r: 22, c: 4, type: ARC.RedwoodDune, rot: 1 },
      { r: 24, c: 6, type: ARC.BasaltDune, rot: 3 },
      { r: 20, c: 6, type: ARC.DuneBirch, rot: 0 },
      // Smaller accent pieces (rects)
      { r: 22, c: 8, type: vert(G.Redwood), rot: 0 },
      { r: 26, c: 5, type: horiz(G.Storm), rot: 0 },
      { r: 22, c: 3, type: vert(G.Dune), rot: 0 },
      // Single cut accents — like pebbles near the stone
      { r: 24, c: 4, type: cut(G.Basalt), rot: 0 },
      { r: 25, c: 4, type: cut(G.Sunbeam), rot: 0 },
      { r: 21, c: 8, type: cut(G.Dune), rot: 0 },
      { r: 26, c: 8, type: cut(G.Storm), rot: 0 },
      { r: 20, c: 5, type: cut(G.Redwood), rot: 0 },
      { r: 26, c: 4, type: cut(G.Dune), rot: 0 },
    ]

    // Check if this cell is a cluster anchor
    for (const p of clusterPieces) {
      if (r === p.r && c === p.c) return { type: p.type, rotation: p.rot }
    }

    // Everything else: uniform Birch cuts — the "snow"
    return { type: cut(G.Birch), rotation: 0 }
  },
  grout: 'E8E0D8',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MONDRIAN GRID — Neoplastic composition with rectangles
//    Thick "lines" of Basalt cuts forming a Mondrian-style grid.
//    Rectangles filled with Dune (cream), Redwood (red-brown), Denim (blue),
//    Sunbeam (yellow). Most cells are Birch (white). Pure geometry.
// ═══════════════════════════════════════════════════════════════════════════════
designs.wild_mondrian = {
  fn: (r, c) => {
    // Define the Mondrian grid lines (thick lines = 1 cell wide of Basalt)
    // Vertical lines at columns 5, 11, 15
    // Horizontal lines at rows 7 (only in lower section), 14, 21, 28
    const vLines = [5, 11, 15]
    const hLines = [14, 21, 28]
    // Upper section has different verticals since it starts at col 8
    const upperVLines = [11, 15]

    const isVLine = r < S.upperRows ? upperVLines.includes(c) : vLines.includes(c)
    const isHLine = hLines.includes(r)

    // Grid lines: dark Basalt
    if (isVLine || isHLine) {
      return { type: cut(G.Basalt), rotation: 0 }
    }

    // Color blocks — specific rectangles get filled with color
    // Block 1: Redwood rectangle (rows 14-20, cols 0-4)
    if (r >= 15 && r <= 20 && c >= 0 && c <= 4) {
      if (r % 2 === 0 && c % 2 === 0 && c + 1 <= 4) {
        return { type: ARC.RedwoodDune, rotation: 2 }
      }
      return null // filled by arcs
    }

    // Block 2: Denim rectangle (rows 22-27, cols 12-14)
    if (r >= 22 && r <= 27 && c >= 12 && c <= 14) {
      return { type: cut(G.Denim), rotation: 0 }
    }

    // Block 3: Sunbeam rectangle (rows 29-33, cols 0-4)
    if (r >= 29 && r <= 33 && c >= 0 && c <= 4) {
      return { type: cut(G.Sunbeam), rotation: 0 }
    }

    // Block 4: Small Redwood square (rows 0-6 upper, cols 12-14)
    if (r < S.upperRows && r >= 0 && r <= 6 && c >= 12 && c <= 14) {
      return { type: cut(G.Redwood), rotation: 0 }
    }

    // Block 5: Denim accent (rows 22-27, cols 16-17)
    if (r >= 22 && r <= 27 && c >= 16 && c <= 17) {
      return { type: cut(G.Storm), rotation: 0 }
    }

    // Everything else: white (Birch)
    return { type: cut(G.Birch), rotation: 0 }
  },
  grout: '1A1A1A',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. OP-ART VORTEX — Concentric rotation
//    Arc tiles all rotate based on their angle from a center point,
//    creating a spiral/vortex optical illusion. Uses only two muted tile
//    types to keep it house-appropriate but visually hypnotic.
// ═══════════════════════════════════════════════════════════════════════════════
designs.wild_vortex = {
  fn: (r, c) => {
    if (r % 2 !== 0 || c % 2 !== 0) return null

    // Center of the vortex (in the wider lower section, slightly off-center)
    const cx = 9, cy = 20
    const tr = r / 2, tc = c / 2
    const dx = tc - cx / 2, dy = tr - cy / 2

    // Angle from center determines rotation
    const angle = Math.atan2(dy, dx)
    // Map angle to rotation: 4 quadrants -> 4 rotations, but shifted by distance
    const dist = Math.sqrt(dx * dx + dy * dy)
    const rotOffset = Math.floor(dist / 2.5)
    const rot = ((Math.floor((angle + Math.PI) / (Math.PI / 2)) + rotOffset) % 4 + 4) % 4

    // Alternate between two tile types based on distance rings
    const ring = Math.floor(dist) % 3
    if (ring === 0) return { type: ARC.StormBirch, rotation: rot }
    if (ring === 1) return { type: ARC.DuneBirch, rotation: rot }
    return { type: ARC.BasaltDune, rotation: rot }
  },
  grout: '808080',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SCANDINAVIAN STRIPE — Vertical rhythm with mixed tile sizes
//    Alternating columns of different tile types create a woven textile look.
//    Even cols: vertical rects in alternating tones. Odd cols: cuts.
//    Every 8 rows, a horizontal band of arc tiles breaks the rhythm.
//    Inspired by Marimekko / Scandinavian textile design.
// ═══════════════════════════════════════════════════════════════════════════════
designs.wild_scandi_stripe = {
  fn: (r, c) => {
    // Horizontal accent bands every 10 rows: 2 rows of arc tiles
    const bandStart = [12, 22, 32]
    for (const bs of bandStart) {
      if (r >= bs && r < bs + 2 && r % 2 === 0 && c % 2 === 0) {
        return { type: ARC.BirchDune, rotation: (c / 2) % 2 === 0 ? 0 : 2 }
      }
      if (r >= bs && r < bs + 2) return null // covered by arc
    }

    // Column pattern repeats every 6 columns:
    // col%6=0,1: wide stripe (Dune verts)
    // col%6=2: thin stripe (Storm cuts)
    // col%6=3,4: wide stripe (Birch verts)
    // col%6=5: thin stripe (Redwood cuts)
    const phase = ((c % 6) + 6) % 6

    if (phase === 0 || phase === 1) {
      // Wide warm stripe — vertical rects
      if (phase === 0 && r % 2 === 0) {
        return { type: vert(G.Dune), rotation: 0 }
      }
      if (phase === 1 && r % 2 === 0) {
        return { type: vert(G.Dune), rotation: 0 }
      }
      return null // covered by vert above
    }

    if (phase === 2) {
      // Thin dark accent
      const alt = Math.floor(r / 2) % 2
      return { type: cut(alt === 0 ? G.Storm : G.Basalt), rotation: 0 }
    }

    if (phase === 3 || phase === 4) {
      // Wide light stripe
      if (phase === 3 && r % 2 === 0) {
        return { type: vert(G.Birch), rotation: 0 }
      }
      if (phase === 4 && r % 2 === 0) {
        return { type: vert(G.Birch), rotation: 0 }
      }
      return null
    }

    if (phase === 5) {
      // Thin warm accent
      const alt = Math.floor(r / 3) % 3
      const colors = [G.Redwood, G.Sunbeam, G.Redwood]
      return { type: cut(colors[alt]), rotation: 0 }
    }

    return null
  },
  grout: 'C0BDB8',
}

export { designs }
