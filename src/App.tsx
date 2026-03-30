import { useState, useCallback, useRef, useEffect } from 'react'
import { GROUT_COLORS } from './colors'
import { DESIGN_LIBRARY, type Design } from './library'

type Rotation = 0 | 1 | 2 | 3

// ─── Tile types (fixed background + arc color pairs) ────────────────────────

interface TileType {
  name: string
  background: string
  arc: string
  image?: string          // full tile photo (square tiles)
  bgImage?: string        // background glaze texture (rectangle tiles)
  arcImage?: string       // arc glaze texture (rectangle tiles)
  subW: number            // width in sub-cells at rotation 0 (2=square, 1=half)
  subH: number            // height in sub-cells at rotation 0
}

// Effective sub-cell size after rotation (odd rotations swap w/h)
function tileDims(t: TileType, rot: Rotation): { w: number; h: number } {
  return (rot === 1 || rot === 3) ? { w: t.subH, h: t.subW } : { w: t.subW, h: t.subH }
}

// Images are naturally oriented with arc at bottom-right.
// To show rotation r, we rotate the image by ((r - 2 + 4) % 4) * 90 degrees.
function imgRot(r: Rotation): number { return ((r - 2 + 4) % 4) * 90 }

// ─── Square tiles (2×2 sub-cells) — use product photos ─────────────────────
const TILE_TYPES: TileType[] = [
  { name: 'Birch / Denim',      background: '#EAE2D6', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Birch-Denim-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Birch / Dune',       background: '#EAE2D6', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Birch-Dune-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Denim / Birch',      background: '#9898A8', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Denim-Birch-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Dune / Birch',       background: '#DECAB0', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Dune-Birch-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Basalt / Dune',      background: '#302828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Basalt-Dune-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Storm / Birch',      background: '#888880', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Storm-Birch-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Sunbeam / Denim',    background: '#C89030', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Sunbeam-Denim-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Surf / Sunbeam',     background: '#486878', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Surf-Sunbeam-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Redwood / Coral',    background: '#782828', arc: '#C87858', image: 'Kat-Roger-6x6-arc-Redwood-Coral-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Redwood / Dune',     background: '#782828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Redwood-Dune-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Redwood / Sunbeam',  background: '#782828', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Redwood-Sunbeam-2-230x230.jpg', subW: 2, subH: 2 },
  { name: 'Redwood / Surf',     background: '#782828', arc: '#486878', image: 'Kat-Roger-6x6-arc-Redwood-Surf-230x230.jpg', subW: 2, subH: 2 },
  // ─── Rectangle tiles (solid glazes) ─────────────────────────────────────────
  { name: 'Rect Birch',    background: '#EAE2D6', arc: '#EAE2D6', subW: 1, subH: 2, bgImage: 'glaze/Birch.jpg' },
  { name: 'Rect Dune',     background: '#DECAB0', arc: '#DECAB0', subW: 1, subH: 2, bgImage: 'glaze/Dune.jpg' },
  { name: 'Rect Coral',    background: '#C87858', arc: '#C87858', subW: 1, subH: 2, bgImage: 'glaze/Coral.jpg' },
  { name: 'Rect Sunbeam',  background: '#C89030', arc: '#C89030', subW: 1, subH: 2, bgImage: 'glaze/Sunbeam.jpg' },
  { name: 'Rect Redwood',  background: '#782828', arc: '#782828', subW: 1, subH: 2, bgImage: 'glaze/Redwood.jpg' },
  { name: 'Rect Denim',    background: '#9898A8', arc: '#9898A8', subW: 1, subH: 2, bgImage: 'glaze/Denim.jpg' },
  { name: 'Rect Storm',    background: '#888880', arc: '#888880', subW: 1, subH: 2, bgImage: 'glaze/storm.jpg' },
  { name: 'Rect Surf',     background: '#486878', arc: '#486878', subW: 1, subH: 2, bgImage: 'glaze/Surf.jpg' },
  { name: 'Rect Basalt',   background: '#302828', arc: '#302828', subW: 1, subH: 2, bgImage: 'glaze/Basalt.jpg' },
  { name: 'Rect Poppy',    background: '#C05528', arc: '#C05528', subW: 1, subH: 2, bgImage: 'glaze/Poppy.jpg' },
]

// ─── Cell ────────────────────────────────────────────────────────────────────

interface Cell {
  rotation: Rotation
  typeOverride?: number  // if set, overrides the template type for this cell
}

// ─── Patterns ───────────────────────────────────────────────────────────────

type PatternFn = (r: number, c: number) => Rotation

const PATTERNS: { key: string; label: string; fn: PatternFn }[] = [
  { key: 'allTL',  label: '↖ All',      fn: ()    => 0 },
  { key: 'allTR',  label: '↗ All',      fn: ()    => 1 },
  { key: 'allBR',  label: '↘ All',      fn: ()    => 2 },
  { key: 'allBL',  label: '↙ All',      fn: ()    => 3 },
  { key: 'pinIn',  label: 'Pinwheel ●', fn: (r,c) => ([[2,3],[1,0]] as Rotation[][])[r%2][c%2] },
  { key: 'pinOut', label: 'Pinwheel ○', fn: (r,c) => ([[0,1],[3,2]] as Rotation[][])[r%2][c%2] },
  { key: 'diag',   label: 'Diagonal',   fn: (r,c) => ((r+c)%4) as Rotation },
  { key: 'rows',   label: 'By Row',     fn: (r)   => (r%2===0 ? 0 : 2) as Rotation },
  { key: 'cols',   label: 'By Column',  fn: (_,c) => (c%2===0 ? 1 : 3) as Rotation },
  { key: 'checker',label: 'Checker',    fn: (r,c) => ((r+c)%2===0 ? 0 : 2) as Rotation },
]

function makeGrid(rows: number, cols: number, fn: PatternFn = () => 0): Cell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ rotation: fn(r, c) }))
  )
}

