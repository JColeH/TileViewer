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
]
