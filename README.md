# Tile Visualizer

Interactive tile layout planner for Kat+Roger 6×6 Arc tiles by Pratt & Larson. Made for Maryna.

**Live:** https://jcoleh.github.io/TileViewer/

## Features

- Paint arc, vertical, horizontal, and cut tiles onto a scaled floor plan
- Room mode: exact L-shaped floor geometry (8′-5″ × 4′-7″) with shelves and radiator overlays
- Grout color picker and fractional grout width (down to 1/32″)
- Zoom slider (px/inch)
- Rotation patterns (pinwheel, diagonal, checker, etc.)
- Shift+drag to select, then repeat/fill or copy-paste regions
- Measure tool for verifying distances on the canvas
- Crop toggle (show/hide room boundary clip)
- Furniture toggle (show/hide shelves and radiator)
- Undo/Redo (Cmd+Z / Cmd+Shift+Z)
- Design library with saved patterns
- Export SVG
- All state (tiles, grout, zoom, crop, furniture) encoded in the URL — shareable links

## Development

```bash
npm install
npm run dev       # localhost:5173
npm run build     # production build → dist/
npm run deploy    # build + push to gh-pages branch
```

Deployed to GitHub Pages from the `gh-pages` branch.