// ─── Template cell ───────────────────────────────────────────────────────────

interface TemplateCell {
  typeIndex: number
  rotation: Rotation
}

function makeTemplate(rows: number, cols: number): TemplateCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ typeIndex: 0, rotation: 0 as Rotation }))
  )
}

const TEMPLATE_PRESETS: { label: string; rows: number; cols: number }[] = [
  { label: '1×1', rows: 1, cols: 1 },
  { label: '2×2', rows: 2, cols: 2 },
  { label: '2×3', rows: 2, cols: 3 },
  { label: '3×3', rows: 3, cols: 3 },
  { label: '4×4', rows: 4, cols: 4 },
]

// ─── Staircase room layout ──────────────────────────────────────────────────
const STAIRCASE_COLS         = 9
const STAIRCASE_ROWS         = 17
const STAIRCASE_UPPER_OFFSET = 4
const STAIRCASE_UPPER_ROWS   = 6

function staircaseMask(): boolean[][] {
  return Array.from({ length: STAIRCASE_ROWS }, (_, r) =>
    Array.from({ length: STAIRCASE_COLS }, (_, c) =>
      r < STAIRCASE_UPPER_ROWS ? c >= STAIRCASE_UPPER_OFFSET : true
    )
  )
}

const STAIRCASE_MASK = staircaseMask()

// ─── Layouts ────────────────────────────────────────────────────────────────

interface Layout {
  label: string; cols: number; rows: number
  mask: boolean[][] | null; defaultPattern: string
}

const LAYOUTS: Record<string, Layout> = {
  staircase: { label: 'Staircase Room', cols: STAIRCASE_COLS, rows: STAIRCASE_ROWS, mask: STAIRCASE_MASK, defaultPattern: 'allBR' },
  grid:      { label: 'Free Grid',      cols: 8,              rows: 8,              mask: null,            defaultPattern: 'pinIn' },
}

// ─── Template editor ────────────────────────────────────────────────────────

