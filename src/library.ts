export interface Design {
  name: string
  rating: number
  description: string
  keywords: string[]
  hash: string
}

export const DESIGN_LIBRARY: Design[] = [
  {
    name: 'River',
    rating: 9,
    description: 'A diagonal band of teal/gold Surf tiles cuts through a Storm gray field with Sunbeam/Denim transitions. Dynamic, unexpected — draws the eye down the staircase.',
    keywords: ['bold', 'diagonal', 'teal', 'gold', 'dynamic', 'statement', 'custom', 'flowing', 'modern'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-06152535050-0-0-0-17263505150-0-0-0-27370615250-0-0-0-37071625350-0-0-0-07172736050-0-0-0-1727370615253505152637071726350515253607172736051525350516273707152535051526370717253505152535061727350515253505152637051525350515253607152535051525350516253505152535051526350515253505152535051525350515253505',
  },
  {
    name: 'Framed Border',
    rating: 8.5,
    description: 'Dark Basalt frame with a Redwood/Dune inner accent border around a warm Birch/Dune field. Reads like a luxurious area rug — high-end residential feel.',
    keywords: ['elegant', 'border', 'frame', 'rug', 'warm', 'luxury', 'custom', 'classic', 'redwood'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-04140414040-0-0-0-34293929340-0-0-0-04190911040-0-0-0-34293921340-0-0-0-04190911040-0-0-0-3424342434041109110111091104342139213121392134041109110111091104342139213121392134041109110111091104342139213121392134041109110111091104342139213121392134041909190919091904342139213121392134041404140414041404',
  },
  {
    name: 'Scattered Terrazzo',
    rating: 8.5,
    description: 'Storm/Birch base with calculated pops of Surf/Sunbeam, Redwood/Sunbeam, and Sunbeam/Denim. Curated randomness — joyful without being chaotic.',
    keywords: ['contemporary', 'terrazzo', 'playful', 'colorful', 'scattered', 'custom', 'eclectic', 'fun'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-0-25352035250-0-0-0-15001500150-0-0-0-25352035200-0-0-0-15051505170-0-0-0-2035253a250-0-0-0-15051a0515203525352035253526150017051505100715253520302a352535251505150515051500102737273525352535251000100515051505152535253525352a3020150515001005150515253a203525372035251a001505100515061520352530253725352a',
  },
  {
    name: 'Diamond Medallion',
    rating: 8,
    description: 'Concentric diamonds radiating from center — Surf/Sunbeam jewel core through Sunbeam/Denim and Storm to dark Basalt edges. A graphic conversation piece.',
    keywords: ['bold', 'geometric', 'diamond', 'medallion', 'graphic', 'custom', 'statement', 'concentric'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-24342434240-0-0-0-14041404140-0-0-0-24342434240-0-0-0-15041404140-0-0-0-25352434240-0-0-0-1605150414243525362636253524150516061706160515253626372737263625160617071707170616253626372737263625150516061706160515243525362636253524140415051605150414243424352535243424140414041504140414243424342434243424',
  },
  {
    name: 'Gradient Descent',
    rating: 8,
    description: 'Vertical transition from dark Basalt at top through Storm gray to cool Birch/Denim to warm Denim/Birch at bottom. A "descending into light" narrative.',
    keywords: ['gradient', 'ombre', 'subtle', 'transitional', 'custom', 'architectural', 'moody'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-0-24342434240-0-0-0-14041404140-0-0-0-24342434240-0-0-0-14041404140-0-0-0-25352535250-0-0-0-1505150515253525352535253525100010001000100010203020302030203020100010001000100010223222322232223222120212021202120212223222322232223222120212021202120212223222322232223222120212021202120212223222322232223222',
  },
  {
    name: 'Tritone Weave',
    rating: 8,
    description: 'Three-tile 2×3 template — Basalt anchors corners, Storm mediates, Birch/Denim lightens. The asymmetric repeat feels artisanal and considered.',
    keywords: ['neutral', 'three-tone', 'sophisticated', 'woven', 'template', 'subtle', 'balanced'],
    hash: 'l=staircase&ts=2x3&t=400050005040&g=686060&sz=56&gw=3&r=2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-',
  },
  {
    name: 'Modern Contrast',
    rating: 7.5,
    description: 'Basalt/Dune and Birch/Denim in pinwheel-out pattern with charcoal grout. Strong light/dark value contrast — clean, modern, architectural.',
    keywords: ['modern', 'contrast', 'minimal', 'black-white', 'pinwheel', 'template', 'architectural', 'clean'],
    hash: 'l=staircase&ts=2x2&t=40000040&g=484040&sz=56&gw=3&r=0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-',
  },
  {
    name: 'Surf Solo',
    rating: 7.5,
    description: 'Single Surf/Sunbeam tile in pinwheel pattern on black grout. The teal and gold create interlocking circles — graphic, bold, personality-driven.',
    keywords: ['bold', 'teal', 'gold', 'single-tile', 'pinwheel', 'template', 'graphic', 'maximalist'],
    hash: 'l=staircase&ts=1x1&t=70&g=201818&sz=56&gw=3&r=2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-',
  },
  // ─── River Collection ───────────────────────────────────────────────────
  {
    name: 'Thin River',
    rating: 7.5,
    description: 'Narrow diagonal teal/gold stripe from upper-right to lower-left. A racing stripe of Surf/Sunbeam through Storm gray — elegant restraint.',
    keywords: ['river', 'thin', 'diagonal', 'minimal', 'teal', 'custom', 'subtle'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-05152536070-0-0-0-15253607170-0-0-0-25350617260-0-0-0-35061727360-0-0-0-05162736050-0-0-0-1627370615253505152637061525350515263707162535051525360716253505152536071726350515253506172635051525350617273605152535051627360515253505162737061525350515263706152535051525370716253505152535071625350515253505',
  },
  {
    name: 'Split River',
    rating: 8,
    description: 'River enters from the front door and forks — one branch toward the downstairs gap, one continuing to the lower area. A metaphor for the branching paths.',
    keywords: ['river', 'split', 'fork', 'dynamic', 'teal', 'custom', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-05152637070-0-0-0-15253607170-0-0-0-25360717260-0-0-0-36071727360-0-0-0-06172736050-0-0-0-1727360515253506172737061525370717273707172635071727370717263505172736071726350515273707172635051525370717263505152535071727360515253505172736051525350515273605152535051525360515253505152535061525350515253505',
  },
  {
    name: 'Door Flow',
    rating: 8.5,
    description: 'River fans outward from the front door entry, widening as it flows deeper into the space. The expanding band creates a welcoming "come in" gesture.',
    keywords: ['river', 'door', 'welcoming', 'fan', 'teal', 'custom', 'entry', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-05152536070-0-0-0-15253607170-0-0-0-25360717270-0-0-0-35061727360-0-0-0-06172737060-0-0-0-1727370716253506162737071626350516273707172635051626370717263605162637071727360615263707172737061625360717273706162535071727370716263505172737071726360515273707172636061525370717273606152535071727370616253505',
  },
  {
    name: 'Meander',
    rating: 8.5,
    description: 'S-curve sine-wave river path through Storm gray field. Organic and natural — creates beautiful asymmetric positive/negative space. Very artisanal.',
    keywords: ['river', 'organic', 'curved', 'natural', 'teal', 'custom', 'artisanal', 'playful'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-07172635050-0-0-0-16273707160-0-0-0-25360717270-0-0-0-35061727370-0-0-0-06172737060-0-0-0-1727370615253506172736051525350617273605152535061727370615253505152637071625350515253506172737061525350515263607172635051525350516273706152535051526370717253505152536071726350515253607172635051526370717263505',
  },
  {
    name: 'Confluence',
    rating: 8,
    description: 'Two rivers meeting in the center — one from the front door, one from the lower stairs. The junction pools wider where paths converge.',
    keywords: ['river', 'confluence', 'meeting', 'two-rivers', 'teal', 'custom', 'symbolic'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-05152637070-0-0-0-15253607170-0-0-0-25360717260-0-0-0-35061727360-0-0-0-06172736050-0-0-0-1727370615253505162737061525350516273707162535051526370717253505152637071726350515253607172635051525360717273605152535061727360515253505172736051525350515273706152535051525370615253505152535071625350515253505',
  },
  {
    name: 'Warm River',
    rating: 9,
    description: 'Burgundy Redwood/Surf river through warm Birch/Dune cream with Redwood/Dune transitions and buff grout. Warm, sophisticated, magazine-worthy. A complete palette inversion of the original River.',
    keywords: ['river', 'warm', 'burgundy', 'redwood', 'cream', 'custom', 'sophisticated', 'earthy', 'magazine'],
    hash: 'l=staircase&ts=1x1&t=00&g=C8B890&sz=56&gw=3&r=0-0-0-0-09112131010-0-0-0-1b293101110-0-0-0-2b3b0911210-0-0-0-3b0b1921310-0-0-0-0b1b2b39010-0-0-0-1b2b3b091121310111293b0b1b2931011121390b1b2b390111213101192b3b0b1121310111293b0b1b213101112131091b2b31011121310111293b01112131011121390b112131011121310119213101112131011129310111213101112131011121310111213101',
  },
  // ─── Round 1: Threshold ─────────────────────────────────────────────────
  {
    name: 'Welcome',
    rating: 8.5,
    description: 'Radial burst of teal/gold from the front door entry, fading through Sunbeam/Denim into calm Storm field. You instantly see where to enter — warm and inviting.',
    keywords: ['entry', 'radial', 'welcoming', 'teal', 'door', 'custom', 'warm', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-26372737270-0-0-0-16071707170-0-0-0-26372737270-0-0-0-16061707170-0-0-0-20362636260-0-0-0-1000100010253525352030203020150515051505150515253525352535253525150515051505150515253525352535253525150515051505150515253525352535253525150515051505150515253525352535253525150515051505150515253525352535253525',
  },
  {
    name: 'Runway',
    rating: 8,
    description: 'Dark Basalt runner from the front door flowing downward with a shifting centerline. Creates a strong directional path — guides movement through the space.',
    keywords: ['runner', 'directional', 'path', 'dark', 'basalt', 'custom', 'practical', 'formal'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-0-05100414000-0-0-0-35203424300-0-0-0-05100414000-0-0-0-35203424300-0-0-0-05100414000-0-0-0-3520342430051505150510041400352535253024342430051505150014041005352535253024342035051505100414041005352535203424302535051505100414001505352530243424302535051500140414001505352530243420352535051500140410051505',
  },
  // ─── Round 2: Geometry ──────────────────────────────────────────────────
  {
    name: 'Zigzag',
    rating: 8,
    description: 'Bold diagonal stripes alternating Surf/Sunbeam, Storm, and Birch/Denim. The teal stripes catch the eye and create dynamic energy that reads well at distance.',
    keywords: ['geometric', 'stripes', 'diagonal', 'teal', 'bold', 'custom', 'dynamic', 'pattern'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-00102737050-0-0-0-10273705150-0-0-0-27370515200-0-0-0-37051520300-0-0-0-05152030070-0-0-0-1520300717273705152030071725370515203007172535051520300717253500152030071725350010203007172535001027300717253500102737071725350010273705172535001027370515253500102737051520350010273705152030001027370515203007',
  },
  {
    name: 'Houndstooth',
    rating: 8.5,
    description: 'Classic houndstooth tooth pattern in Basalt and Birch/Denim. Reads as sophisticated textile — high-end London townhouse energy. Fashion-forward for a floor.',
    keywords: ['geometric', 'houndstooth', 'classic', 'fashion', 'textile', 'custom', 'sophisticated', 'black-white'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-0-20302034200-0-0-0-10041404100-0-0-0-20342030200-0-0-0-14041004140-0-0-0-20302034200-0-0-0-1004140410203420302034203020140410041404100414203020342030203420100414041004140410203420302034203020140410041404100414203020342030203420100414041004140410203420302034203020140410041404100414203020342030203420',
  },
  // ─── Round 3: Mood ──────────────────────────────────────────────────────
  {
    name: 'Ember',
    rating: 9,
    description: 'Hot Redwood/Coral core radiating through Sunbeam gold to cool Storm edges. Viscerally warm — you feel the heat from the center. Sits right where you stand. Incredibly inviting.',
    keywords: ['warm', 'radial', 'ember', 'fire', 'redwood', 'gold', 'custom', 'statement', 'cozy', 'dramatic'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-25352535250-0-0-0-15051505150-0-0-0-25352535250-0-0-0-16061605150-0-0-0-2a3a2636250-0-0-0-1a0a1a0616263a2a3828382a3a26160a1a0818081a0a16263a2a3828382a3a2616061a0a1a0a1a06162536263a2a3a263625150516061606160515253525352535253525150515051505150515253525352535253525150515051505150515253525352535253525',
  },
  {
    name: 'Dusk',
    rating: 8.5,
    description: 'Warm sunset at the door (Redwood/Sunbeam) graduating through gold, gray, to dark Basalt at the shoe rack. Beautiful storytelling — and the dark bottom hides dirt.',
    keywords: ['gradient', 'sunset', 'warm-to-cool', 'practical', 'custom', 'narrative', 'ombre', 'dusk'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-2a3a2a3a2a0-0-0-0-1a0a1a0a1a0-0-0-0-28382838280-0-0-0-18081808180-0-0-0-26362636260-0-0-0-1606160616253525352535253525150515051505150515253520302030203020150510001000100010253522322232223222140412021202120212243424342434243424140414041404140414243424342434243424140414041404140414243424342434243424',
  },
  // ─── Round 4: Luxe ──────────────────────────────────────────────────────
  {
    name: 'Inlay',
    rating: 8.5,
    description: 'Centered Redwood/Sunbeam medallion with concentric Sunbeam/Denim and Birch/Denim borders in a dark Basalt field. Formal, intentional — like marble inlay in a grand foyer.',
    keywords: ['luxury', 'medallion', 'inlay', 'formal', 'centered', 'custom', 'grand', 'foyer'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-24342434240-0-0-0-14041404140-0-0-0-24342434240-0-0-0-14041404140-0-0-0-24342434240-0-0-0-10001000142430263626362630241400160a1a0a1600142430263a2a3a2630241400160a1a0a160014243026362636263024140010001000100014243424342434243424140414041404140414243424342434243424140414041404140414243424342434243424',
  },
  {
    name: 'Tuxedo',
    rating: 8,
    description: 'Dark Basalt upper zone at the door contrasting with warm Birch/Dune lower field, plus dark borders. Formal and structured — the dark entry hides footprint dirt.',
    keywords: ['formal', 'contrast', 'dark-light', 'practical', 'custom', 'structured', 'tuxedo'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-04140414040-0-0-0-34243424340-0-0-0-04140414040-0-0-0-34243424340-0-0-0-04140414040-0-0-0-3121312134041101110111011104342131213121312134041101110111011104342131213121312134041101110111011104342131213121312134041101110111011104342131213121312134041101110111011104342131213121312134041404140414041404',
  },
  // ─── Round 5: Wild ──────────────────────────────────────────────────────
  {
    name: 'Glitch',
    rating: 8,
    description: 'Ordered Birch/Denim pinwheel with three horizontal bands of "glitched" color and rotation. Contemporary art meets floor tile. Black grout sells it. Polarizing but memorable.',
    keywords: ['wild', 'glitch', 'contemporary', 'art', 'disruptive', 'custom', 'bold', 'unexpected'],
    hash: 'l=staircase&ts=1x1&t=00&g=201818&sz=56&gw=3&r=0-0-0-0-07302030070-0-0-0-10001000100-0-0-0-20302030200-0-0-0-28142417280-0-0-0-20302030200-0-0-0-1000100010201720302017203020271824372718243727203020302030203020100010001000100010203020302030203020271824142718241427203007302030203020370010003700100037203020302030073020100010001000100010203020302030203020',
  },
  {
    name: 'Horizon',
    rating: 8.5,
    description: 'Abstract landscape — cream Birch/Denim sky near the door, golden hour Sunbeam band, Redwood/Surf treeline, dark earth at the shoe rack. Surprisingly readable as a mood.',
    keywords: ['wild', 'landscape', 'narrative', 'sky', 'earth', 'custom', 'artistic', 'layered', 'nature'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-20302030200-0-0-0-10001000100-0-0-0-20302030200-0-0-0-16061606160-0-0-0-26362636260-0-0-0-1b05150b152b35253b25352b3525190919091909190919293929392939293929190919091909190919243424342434243424140414041404140414243424342434243424140414041404140414243424342434243424140414041404140414243424342434243424',
  },
  // ─── Wild Round 1: Optical Illusions ────────────────────────────────────
  {
    name: 'Spiral',
    rating: 9,
    description: 'Rotations converge toward the center creating a genuine vortex, with Surf/Sunbeam core glowing through Sunbeam, Storm, and Basalt rings. Black grout. Stop-people-in-their-tracks drama.',
    keywords: ['optical', 'spiral', 'vortex', 'dramatic', 'teal', 'gold', 'custom', 'illusion', 'hypnotic'],
    hash: 'l=staircase&ts=1x1&t=00&g=201818&sz=56&gw=3&r=0-0-0-0-14141414140-0-0-0-14141414140-0-0-0-15151515140-0-0-0-15151515150-0-0-0-16161615150-0-0-0-1616161615060606061616161616060606071717161616060606072727262626363636373727262626363636363626262626353636363626262625353536363626262525353535353525252525343535353525252524343434343424242424343434343424242424',
  },
  // ─── Wild Round 2: Nature ───────────────────────────────────────────────
  {
    name: 'Topography',
    rating: 8.5,
    description: 'Contour lines radiating from two peaks — one near the door, one in the lower area — referencing the two staircases. Map-like quality that\'s intellectually satisfying.',
    keywords: ['nature', 'topography', 'contour', 'map', 'organic', 'custom', 'intellectual', 'two-peaks'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-07102035000-0-0-0-17203507150-0-0-0-27300517250-0-0-0-37001527350-0-0-0-07102035000-0-0-0-1527300010253505152535071727350717273707152535071020300010273505102035051520300715203507172735001725300015253500102735071020300010273505152737071727350510253505152535051027300010203000102737071727370717273705',
  },
  {
    name: 'Tide Pools',
    rating: 9,
    description: 'Jewel-like pools of color scattered across a Storm/Birch rock field — teal near the door, burgundy by the stairs, gold in the center. Like discovering a rocky shoreline. Organic, surprising, personal.',
    keywords: ['nature', 'pools', 'organic', 'scattered', 'jewel', 'colorful', 'custom', 'coastal', 'discovery'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-0-20372737200-0-0-0-10071707100-0-0-0-20372737200-0-0-0-17071000150-0-0-0-27372035250-0-0-0-1707100515203b2b3b2030263020150010001006160610253525352636263626100010051006100a102838283020302a3a2a180818001505100a10283828302535253025100010051505150515253525352535253525150515051505150515253525352535253525',
  },
  // ─── Wild Round 3: Cultural ─────────────────────────────────────────────
  {
    name: 'Sashiko',
    rating: 8,
    description: 'Japanese stitching cross-hatch with Surf/Sunbeam nodes on Birch/Denim field. White grout disappears. Meditative, quiet, deeply considered. Wabi-sabi energy.',
    keywords: ['cultural', 'japanese', 'sashiko', 'meditative', 'minimal', 'custom', 'textile', 'zen'],
    hash: 'l=staircase&ts=1x1&t=00&g=F2F0EC&sz=56&gw=3&r=0-0-0-0-12121712120-0-0-0-10000200100-0-0-0-20300230200-0-0-0-12171212170-0-0-0-20022030020-0-0-0-1002100002121712121712121712100210000200100210200220300230200220171212171212171212023020022030023020020010021000020010121217121217121217100002001002100002203002302002203002121712121712121712200220300230200220',
  },
  {
    name: 'Zellige',
    rating: 9,
    description: 'Maximalist Moroccan palette — teal, burgundy, gold, coral, dark all jumbled with warm linen grout. Looks exactly like handmade zellige in a Marrakech riad. Chaotic up close, harmonious at distance.',
    keywords: ['cultural', 'moroccan', 'zellige', 'maximalist', 'colorful', 'custom', 'handmade', 'bold', 'riad'],
    hash: 'l=staircase&ts=1x1&t=00&g=E0D8C8&sz=56&gw=3&r=0-0-0-0-061b162b340-0-0-0-2b0725361b0-0-0-0-07372704340-0-0-0-3725272b1b0-0-0-0-14272b36380-0-0-0-04172b04171a341b0726053817363a3b25160b07342a1728262b3a3b373438361525350515253505150b173b163814371b3a2b16053b28170a3414161716040a0506073b040b15283a34061b272408263b17370826061707251734250434250b3b3626241417070a',
  },
  {
    name: 'Kilim',
    rating: 8,
    description: 'Woven horizontal bands of Redwood/Coral, Sunbeam, Storm, and Surf with triangle motifs. Reads as a textile runner — perfect for a hallway. Warm and cultural.',
    keywords: ['cultural', 'kilim', 'woven', 'textile', 'horizontal', 'custom', 'runner', 'warm', 'tribal'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-04082828040-0-0-0-04082828040-0-0-0-06262606060-0-0-0-06262606060-0-0-0-05052525050-0-0-0-0505252505072727040727270407072727040727270407050525250505252505050525250505252505062626060626260606062626060626260606040828280408282804040828280408282804082828080828280808082828080828280808060626260606262606',
  },
  // ─── Wild Round 4: Conceptual ───────────────────────────────────────────
  {
    name: 'Erosion',
    rating: 8.5,
    description: 'Ordered Basalt/Birch checkerboard at the door gradually breaks down with warm tiles intruding deeper in. Formality yielding to warmth — a story in tile.',
    keywords: ['conceptual', 'erosion', 'decay', 'order-to-chaos', 'narrative', 'custom', 'unique', 'artistic'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-24302430240-0-0-0-10041004100-0-0-0-24302430240-0-0-0-10041004100-0-0-0-24302430240-0-0-0-10041004102430243024072406241004100410041004080a3007300630243024100410061008101a102430243008300a30070604180417041007102408240a241724182410270a04070406041817301630280624082410171018101a08270a072806301830173016',
  },
  {
    name: 'Gravity',
    rating: 8.5,
    description: 'Tiles "settle" to the bottom in warm layers — sparse airy top near the door, dense warm bottom hidden by the shoe rack. You\'d never guess the concept, it just feels right.',
    keywords: ['conceptual', 'gravity', 'settling', 'sparse', 'dense', 'custom', 'poetic', 'practical', 'layered'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-25352535250-0-0-0-15051505150-0-0-0-25352535250-0-0-0-15051505150-0-0-0-25352535250-0-0-0-150515051525372535273525352515051705150715051525352537253525372516051505150615051526362635253525352615051a0a1a0a1a0a15253525352535253525180818081808180818283828382838253525140414051404140414243424342434243424',
  },
  // ─── Wild Round 5: Maximum Drama ────────────────────────────────────────
  {
    name: 'Eclipse',
    rating: 9,
    description: 'Redwood/Sunbeam crescent against a dark Basalt disc, Sunbeam corona, on Denim/Birch night sky with black grout. Celestial and theatrical — a conversation starter for decades.',
    keywords: ['dramatic', 'eclipse', 'celestial', 'art', 'crescent', 'custom', 'black', 'theatrical', 'moon'],
    hash: 'l=staircase&ts=1x1&t=00&g=201818&sz=56&gw=3&r=0-0-0-0-22322232220-0-0-0-12021202120-0-0-0-22322232220-0-0-0-16061202120-0-0-0-26362632220-0-0-0-140416061222362a34243424362212061a0a140414061222362a3a2a342a36221206160a1a0a160612223226362636263222120212061606120212223222322232223222120212021202120212223222322232223222120212021202120212223222322232223222',
  },
  {
    name: 'Stained Glass',
    rating: 8.5,
    description: 'Basalt "lead lines" divide glowing panels of teal, coral, gold, and burgundy on black grout. Genuinely evokes a church window. The kind of floor that makes you forget where you were going.',
    keywords: ['dramatic', 'stained-glass', 'church', 'panels', 'colorful', 'custom', 'gothic', 'bold', 'lead'],
    hash: 'l=staircase&ts=1x1&t=00&g=201818&sz=56&gw=3&r=0-0-0-0-04141414040-0-0-0-04081808040-0-0-0-04382838040-0-0-0-04141414040-0-0-0-043b2b3b040-0-0-0-040b1b0b0404141414041414140404071707040a1a0a0404372737043a2a3a0404141414041414140404362636043b2b3b0404061606040b1b0b0404141414041414140404071707040818080404372737043828380404141414041414140404382838043a2a3a04',
  },
  // ─── Rope Collection ────────────────────────────────────────────────────
  {
    name: 'Original Braid',
    rating: 8,
    description: 'The classic — Birch/Denim with alternating 0/2 rotations in a 4×4 template. Connected arcs form sinuous braided ropes flowing horizontally. Subtle, woven, endlessly satisfying.',
    keywords: ['rope', 'braid', 'classic', 'woven', 'subtle', 'template', 'horizontal', 'textile'],
    hash: 'l=staircase&ts=4x4&t=02000200000200020200020000020002&g=C0BDB8&sz=56&gw=3&r=2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-2-',
  },
  {
    name: 'Wide Braid',
    rating: 8,
    description: 'Double-width rotation bands create fatter, lazier waves. Feels like draped fabric — luxurious and calm. The wider curves have real presence.',
    keywords: ['rope', 'braid', 'wide', 'thick', 'fabric', 'luxurious', 'template', 'calm'],
    hash: 'l=staircase&ts=4x4&t=00000202000002020202000002020000&g=C0BDB8&sz=56&gw=3&r=0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-',
  },
  {
    name: 'Teal Rope',
    rating: 9,
    description: 'Surf/Sunbeam rope on Birch/Denim with dark grout. The teal/gold pops and the sinuous line becomes the unmistakable hero. Beautiful and bold.',
    keywords: ['rope', 'braid', 'teal', 'gold', 'bold', 'template', 'colorful', 'contrast'],
    hash: 'l=staircase&ts=4x4&t=72007200007200727200720000720072&g=484040&sz=56&gw=3&r=0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-',
  },
  {
    name: 'Warm Rope',
    rating: 8.5,
    description: 'Redwood/Coral rope weaving through Dune/Birch cream with buff grout. Tuscan villa energy — warm terracotta sinuous lines through a creamy field.',
    keywords: ['rope', 'braid', 'warm', 'redwood', 'coral', 'cream', 'template', 'tuscan', 'mediterranean'],
    hash: 'l=staircase&ts=4x4&t=82308230308230828230823030823082&g=C8B890&sz=56&gw=3&r=0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-',
  },
  {
    name: 'Dark Rope',
    rating: 9,
    description: 'Basalt/Dune rope on Storm/Birch with charcoal grout. Luxury hotel lobby elegance — the dark ropes create strong graphic rhythm with high value contrast.',
    keywords: ['rope', 'braid', 'dark', 'basalt', 'luxury', 'template', 'elegant', 'hotel', 'graphic'],
    hash: 'l=staircase&ts=4x4&t=42504250504250424250425050425042&g=484040&sz=56&gw=3&r=0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-',
  },
  {
    name: 'Diagonal Braid',
    rating: 8.5,
    description: 'Rotations 1/3 create vertical-flowing ropes like rain on a window. Perfect staircase orientation — the flow matches the direction you walk.',
    keywords: ['rope', 'braid', 'diagonal', 'vertical', 'flowing', 'template', 'rain', 'directional'],
    hash: 'l=staircase&ts=4x4&t=01030103030103010103010303010301&g=C0BDB8&sz=56&gw=3&r=0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-',
  },
  {
    name: 'Serpentine',
    rating: 8.5,
    description: 'Thick Surf/Sunbeam snake winding in sine-wave curves across a Birch/Denim field. Combines the best of the river and rope concepts — organic, flowing, dramatic.',
    keywords: ['rope', 'serpentine', 'snake', 'organic', 'teal', 'custom', 'flowing', 'thick', 'sinuous'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-17171710100-0-0-0-10171717170-0-0-0-00000707070-0-0-0-30373737370-0-0-0-37373730300-0-0-0-3730303030070707070000000000101717171710101010101010101717171010101010101010171717000000000000070707303030303037373737303030373737303030303737373030303030070707070000000000101017171710101010101010101717171010',
  },
  {
    name: 'Helix',
    rating: 9.5,
    description: 'Two intertwined rope strands — teal Surf/Sunbeam and burgundy Redwood/Coral — twisting around each other with Sunbeam/Denim and Redwood/Dune transitions. A DNA double helix in tile. Completely unique.',
    keywords: ['rope', 'helix', 'dna', 'double', 'teal', 'burgundy', 'custom', 'unique', 'intertwined', 'statement'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-0-07270620000-0-0-0-29062707200-0-0-0-00200727060-0-0-0-29062707260-0-0-0-08270726000-0-0-0-2708280920002607270629082809200627072000280829002007270629082800200020062707260020002008280926072700200928082000270726002908280926072706200029082807270620002006270728082900200627072609280829002607270020082809',
  },
]
