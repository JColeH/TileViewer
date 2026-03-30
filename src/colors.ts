export interface Glaze {
  name: string
  hex: string
}

// Actual Kat + Roger glaze colors (10 colorways, colors sampled from product photos)
export const KAT_ROGER_GLAZES: Glaze[] = [
  { name: 'Birch',    hex: '#EAE2D6' },  // near white, warm cream
  { name: 'Dune',     hex: '#DECAB0' },  // light sandy beige-pink
  { name: 'Coral',    hex: '#C87858' },  // salmon / terracotta pink
  { name: 'Sunbeam',  hex: '#C89030' },  // rich golden amber
  { name: 'Poppy',    hex: '#C05528' },  // warm red-orange
  { name: 'Redwood',  hex: '#782828' },  // deep burgundy-maroon
  { name: 'Denim',    hex: '#9898A8' },  // cool light gray-blue
  { name: 'Storm',    hex: '#888880' },  // medium warm gray
  { name: 'Surf',     hex: '#486878' },  // deep teal / slate blue-green
  { name: 'Basalt',   hex: '#302828' },  // near black charcoal
]

// Extended palette inspired by handmade ceramic glazes
export const GLAZES: Glaze[] = [
  // Whites & Creams
  { name: 'Chalk',       hex: '#F4F0EA' },
  { name: 'Cream',       hex: '#EEE5D4' },
  { name: 'Bone',        hex: '#E8DCC8' },
  { name: 'Linen',       hex: '#DDD0B8' },
  // Yellows & Warm
  { name: 'Butter',      hex: '#E8D870' },
  { name: 'Wheat',       hex: '#CCA860' },
  { name: 'Sand',        hex: '#C8A870' },
  { name: 'Buff',        hex: '#D4BA88' },
  // Pinks & Reds
  { name: 'Blush',       hex: '#DDB0A0' },
  { name: 'Rose',        hex: '#C88878' },
  { name: 'Rust',        hex: '#B05040' },
  { name: 'Terracotta',  hex: '#C86845' },
  { name: 'Clay',        hex: '#B87855' },
  // Greens
  { name: 'Sage',        hex: '#98B088' },
  { name: 'Seafoam',     hex: '#80B8A8' },
  { name: 'Teal',        hex: '#408880' },
  { name: 'Forest',      hex: '#386848' },
  { name: 'Moss',        hex: '#688048' },
  { name: 'Olive',       hex: '#888040' },
  // Blues
  { name: 'Powder',      hex: '#C0D8EC' },
  { name: 'Sky',         hex: '#A8C8E0' },
  { name: 'Slate',       hex: '#6888A0' },
  { name: 'Cobalt',      hex: '#2858A8' },
  { name: 'Navy',        hex: '#183058' },
  // Purples
  { name: 'Lavender',    hex: '#A898C8' },
  { name: 'Plum',        hex: '#785888' },
  // Neutrals
  { name: 'Dove',        hex: '#C8C0B8' },
  { name: 'Stone',       hex: '#A09890' },
  { name: 'Pewter',      hex: '#787068' },
  { name: 'Graphite',    hex: '#585048' },
  { name: 'Charcoal',    hex: '#403838' },
  { name: 'Ebony',       hex: '#201818' },
]

export const ALL_GLAZES: Glaze[] = [...KAT_ROGER_GLAZES, ...GLAZES]

export const GROUT_COLORS: Glaze[] = [
  { name: 'White',    hex: '#F2F0EC' },
  { name: 'Linen',    hex: '#E0D8C8' },
  { name: 'Buff',     hex: '#C8B890' },
  { name: 'Lt. Gray', hex: '#C0BDB8' },
  { name: 'Gray',     hex: '#909090' },
  { name: 'Dk. Gray', hex: '#686060' },
  { name: 'Charcoal', hex: '#484040' },
  { name: 'Black',    hex: '#201818' },
]
