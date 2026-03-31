import { useState, useCallback, useRef, useEffect } from 'react'
import { GROUT_COLORS } from './colors'
import { DESIGN_LIBRARY } from './library'

type Rotation = 0 | 1 | 2 | 3

// ─── Tile types ─────────────────────────────────────────────────────────────
// The grid is cells. A cell is half the old tile size.
// Arc tiles = 2×2 cells, rectangles = 1×2 or 2×1, cuts = 1×1.

interface TileType {
  name: string
  group: 'arc' | 'vert' | 'horiz' | 'cut'
  w: number               // width in cells
  h: number               // height in cells
  background: string
  arc?: string            // only for arc tiles
  image?: string          // product photo (arc tiles)
  bgImage?: string        // glaze texture (solid tiles)
  rotatable: boolean      // arc tiles can rotate, solid tiles cannot
}

function imgRot(r: Rotation): number { return ((r - 2 + 4) % 4) * 90 }

const GLAZE_COLORS: { name: string; hex: string; img: string }[] = [
  { name: 'Birch',   hex: '#EAE2D6', img: 'glaze/Birch.jpg' },
  { name: 'Dune',    hex: '#DECAB0', img: 'glaze/Dune.jpg' },
  { name: 'Coral',   hex: '#C87858', img: 'glaze/Coral.jpg' },
  { name: 'Sunbeam', hex: '#C89030', img: 'glaze/Sunbeam.jpg' },
  { name: 'Poppy',   hex: '#C05528', img: 'glaze/Poppy.jpg' },
  { name: 'Redwood', hex: '#782828', img: 'glaze/Redwood.jpg' },
  { name: 'Denim',   hex: '#9898A8', img: 'glaze/Denim.jpg' },
  { name: 'Storm',   hex: '#888880', img: 'glaze/storm.jpg' },
  { name: 'Surf',    hex: '#486878', img: 'glaze/Surf.jpg' },
  { name: 'Basalt',  hex: '#302828', img: 'glaze/Basalt.jpg' },
]

