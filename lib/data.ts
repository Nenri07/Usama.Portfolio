// Static content module for the Puro Cleaning & Disinfecting site.
// All page content is hardcoded here (Req 1.4, 3.1, 3.3, 4.1, 4.3, 5.1, 5.5, 6.1, 6.3).
// Sequential image paths are derived from index (see lib/format.ts resolveImagePath /
// imagePathForIndex) unless a Project defines an explicit `image` override (Req 4.2).
//
// NO revenue, cost, or net-profit figures appear in any data model — only
// Public_Metric counts (visitors, winners, staff, days, activations) (Req 4.5, 5.5, 8.6).

// Public brand identity used by metadata and visible company lockups.
export const brand = {
  name: 'Puro Cleaning & Disinfecting',
  description: 'Professional operations and on-site delivery in Qatar.',
  logo: '/PURO-logo.png',
} as const;

/**
 * A single project card in the Work grid (Req 4.3, 4.4).
 *
 * `services` is the required highlight list. `visitors`/`winners`/`staff`/`days`
 * are OPTIONAL Public_Metric counts. `image` is an OPTIONAL explicit path that
 * overrides the sequential mapping (Req 4.2). `stat` is retained as an optional
 * legacy field so existing components keep compiling until the section tasks
 * (14.x) migrate them to `services`/counts.
 */
export interface Project {
  title: string;
  venue: string;
  year: string;
  services: string[];
  visitors?: string;
  winners?: string;
  staff?: string;
  days?: string;
  image?: string;
  /** @deprecated legacy summary line; superseded by services + counts (Req 4.3, 4.4). */
  stat?: string;
  // NO revenue / cost / profit fields (Req 4.5).
}

/** A single statistic block in the Results section (Req 5.1). */
export interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

/** A single role-based team card (Req 6.1–6.4). `name` is optional (Req 6.2, 6.3). */
export interface TeamMember {
  role: string;
  name?: string;
  image: string;
}

/**
 * Contact details for the Contact section.
 * `phone` is the public Qatar display number; `whatsapp` carries the required
 * international country code used only to construct the wa.me destination.
 */
export const contact = {
  email: 'info@puroqatar.com',
  phone: '70981603',
  whatsapp: '97470981603',
};

/** Trusted-by clients/venues/partners, rendered as text in EXACT order (Req 3.1, 3.3). */
export const clients = [
  'Qatari Diar',
  'Lusail',
  'Qatar Foundation',
  'LULU',
  'Lagoona Mall',
  'Doha Festival City',
  'Qatar Racing Club',
  'FIFA World Cup 2022',
] as const;

/**
 * Backwards-compatible alias for the old `wordmarks` export so the existing
 * Marquee compiles until task 14.2 migrates it to `clients`.
 * @deprecated use `clients`.
 */
export const wordmarks = clients;

/**
 * Results statistics: Public_Metric values only, no financial figures (Req 5.1, 5.5).
 */
export const results: StatItem[] = [
  { target: 3.75, suffix: 'M', label: 'Peak visitors' },
  { target: 13, suffix: '+', label: 'Activations' },
  { target: 3, suffix: '', label: 'FIFA World Cup 2022 activations' },
  { target: 7000, suffix: '+', label: 'Prize winners' },
  { target: 12000, suffix: '', label: 'Balloons across 8 Qatar landmarks' },
];

/**
 * Backwards-compatible alias for the old `numbers` export so the existing
 * Numbers/StatBlock components compile until task 14.4 migrates them to `results`.
 * @deprecated use `results`.
 */
export const numbers = results;

/**
 * Work-grid projects: EXACTLY 13 entries, in definition order, mapped sequentially
 * to img-000.png through img-012.png unless an explicit `image` is set (Req 4.1, 4.2, 4.3, 1.4).
 */
export const projects: Project[] = [
  {
    title: 'Formula 1 & MotoGP Fan Zone',
    venue: 'Lusail Circuit & Boulevard',
    year: '2023–24',
    services: [
      'Carnival Games',
      'Slot Car Racing',
      'Henna Artists',
      'Face Painters',
      'Hospitality',
      'Branding',
    ],
    days: '10',
  },
  {
    title: 'Hello Asia',
    venue: 'Lusail Boulevard',
    year: '2024',
    services: ['25 VIP Hostesses', '16 Carnival Games', 'Train', 'Soft Play Area'],
    visitors: '3.75M',
    staff: '90',
    days: '30',
  },
  {
    title: 'Flower Festival',
    venue: 'Lusail Boulevard',
    year: '2023',
    services: ['12 Carnival Games', '15 Arcade Games', '4 Giant Inflatables'],
    visitors: '40,000',
    staff: '76',
    days: '3',
  },
  {
    title: 'Eid Festival',
    venue: 'Lusail Boulevard',
    year: '2023',
    services: ['16 Carnival Games', '20 Arcade Games', '2 Giant Inflatables', 'Full F&B'],
    visitors: '100,000',
    days: '8',
  },
  {
    title: 'Darb al Lusail Parade',
    venue: 'Lusail Boulevard',
    year: '2023',
    services: ['80 Entertainment Artists', '30 Management Staff'],
    visitors: '40,000',
    staff: '110',
    days: '3',
  },
  {
    title: 'Eid ul Adha Festival',
    venue: 'Abu Sidra Mall (LULU)',
    year: '2023',
    services: [
      '9 Shows',
      '15 Roaming Parade Characters',
      'Arts & Craft',
      'Face Painting',
      'Henna',
    ],
    visitors: '30,000',
    days: '3',
  },
  {
    title: "ALJAM'A Celebration Week",
    venue: 'Education City, Qatar Foundation',
    year: '2022–23',
    services: ['8 Universities', 'Multi-day celebration'],
    visitors: '2,000',
    winners: '230',
    days: '5',
  },
  {
    title: 'Qatar Custom Show',
    venue: 'Qatar Racing Club',
    year: '2022–23',
    services: ['6 Carnival Games', 'Building Block City', 'Bouncy Castle Inflatables'],
    visitors: '3,000',
    winners: '420',
    days: '3',
  },
  {
    title: 'Building Block City',
    venue: 'Lagoona Mall',
    year: '2022',
    services: ['Building Block City'],
    days: '90',
  },
  {
    title: 'FIFA World Cup Fan Zone',
    venue: 'Lagoona Mall',
    year: '2022',
    services: ['4 Carnival Games', 'Soft Building Block City'],
    visitors: '5,000',
    winners: '450',
    days: '30',
  },
  {
    title: 'FIFA World Cup Fan Zone',
    venue: 'Doha Festival City Arena',
    year: '2022',
    services: ['4 Carnival Games'],
    visitors: '3,000',
    winners: '250',
    days: '30',
  },
  {
    title: 'Eid in Qatar',
    venue: 'Corniche',
    year: '2022',
    services: ['7 Carnival Games', 'Soft Building Block City', 'Inflatable Jumping Castles'],
    visitors: '3,000',
    winners: '200',
    days: '3',
  },
  {
    title: 'Qatar International Food Festival',
    venue: 'Al Bidda Park & Corniche',
    year: '2021',
    services: ['9 Carnival Games'],
    visitors: '40,000',
    winners: '5,500',
    days: '19',
  },
];

