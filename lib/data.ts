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

/* ─────────────────────────────────────────────────────────────────────────
   Services — the verified Puro service lines from the company profile.

   Names, summaries and key points are drawn only from source-backed content
   already documented in this file (see `projects`, `results`, `divisions`).
   Imagery reuses the curated `public/puro/work/` photographs; where a service
   line has no dedicated verified photograph yet, `image` is left null so the
   Services card renders a clearly-marked, non-fabricated placeholder the user
   can fill later (no invented visuals, metrics, certifications or clients).
   ───────────────────────────────────────────────────────────────────────── */
export interface ServiceItem {
  /** Stable identifier used for keys and deep-links. */
  slug: string;
  /** Document-supported service name. */
  name: string;
  /** Short context line for the card overlay. */
  context: string;
  /** One-sentence, source-backed summary. */
  summary: string;
  /** Curated verified photograph, or null for a marked placeholder slot. */
  image: string | null;
  /** Descriptive alt text for the mapped image (empty when placeholder). */
  alt: string;
  /** Source-backed key points shown on the card. */
  points: string[];
}

export const services: ServiceItem[] = [
  {
    slug: 'cleaning-housekeeping',
    name: 'Cleaning & Housekeeping',
    context: 'Public areas · Floor care',
    summary:
      'Cleaning and housekeeping delivered for public and commercial environments, documented in the Puro profile.',
    image: portfolioAssets.mallLobby[0],
    alt: 'Puro team member cleaning a mall lobby public area',
    points: ['Public-area cleaning', 'Housekeeping routines', 'Floor care and presentation'],
  },
  {
    slug: 'indoor-cleaning',
    name: 'Indoor Cleaning',
    context: 'Interior spaces · Presentation',
    summary:
      'Indoor cleaning scopes keep interior spaces sanitary and presentable across day-to-day operations.',
    image: portfolioAssets.mallLobby[1],
    alt: 'Puro team member carrying out interior floor care',
    points: ['Interior surface cleaning', 'Sanitary space upkeep', 'Presentation checks'],
  },
  {
    slug: 'external-window-cleaning',
    name: 'External Window Cleaning',
    context: 'Exterior glass · Specialist equipment',
    summary:
      'External window cleaning is documented among Puro’s specialist services, supported by dedicated equipment for exterior glass.',
    image: portfolioAssets.externalWindows[0],
    alt: 'Puro team cleaning exterior glazing with specialist equipment',
    points: ['Exterior glass care', 'Dedicated equipment', 'Height-aware delivery'],
  },
  {
    slug: 'facade-cleaning',
    name: 'Façade Cleaning',
    context: 'Building exterior · HSE-led',
    summary:
      'Façade cleaning for commercial properties, delivered alongside the profile’s documented site-safety controls.',
    image: portfolioAssets.facade[0],
    alt: 'Puro team carrying out façade cleaning on a commercial building',
    points: ['Building exterior care', 'Site-safety controls', 'Commercial properties'],
  },
  {
    slug: 'pest-control',
    name: 'Pest Control',
    context: 'Insect & rodent control',
    summary:
      'Insect and rodent control is included in the Puro profile and identified within its documented contract scope.',
    image: portfolioAssets.pestControl[0],
    alt: 'Puro pest-control service activity',
    points: ['Insect control', 'Rodent control', 'Cleaning-support delivery'],
  },
  {
    slug: 'hospitality-support',
    name: 'Hospitality & Support Services',
    context: 'Client-facing · Support',
    summary:
      'Hospitality and support services complement Puro’s cleaning operations in client-facing environments.',
    // No dedicated verified public photograph for this service line yet.
    image: null,
    alt: '',
    points: ['Hospitality services', 'Front-of-house support', 'Client-facing delivery'],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Activities — operational scope-of-work items, distinct from the headline
   Services. These describe HOW work is delivered (methods, controls, checks)
   rather than the service line itself, and trace to the profile's documented
   quality, environmental and safety practices (see `results`). No fabricated
   claims; imagery reuses curated work photographs.
   ───────────────────────────────────────────────────────────────────────── */
export interface ActivityItem {
  slug: string;
  /** Short operational label. */
  title: string;
  /** Source-backed description of the operational activity. */
  description: string;
  /** Curated verified photograph, or null for a marked placeholder slot. */
  image: string | null;
  alt: string;
  /** Concrete, source-backed sub-activities. */
  tasks: string[];
}

export const activities: ActivityItem[] = [
  {
    slug: 'quality-assurance',
    title: 'Quality Assurance',
    description:
      'Quality assurance is identified in the profile as a crucial part of meeting service and business objectives, applied consistently across operations.',
    image: portfolioAssets.mallLobby[1],
    alt: 'Puro team member maintaining presentation standards indoors',
    tasks: [
      'Consistent standards across cleaning and hygiene work',
      'Delivery aligned to client requirements',
      'Staff training and involvement',
    ],
  },
  {
    slug: 'low-impact-cleaning',
    title: 'Low-Impact Cleaning',
    description:
      'The profile commits to environmentally responsible liquids, systems and methods that reduce impact while keeping spaces sanitary.',
    image: portfolioAssets.facade[0],
    alt: 'Puro team carrying out exterior cleaning work',
    tasks: [
      'Environmentally friendly cleaning liquids and systems',
      'Microfiber methods that reduce chemical use',
      'Energy, water and resource conservation',
    ],
  },
  {
    slug: 'hse-controls',
    title: 'Safety Controls & Inspections',
    description:
      'Safety training, periodic equipment inspection and protective controls form part of Puro’s documented project-delivery approach.',
    image: portfolioAssets.pestControl[1],
    alt: 'Puro pest-control activity carried out with protective controls',
    tasks: [
      'Task-appropriate safety training',
      'Periodic tools and equipment inspection',
      'PPE, warning controls and site supervision',
    ],
  },
  {
    slug: 'pest-management',
    title: 'Insect & Rodent Management',
    description:
      'Insect and rodent control activity is documented in the profile as part of Puro’s cleaning-support scope.',
    image: portfolioAssets.pestControl[2],
    alt: 'Puro pest-control service activity on site',
    tasks: ['Insect control', 'Rodent control', 'Scheduled cleaning-support visits'],
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Film — the dedicated cinematic /film route's video configuration.

   ⚠️ INTERIM: `youtubeId` / `youtubeUrl` below point at an interim stakeholder
   video, NOT the final film. The user replaces `youtubeId` with the real
   YouTube video id (and, if desired, `youtubeUrl`) once the film is published.
   Everything downstream derives the privacy-friendly youtube-nocookie embed
   from `youtubeId` alone (share-URL list/index/pp params are never embedded).
   ───────────────────────────────────────────────────────────────────────── */
export interface FilmConfig {
  title: string;
  tagline: string;
  /** PLACEHOLDER YouTube video id — replace with the real id. */
  youtubeId: string;
  /** PLACEHOLDER canonical watch URL — optional, replace with the real link. */
  youtubeUrl: string;
  /** Whether the current value is still the placeholder (drives on-page note). */
  isPlaceholder: boolean;
}

export const film: FilmConfig = {
  title: 'The Puro Film',
  tagline: 'A cinematic look at cleaning, hospitality and façade services in Qatar.',
  // ⚠️ INTERIM stakeholder video — replace with the real film's YouTube id
  // once published. Only the clean 11-char id is used downstream (any
  // list/index/pp params from the share URL are intentionally stripped).
  youtubeId: 'CWZ0lTUs5Mk',
  youtubeUrl: 'https://www.youtube.com/watch?v=CWZ0lTUs5Mk',
  isPlaceholder: true,
} as const;

/** Decorative ending-plane images, kept centralized with all other work assets. */
export const closingImages = [
  portfolioAssets.mallLobby[0],
  portfolioAssets.facade[0],
  portfolioAssets.pestControl[0],
  portfolioAssets.mallLobby[1],
  portfolioAssets.externalWindows[0],
] as const;