function TemplateEditor({ template, tileSize, groutColor, selectedType, onSetSlot, onRotateSlot, onResize, activePreset }: {
  template: TemplateCell[][]
  tileSize: number
  groutColor: string
  selectedType: number
  onSetSlot: (r: number, c: number) => void
  onRotateSlot: (r: number, c: number) => void
  onResize: (rows: number, cols: number) => void
  activePreset: string
}) {
  const rows = template.length
  const cols = template[0]?.length ?? 1
  const S = tileSize; const G = 2; const CELL = S + G

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666' }}>
          Template
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {TEMPLATE_PRESETS.map(p => (
            <button key={p.label} onClick={() => onResize(p.rows, p.cols)} style={{
              padding: '2px 5px', fontSize: 9,
              border: activePreset === p.label ? '1.5px solid #111' : '1px solid #ddd',
              borderRadius: 3, cursor: 'pointer',
              background: activePreset === p.label ? '#111' : '#f4f4f4',
              color: activePreset === p.label ? 'white' : '#555',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      <svg
        width={cols * CELL + G}
        height={rows * CELL + G}
        style={{ display: 'block', borderRadius: 4, overflow: 'hidden', cursor: 'pointer' }}
        onContextMenu={e => e.preventDefault()}
      >
        <rect width={cols * CELL + G} height={rows * CELL + G} fill={groutColor} />
        {template.map((row, r) =>
          row.map((cell, c) => {
            const t = TILE_TYPES[cell.typeIndex]
            const px = G + c * CELL; const py = G + r * CELL
            return (
              <g key={`${r}-${c}`} transform={`translate(${px},${py})`}
                onClick={() => onSetSlot(r, c)}
                onContextMenu={e => { e.preventDefault(); onRotateSlot(r, c) }}
              >
                <g transform={`rotate(${imgRot(cell.rotation)},${S/2},${S/2})`}>
                  <image href={`${import.meta.env.BASE_URL}tiles/${t.image}`} width={S} height={S} />
                </g>
              </g>
            )
          })
        )}
      </svg>
      <div style={{ fontSize: 9, color: '#bbb', marginTop: 4 }}>Left-click to assign · right-click to rotate</div>
    </div>
  )
}

// ─── Tile type picker ────────────────────────────────────────────────────────

function TileTypePicker({ size, selected, onSelect }: {
  size: number; selected: number; onSelect: (i: number) => void
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>
        Tile
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {TILE_TYPES.map((t, i) => (
          <div key={i} onClick={() => onSelect(i)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px',
            borderRadius: 5, cursor: 'pointer',
            border: selected === i ? '2px solid #111' : '1px solid #e8e8e8',
            background: selected === i ? '#f8f8f8' : 'white',
            boxSizing: 'border-box',
          }}>
            {/* Single tile preview */}
            <div style={{
              width: size, height: t.subW === 1 ? size / 2 : size, flexShrink: 0, borderRadius: 2, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              {t.image ? (
                <img src={`${import.meta.env.BASE_URL}tiles/${t.image}`} width={size} height={size} style={{ display: 'block' }} />
              ) : t.bgImage ? (
                <img src={`${import.meta.env.BASE_URL}tiles/${t.bgImage}`} width={size} height={t.subW === 1 ? size / 2 : size} style={{ display: 'block', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: t.background }} />
              )}
            </div>
            <span style={{ fontSize: 10, color: '#444', lineHeight: 1.3 }}>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Grout picker ───────────────────────────────────────────────────────────

function GroutPicker({ selected, onSelect }: {
  selected: string; onSelect: (hex: string) => void
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666' }}>Grout</span>
        <div style={{ width: 16, height: 16, background: selected, border: '1px solid rgba(0,0,0,0.18)', borderRadius: 3, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: '#aaa' }}>
          {GROUT_COLORS.find(g => g.hex === selected)?.name ?? ''}
        </span>
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

// ─── Design Library ─────────────────────────────────────────────────────────

function DesignLibrary({ onLoad }: { onLoad: (hash: string) => void }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = search.trim()
    ? DESIGN_LIBRARY.filter(d => {
        const q = search.toLowerCase()
        return d.name.toLowerCase().includes(q) ||
               d.description.toLowerCase().includes(q) ||
               d.keywords.some(k => k.includes(q))
      })
    : DESIGN_LIBRARY

  const stars = (n: number) => {
    const full = Math.floor(n / 2)
    const half = n % 2 >= 1
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0))
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
          color: '#666', marginBottom: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <span style={{ fontSize: 8 }}>{expanded ? '▼' : '▶'}</span>
        Design Library ({DESIGN_LIBRARY.length})
      </div>
      {expanded && (
        <>
          <input
            type="text"
            placeholder="Search by keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '5px 8px', fontSize: 11, border: '1px solid #e0e0e0',
              borderRadius: 4, marginBottom: 8, boxSizing: 'border-box', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((d, i) => (
              <div
                key={i}
                onClick={() => onLoad(d.hash)}
                style={{
                  padding: '8px 10px', borderRadius: 5, cursor: 'pointer',
                  border: '1px solid #e8e8e8', background: 'white',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#111')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#222' }}>{d.name}</span>
                  <span style={{ fontSize: 9, color: '#c89030', letterSpacing: -1 }}>{stars(d.rating)}</span>
                </div>
                <div style={{ fontSize: 9, color: '#888', lineHeight: 1.4, marginBottom: 4 }}>{d.description}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {d.keywords.slice(0, 5).map(k => (
                    <span key={k} style={{
                      fontSize: 8, padding: '1px 5px', background: '#f0f0f0', borderRadius: 3, color: '#666',
                    }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', padding: 8 }}>No matches</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Saved Designs (localStorage) ───────────────────────────────────────────

interface SavedDesign { name: string; hash: string }
const STORAGE_KEY = 'tile-visualizer-saved'

function loadSaved(): SavedDesign[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function storeSaved(designs: SavedDesign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs))
}

function SavedDesigns({ onLoad, currentHash }: { onLoad: (hash: string) => void; currentHash: string }) {
  const [saved, setSaved] = useState<SavedDesign[]>(loadSaved)
  const [expanded, setExpanded] = useState(false)

  const handleSave = () => {
    const name = prompt('Name this design:')
    if (!name?.trim()) return
    const next = [...saved, { name: name.trim(), hash: currentHash }]
    setSaved(next)
    storeSaved(next)
  }

  const handleDelete = (i: number) => {
    const next = saved.filter((_, j) => j !== i)
    setSaved(next)
    storeSaved(next)
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px',
            color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          <span style={{ fontSize: 8 }}>{expanded ? '▼' : '▶'}</span>
          My Designs ({saved.length})
        </div>
        <button onClick={handleSave} style={{
          fontSize: 9, padding: '2px 8px', border: '1px solid #ddd', borderRadius: 3,
          background: '#f4f4f4', cursor: 'pointer', color: '#555',
        }}>+ Save Current</button>
      </div>
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {saved.length === 0 && (
            <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', padding: 8 }}>No saved designs yet</div>
          )}
          {saved.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '5px 8px', borderRadius: 4, border: '1px solid #e8e8e8', background: 'white',
            }}>
              <span
                onClick={() => onLoad(d.hash)}
                style={{ fontSize: 11, color: '#333', cursor: 'pointer', flex: 1 }}
              >{d.name}</span>
              <button onClick={() => handleDelete(i)} style={{
                fontSize: 9, padding: '1px 5px', border: 'none', background: 'none',
                cursor: 'pointer', color: '#ccc',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── URL state encoding / decoding ──────────────────────────────────────────

// Template: each cell encoded as hex typeIndex (0-b) + rotation (0-3), row-major
// Cell rotations: string of 0-3 digits, row-major
function encodeState(
  layoutKey: string, tRows: number, tCols: number, tmpl: TemplateCell[][],
  grout: string, tileSize: number, groutWidth: number, cells: Cell[][],
) {
  const t = tmpl.flatMap(row => row.map(c => c.typeIndex.toString(16) + c.rotation)).join('')
  // Each cell: rotation (0-3) + override type as hex or '-' for none
  const r = cells.flatMap(row => row.map(c =>
    c.rotation.toString() + (c.typeOverride != null ? c.typeOverride.toString(16) : '-')
  )).join('')
  const params = new URLSearchParams()
  params.set('l', layoutKey)
  params.set('ts', `${tRows}x${tCols}`)
  params.set('t', t)
  params.set('g', grout.replace('#', ''))
  params.set('sz', String(tileSize))
  params.set('gw', String(groutWidth))
  params.set('r', r)
  return params.toString()
}

function decodeState(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  if (!params.has('l')) return null
  const layoutKey = params.get('l') as 'staircase' | 'grid'
  const [tRows, tCols] = (params.get('ts') ?? '2x2').split('x').map(Number)
  const tStr = params.get('t') ?? ''
  const tmpl: TemplateCell[][] = []
  for (let r = 0; r < tRows; r++) {
    const row: TemplateCell[] = []
    for (let c = 0; c < tCols; c++) {
      const i = (r * tCols + c) * 2
      row.push({
        typeIndex: parseInt(tStr[i] ?? '0', 16),
        rotation: (Number(tStr[i + 1] ?? '0') % 4) as Rotation,
      })
    }
    tmpl.push(row)
  }
  const grout = '#' + (params.get('g') ?? 'C0BDB8')
  const tileSize = Number(params.get('sz') ?? 56)
  const groutWidth = Number(params.get('gw') ?? 3)
  const layout = LAYOUTS[layoutKey] ?? LAYOUTS.staircase
  const rStr = params.get('r') ?? ''
  const cells: Cell[][] = Array.from({ length: layout.rows }, (_, r) =>
    Array.from({ length: layout.cols }, (_, c) => {
      const i = (r * layout.cols + c) * 2
      const rot = (Number(rStr[i] ?? '0') % 4) as Rotation
      const ovChar = rStr[i + 1]
      const typeOverride = ovChar && ovChar !== '-' ? parseInt(ovChar, 16) : undefined
      return { rotation: rot, typeOverride }
    })
  )
  const preset = TEMPLATE_PRESETS.find(p => p.rows === tRows && p.cols === tCols)?.label ?? ''
  return { layoutKey, tRows, tCols, tmpl, grout, tileSize, groutWidth, cells, preset }
}

// ─── App ────────────────────────────────────────────────────────────────────

export function App() {
  const init = decodeState(window.location.hash)

  const [layoutKey, setLayoutKey]       = useState<'staircase' | 'grid'>(init?.layoutKey ?? 'staircase')
  const [selectedType, setSelectedType] = useState(0)
  const [groutColor, setGroutColor]     = useState(init?.grout ?? '#C0BDB8')
  const [tileSize, setTileSize]         = useState(init?.tileSize ?? 56)
  const [groutWidth, setGroutWidth]     = useState(init?.groutWidth ?? 3)
  const [templatePreset, setTemplatePreset] = useState(init?.preset ?? '2×2')
  const [templateRows, setTemplateRows]     = useState(init?.tRows ?? 2)
  const [templateCols, setTemplateCols]     = useState(init?.tCols ?? 2)
  const [template, setTemplate]             = useState<TemplateCell[][]>(() => init?.tmpl ?? makeTemplate(2, 2))
  const [cells, setCells]               = useState<Cell[][]>(() => {
    if (init?.cells) return init.cells
    const l = LAYOUTS.staircase
    return makeGrid(l.rows, l.cols, PATTERNS.find(p => p.key === l.defaultPattern)!.fn)
  })

  const svgRef = useRef<SVGSVGElement>(null)
  const layout = LAYOUTS[layoutKey]
  const { cols, rows, mask } = layout

  // ── Current hash (used for URL sync + saving) ──
  const currentHash = encodeState(layoutKey, templateRows, templateCols, template, groutColor, tileSize, groutWidth, cells)

  useEffect(() => {
    window.history.replaceState(null, '', '#' + currentHash)
  }, [currentHash])

  // ── Load a design from library ──
  const loadDesign = useCallback((hash: string) => {
    const state = decodeState(hash)
    if (!state) return
    setLayoutKey(state.layoutKey)
    setGroutColor(state.grout)
    setTileSize(state.tileSize)
    setGroutWidth(state.groutWidth)
    setTemplateRows(state.tRows)
    setTemplateCols(state.tCols)
    setTemplate(state.tmpl)
    setTemplatePreset(state.preset)
    setCells(state.cells)
  }, [])

  // ── Layout switch ──
  const switchLayout = useCallback((key: 'staircase' | 'grid') => {
    const l = LAYOUTS[key]
    setCells(makeGrid(l.rows, l.cols, PATTERNS.find(p => p.key === l.defaultPattern)!.fn))
    setLayoutKey(key)
  }, [])

  // ── Template slot assignment ──
  const setTemplateSlot = useCallback((r: number, c: number) => {
    setTemplate(prev => prev.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c) ? { ...cell, typeIndex: selectedType } : cell)
    ))
  }, [selectedType])

  // ── Template slot rotation ──
  const rotateTemplateSlot = useCallback((r: number, c: number) => {
    setTemplate(prev => prev.map((row, ri) =>
      row.map((cell, ci) =>
        ri === r && ci === c
          ? { ...cell, rotation: ((cell.rotation + 1) % 4) as Rotation }
          : cell
      )
    ))
  }, [])

  // ── Template resize (preserve existing slots where possible) ──
  const resizeTemplate = useCallback((newRows: number, newCols: number) => {
    setTemplate(prev =>
      Array.from({ length: newRows }, (_, r) =>
        Array.from({ length: newCols }, (_, c) => prev[r]?.[c] ?? { typeIndex: 0, rotation: 0 as Rotation })
      )
    )
    setTemplateRows(newRows)
    setTemplateCols(newCols)
    setTemplatePreset(TEMPLATE_PRESETS.find(p => p.rows === newRows && p.cols === newCols)?.label ?? '')
  }, [])

  // ── Pattern apply ──
  const applyPattern = useCallback((fn: PatternFn) => {
    setCells(prev => prev.map((row, r) => row.map((cell, c) => ({ ...cell, rotation: fn(r, c) }))))
  }, [])

  const randomize = useCallback(() => {
    setCells(prev => prev.map(row => row.map(cell => ({
      ...cell, rotation: Math.floor(Math.random() * 4) as Rotation,
    }))))
  }, [])

  // ── Left-click: paint with selected type ──
  const handleTilePaint = useCallback((r: number, c: number) => {
    setCells(prev => prev.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri !== r || ci !== c) return cell
        const tmplType = template[r % templateRows][c % templateCols].typeIndex
        return {
          ...cell,
          typeOverride: selectedType === tmplType ? undefined : selectedType,
        }
      })
    ))
  }, [selectedType, template, templateRows, templateCols])

  // ── Right-click: rotate ──
  const handleTileRotate = useCallback((r: number, c: number) => {
    setCells(prev => prev.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri !== r || ci !== c) return cell
        return { ...cell, rotation: ((cell.rotation + 1) % 4) as Rotation }
      })
    ))
  }, [])

  // ── Middle-click: reset cell to template ──
  const handleTileReset = useCallback((r: number, c: number) => {
    setCells(prev => prev.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri !== r || ci !== c) return cell
        return { rotation: 0 as Rotation }
      })
    ))
  }, [])

  // ── Reset all overrides ──
  const resetAllOverrides = useCallback(() => {
    setCells(prev => prev.map(row => row.map(cell => ({
      rotation: cell.rotation,
    }))))
  }, [])

  // ── Stamp tool: drag-select a region, then repeat it ──
  const [stampMode, setStampMode] = useState(false)
  const [selection, setSelection] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null)
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null)

  const cellFromEvent = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cs = tileSize + groutWidth
    return {
      r: Math.max(0, Math.min(Math.floor(y / cs), rows - 1)),
      c: Math.max(0, Math.min(Math.floor(x / cs), cols - 1)),
    }
  }, [tileSize, groutWidth, rows, cols])

  const handleStampMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!stampMode || e.button !== 0) return
    const { r, c } = cellFromEvent(e)
    setDragStart({ r, c })
    setSelection({ r1: r, c1: c, r2: r, c2: c })
  }, [stampMode, cellFromEvent])

  const handleStampMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragStart) return
    const { r, c } = cellFromEvent(e)
    setSelection({
      r1: Math.min(dragStart.r, r), c1: Math.min(dragStart.c, c),
      r2: Math.max(dragStart.r, r), c2: Math.max(dragStart.c, c),
    })
  }, [dragStart, cellFromEvent])

  const handleStampMouseUp = useCallback(() => {
    setDragStart(null)
  }, [])

  // Get the effective type+rotation for a cell (resolving template + overrides)
  const getEffectiveCell = useCallback((r: number, c: number) => {
    const cell = cells[r]?.[c]
    if (!cell) return { typeIndex: 0, rotation: 0 as Rotation }
    const tmplCell = template[r % templateRows][c % templateCols]
    const typeIndex = cell.typeOverride ?? tmplCell.typeIndex
    const rotation = ((cell.rotation + tmplCell.rotation) % 4) as Rotation
    return { typeIndex, rotation }
  }, [cells, template, templateRows, templateCols])

  // Repeat the selection in a direction
  const repeatSelection = useCallback((dir: 'right' | 'left' | 'down' | 'up') => {
    if (!selection) return
    const { r1, c1, r2, c2 } = selection
    const sw = c2 - c1 + 1  // stamp width
    const sh = r2 - r1 + 1  // stamp height

    // Capture the stamp pattern (effective type + rotation)
    const stamp: { typeIndex: number; rotation: Rotation }[][] = []
    for (let dr = 0; dr < sh; dr++) {
      const row: { typeIndex: number; rotation: Rotation }[] = []
      for (let dc = 0; dc < sw; dc++) {
        row.push(getEffectiveCell(r1 + dr, c1 + dc))
      }
      stamp.push(row)
    }

    setCells(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })))
      // Fill in the repeat direction
      const applyStamp = (startR: number, startC: number) => {
        for (let dr = 0; dr < sh; dr++) {
          for (let dc = 0; dc < sw; dc++) {
            const tr = startR + dr, tc = startC + dc
            if (tr < 0 || tr >= rows || tc < 0 || tc >= cols) continue
            if (mask && !mask[tr]?.[tc]) continue
            // Skip the original selection
            if (tr >= r1 && tr <= r2 && tc >= c1 && tc <= c2) continue
            const s = stamp[dr][dc]
            next[tr][tc] = { typeOverride: s.typeIndex, rotation: s.rotation }
          }
        }
      }
      if (dir === 'right') {
        for (let startC = c1 + sw; startC < cols; startC += sw) applyStamp(r1, startC)
      } else if (dir === 'left') {
        for (let startC = c1 - sw; startC >= -sw + 1; startC -= sw) applyStamp(r1, startC)
      } else if (dir === 'down') {
        for (let startR = r1 + sh; startR < rows; startR += sh) applyStamp(startR, c1)
      } else if (dir === 'up') {
        for (let startR = r1 - sh; startR >= -sh + 1; startR -= sh) applyStamp(startR, c1)
      }
      return next
    })
  }, [selection, rows, cols, mask, getEffectiveCell])

  // Repeat in ALL directions (fill the grid)
  const repeatAll = useCallback(() => {
    if (!selection) return
    const { r1, c1, r2, c2 } = selection
    const sw = c2 - c1 + 1
    const sh = r2 - r1 + 1
    const stamp: { typeIndex: number; rotation: Rotation }[][] = []
    for (let dr = 0; dr < sh; dr++) {
      const row: { typeIndex: number; rotation: Rotation }[] = []
      for (let dc = 0; dc < sw; dc++) {
        row.push(getEffectiveCell(r1 + dr, c1 + dc))
      }
      stamp.push(row)
    }
    setCells(prev => {
      const next = prev.map(row => row.map(cell => ({ ...cell })))
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (mask && !mask[r]?.[c]) continue
          if (r >= r1 && r <= r2 && c >= c1 && c <= c2) continue
          const sr = ((r - r1) % sh + sh) % sh
          const sc = ((c - c1) % sw + sw) % sw
          const s = stamp[sr][sc]
          next[r][c] = { typeOverride: s.typeIndex, rotation: s.rotation }
        }
      }
      return next
    })
  }, [selection, rows, cols, mask, getEffectiveCell])

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

  // ── Sizes ──
  const cellSize  = tileSize + groutWidth
  const svgWidth  = cols * cellSize + groutWidth
  const svgHeight = rows * cellSize + groutWidth

  const btnBase: React.CSSProperties = {
    padding: '5px 4px', fontSize: 11, background: '#f4f4f4',
    border: '1px solid #e8e8e8', borderRadius: 4, cursor: 'pointer', color: '#333',
  }
  const btnActive: React.CSSProperties = { ...btnBase, background: '#111', color: 'white', border: '1px solid #111' }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 264, background: 'white', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>

        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 1 }}>Tile Visualizer</div>
          <div style={{ fontSize: 10, color: '#999', marginBottom: 8 }}>Kat+Roger 6×6 Arc · Pratt &amp; Larson</div>
          <div style={{ fontSize: 9, color: '#aaa', lineHeight: 1.5 }}>
            Pick a tile, then left-click to paint and right-click to rotate. Use the template to set a repeating pattern, or browse the Design Library for curated layouts. Save your favorites with "My Designs", or copy the URL to bookmark or share.
          </div>
          <div style={{ fontSize: 9, color: '#ccc', marginTop: 6 }}>Made with ❤️ for Maryna</div>
        </div>

        {/* Controls */}
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

          {/* Tile type palette */}
          <TileTypePicker
            size={36}
            selected={selectedType}
            onSelect={setSelectedType}
          />

          {/* Template editor */}
          <TemplateEditor
            template={template}
            tileSize={36}
            groutColor={groutColor}
            selectedType={selectedType}
            onSetSlot={setTemplateSlot}
            onRotateSlot={rotateTemplateSlot}
            onResize={resizeTemplate}
            activePreset={templatePreset}
          />

          <GroutPicker selected={groutColor} onSelect={setGroutColor} />

          {/* Stamp tool */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>Stamp Tool</div>
            <button onClick={() => { setStampMode(!stampMode); if (stampMode) setSelection(null) }}
              style={stampMode ? { ...btnActive, width: '100%', padding: '6px 0', marginBottom: 6 } : { ...btnBase, width: '100%', padding: '6px 0', marginBottom: 6 }}>
              {stampMode ? '✓ Select Mode ON' : 'Select Region'}
            </button>
            {stampMode && (
              <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>
                {selection ? `Selected ${selection.c2-selection.c1+1}×${selection.r2-selection.r1+1} — repeat:` : 'Drag on the grid to select a region'}
              </div>
            )}
            {selection && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 6 }}>
                <button onClick={() => repeatSelection('left')} style={btnBase}>← Left</button>
                <button onClick={() => repeatSelection('right')} style={btnBase}>→ Right</button>
                <button onClick={() => repeatSelection('up')} style={btnBase}>↑ Up</button>
                <button onClick={() => repeatSelection('down')} style={btnBase}>↓ Down</button>
                <button onClick={repeatAll} style={{ ...btnBase, gridColumn: '1 / -1' }}>Fill All</button>
                <button onClick={() => setSelection(null)} style={{ ...btnBase, gridColumn: '1 / -1', color: '#999' }}>Clear Selection</button>
              </div>
            )}
          </div>

          {/* Patterns */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#666', marginBottom: 7 }}>Patterns</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {PATTERNS.map(p => (
                <button key={p.key} onClick={() => applyPattern(p.fn)} style={btnBase}>{p.label}</button>
              ))}
              <button onClick={randomize} style={btnBase}>✦ Random</button>
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

          <button onClick={resetAllOverrides} style={{ width: '100%', padding: '8px 0', fontSize: 11, fontWeight: 600, background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', color: '#333', marginBottom: 6 }}>
            Reset Overrides
          </button>
          <button onClick={downloadSVG} style={{ width: '100%', padding: '8px 0', fontSize: 11, fontWeight: 600, background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', color: '#333', marginBottom: 10 }}>
            ↓ Export SVG
          </button>
          <div style={{ fontSize: 10, color: '#ccc', lineHeight: 1.5 }}>Left-click to paint · right-click to rotate<br />Shift-click to reset a single tile</div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }}
        onContextMenu={e => e.preventDefault()}>
        <svg id="canvas" ref={svgRef} width={svgWidth} height={svgHeight}
          style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
          onMouseDown={handleStampMouseDown}
          onMouseMove={handleStampMouseMove}
          onMouseUp={handleStampMouseUp}
          onMouseLeave={handleStampMouseUp}>
          {cells.slice(0, rows).flatMap((row, r) =>
            row.slice(0, cols).map((cell, c) => {
              if (mask && !mask[r]?.[c]) return null
              const tx = c * cellSize + groutWidth
              const ty = r * cellSize + groutWidth
              const tmplCell = template[r % templateRows][c % templateCols]
              const typeIdx = cell.typeOverride ?? tmplCell.typeIndex
              const tile = TILE_TYPES[typeIdx]
              return (
                <g key={`${r}-${c}`}>
                  <rect x={c*cellSize} y={r*cellSize} width={cellSize+groutWidth} height={cellSize+groutWidth} fill={groutColor} />
                  <g transform={`translate(${tx},${ty})`}
                    onClick={e => { if (stampMode) return; e.shiftKey ? handleTileReset(r, c) : handleTilePaint(r, c) }}
                    onContextMenu={e => { e.preventDefault(); if (!stampMode) handleTileRotate(r, c) }}
                    style={{ cursor: stampMode ? 'crosshair' : 'pointer' }}>
                    {tile.image ? (
                      /* Square arc tile with product photo */
                      <g transform={`rotate(${imgRot(((cell.rotation + tmplCell.rotation) % 4) as Rotation)},${tileSize/2},${tileSize/2})`}>
                        <image href={`${import.meta.env.BASE_URL}tiles/${tile.image}`} width={tileSize} height={tileSize} />
                      </g>
                    ) : tile.bgImage ? (
                      /* Solid rectangle tile with glaze texture */
                      <image href={`${import.meta.env.BASE_URL}tiles/${tile.bgImage}`} width={tileSize} height={tileSize} preserveAspectRatio="xMidYMid slice" />
                    ) : (
                      /* Fallback solid color */
                      <rect width={tileSize} height={tileSize} fill={tile.background} />
                    )}
                  </g>
                </g>
              )
            })
          )}
          {/* Selection highlight overlay */}
          {selection && (
            <rect
              x={selection.c1 * cellSize + groutWidth / 2}
              y={selection.r1 * cellSize + groutWidth / 2}
              width={(selection.c2 - selection.c1 + 1) * cellSize}
              height={(selection.r2 - selection.r1 + 1) * cellSize}
              fill="none"
              stroke="#2080ff"
              strokeWidth={2}
              strokeDasharray="6 3"
              pointerEvents="none"
            />
          )}
        </svg>
      </div>
    </div>
  )
}