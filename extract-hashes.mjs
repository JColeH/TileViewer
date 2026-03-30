#!/usr/bin/env node
/** Extract URL hashes for all curated designs — no screenshots needed */

const S = { cols: 9, rows: 17, upperOffset: 4, upperRows: 6 }
function inMask(r, c) { return r < S.upperRows ? c >= S.upperOffset : true }

function buildHash(designFn, grout) {
  let rStr = ''
  for (let r = 0; r < S.rows; r++) {
    for (let c = 0; c < S.cols; c++) {
      if (!inMask(r, c)) { rStr += '0-'; continue }
      const { type, rotation } = designFn(r, c)
      rStr += (rotation % 4) + type.toString(16)
    }
  }
  const params = new URLSearchParams()
  params.set('l', 'staircase')
  params.set('ts', '1x1')
  params.set('t', '00')
  params.set('g', grout)
  params.set('sz', '56')
  params.set('gw', '3')
  params.set('r', rStr)
  return params.toString()
}

const designs = {
  river: {
    fn: (r, c) => {
      const dist = (c * 1.0) - (r * 0.55) + 1.5
      let type = dist > 2.5 && dist < 5.5 ? 7 : dist > 1.5 && dist < 6.5 ? 6 : 5
      return { type, rotation: ((r + c) % 4) }
    },
    grout: '484040'
  },
  border: {
    fn: (r, c) => {
      const isEdge = (r >= S.upperRows && (c === 0 || c === S.cols - 1)) ||
                     (r < S.upperRows && (c === S.upperOffset || c === S.cols - 1)) ||
                     r === 0 || r === S.rows - 1 || (r === S.upperRows - 1 && c >= S.upperOffset)
      const innerBorder = (r >= S.upperRows && c === 2) || (c === S.cols - 3) ||
                          (r === S.rows - 3) || (r === 1 && c >= S.upperOffset) ||
                          (r < S.upperRows && c === S.upperOffset + 1)
      let type = isEdge ? 4 : innerBorder ? 9 : 1
      return { type, rotation: [[0,1],[3,2]][r%2][c%2] }
    },
    grout: '484040'
  },
  scattered: {
    fn: (r, c) => {
      const hash = ((r * 23 + c * 41 + r * c * 7) % 113)
      let type = hash < 6 ? 7 : hash < 11 ? 10 : hash < 15 ? 6 : hash < 40 ? 0 : 5
      return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
    },
    grout: '686060'
  },
  diamond: {
    fn: (r, c) => {
      const dist = Math.abs(r - 9) + Math.abs(c - 4)
      let type = dist <= 2 ? 7 : dist <= 4 ? 6 : dist <= 6 ? 5 : 4
      return { type, rotation: [[2,3],[1,0]][r%2][c%2] }
    },
    grout: '484040'
  },
  gradient: {
    fn: (r, c) => {
      const t = r <= 3 ? 4 : r <= 6 ? 5 : r <= 9 ? 0 : 2
      return { type: t, rotation: [[2,3],[1,0]][r%2][c%2] }
    },
    grout: '686060'
  },
}

for (const [name, { fn, grout }] of Object.entries(designs)) {
  console.log(`${name}: ${buildHash(fn, grout)}`)
}
