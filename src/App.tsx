import { useState, useCallback, useRef, useEffect } from 'react'
import { GROUT_COLORS } from './colors'

type Rotation = 0 | 1 | 2 | 3

// ─── Tile types (fixed background + arc color pairs) ────────────────────────

interface TileType {
  name: string
  background: string
  arc: string
  image: string
}

// Images are naturally oriented with arc at bottom-right.
// To show rotation r, we rotate the image by ((r - 2 + 4) % 4) * 90 degrees.
function imgRot(r: Rotation): number { return ((r - 2 + 4) % 4) * 90 }

// Images are naturally oriented with arc at bottom-right (rotation 2 in display terms)
const TILE_TYPES: TileType[] = [
  { name: 'Birch / Denim',      background: '#EAE2D6', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Birch-Denim-230x230.jpg' },
  { name: 'Birch / Dune',       background: '#EAE2D6', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Birch-Dune-230x230.jpg' },
  { name: 'Denim / Birch',      background: '#9898A8', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Denim-Birch-230x230.jpg' },
  { name: 'Dune / Birch',       background: '#DECAB0', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Dune-Birch-230x230.jpg' },
  { name: 'Basalt / Dune',      background: '#302828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Basalt-Dune-230x230.jpg' },
  { name: 'Storm / Birch',      background: '#888880', arc: '#EAE2D6', image: 'Kat-Roger-6x6-arc-Storm-Birch-230x230.jpg' },
  { name: 'Sunbeam / Denim',    background: '#C89030', arc: '#9898A8', image: 'Kat-Roger-6x6-arc-Sunbeam-Denim-230x230.jpg' },
  { name: 'Surf / Sunbeam',     background: '#486878', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Surf-Sunbeam-230x230.jpg' },
  { name: 'Redwood / Coral',    background: '#782828', arc: '#C87858', image: 'Kat-Roger-6x6-arc-Redwood-Coral-230x230.jpg' },
  { name: 'Redwood / Dune',     background: '#782828', arc: '#DECAB0', image: 'Kat-Roger-6x6-arc-Redwood-Dune-230x230.jpg' },
  { name: 'Redwood / Sunbeam',  background: '#782828', arc: '#C89030', image: 'Kat-Roger-6x6-arc-Redwood-Sunbeam-2-230x230.jpg' },
  { name: 'Redwood / Surf',     background: '#782828', arc: '#486878', image: 'Kat-Roger-6x6-arc-Redwood-Surf-230x230.jpg' },
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
const STAIRCASE_ROWS         = 14
const STAIRCASE_UPPER_OFFSET = 3
const STAIRCASE_UPPER_ROWS   = 5

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
            {/* Single tile preview at natural orientation */}
            <div style={{
              width: size, height: size, flexShrink: 0, borderRadius: 2, overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.08)',
            }}>
              <img src={`${import.meta.env.BASE_URL}tiles/${t.image}`} width={size} height={size} style={{ display: 'block' }} />
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

  // ── Sync state → URL hash ──
  useEffect(() => {
    const hash = encodeState(layoutKey, templateRows, templateCols, template, groutColor, tileSize, groutWidth, cells)
    window.history.replaceState(null, '', '#' + hash)
  }, [layoutKey, templateRows, templateCols, template, groutColor, tileSize, groutWidth, cells])

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
          <div style={{ fontSize: 10, color: '#999' }}>Kat+Roger 6×6 Arc · Pratt &amp; Larson</div>
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

          <button onClick={resetAllOverrides} style={{ width: '100%', padding: '8px 0', fontSize: 11, fontWeight: 600, background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', color: '#333', marginBottom: 6 }}>
            Reset Overrides
          </button>
          <button onClick={downloadSVG} style={{ width: '100%', padding: '8px 0', fontSize: 11, fontWeight: 600, background: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: 4, cursor: 'pointer', color: '#333', marginBottom: 10 }}>
            ↓ Export SVG
          </button>
          <div style={{ fontSize: 10, color: '#ccc', lineHeight: 1.5 }}>Left-click to paint · right-click to rotate<br />Middle-click to reset a single tile</div>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={{ flex: 1, overflow: 'auto', background: '#f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 40 }}
        onContextMenu={e => e.preventDefault()}>
        <svg ref={svgRef} width={svgWidth} height={svgHeight}
          style={{ background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.10)', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg">
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
                    onClick={() => handleTilePaint(r, c)}
                    onContextMenu={e => { e.preventDefault(); handleTileRotate(r, c) }}
                    onAuxClick={e => { if (e.button === 1) { e.preventDefault(); handleTileReset(r, c) } }}
                    style={{ cursor: 'pointer' }}>
                    <g transform={`rotate(${imgRot(((cell.rotation + tmplCell.rotation) % 4) as Rotation)},${tileSize/2},${tileSize/2})`}>
                      <image href={`${import.meta.env.BASE_URL}tiles/${tile.image}`} width={tileSize} height={tileSize} />
                    </g>
                  </g>
                </g>
              )
            })
          )}
        </svg>
      </div>
    </div>
  )
}