/**
 * Team roster: role-based cards with NO invented names (Req 6.1–6.3).
 * Images are sourced from public/work (Req 6.4); `name` is left undefined so real
 * names can be filled in later without a code change.
 */
export const team: TeamMember[] = [
  { role: 'Creative Director', image: '/work/img-020.png' },
  { role: 'Activation Lead', image: '/work/img-021.png' },
  { role: 'Operations Manager', image: '/work/img-022.png' },
  { role: 'Production Lead', image: '/work/img-023.png' },
  { role: 'Talent & Staffing Manager', image: '/work/img-024.png' },
  { role: 'Hospitality Lead', image: '/work/img-025.png' },
];

/**
 * A single division in the division-wise Team showcase.
 *
 * Cards are photo + division only — NO invented individual names (Req 6.2, 6.3).
 * `images` holds the real staff photo paths under public/team/<slug>/.
 */
export interface TeamDivision {
  /** URL-safe slug that matches the public/team/<slug>/ folder. */
  slug: string;
  /** Display label for the division heading. */
  name: string;
  /** One short, factual line — no fluff, no financials. */
  blurb: string;
  /** Responsibilities directly supported by the division blurb and project services. */
  capabilities: string[];
  /** Conservative description of how this crew contributes on site. */
  management: string;
  /** Real staff photo paths: /team/<slug>/NN.jpeg. */
  images: string[];
}

/**
 * Build the sequential, zero-padded 2-digit photo paths for a division folder.
 * @example teamImagePaths('cleaning', 3)
 *   // ['/team/cleaning/01.jpeg', '/team/cleaning/02.jpeg', '/team/cleaning/03.jpeg']
 */
function teamImagePaths(slug: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `/team/${slug}/${String(i + 1).padStart(2, '0')}.jpeg`,
  );
}

/**
 * Division-wise team showcase, in display order. Each entry maps to real staff
 * photos under public/team/<slug>/ (Req 6.1, 6.4). No financial figures and no
 * invented names anywhere (Req 6.2, 6.3, 8.6).
 */
export const divisions: TeamDivision[] = [
  {
    slug: 'organizers',
    name: 'Organizers & Providers',
    blurb: 'The core crew that plans, sets up and runs each activation on the ground.',
    capabilities: ['On-site planning', 'Activation setup', 'Live event operations'],
    management: 'Coordinates practical planning, setup and live delivery across each activation.',
    images: teamImagePaths('organizers', 13),
  },
  {
    slug: 'hostesses',
    name: 'Hostesses',
    blurb: 'VIP hostesses welcoming and guiding guests across our activations.',
    capabilities: ['Guest welcome', 'Guest guidance', 'VIP hosting'],
    management: 'Supports guest arrival, wayfinding and hosted touchpoints throughout the event.',
    images: teamImagePaths('hostesses', 20),
  },
  {
    slug: 'play-area',
    name: 'Play Area & Activities',
    blurb: 'The team operating carnival games, soft play and family activities.',
    capabilities: ['Carnival games', 'Soft play', 'Family activities'],
    management: 'Operates staffed activity areas, games and family play zones on site.',
    images: teamImagePaths('play-area', 14),
  },
  {
    slug: 'waiters',
    name: 'Waiters',
    blurb: 'Hospitality and F&B service staff.',
    capabilities: ['Hospitality service', 'Food and beverage service', 'Guest support'],
    management: 'Supports hospitality and food-and-beverage service during live events.',
    images: teamImagePaths('waiters', 4),
  },
  {
    slug: 'cleaning',
    name: 'Cleaning Crew',
    blurb: 'Keeping every venue spotless before, during and after each event.',
    capabilities: ['Venue readiness', 'Live-event upkeep', 'Post-event reset'],
    management: 'Maintains venue presentation before opening, during operation and after close.',
    images: teamImagePaths('cleaning', 3),
  },
];

/**
 * General "Our Team" gallery: mixed team & event images used for the showcase
 * strip. Real photos under public/team/gallery/ (36 images).
 */
export const teamGallery: string[] = teamImagePaths('gallery', 36);
