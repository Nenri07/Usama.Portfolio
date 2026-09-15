// Public, source-backed content for Puro Cleaning Services W.L.L.
// The company profile PDF is the factual source for services, clients, standards,
// and the curated work imagery mapped below. No financial or private data is exposed.

export const brand = {
  name: 'Puro Cleaning Services W.L.L.',
  description:
    'Cleaning, housekeeping, hospitality and façade services delivered with a focus on quality, hygiene and safety in Qatar.',
  logo: '/PURO-logo.png',
} as const;

export interface WorkImage {
  src: string;
  alt: string;
}

export interface WorkFact {
  label: string;
  value: string;
}

/** A neutral service/work record used by the hero, work list, and detail modal. */
export interface Project {
  title: string;
  category: string;
  client?: string;
  location: string;
  summary: string;
  services: string[];
  image: string;
  images: WorkImage[];
  facts: WorkFact[];
}

/** A source-backed operating principle shown in the former numeric-results area. */
export interface StatItem {
  kicker: string;
  label: string;
  summary: string;
  details: string[];
}

/** A role-based card retained for legacy team-grid compatibility. */
export interface TeamMember {
  role: string;
  name?: string;
  image: string;
}

export const contact = {
  email: 'info@puroqatar.com',
  phone: '70981603',
  whatsapp: '97470981603',
} as const;

/** Centralized curated photographs extracted directly from the Puro profile. */
export const portfolioAssets = {
  mallLobby: [
    '/puro/work/mall-lobby-cleaning-01.webp',
    '/puro/work/mall-lobby-cleaning-02.webp',
  ],
  externalWindows: ['/puro/work/facade-cleaning-01.webp'],
  facade: ['/puro/work/facade-cleaning-02.webp'],
  pestControl: [
    '/puro/work/pest-control-01.webp',
    '/puro/work/pest-control-02.webp',
    '/puro/work/pest-control-03.webp',
    '/puro/work/pest-control-04.webp',
    '/puro/work/pest-control-05.webp',
  ],
} as const;

/** Public client names reproduced from the profile's client and contract lists. */
export const clients = [
  'Primary Health Care Corporation (PHCC)',
  'Ministry of Defense — Qatar Armed Forces',
  'Mesaimeer City Real Estate Company W.L.L.',
  'Doha Marketing Services Company (Honda)',
  'Al Fardan Properties',
  'Ali Bin Ali Group',
  'Gulf Times',
  'Nasser Bin Khalid Holdings (NBK)',
  'Qatar Automobiles Company (Mitsubishi)',
  'SNC-Lavalin Profac Gulf Management',
  'The Blue Group (Sports Corner)',
  'Qatar Distribution Company (QDC)',
] as const;

export const projects: Project[] = [
  {
    title: 'DFC Mall Lobby Cleaning',
    category: 'Cleaning & Housekeeping',
    client: 'DFC Mall',
    location: 'Qatar',
    summary:
      'A dedicated mall-lobby cleaning assignment documented in the Puro company profile, focused on public circulation and floor presentation.',
    services: ['Lobby cleaning', 'Public-area cleaning', 'Floor care'],
    image: portfolioAssets.mallLobby[0],
    images: [
      { src: portfolioAssets.mallLobby[0], alt: 'Puro team member cleaning a DFC mall lobby' },
      { src: portfolioAssets.mallLobby[1], alt: 'Puro team member carrying out floor care in a DFC mall lobby' },
    ],
    facts: [
      { label: 'Setting', value: 'Mall lobby' },
      { label: 'Delivery', value: 'Cleaning service' },
    ],
  },
  {
    title: 'External Window Cleaning',
    category: 'Specialist Cleaning',
    location: 'Qatar',
    summary:
      'Puro documents external window cleaning among its specialist services, supported by dedicated equipment for exterior glass care.',
    services: ['External window cleaning', 'Exterior glass care', 'Specialist equipment'],
    image: portfolioAssets.externalWindows[0],
    images: [
      { src: portfolioAssets.externalWindows[0], alt: 'Puro team cleaning exterior glazing with specialist equipment' },
    ],
    facts: [
      { label: 'Focus', value: 'Exterior glass' },
      { label: 'Approach', value: 'Dedicated equipment' },
    ],
  },
  {
    title: 'Façade Cleaning',
    category: 'Building Exterior Care',
    location: 'Qatar',
    summary:
      'Façade cleaning is listed as a core Puro service for commercial properties, delivered alongside site safety controls.',
    services: ['Façade cleaning', 'Building exterior care', 'Site safety controls'],
    image: portfolioAssets.facade[0],
    images: [
      { src: portfolioAssets.facade[0], alt: 'Puro team carrying out façade cleaning on a commercial building' },
    ],
    facts: [
      { label: 'Scope', value: 'Building façades' },
      { label: 'Standard', value: 'HSE-led delivery' },
    ],
  },
  {
    title: 'Pest Control Services',
    category: 'Cleaning Support',
    location: 'Qatar',
    summary:
      'The Puro profile includes insect and rodent control activity, with pest-control delivery also identified in its documented contract scope.',
    services: ['Pest control', 'Insect control', 'Rodent control'],
    image: portfolioAssets.pestControl[0],
    images: portfolioAssets.pestControl.map((src, index) => ({
      src,
      alt: `Puro pest-control service activity ${index + 1}`,
    })),
    facts: [
      { label: 'Scope', value: 'Insect and rodent control' },
      { label: 'Delivery', value: 'Cleaning support service' },
    ],
  },
];

