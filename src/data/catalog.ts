import { CategoryFilter, MediaFilter, SpaceItem } from '@/types/space';

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const CATALOG: SpaceItem[] = [
  {
    id: '2026-09-12',
    date: '2026-09-12',
    title: 'Earth at Nightfall',
    explanation:
      'City lights trace the continents while the terminator slides into dusk. This Astronomy Picture of the Day frames our world as a thin, glowing harbor in a much darker sea.',
    credit: 'NASA',
    url: img('photo-1446776811953-b23d57bd21aa'),
    mediaType: 'image',
    category: 'earth',
  },
  {
    id: '2026-09-11',
    date: '2026-09-11',
    title: 'Pillars in the Eagle Nebula',
    explanation:
      'Towers of cool hydrogen rise several light-years high, sculpted by ultraviolet wind from nearby young stars. Newborn suns still hide in the densest knots of dust.',
    credit: 'NASA / ESA / Hubble',
    url: img('photo-1464802686167-b939a6910659'),
    mediaType: 'image',
    category: 'nebula',
  },
  {
    id: '2026-09-10',
    date: '2026-09-10',
    title: 'Andromeda on Approach',
    explanation:
      'The nearest spiral giant spans more than 200,000 light-years. Dust lanes curl toward a bright core where hundreds of billions of stars keep a slow, ancient clock.',
    credit: 'NASA / ESA',
    url: img('photo-1543722530-d2c3201371e7'),
    mediaType: 'image',
    category: 'galaxy',
  },
  {
    id: '2026-09-08',
    date: '2026-09-08',
    title: 'Saturn After Equinox',
    explanation:
      'Sunlight rakes across the rings until they become a paper-thin line. Storms in the amber atmosphere still turn, indifferent to the geometry we find so precise.',
    credit: 'NASA / JPL-Caltech / Cassini',
    url: img('photo-1614732414444-096e5f1122d5'),
    mediaType: 'image',
    category: 'planet',
  },
  {
    id: '2026-09-05',
    date: '2026-09-05',
    title: 'Blue Marble Revisited',
    explanation:
      'Oceans, cloud streets, and a razor of atmosphere. A reminder that every night sky we study is seen from this one moving observatory.',
    credit: 'NASA',
    url: img('photo-1451187580459-43490279c0fa'),
    mediaType: 'image',
    category: 'earth',
  },
  {
    id: '2026-09-01',
    date: '2026-09-01',
    title: 'The Orion Nursery',
    explanation:
      'A cavern of gas four light-years wide, lit from within by the Trapezium. Infrared still finds proplyds — infant solar systems — along the glowing walls.',
    credit: 'NASA / ESA / Hubble',
    url: img('photo-1502134249126-9f3755a50d78'),
    mediaType: 'image',
    category: 'nebula',
  },
  {
    id: '2026-08-28',
    date: '2026-08-28',
    title: 'Full Moon, Close Harvest',
    explanation:
      'Impact basins and mare basalts resolve into a silver relief. The highlands are older, brighter, and still keep the record of the early solar system.',
    credit: 'NASA / GSFC',
    url: img('photo-1522030299830-16b8d3d049ab'),
    mediaType: 'image',
    category: 'moon',
  },
  {
    id: '2026-08-20',
    date: '2026-08-20',
    title: 'Jupiter in True Color',
    explanation:
      'The Great Red Spot is a storm older than most nations. Bands of ammonia ice and deeper reds shear past each other at hundreds of kilometers an hour.',
    credit: 'NASA / Juno',
    url: img('photo-1630694093867-4b947d25d1c6'),
    mediaType: 'image',
    category: 'planet',
  },
  {
    id: '2026-08-12',
    date: '2026-08-12',
    title: 'Milky Way Over the Quiet Earth',
    explanation:
      'Our galaxy’s dusty spine rises behind a dark ridgeline. Most of those points are not stars you could name — they are unresolved light from farther in the disk.',
    credit: 'NASA / ESA',
    url: img('photo-1419242902214-272b3f66ee7a'),
    mediaType: 'image',
    category: 'galaxy',
  },
  {
    id: '2026-07-22',
    date: '2026-07-22',
    title: 'Mars, Rust and Ice',
    explanation:
      'Iron-rich dust stains the plains. Polar caps of water and carbon dioxide ice shrink and grow with a year almost twice as long as ours.',
    credit: 'NASA / ESA / OSIRIS',
    url: img('photo-1614728894747-a83421e2b9c9'),
    mediaType: 'image',
    category: 'planet',
  },
  {
    id: '2026-07-04',
    date: '2026-07-04',
    title: 'Deep Field, Early Light',
    explanation:
      'A patch of sky smaller than a grain of sand held at arm’s length. Almost every smudge is a galaxy, some shining from when the universe was still young.',
    credit: 'NASA / ESA / CSA / STScI',
    url: img('photo-1462331940005-aee00c9d8771'),
    mediaType: 'image',
    category: 'galaxy',
  },
  {
    id: '2026-06-16',
    date: '2026-06-16',
    title: 'Helix, a Dying Sun',
    explanation:
      'A planetary nebula is not a planet — it is the last breath of a star like ours. The glowing eye is ionized gas pushed into the dark by a white dwarf at center.',
    credit: 'NASA / ESA / Hubble',
    url: img('photo-1465101162946-4377e57745c3'),
    mediaType: 'image',
    category: 'nebula',
  },
  {
    id: '2026-05-18',
    date: '2026-05-18',
    title: 'Station Over the Pacific',
    explanation:
      'The International Space Station crosses a sunlit limb of Earth. Solar arrays catch the same light that makes the ocean look like hammered steel.',
    credit: 'NASA',
    url: img('photo-1446776653964-20c1d3a81b06'),
    mediaType: 'image',
    category: 'earth',
  },
  {
    id: '2026-04-08',
    date: '2026-04-08',
    title: 'Flight Across a Gas Giant',
    explanation:
      'A simulated pass above Jupiter’s cloud tops, assembled from spacecraft frames. Watch the belts shear and the spot turn like a slow red engine.',
    credit: 'NASA / JPL',
    url: img('photo-1614730321146-b6fa6a46bcb4'),
    thumbnail: img('photo-1614730321146-b6fa6a46bcb4'),
    mediaType: 'video',
    category: 'planet',
  },
];

export const TODAY = CATALOG[0];

export function getById(id: string): SpaceItem | undefined {
  return CATALOG.find((item) => item.id === id);
}

export function neighbors(id: string): { prev?: SpaceItem; next?: SpaceItem } {
  const index = CATALOG.findIndex((item) => item.id === id);
  if (index < 0) return {};
  return { prev: CATALOG[index + 1], next: CATALOG[index - 1] };
}

export function filterCatalog(query: string, media: MediaFilter, category: CategoryFilter, date?: string): SpaceItem[] {
  const needle = query.trim().toLowerCase();
  return CATALOG.filter((item) => {
    if (date && item.date !== date) return false;
    if (media !== 'all' && item.mediaType !== media) return false;
    if (category !== 'all' && item.category !== category) return false;
    if (!needle) return true;
    return `${item.title} ${item.explanation} ${item.credit}`.toLowerCase().includes(needle);
  });
}

export const CATALOG_DATES = new Set(CATALOG.map((item) => item.date));