const TILE_TYPES: TileType[] = [
  // Arc tiles (2×2) — product photos
  { name: 'Birch / Denim',    group: 'arc', w: 2, h: 2, background: '#EAE2D6', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Birch-Denim-230x230.jpg', rotatable: true },
  { name: 'Birch / Dune',     group: 'arc', w: 2, h: 2, background: '#EAE2D6', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Birch-Dune-230x230.jpg', rotatable: true },
  { name: 'Denim / Birch',    group: 'arc', w: 2, h: 2, background: '#9898A8', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Denim-Birch-230x230.jpg', rotatable: true },
  { name: 'Dune / Birch',     group: 'arc', w: 2, h: 2, background: '#DECAB0', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Dune-Birch-230x230.jpg', rotatable: true },
  { name: 'Basalt / Dune',    group: 'arc', w: 2, h: 2, background: '#302828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Basalt-Dune-230x230.jpg', rotatable: true },
  { name: 'Storm / Birch',    group: 'arc', w: 2, h: 2, background: '#888880', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Storm-Birch-230x230.jpg', rotatable: true },
  { name: 'Sunbeam / Denim',  group: 'arc', w: 2, h: 2, background: '#C89030', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Sunbeam-Denim-230x230.jpg', rotatable: true },
  { name: 'Surf / Sunbeam',   group: 'arc', w: 2, h: 2, background: '#486878', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Surf-Sunbeam-230x230.jpg', rotatable: true },
  { name: 'Redwood / Coral',  group: 'arc', w: 2, h: 2, background: '#782828', arc: '#C87858', image: 'Kat-Roger-6x6-arc-Redwood-Coral-230x230.jpg', rotatable: true },
  { name: 'Redwood / Dune',   group: 'arc', w: 2, h: 2, background: '#782828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Redwood-Dune-230x230.jpg', rotatable: true },
  { name: 'Redwood / Sunbeam',group: 'arc', w: 2, h: 2, background: '#782828', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Redwood-Sunbeam-2-230x230.jpg', rotatable: true },
  { name: 'Redwood / Surf',   group: 'arc', w: 2, h: 2, background: '#782828', arc: '#486878', image: 'Kat-Roger-6x6-arc-Redwood-Surf-230x230.jpg', rotatable: true },
  // Vertical rectangles (1×2) — solid glazes
  ...GLAZE_COLORS.map(g => ({ name: `${g.name} ↕`, group: 'vert' as const, w: 1, h: 2, background: g.hex, bgImage: g.img, rotatable: false })),
  // Horizontal rectangles (2×1) — solid glazes
  ...GLAZE_COLORS.map(g => ({ name: `${g.name} ↔`, group: 'horiz' as const, w: 2, h: 1, background: g.hex, bgImage: g.img, rotatable: false })),
  // Cut tiles (1×1) — solid glazes
  ...GLAZE_COLORS.map(g => ({ name: `${g.name} ◻`, group: 'cut' as const, w: 1, h: 1, background: g.hex, bgImage: g.img, rotatable: false })),
]

const GROUP_LABELS: Record<string, string> = { arc: 'Arc Tiles (2×2)', vert: 'Vertical (1×2)', horiz: 'Horizontal (2×1)', cut: 'Cut (1×1)' }

// ─── Grid data model ────────────────────────────────────────────────────────
// Each cell is either null (empty = grout) or an anchor of a placed tile.
// Multi-cell tiles: only the top-left cell is the anchor. Other cells point to it.

interface PlacedTile {
  typeIndex: number
  rotation: Rotation     // only meaningful for arc tiles
}

interface GridCell {
  tile: PlacedTile
  anchorR: number        // row of the anchor (top-left of this tile)
  anchorC: number        // col of the anchor
}

type Grid = (GridCell | null)[][]

function isAnchor(grid: Grid, r: number, c: number): boolean {
  const cell = grid[r]?.[c]
  return cell != null && cell.anchorR === r && cell.anchorC === c
}

function makeEmptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => null))
}

// Place a tile, nuking anything in its footprint
function placeTile(grid: Grid, r: number, c: number, typeIndex: number, rotation: Rotation): Grid {
  const tile = TILE_TYPES[typeIndex]
  const rows = grid.length, cols = grid[0]?.length ?? 0
  if (r + tile.h > rows || c + tile.w > cols) return grid
  const next = grid.map(row => [...row])
  // Clear anything overlapping
  for (let dr = 0; dr < tile.h; dr++) {
    for (let dc = 0; dc < tile.w; dc++) {
      const existing = next[r + dr][c + dc]
      if (existing) clearTile(next, existing.anchorR, existing.anchorC)
    }
  }
  // Place
  const placed: PlacedTile = { typeIndex, rotation }
  for (let dr = 0; dr < tile.h; dr++) {
    for (let dc = 0; dc < tile.w; dc++) {
      next[r + dr][c + dc] = { tile: placed, anchorR: r, anchorC: c }
    }
  }
  return next
}

function clearTile(grid: Grid, anchorR: number, anchorC: number) {
  const cell = grid[anchorR]?.[anchorC]
  if (!cell) return
  const tile = TILE_TYPES[cell.tile.typeIndex]
  for (let dr = 0; dr < tile.h; dr++) {
    for (let dc = 0; dc < tile.w; dc++) {
      const cr = anchorR + dr, cc = anchorC + dc
      if (grid[cr]?.[cc]?.anchorR === anchorR && grid[cr]?.[cc]?.anchorC === anchorC) {
        grid[cr][cc] = null
      }
    }
  }
}

// Fill grid with 2×2 arc tiles (default type 0)
function fillWithSquares(rows: number, cols: number, typeIndex: number = 0, rotation: Rotation = 2): Grid {
  const grid = makeEmptyGrid(rows, cols)
  for (let r = 0; r <= rows - 2; r += 2) {
    for (let c = 0; c <= cols - 2; c += 2) {
      const placed: PlacedTile = { typeIndex, rotation }
      for (let dr = 0; dr < 2; dr++) {
        for (let dc = 0; dc < 2; dc++) {
          grid[r + dr][c + dc] = { tile: placed, anchorR: r, anchorC: c }
        }
      }
    }
  }
  return grid
}

// ─── Staircase layout (rotated 90° CW: 34×18) ──────────────────────────────
const STAIRCASE_COLS = 34
const STAIRCASE_ROWS = 18
const STAIRCASE_NOTCH_ROWS = 8   // rows where the notch applies
const STAIRCASE_NOTCH_START = 22  // cols >= this are hidden in notch rows

function staircaseMask(): boolean[][] {
  return Array.from({ length: STAIRCASE_ROWS }, (_, r) =>
    Array.from({ length: STAIRCASE_COLS }, (_, c) =>
      r < STAIRCASE_NOTCH_ROWS ? c < STAIRCASE_NOTCH_START : true
    )
  )
}
const STAIRCASE_MASK = staircaseMask()

interface Layout { label: string; cols: number; rows: number; mask: boolean[][] | null }
const LAYOUTS: Record<string, Layout> = {
  staircase: { label: 'Staircase Room', cols: STAIRCASE_COLS, rows: STAIRCASE_ROWS, mask: STAIRCASE_MASK },
  grid:      { label: 'Free Grid',      cols: 16,             rows: 16,             mask: null },
}

// ─── Rotation patterns (for arc tiles, using tile-level coords) ─────────────
type PatternFn = (r: number, c: number) => Rotation
const PATTERNS: { key: string; label: string; fn: PatternFn }[] = [
  { key: 'allTL',  label: '↖ All',      fn: ()    => 0 },
  { key: 'allTR',  label: '↗ All',      fn: ()    => 1 },
  { key: 'allBR',  label: '↘ All',      fn: ()    => 2 },
  { key: 'allBL',  label: '↙ All',      fn: ()    => 3 },
  { key: 'pinIn',  label: 'Pinwheel ●', fn: (r,c) => ([[2,3],[1,0]] as Rotation[][])[r%2][c%2] },
  { key: 'pinOut', label: 'Pinwheel ○', fn: (r,c) => ([[0,1],[3,2]] as Rotation[][])[r%2][c%2] },
  { key: 'diag',   label: 'Diagonal',   fn: (r,c) => ((r+c)%4) as Rotation },
  { key: 'checker',label: 'Checker',    fn: (r,c) => ((r+c)%2===0 ? 0 : 2) as Rotation },
]

// ─── Grout picker ───────────────────────────────────────────────────────────
function GroutPicker({ selected, onSelect }: { selected: string; onSelect: (hex: string) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666' }}>Grout</span>
        <div style={{ width: 16, height: 16, background: selected, border: '1px solid rgba(0,0,0,0.18)', borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {GROUT_COLORS.map(g => (
          <div key={g.hex} title={g.name} onClick={() => onSelect(g.hex)} style={{
            width: 22, height: 22, background: g.hex, borderRadius: 3, cursor: 'pointer',
            border: selected === g.hex ? '2px solid #111' : '1px solid rgba(0,0,0,0.14)',
            boxSizing: 'border-box',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Tile type picker (grouped by shape) ────────────────────────────────────
function TileTypePicker({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const groups = ['arc', 'vert', 'horiz', 'cut'] as const
  return (
    <div style={{ marginBottom: 18 }}>
      {groups.map(group => {
        const tiles = TILE_TYPES.map((t, i) => ({ t, i })).filter(({ t }) => t.group === group)
        return (
          <div key={group} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#999', marginBottom: 4 }}>
              {GROUP_LABELS[group]}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tiles.map(({ t, i }) => (
                <div key={i} onClick={() => onSelect(i)} title={t.name} style={{
                  width: group === 'horiz' ? 36 : group === 'vert' ? 16 : group === 'cut' ? 16 : 32,
                  height: group === 'vert' ? 36 : group === 'horiz' ? 16 : group === 'cut' ? 16 : 32,
                  borderRadius: 2, cursor: 'pointer', overflow: 'hidden',
                  border: selected === i ? '2px solid #111' : '1px solid rgba(0,0,0,0.12)',
                  boxSizing: 'border-box',
                }}>
                  {t.image ? (
                    <img src={`${import.meta.env.BASE_URL}tiles/${t.image}`} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
                  ) : t.bgImage ? (
                    <img src={`${import.meta.env.BASE_URL}tiles/${t.bgImage}`} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: t.background }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Saved Designs (localStorage) ───────────────────────────────────────────
interface SavedDesign { name: string; hash: string }
const STORAGE_KEY = 'tile-visualizer-saved-v3'
function loadSaved(): SavedDesign[] { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] } }
function storeSaved(d: SavedDesign[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) }

function SavedDesigns({ onLoad, currentHash }: { onLoad: (hash: string) => void; currentHash: string }) {
  const [saved, setSaved] = useState<SavedDesign[]>(loadSaved)
  const [expanded, setExpanded] = useState(false)
  const handleSave = () => { const n = prompt('Name:'); if (!n?.trim()) return; const next = [...saved, { name: n.trim(), hash: currentHash }]; setSaved(next); storeSaved(next) }
  const handleDelete = (i: number) => { const next = saved.filter((_, j) => j !== i); setSaved(next); storeSaved(next) }
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div onClick={() => setExpanded(!expanded)} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 8 }}>{expanded ? '▼' : '▶'}</span> My Designs ({saved.length})
        </div>
        <button onClick={handleSave} style={{ fontSize: 9, padding: '2px 8px', border: '1px solid #ddd', borderRadius: 3, background: '#f4f4f4', cursor: 'pointer', color: '#555' }}>+ Save</button>
      </div>
      {expanded && saved.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', marginBottom: 3, borderRadius: 4, border: '1px solid #e8e8e8' }}>
          <span onClick={() => onLoad(d.hash)} style={{ fontSize: 11, color: '#333', cursor: 'pointer', flex: 1 }}>{d.name}</span>
          <button onClick={() => handleDelete(i)} style={{ fontSize: 9, border: 'none', background: 'none', cursor: 'pointer', color: '#ccc' }}>✕</button>
        </div>
      ))}
    </div>
  )
}

// ─── Design Library ─────────────────────────────────────────────────────────
function DesignLibrary({ onLoad }: { onLoad: (hash: string) => void }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)
  const filtered = search.trim()
    ? DESIGN_LIBRARY.filter(d => {
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.keywords.some(k => k.includes(q))
      })
    : DESIGN_LIBRARY
  return (
    <div style={{ marginBottom: 18 }}>
      <div onClick={() => setExpanded(!expanded)} style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
        color: '#666', marginBottom: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <span style={{ fontSize: 8 }}>{expanded ? '▼' : '▶'}</span>
        Design Library ({DESIGN_LIBRARY.length})
      </div>
      {expanded && (
        <>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, border: '1px solid #e0e0e0', borderRadius: 4, marginBottom: 8, boxSizing: 'border-box', outline: 'none' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {filtered.map((d, i) => (
              <div key={i} onClick={() => onLoad(d.hash)} style={{
                padding: '6px 8px', borderRadius: 4, cursor: 'pointer', border: '1px solid #e8e8e8', background: 'white',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#222' }}>{d.name}</span>
                  <span style={{ fontSize: 9, color: '#c89030' }}>{d.rating}/10</span>
                </div>
                <div style={{ fontSize: 9, color: '#888', lineHeight: 1.4, marginBottom: 3 }}>{d.description}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {d.keywords.map(k => (
                    <span key={k} style={{ fontSize: 8, padding: '1px 5px', background: '#f0f0f0', borderRadius: 3, color: '#666' }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', padding: 8 }}>No matches</div>}
          </div>
        </>
      )}
    </div>
  )
}

// ─── URL encoding (v3 — grid-based) ─────────────────────────────────────────
function encodeGrid(layoutKey: string, grout: string, tileSize: number, groutWidth: number, grid: Grid): string {
  // Encode only anchor cells: row,col,typeIndex,rotation
  const anchors: string[] = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < (grid[0]?.length ?? 0); c++) {
      if (isAnchor(grid, r, c)) {
        const cell = grid[r][c]!
        anchors.push(`${r}.${c}.${cell.tile.typeIndex}.${cell.tile.rotation}`)
      }
    }
  }
  const params = new URLSearchParams()
  params.set('v', '3')
  params.set('l', layoutKey)
  params.set('g', grout.replace('#', ''))
  params.set('sz', String(tileSize))
  params.set('gw', String(groutWidth))
  params.set('a', anchors.join(';'))
  return params.toString()
}

function decodeGrid(hash: string): { layoutKey: 'staircase' | 'grid'; grout: string; tileSize: number; groutWidth: number; grid: Grid } | null {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('l')) return null
  const layoutKey = params.get('l') as 'staircase' | 'grid'
  const grout = '#' + (params.get('g') ?? 'C0BDB8')
  const tileSize = Number(params.get('sz') ?? 56)
  const groutWidth = Number(params.get('gw') ?? 3)
  const layout = LAYOUTS[layoutKey] ?? LAYOUTS.staircase
  const grid = makeEmptyGrid(layout.rows, layout.cols)
  const aStr = params.get('a') ?? ''
  if (aStr) {
    for (const entry of aStr.split(';')) {
      const [rs, cs, ts, rots] = entry.split('.')
      const r = Number(rs), c = Number(cs), typeIndex = Number(ts), rotation = (Number(rots) % 4) as Rotation
      if (typeIndex >= 0 && typeIndex < TILE_TYPES.length) {
        const tile = TILE_TYPES[typeIndex]
        const placed: PlacedTile = { typeIndex, rotation }
        for (let dr = 0; dr < tile.h; dr++) {
          for (let dc = 0; dc < tile.w; dc++) {
            if (r + dr < layout.rows && c + dc < layout.cols) {
              grid[r + dr][c + dc] = { tile: placed, anchorR: r, anchorC: c }
            }
          }
        }
      }
    }
  }
  return { layoutKey, grout, tileSize, groutWidth, grid }
}

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const init = decodeGrid(window.location.hash)

  const [layoutKey, setLayoutKey] = useState<'staircase' | 'grid'>(init?.layoutKey ?? 'staircase')
  const [selectedType, setSelectedType] = useState(0)
  const [groutColor, setGroutColor] = useState(init?.grout ?? '#C0BDB8')
  const [tileSize, setTileSize] = useState(init?.tileSize ?? 56)
  const [groutWidth, setGroutWidth] = useState(init?.groutWidth ?? 3)
  const [grid, setGrid] = useState<Grid>(() => {
    if (init?.grid) return init.grid
    const l = LAYOUTS.staircase
    return fillWithSquares(l.rows, l.cols, 0, 2)
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const layout = LAYOUTS[layoutKey]
  const { cols, rows, mask } = layout

  // ── URL sync ──
  const currentHash = encodeGrid(layoutKey, groutColor, tileSize, groutWidth, grid)
  useEffect(() => { window.history.replaceState(null, '', '#' + currentHash) }, [currentHash])

  // ── Load design ──
  const loadDesign = useCallback((hash: string) => {
    const s = decodeGrid(hash)
    if (!s) return
    setLayoutKey(s.layoutKey); setGroutColor(s.grout); setTileSize(s.tileSize); setGroutWidth(s.groutWidth); setGrid(s.grid)
  }, [])

  // ── Layout switch ──
  const switchLayout = useCallback((key: 'staircase' | 'grid') => {
    const l = LAYOUTS[key]
    setGrid(fillWithSquares(l.rows, l.cols, 0, 2))
    setLayoutKey(key)
  }, [])

  // ── Apply rotation pattern to all 2×2 arc tiles ──
  const applyPattern = useCallback((fn: PatternFn) => {
    setGrid(prev => {
      const next = prev.map(row => [...row])
      for (let r = 0; r < next.length; r++) {
        for (let c = 0; c < (next[0]?.length ?? 0); c++) {
          if (!isAnchor(next, r, c)) continue
          const cell = next[r][c]!
          const tile = TILE_TYPES[cell.tile.typeIndex]
          if (!tile.rotatable) continue
          const tileR = Math.floor(r / 2), tileC = Math.floor(c / 2)
          const newRot = fn(tileR, tileC)
          const placed: PlacedTile = { typeIndex: cell.tile.typeIndex, rotation: newRot }
          for (let dr = 0; dr < tile.h; dr++) {
            for (let dc = 0; dc < tile.w; dc++) {
              next[r + dr][c + dc] = { tile: placed, anchorR: r, anchorC: c }
            }
          }
        }
      }
      return next
    })
  }, [])

  // ── Click: place tile at cell ──
  const handleClick = useCallback((r: number, c: number) => {
    setGrid(prev => placeTile(prev, r, c, selectedType, 2))
  }, [selectedType])

  // ── Right-click: rotate (arc tiles only) ──
  const handleRotate = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const cell = prev[r]?.[c]
      if (!cell) return prev
      const anchor = prev[cell.anchorR]?.[cell.anchorC]
      if (!anchor) return prev
      const tile = TILE_TYPES[anchor.tile.typeIndex]
      if (!tile.rotatable) return prev
      const newRot = ((anchor.tile.rotation + 1) % 4) as Rotation
      const next = prev.map(row => [...row])
      const placed: PlacedTile = { typeIndex: anchor.tile.typeIndex, rotation: newRot }
      for (let dr = 0; dr < tile.h; dr++) {
        for (let dc = 0; dc < tile.w; dc++) {
          next[cell.anchorR + dr][cell.anchorC + dc] = { tile: placed, anchorR: cell.anchorR, anchorC: cell.anchorC }
        }
      }
      return next
    })
  }, [])

  // ── SVG export ──
  const downloadSVG = useCallback(() => {
    if (!svgRef.current) return
    const data = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `tile-layout-${layoutKey}.svg`; a.click()
    URL.revokeObjectURL(url)
  }, [layoutKey])

  // ── Stamp tool ──
  const [selection, setSelection] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null)
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null)

  const halfPitch = (tileSize + groutWidth) / 2
  const svgWidth = cols * halfPitch + groutWidth
  const svgHeight = rows * halfPitch + groutWidth

  const cellFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      r: Math.max(0, Math.min(Math.floor((e.clientY - rect.top) / halfPitch), rows - 1)),
      c: Math.max(0, Math.min(Math.floor((e.clientX - rect.left) / halfPitch), cols - 1)),
    }
  }, [halfPitch, rows, cols])

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!e.shiftKey || e.button !== 0) return
    e.preventDefault()
    const { r, c } = cellFromEvent(e)
    setDragStart({ r, c }); setSelection({ r1: r, c1: c, r2: r, c2: c })
  }, [cellFromEvent])

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return
    const { r, c } = cellFromEvent(e)
    setSelection({ r1: Math.min(dragStart.r, r), c1: Math.min(dragStart.c, c), r2: Math.max(dragStart.r, r), c2: Math.max(dragStart.c, c) })
  }, [dragStart, cellFromEvent])

  const onMouseUp = useCallback(() => { setDragStart(null) }, [])

  // Capture stamp from selection
  const captureStamp = useCallback(() => {
    if (!selection) return null
    const { r1, c1, r2, c2 } = selection
    const stamp: (GridCell | null)[][] = []
    for (let r = r1; r <= r2; r++) {
      const row: (GridCell | null)[] = []
      for (let c = c1; c <= c2; c++) { row.push(grid[r]?.[c] ?? null) }
      stamp.push(row)
    }
    return stamp
  }, [selection, grid])

  const repeatSelection = useCallback((dir: 'right' | 'left' | 'down' | 'up') => {
    const stamp = captureStamp()
    if (!stamp || !selection) return
    const { r1, c1, r2, c2 } = selection
    const sw = c2 - c1 + 1, sh = r2 - r1 + 1
    setGrid(prev => {
      const next = prev.map(row => [...row])
      const applyAt = (sr: number, sc: number) => {
        for (let dr = 0; dr < sh; dr++) {
          for (let dc = 0; dc < sw; dc++) {
            const tr = sr + dr, tc = sc + dc
            if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) continue
            if (mask && !mask[tr]?.[tc]) continue
            const src = stamp[dr][dc]
            if (src && isAnchor(prev, src.anchorR, src.anchorC) && src.anchorR === r1 + dr && src.anchorC === c1 + dc) {
              // This is an anchor — place the tile at the new position
              const tile = TILE_TYPES[src.tile.typeIndex]
              const placed = src.tile
              for (let tdr = 0; tdr < tile.h; tdr++) {
                for (let tdc = 0; tdc < tile.w; tdc++) {
                  const fr = tr + tdr, fc = tc + tdc
                  if (fr >= 0 && fr < rows && fc >= 0 && fc < cols) {
                    next[fr][fc] = { tile: placed, anchorR: tr, anchorC: tc }
                  }
                }
              }
            } else if (!src) {
              next[tr][tc] = null
            }
          }
        }
      }
      if (dir === 'right') for (let sc = c1 + sw; sc < cols; sc += sw) applyAt(r1, sc)
      else if (dir === 'left') for (let sc = c1 - sw; sc >= -sw + 1; sc -= sw) applyAt(r1, sc)
      else if (dir === 'down') for (let sr = r1 + sh; sr < rows; sr += sh) applyAt(sr, c1)
      else if (dir === 'up') for (let sr = r1 - sh; sr >= -sh + 1; sr -= sh) applyAt(sr, c1)
      return next
    })
  }, [captureStamp, selection, rows, cols, mask])

  const repeatAll = useCallback(() => {
    const stamp = captureStamp()
    if (!stamp || !selection) return
    const { r1, c1, r2, c2 } = selection
    const sw = c2 - c1 + 1, sh = r2 - r1 + 1
    setGrid(prev => {
      const next = prev.map(row => [...row])
      for (let sr = 0; sr < rows; sr += sh) {
        for (let sc = 0; sc < cols; sc += sw) {
          if (sr === r1 && sc === c1) continue // skip original
          for (let dr = 0; dr < sh; dr++) {
            for (let dc = 0; dc < sw; dc++) {
              const tr = sr + dr, tc = sc + dc
              if (tr >= rows || tc >= cols) continue
              if (mask && !mask[tr]?.[tc]) continue
              const src = stamp[dr]?.[dc]
              if (src && src.anchorR === r1 + dr && src.anchorC === c1 + dc) {
                const tile = TILE_TYPES[src.tile.typeIndex]
                for (let tdr = 0; tdr < tile.h; tdr++) {
                  for (let tdc = 0; tdc < tile.w; tdc++) {
                    const fr = tr + tdr, fc = tc + tdc
                    if (fr >= 0 && fr < rows && fc >= 0 && fc < cols) {
                      next[fr][fc] = { tile: src.tile, anchorR: tr, anchorC: tc }
                    }
                  }
                }
              } else if (!src) {
                next[tr][tc] = null
              }
            }
          }
        }
      }
      return next
    })
  }, [captureStamp, selection, rows, cols, mask])

  const btnBase: React.CSSProperties = { padding: '5px 4px', fontSize: 11, background: '#f4f4f4', border: '1px solid #e8e8e8', borderRadius: 4, cursor: 'pointer', color: '#333' }
  const btnActive: React.CSSProperties = { ...btnBase, background: '#111', color: 'white', border: '1px solid #111' }

  // ── Render ──
  // Collect anchor tiles for rendering
  const anchors: { r: number; c: number; cell: GridCell }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isAnchor(grid, r, c)) anchors.push({ r, c, cell: grid[r][c]! })
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <div style={{ width: 280, background: 'white', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 1 }}>Tile Visualizer</div>
          <div style={{ fontSize: 10, color: '#999', marginBottom: 8 }}>Kat+Roger 6×6 Arc · Pratt &amp; Larson</div>
          <div style={{ fontSize: 9, color: '#aaa', lineHeight: 1.5 }}>
            Left-click to place tiles, right-click to rotate arcs. Shift+drag to select a region, then repeat it in any direction.
          </div>
          <div style={{ fontSize: 9, color: '#ccc', marginTop: 6 }}>Made with ❤️ for Maryna</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
          {/* Layout */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>Layout</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['staircase', 'grid'] as const).map(k => (
                <button key={k} onClick={() => switchLayout(k)} style={layoutKey === k ? { ...btnActive, flex: 1, padding: '6px 0' } : { ...btnBase, flex: 1, padding: '6px 0' }}>
                  {LAYOUTS[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tile picker */}
          <TileTypePicker selected={selectedType} onSelect={setSelectedType} />

          <GroutPicker selected={groutColor} onSelect={setGroutColor} />

          {/* Stamp & Fill */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>Stamp &amp; Fill</div>
            {!selection ? (
              <div style={{ fontSize: 10, color: '#888', lineHeight: 1.5 }}>
                <strong>Shift+drag</strong> on the grid to select, then repeat.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 10, color: '#333', marginBottom: 6, fontWeight: 600 }}>
                  {selection.c2 - selection.c1 + 1} × {selection.r2 - selection.r1 + 1} cells selected
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <button onClick={() => repeatSelection('left')} style={btnBase}>← Left</button>
                  <button onClick={() => repeatSelection('right')} style={btnBase}>→ Right</button>
                  <button onClick={() => repeatSelection('up')} style={btnBase}>↑ Up</button>
                  <button onClick={() => repeatSelection('down')} style={btnBase}>↓ Down</button>
                  <button onClick={repeatAll} style={{ ...btnBase, gridColumn: '1 / -1', fontWeight: 600 }}>Fill All</button>
                  <button onClick={() => setSelection(null)} style={{ ...btnBase, gridColumn: '1 / -1', color: '#999' }}>Clear</button>
                </div>
              </>
            )}
          </div>

          {/* Rotation patterns */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>Rotation Patterns</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {PATTERNS.map(p => (
                <button key={p.key} onClick={() => applyPattern(p.fn)} style={btnBase}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* Size controls */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 4 }}>Tile Size: {tileSize}px</div>
            <input type="range" min={28} max={90} value={tileSize} onChange={e => setTileSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#111' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 4 }}>Grout: {groutWidth}px</div>
            <input type="range" min={1} max={10} value={groutWidth} onChange={e => setGroutWidth(Number(e.target.value))} style={{ width: '100%', accentColor: '#111' }} />
          </div>

          <SavedDesigns onLoad={loadDesign} currentHash={currentHash} />

          <DesignLibrary onLoad={loadDesign} />

          <button onClick={downloadSVG} style={{ width: '100%', padding: '8px 0', fontSize: 11, fontWeight: 600, background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', color: '#333', marginBottom: 10 }}>
            ↓ Export SVG
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }}
        onContextMenu={e => e.preventDefault()}>
        <svg id="canvas" ref={svgRef} width={svgWidth} height={svgHeight}
          style={{ background: groutColor, boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

          {/* Click targets for all cells (including empty ones) + mask whitout */}
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              if (mask && !mask[r]?.[c]) return <rect key={`bg${r}-${c}`} x={c * halfPitch} y={r * halfPitch} width={halfPitch} height={halfPitch} fill="white" />
              return (
                <rect key={`bg${r}-${c}`} x={c * halfPitch} y={r * halfPitch} width={halfPitch} height={halfPitch}
                  fill="transparent" cursor="pointer"
                  onClick={e => { if (e.shiftKey) return; handleClick(r, c) }}
                  onContextMenu={e => { e.preventDefault(); handleRotate(r, c) }}
                />
              )
            })
          )}

          {/* Render tiles at anchors */}
          {anchors.map(({ r, c, cell }) => {
            if (mask && !mask[r]?.[c]) return null
            const tile = TILE_TYPES[cell.tile.typeIndex]
            const tw = tile.w * halfPitch - groutWidth
            const th = tile.h * halfPitch - groutWidth
            const px = c * halfPitch + groutWidth
            const py = r * halfPitch + groutWidth
            return (
              <g key={`${r}-${c}`}
                onClick={e => { if (e.shiftKey) return; handleClick(r, c) }}
                onContextMenu={e => { e.preventDefault(); handleRotate(r, c) }}
                style={{ cursor: 'pointer' }}>
                {tile.image ? (
                  <g transform={`translate(${px},${py})`}>
                    <g transform={`rotate(${imgRot(cell.tile.rotation)},${tw / 2},${th / 2})`}>
                      <image href={`${import.meta.env.BASE_URL}tiles/${tile.image}`} width={tw} height={th} />
                    </g>
                  </g>
                ) : tile.bgImage ? (
                  <image href={`${import.meta.env.BASE_URL}tiles/${tile.bgImage}`} x={px} y={py} width={tw} height={th} preserveAspectRatio="xMidYMid slice" />
                ) : (
                  <rect x={px} y={py} width={tw} height={th} fill={tile.background} />
                )}
              </g>
            )
          })}

          {/* Selection overlay */}
          {selection && (
            <rect
              x={selection.c1 * halfPitch + groutWidth / 2}
              y={selection.r1 * halfPitch + groutWidth / 2}
              width={(selection.c2 - selection.c1 + 1) * halfPitch}
              height={(selection.r2 - selection.r1 + 1) * halfPitch}
              fill="none" stroke="#2080ff" strokeWidth={2} strokeDasharray="6 3" pointerEvents="none"
            />
          )}
        </svg>
      </div>
    </div>
  )
}
