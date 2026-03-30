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
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3706152535050-0-0-0717263505150-0-0-1727370615250-0-0-2737071625350-0-0-360717273605152535061727370615253505152637071726350515253607172736051525350516273707152535051526370717253505152535061727350515253505152637051525350515253607152535051525350516',
  },
  {
    name: 'Framed Border',
    rating: 8.5,
    description: 'Dark Basalt frame with a Redwood/Dune inner accent border around a warm Birch/Dune field. Reads like a luxurious area rug — high-end residential feel.',
    keywords: ['elegant', 'border', 'frame', 'rug', 'warm', 'luxury', 'custom', 'classic', 'redwood'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-1404140414040-0-0-2439293929340-0-0-1409110911040-0-0-2439213921340-0-0-140414041404342139213121392134041109110111091104342139213121392134041109110111091104342139213121392134041109110111091104342939293929392934041109110111091104342434243424342434',
  },
  {
    name: 'Scattered Terrazzo',
    rating: 8.5,
    description: 'Storm/Birch base with calculated pops of Surf/Sunbeam, Redwood/Sunbeam, and Sunbeam/Denim. Curated randomness — joyful without being chaotic.',
    keywords: ['contemporary', 'terrazzo', 'playful', 'colorful', 'scattered', 'custom', 'eclectic', 'fun'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-3a25352035250-0-0-0515001500150-0-0-3525352035200-0-0-0015051505170-0-0-352035253a251705150715051a0515203525352035253526150017051505100715253520302a352535251505150515051500102737273525352535251000100515051505152535253525352a3020150515001005150515',
  },
  {
    name: 'Diamond Medallion',
    rating: 8,
    description: 'Concentric diamonds radiating from center — Surf/Sunbeam jewel core through Sunbeam/Denim and Storm to dark Basalt edges. A graphic conversation piece.',
    keywords: ['bold', 'geometric', 'diamond', 'medallion', 'graphic', 'custom', 'statement', 'concentric'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3424342434240-0-0-0414041404140-0-0-3424342434240-0-0-0415041404140-0-0-352535243424140415051605150414243525362636253524150516061706160515253626372737263625160617071707170616253626372737263625150516061706160515243525362636253524140415051605150414',
  },
  {
    name: 'Gradient Descent',
    rating: 8,
    description: 'Vertical transition from dark Basalt at top through Storm gray to cool Birch/Denim to warm Denim/Birch at bottom. A "descending into light" narrative.',
    keywords: ['gradient', 'ombre', 'subtle', 'transitional', 'custom', 'architectural', 'moody'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-3424342434240-0-0-0414041404140-0-0-3424342434240-0-0-0414041404140-0-0-352535253525150515051505150515253525352535253525100010001000100010203020302030203020100010001000100010223222322232223222120212021202120212223222322232223222120212021202120212',
  },
  {
    name: 'Tritone Weave',
    rating: 8,
    description: 'Three-tile 2×3 template — Basalt anchors corners, Storm mediates, Birch/Denim lightens. The asymmetric repeat feels artisanal and considered.',
    keywords: ['neutral', 'three-tone', 'sophisticated', 'woven', 'template', 'subtle', 'balanced'],
    hash: 'l=staircase&ts=2x3&t=400050005040&g=686060&sz=56&gw=3&r=2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-',
  },
  {
    name: 'Modern Contrast',
    rating: 7.5,
    description: 'Basalt/Dune and Birch/Denim in pinwheel-out pattern with charcoal grout. Strong light/dark value contrast — clean, modern, architectural.',
    keywords: ['modern', 'contrast', 'minimal', 'black-white', 'pinwheel', 'template', 'architectural', 'clean'],
    hash: 'l=staircase&ts=2x2&t=40000040&g=484040&sz=56&gw=3&r=0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-0-1-0-1-0-1-0-1-0-3-2-3-2-3-2-3-2-3-',
  },
  {
    name: 'Surf Solo',
    rating: 7.5,
    description: 'Single Surf/Sunbeam tile in pinwheel pattern on black grout. The teal and gold create interlocking circles — graphic, bold, personality-driven.',
    keywords: ['bold', 'teal', 'gold', 'single-tile', 'pinwheel', 'template', 'graphic', 'maximalist'],
    hash: 'l=staircase&ts=1x1&t=70&g=201818&sz=56&gw=3&r=2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-2-3-2-3-2-3-2-3-2-1-0-1-0-1-0-1-0-1-',
  },
  // ─── River Collection ───────────────────────────────────────────────────
  {
    name: 'Thin River',
    rating: 7.5,
    description: 'Narrow diagonal teal/gold stripe from upper-right to lower-left. A racing stripe of Surf/Sunbeam through Storm gray — elegant restraint.',
    keywords: ['river', 'thin', 'diagonal', 'minimal', 'teal', 'custom', 'subtle'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3505152536070-0-0-0515253607170-0-0-1525360717260-0-0-2535061727360-0-0-350617273605152535061727360515253505162737061525350516273706152535051526370716253505152637071625350515263707162535051525360717263505152535071726350515253505172635051525350515',
  },
  {
    name: 'Split River',
    rating: 8,
    description: 'River enters from the front door and forks — one branch toward the downstairs gap, one continuing to the lower area. A metaphor for the branching paths.',
    keywords: ['river', 'split', 'fork', 'dynamic', 'teal', 'custom', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3505152637070-0-0-0515253607170-0-0-1525360717260-0-0-2536071727360-0-0-350617273605152535061727360515253506172737061525370717273707172635071727370717263505172736071726350515273707172635051525370717263505152535071727360515253505172736051525350515',
  },
  {
    name: 'Door Flow',
    rating: 8.5,
    description: 'River fans outward from the front door entry, widening as it flows deeper into the space. The expanding band creates a welcoming "come in" gesture.',
    keywords: ['river', 'door', 'welcoming', 'fan', 'teal', 'custom', 'entry', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3505152536070-0-0-0515253607170-0-0-1525360717270-0-0-2535061727360-0-0-350617273706152535061727370716253506162737071626350516273707172635051626370717263605162637071727360615263707172737061625360717273706162535071727370716263505172737071726360515',
  },
  {
    name: 'Meander',
    rating: 8.5,
    description: 'S-curve sine-wave river path through Storm gray field. Organic and natural — creates beautiful asymmetric positive/negative space. Very artisanal.',
    keywords: ['river', 'organic', 'curved', 'natural', 'teal', 'custom', 'artisanal', 'playful'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3607172635050-0-0-0516273707160-0-0-1525360717270-0-0-2535061727370-0-0-350617273706152535061727370615253506172736051525350617273605152535061727370615253505152637071625350515253506172737061525350515263607172635051525350516273706152535051526370717',
  },
  {
    name: 'Confluence',
    rating: 8,
    description: 'Two rivers meeting in the center — one from the front door, one from the lower stairs. The junction pools wider where paths converge.',
    keywords: ['river', 'confluence', 'meeting', 'two-rivers', 'teal', 'custom', 'symbolic'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3505152637070-0-0-0515253607170-0-0-1525360717260-0-0-2535061727360-0-0-350617273605152535061727370615253505162737061525350516273707162535051526370717253505152637071726350515253607172635051525360717273605152535061727360515253505172736051525350515',
  },
  {
    name: 'Warm River',
    rating: 9,
    description: 'Burgundy Redwood/Surf river through warm Birch/Dune cream with Redwood/Dune transitions and buff grout. Warm, sophisticated, magazine-worthy. A complete palette inversion of the original River.',
    keywords: ['river', 'warm', 'burgundy', 'redwood', 'cream', 'custom', 'sophisticated', 'earthy', 'magazine'],
    hash: 'l=staircase&ts=1x1&t=00&g=C8B890&sz=56&gw=3&r=0-0-0-3b09112131010-0-0-0b1b293101110-0-0-1b2b3b0911210-0-0-2b3b0b1921310-0-0-390b1b2b3901112131091b2b3b091121310111293b0b1b2931011121390b1b2b390111213101192b3b0b1121310111293b0b1b213101112131091b2b31011121310111293b01112131011121390b112131011121310119',
  },
  // ─── Round 1: Threshold ─────────────────────────────────────────────────
  {
    name: 'Welcome',
    rating: 8.5,
    description: 'Radial burst of teal/gold from the front door entry, fading through Sunbeam/Denim into calm Storm field. You instantly see where to enter — warm and inviting.',
    keywords: ['entry', 'radial', 'welcoming', 'teal', 'door', 'custom', 'warm', 'directional'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3026372737270-0-0-0016071707170-0-0-3026372737270-0-0-0016061707170-0-0-302036263626150515001000100010253525352030203020150515051505150515253525352535253525150515051505150515253525352535253525150515051505150515253525352535253525150515051505150515',
  },
  {
    name: 'Runway',
    rating: 8,
    description: 'Dark Basalt runner from the front door flowing downward with a shifting centerline. Creates a strong directional path — guides movement through the space.',
    keywords: ['runner', 'directional', 'path', 'dark', 'basalt', 'custom', 'practical', 'formal'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-1505100414000-0-0-2535203424300-0-0-1505100414000-0-0-2535203424300-0-0-150510041400352535253520342430051505150510041400352535253024342430051505150014041005352535253024342035051505100414041005352535203424302535051505100414001505352530243424302535',
  },
  // ─── Round 2: Geometry ──────────────────────────────────────────────────
  {
    name: 'Zigzag',
    rating: 8,
    description: 'Bold diagonal stripes alternating Surf/Sunbeam, Storm, and Birch/Denim. The teal stripes catch the eye and create dynamic energy that reads well at distance.',
    keywords: ['geometric', 'stripes', 'diagonal', 'teal', 'bold', 'custom', 'dynamic', 'pattern'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3500102737050-0-0-0010273705150-0-0-1027370515200-0-0-2737051520300-0-0-370515203007102737051520300717273705152030071725370515203007172535051520300717253500152030071725350010203007172535001027300717253500102737071725350010273705172535001027370515',
  },
  {
    name: 'Houndstooth',
    rating: 8.5,
    description: 'Classic houndstooth tooth pattern in Basalt and Birch/Denim. Reads as sophisticated textile — high-end London townhouse energy. Fashion-forward for a floor.',
    keywords: ['geometric', 'houndstooth', 'classic', 'fashion', 'textile', 'custom', 'sophisticated', 'black-white'],
    hash: 'l=staircase&ts=1x1&t=00&g=686060&sz=56&gw=3&r=0-0-0-3420302034200-0-0-0410041404100-0-0-3020342030200-0-0-0414041004140-0-0-342030203420100414041004140410203420302034203020140410041404100414203020342030203420100414041004140410203420302034203020140410041404100414203020342030203420100414041004140410',
  },
  // ─── Round 3: Mood ──────────────────────────────────────────────────────
  {
    name: 'Ember',
    rating: 9,
    description: 'Hot Redwood/Coral core radiating through Sunbeam gold to cool Storm edges. Viscerally warm — you feel the heat from the center. Sits right where you stand. Incredibly inviting.',
    keywords: ['warm', 'radial', 'ember', 'fire', 'redwood', 'gold', 'custom', 'statement', 'cozy', 'dramatic'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3525352535250-0-0-0515051505150-0-0-3525352535250-0-0-0616061605150-0-0-3a2a3a26362516061a0a1a0a1a0616263a2a3828382a3a26160a1a0818081a0a16263a2a3828382a3a2616061a0a1a0a1a06162536263a2a3a263625150516061606160515253525352535253525150515051505150515',
  },
  {
    name: 'Dusk',
    rating: 8.5,
    description: 'Warm sunset at the door (Redwood/Sunbeam) graduating through gold, gray, to dark Basalt at the shoe rack. Beautiful storytelling — and the dark bottom hides dirt.',
    keywords: ['gradient', 'sunset', 'warm-to-cool', 'practical', 'custom', 'narrative', 'ombre', 'dusk'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3a2a3a2a3a2a0-0-0-0a1a0a1a0a1a0-0-0-3828382838280-0-0-0818081808180-0-0-362636263626160616061606160616253525352535253525150515051505150515253520302030203020150510001000100010253522322232223222140412021202120212243424342434243424140414041404140414',
  },
  // ─── Round 4: Luxe ──────────────────────────────────────────────────────
  {
    name: 'Inlay',
    rating: 8.5,
    description: 'Centered Redwood/Sunbeam medallion with concentric Sunbeam/Denim and Birch/Denim borders in a dark Basalt field. Formal, intentional — like marble inlay in a grand foyer.',
    keywords: ['luxury', 'medallion', 'inlay', 'formal', 'centered', 'custom', 'grand', 'foyer'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3424342434240-0-0-0414041404140-0-0-3424342434240-0-0-0414041404140-0-0-3424342434241400100010001000142430263626362630241400160a1a0a1600142430263a2a3a2630241400160a1a0a160014243026362636263024140010001000100014243424342434243424140414041404140414',
  },
  {
    name: 'Tuxedo',
    rating: 8,
    description: 'Dark Basalt upper zone at the door contrasting with warm Birch/Dune lower field, plus dark borders. Formal and structured — the dark entry hides footprint dirt.',
    keywords: ['formal', 'contrast', 'dark-light', 'practical', 'custom', 'structured', 'tuxedo'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-1404140414040-0-0-2434243424340-0-0-1404140414040-0-0-2434243424340-0-0-140414041404342131213121312134041101110111011104342131213121312134041101110111011104342131213121312134041101110111011104342131213121312134041101110111011104342434243424342434',
  },
  // ─── Round 5: Wild ──────────────────────────────────────────────────────
  {
    name: 'Glitch',
    rating: 8,
    description: 'Ordered Birch/Denim pinwheel with three horizontal bands of "glitched" color and rotation. Contemporary art meets floor tile. Black grout sells it. Polarizing but memorable.',
    keywords: ['wild', 'glitch', 'contemporary', 'art', 'disruptive', 'custom', 'bold', 'unexpected'],
    hash: 'l=staircase&ts=1x1&t=00&g=201818&sz=56&gw=3&r=0-0-0-3007302030070-0-0-0010001000100-0-0-3020302030200-0-0-1728142417280-0-0-302030203020100010001000100010201720302017203020271824372718243727203020302030203020100010001000100010203020302030203020271824142718241427203007302030203020370010003700100037',
  },
  {
    name: 'Horizon',
    rating: 8.5,
    description: 'Abstract landscape — cream Birch/Denim sky near the door, golden hour Sunbeam band, Redwood/Surf treeline, dark earth at the shoe rack. Surprisingly readable as a mood.',
    keywords: ['wild', 'landscape', 'narrative', 'sky', 'earth', 'custom', 'artistic', 'layered', 'nature'],
    hash: 'l=staircase&ts=1x1&t=00&g=484040&sz=56&gw=3&r=0-0-0-3020302030200-0-0-0010001000100-0-0-3020302030200-0-0-0616061606160-0-0-362636263626150b15051b05150b152b35253b25352b3525190919091909190919293929392939293929190919091909190919243424342434243424140414041404140414243424342434243424140414041404140414',
  },
]