/** Source-backed service standards replace unsupported event-result metrics. */
export const results: StatItem[] = [
  {
    kicker: 'Quality',
    label: 'Quality Assurance',
    summary:
      'Puro identifies quality assurance as a crucial part of achieving its service and business objectives.',
    details: [
      'Consistent application across cleaning and hygiene operations',
      'Service delivery aligned with client requirements',
      'Training and staff involvement support the operating standard',
    ],
  },
  {
    kicker: 'Environment',
    label: 'Low-Impact Cleaning',
    summary:
      'The profile commits to environmentally responsible liquids, systems and practices that reduce impact while maintaining sanitary spaces.',
    details: [
      'Environmentally friendly cleaning liquids and systems',
      'Microfiber methods that reduce unnecessary chemical use',
      'Energy, water and resource conservation in service delivery',
    ],
  },
  {
    kicker: 'Safety',
    label: 'HSE-Led Delivery',
    summary:
      'Puro describes safety training, inspections and protective controls as part of its project delivery approach.',
    details: [
      'Task-appropriate safety training',
      'Periodic tools and equipment inspection',
      'PPE, warning controls and site supervision',
    ],
  },
  {
    kicker: 'Service',
    label: 'Tailored Operations',
    summary:
      'Cleaning and hospitality solutions are planned around each client’s requirements and operating environment.',
    details: [
      'Cleaning and housekeeping services',
      'Hospitality and support services',
      'Indoor, façade and specialist cleaning scopes',
    ],
  },
];

export const team: TeamMember[] = [
  { role: 'Service Coordination', image: '/team/organizers/01.jpeg' },
  { role: 'Hospitality Support', image: '/team/hostesses/01.jpeg' },
  { role: 'Field Operations', image: '/team/play-area/01.jpeg' },
  { role: 'Service Support', image: '/team/waiters/01.jpeg' },
  { role: 'Cleaning Operations', image: '/team/cleaning/01.jpeg' },
];

export interface TeamDivision {
  slug: string;
  name: string;
  blurb: string;
  capabilities: string[];
  management: string;
  images: string[];
}

function teamImagePaths(slug: string, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => `/team/${slug}/${String(index + 1).padStart(2, '0')}.jpeg`,
  );
}

/**
 * Existing lower-page photography is retained as an editorial operations
 * gallery. Labels describe source-backed service functions without assigning
 * names, departments, or project claims to individual photographs.
 */
export const divisions: TeamDivision[] = [
  {
    slug: 'organizers',
    name: 'Service Coordination',
    blurb: 'An editorial view of the people behind planning, supervision and on-site coordination.',
    capabilities: ['Project coordination', 'Site supervision', 'Work planning'],
    management: 'Supports practical scheduling, team direction and consistent service delivery.',
    images: teamImagePaths('organizers', 13),
  },
  {
    slug: 'hostesses',
    name: 'Hospitality Support',
    blurb: 'People-focused support for hospitality and client-facing service environments.',
    capabilities: ['Hospitality services', 'Front-of-house support', 'Client service'],
    management: 'Supports organised, attentive delivery across hospitality service touchpoints.',
    images: teamImagePaths('hostesses', 20),
  },
  {
    slug: 'play-area',
    name: 'Field Operations',
    blurb: 'A broader field gallery representing coordinated operational support on site.',
    capabilities: ['Operational support', 'Site readiness', 'Service continuity'],
    management: 'Helps teams prepare service areas and maintain dependable on-site operations.',
    images: teamImagePaths('play-area', 14),
  },
  {
    slug: 'waiters',
    name: 'Service Support',
    blurb: 'Hospitality and support personnel contributing to organised service delivery.',
    capabilities: ['Hospitality staffing', 'Service support', 'Client-facing delivery'],
    management: 'Supports day-to-day hospitality requirements with coordinated on-site service.',
    images: teamImagePaths('waiters', 4),
  },
  {
    slug: 'cleaning',
    name: 'Cleaning Operations',
    blurb: 'The operational focus at the centre of Puro’s cleaning and housekeeping services.',
    capabilities: ['Cleaning & housekeeping', 'Public-area care', 'Service checks'],
    management: 'Maintains cleaning routines, presentation standards and practical site readiness.',
    images: teamImagePaths('cleaning', 3),
  },
];

export const teamGallery: string[] = teamImagePaths('gallery', 36);

/** Decorative ending-plane images, kept centralized with all other work assets. */
export const closingImages = [
  portfolioAssets.mallLobby[0],
  portfolioAssets.facade[0],
  portfolioAssets.pestControl[0],
  portfolioAssets.mallLobby[1],
  portfolioAssets.externalWindows[0],
] as const;
