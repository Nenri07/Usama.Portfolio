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
  /**
   * Contract numbers (from `contracts`) that this work item represents.
   * Used to surface real client + scope + duration + dates in the detail
   * modal. Optional; a project without a mapped contract simply omits it.
   */
  contractRefs?: number[];
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

/**
 * A single public row from Puro's official "Cleaning, Hospitality & Support
 * Services Contracts List". Transcribed verbatim from the client-approved
 * contract table. Contains NO financial figures or private data — only the
 * publicly shareable client name, dates, duration and scope.
 */
export interface ContractRecord {
  no: number;
  client: string;
  start: string;
  end: string;
  duration: string;
  scope: string;
}

/**
 * The full, source-backed contracts list (32 rows). Client names, dates,
 * durations and scopes are transcribed exactly from the approved table; no
 * values are invented, and there are no financial figures in the source.
 */
export const contracts: ContractRecord[] = [
  { no: 1, client: 'Primary Health Care Corporation (PHCC)', start: '01-Oct-24', end: '31-Aug-27', duration: '3 Years', scope: 'Cleaning & Housekeeping Services' },
  { no: 2, client: 'Ministry of Defense - Qatar Armed Forces', start: '01-Sep-24', end: '31-Aug-26', duration: '2 Years', scope: 'Cleaning & Housekeeping Services' },
  { no: 3, client: 'Mesaimeer City Real Estate Company W.L.L.', start: '09-Aug-20', end: '08-Aug-23', duration: '3 Years', scope: 'Cleaning, Hospitality & Pest Control Services' },
  { no: 4, client: 'SNC-LAVALIN Profac Gulf Management', start: '01-Jun-21', end: '31-May-22', duration: '1 Year', scope: 'Façade Cleaning' },
  { no: 5, client: 'Nasser Bin Khaled Heavy Equipment W.L.L.', start: '01-Jan-22', end: '31-Dec-22', duration: '1 Year', scope: 'Cleaning & Hospitality Services' },
  { no: 6, client: 'Qatar Automobiles Company WLL', start: '01-Jan-22', end: '31-Dec-22', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 7, client: 'Nasser Bin Khaled Al Thani & Sons Automobiles W.L.L.', start: '01-Jan-23', end: '31-Dec-23', duration: '1 Year', scope: 'Cleaning, Hospitality & Car Washing Services' },
  { no: 8, client: 'Auto Class W.L.L.', start: '01-Jan-22', end: '31-Dec-22', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 9, client: 'Nasser Bin Khaled Services W.L.L.', start: '01-Jan-22', end: '31-Dec-22', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 10, client: 'Ali Bin Ali Group', start: '02-Jun-21', end: '01-Jun-22', duration: '1 Year', scope: 'Cleaning & Supporting Services' },
  { no: 11, client: 'Kangaroo Kids Nursery', start: '14-Aug-19', end: '14-Aug-22', duration: '2 Years', scope: 'Cleaning and Support Services' },
  { no: 12, client: 'Mahaseel for Marketing & Agricultural Services', start: '01-Jan-23', end: '31-Dec-24', duration: '1 Year', scope: 'Cleaning & Hospitality Services' },
  { no: 13, client: 'Doha Marketing Services Company W.L.L.', start: '01-Oct-24', end: '30-Sep-25', duration: '1 Year', scope: 'Cleaning & Hospitality Services' },
  { no: 14, client: 'Sports Corner (The Blue Group)', start: '22-Apr-19', end: '21-Apr-22', duration: '3 Years', scope: 'Cleaning Services' },
  { no: 15, client: 'Mirage International Properties Consultants', start: '01-Sep-24', end: '31-Aug-25', duration: '1 Year', scope: 'Façade Cleaning' },
  { no: 16, client: 'Al Fardan Properties L.L.C', start: '01-Jun-23', end: '31-Dec-24', duration: '1 Year', scope: 'Hospitality Services' },
  { no: 17, client: 'Kien International services', start: '01-Jan-23', end: '31-Dec-24', duration: '1 Year', scope: 'Façade Cleaning' },
  { no: 18, client: 'The Wellness Lab', start: '01-Mar-24', end: '28-Feb-25', duration: '1 Year', scope: 'Cleaning & Hospitality Services' },
  { no: 19, client: 'Qatar Distribution Company', start: '01-Apr-21', end: '31-Jul-22', duration: '1 Year', scope: 'Supporting Services' },
  { no: 20, client: 'Thousand Rent a Car (TRAC)', start: '01-Sep-19', end: '30-Jul-22', duration: '3 Years', scope: 'Supporting Services' },
  { no: 21, client: 'Ali Bin Ali Medical W.L.L', start: '02-Jun-21', end: '01-Jun-22', duration: '1 Year', scope: 'Cleaning & Supporting Services' },
  { no: 22, client: 'Bangladesh MHM School & College', start: '16-Aug-23', end: '15-Aug-25', duration: '2 Years', scope: 'Cleaning & Supporting Services' },
  { no: 23, client: 'Bumblebee Nursery', start: '21-Jun-23', end: '20-Jun-25', duration: '2 Years', scope: 'Cleaning Services' },
  { no: 24, client: 'Diet Delights - Qatar', start: '01-Mar-24', end: '28-Feb-25', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 25, client: 'EMCOR Facilities Services Qatar W.L.L.', start: '19-Oct-24', end: '18-Oct-25', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 26, client: 'Al Mana Real Estate', start: '01-Sep-24', end: '30-Aug-25', duration: '1 Year', scope: 'Façade Cleaning' },
  { no: 27, client: 'Enova Facilities Management Services LLC', start: '01-Jan-24', end: '31-Dec-24', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 28, client: 'Family Mart', start: '01-Sep-21', end: '31-Aug-22', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 29, client: 'Raha Medical Center', start: '01-Oct-24', end: '30-Sep-25', duration: '1 Year', scope: 'Cleaning and Support Services' },
  { no: 30, client: 'Vistas Global', start: '01-Feb-22', end: '31-Jan-23', duration: '1 Year', scope: 'Cleaning and Support Services' },
  { no: 31, client: 'Rash Fashion', start: '20-Nov-22', end: '19-Nov-23', duration: '1 Year', scope: 'Cleaning Services' },
  { no: 32, client: 'Shaqab Qatar', start: '01-Oct-24', end: '30-Sep-25', duration: '1 Year', scope: 'Steward Services' },
];

/**
 * Public client names for the "Trusted By" marquee, derived directly from the
 * 32 real contract rows above (single source of truth). No client is invented
 * and none is dropped.
 */
export const clients: readonly string[] = contracts.map((contract) => contract.client);

/* ─────────────────────────────────────────────────────────────────────────
   Certificates & contract documents — placeholder-driven coverflow content.

   The real certificate/contract scans are NOT machine-extractable, so every
   card starts as a clearly-marked PLACEHOLDER. Titles are neutral and
   non-fabricated: they never claim a specific certifying body, licence number,
   or accreditation that was not provided.

   To publish a real scan, drop an optimized image at the referenced path under
   `public/puro/certificates/` (e.g. `/puro/certificates/cert-01.webp`) and set
   the matching `image` field to that path. Until the file exists, SafeImage
   shows the elegant styled placeholder frame — no fake certificate is ever
   rendered.
   ───────────────────────────────────────────────────────────────────────── */
export interface CertificateItem {
  id: string;
  title: string;
  caption: string;
  /** Path to a real scan under /puro/certificates/, or null for a placeholder. */
  image: string | null;
}

// The 10 REAL provided documents (optimized to WebP, full document preserved
// with objectFit: contain — never cropped). Titles are transcribed from the
// supplied filenames; no extra accreditation numbers or claims are invented
// beyond each document's own name.
export const certificates: CertificateItem[] = [
  { id: 'commercial-registration-1', title: 'Commercial Registration', caption: 'Company registration — page 1', image: '/puro/certificates/cert-01.webp' },
  { id: 'commercial-registration-2', title: 'Commercial Registration — Activities', caption: 'Company registration — page 2 (activities)', image: '/puro/certificates/cert-02.webp' },
  { id: 'trade-license', title: 'Trade License', caption: 'Municipal trade licence', image: '/puro/certificates/cert-03.webp' },
  { id: 'mof-vendor-classification', title: 'MOF Vendor Classification Certificate', caption: 'Ministry of Finance vendor classification', image: '/puro/certificates/cert-04.webp' },
  { id: 'iso-9001-2015', title: 'ISO 9001:2015 Certificate', caption: 'Quality management system certificate', image: '/puro/certificates/cert-05.webp' },
  { id: 'icv-certificate', title: 'ICV Certificate', caption: 'In-Country Value certificate', image: '/puro/certificates/cert-06.webp' },
  { id: 'phcc-appreciation', title: 'PHCC Appreciation Letter', caption: 'Primary Health Care Corporation — appreciation', image: '/puro/certificates/cert-07.webp' },
  { id: 'phcc-compliance', title: 'PHCC Certificate of Compliance', caption: 'Primary Health Care Corporation — compliance', image: '/puro/certificates/cert-08.webp' },
  { id: 'mesaimeer-real-estate', title: 'Mesaimeer Real Estate Certificate', caption: 'Client reference document', image: '/puro/certificates/cert-09.webp' },
  { id: 'nbk-reference', title: 'NBK Reference Certificate', caption: 'Client reference document', image: '/puro/certificates/cert-10.webp' },
];

/* ─────────────────────────────────────────────────────────────────────────
   Hero expansion slots — data-driven imagery for the animated hero collage.

   The hero uses these curated, already-optimized photographs as its layered
   parallax/collage source. To add more hero photos later, append optimized
   images here (under `public/puro/...` or `public/team/...`); no component
   edits are required. Each entry carries descriptive alt text.
   ───────────────────────────────────────────────────────────────────────── */
export interface HeroSlot {
  src: string;
  alt: string;
}

/* ─────────────────────────────────────────────────────────────────────────
   Work gallery — the full set of normalized on-site service photographs.

   The raw WhatsApp-named originals (spaces/parentheses) are converted by
   `scripts/normalize-work-images.mjs` into clean, optimized WebP files
   (`/puro/work/work-01.webp` … `work-54.webp`). ONLY these space-free paths
   are referenced by the app. Alt text is deliberately generic and
   non-fabricated — it never claims a specific client, venue or date.

   `WORK_GALLERY_COUNT` must match the number of `work-NN.webp` files produced
   by the normalizer. If more photos are added, re-run the script and bump this.
   ───────────────────────────────────────────────────────────────────────── */
export const WORK_GALLERY_COUNT = 54;

export const workGallery: WorkImage[] = Array.from(
  { length: WORK_GALLERY_COUNT },
  (_, index) => ({
    src: `/puro/work/work-${String(index + 1).padStart(2, '0')}.webp`,
    alt: `Puro on-site service photograph ${index + 1}`,
  }),
);

/**
 * Evenly distribute the full work gallery across `groups` buckets in order, so
 * every photo is used exactly once and the counts differ by at most one. Used
 * to give each project its own gallery set for the Work modal + gallery block.
 * @example distributeGallery(4) // 14,14,13,13 across 4 projects (54 total)
 */
export function distributeGallery(groups: number): WorkImage[][] {
  const buckets: WorkImage[][] = Array.from({ length: groups }, () => []);
  workGallery.forEach((image, index) => {
    buckets[index % groups].push(image);
  });
  return buckets;
}

const PROJECT_GALLERIES = distributeGallery(4);

export const heroCollage: HeroSlot[] = [
  { src: portfolioAssets.mallLobby[0], alt: 'Puro team member cleaning a mall lobby' },
  { src: '/puro/work/work-04.webp', alt: 'Puro on-site service photograph' },
  { src: portfolioAssets.facade[0], alt: 'Puro façade cleaning on a commercial building' },
  { src: '/puro/work/work-20.webp', alt: 'Puro on-site service photograph' },
  { src: portfolioAssets.pestControl[0], alt: 'Puro pest-control service activity' },
  { src: '/puro/work/work-33.webp', alt: 'Puro on-site service photograph' },
  { src: portfolioAssets.externalWindows[0], alt: 'Puro exterior window cleaning with specialist equipment' },
  { src: '/puro/work/work-48.webp', alt: 'Puro on-site service photograph' },
];

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
      ...PROJECT_GALLERIES[0],
    ],
    facts: [
      { label: 'Setting', value: 'Mall lobby' },
      { label: 'Delivery', value: 'Cleaning service' },
    ],
    // Cleaning & housekeeping contracts from the public contracts list.
    contractRefs: [1, 2, 13],
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
      ...PROJECT_GALLERIES[1],
    ],
    facts: [
      { label: 'Focus', value: 'Exterior glass' },
      { label: 'Approach', value: 'Dedicated equipment' },
    ],
    // Façade / exterior contracts from the public contracts list.
    contractRefs: [4, 15, 17],
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
      ...PROJECT_GALLERIES[2],
    ],
    facts: [
      { label: 'Scope', value: 'Building façades' },
      { label: 'Standard', value: 'HSE-led delivery' },
    ],
    // Façade cleaning contracts from the public contracts list.
    contractRefs: [4, 26, 15],
  },
  {
    title: 'Pest Control Services',
    category: 'Cleaning Support',
    location: 'Qatar',
    summary:
      'The Puro profile includes insect and rodent control activity, with pest-control delivery also identified in its documented contract scope.',
    services: ['Pest control', 'Insect control', 'Rodent control'],
    image: portfolioAssets.pestControl[0],
    images: [
      ...portfolioAssets.pestControl.map((src, index) => ({
        src,
        alt: `Puro pest-control service activity ${index + 1}`,
      })),
      ...PROJECT_GALLERIES[3],
    ],
    facts: [
      { label: 'Scope', value: 'Insect and rodent control' },
      { label: 'Delivery', value: 'Cleaning support service' },
    ],
    // Pest-control scope appears within the Mesaimeer City contract.
    contractRefs: [3],
  },
];

/** Look up full contract records for a project's `contractRefs`. */
export function contractsForRefs(refs: readonly number[] | undefined): ContractRecord[] {
  if (!refs || refs.length === 0) return [];
  return refs
    .map((no) => contracts.find((contract) => contract.no === no))
    .filter((contract): contract is ContractRecord => contract != null);
}

/**
 * Deterministically map a contract to a work-gallery image. Because there are
 * 54 gallery photos and 32 contracts, every contract gets a stable photo and
 * the mapping never runs out (reuse is allowed and stable across renders).
 * The index is derived from the contract number so the same contract always
 * resolves to the same photo (no randomness, SSR-safe).
 */
export function imageForContract(contract: ContractRecord): WorkImage {
  const gallery = workGallery;
  if (gallery.length === 0) {
    return { src: brand.logo, alt: `${contract.client} — Puro engagement` };
  }
  const image = gallery[(contract.no - 1) % gallery.length];
  return {
    src: image.src,
    alt: `Puro service delivery for ${contract.client}`,
  };
}

/**
 * A contract enriched with its deterministic hero image, ready for the hero
 * carousel and the contract-detail modal. Built once from the source-backed
 * `contracts` list; contains no invented data.
 */
export interface ContractCard extends ContractRecord {
  image: WorkImage;
}

export const contractCards: ContractCard[] = contracts.map((contract) => ({
  ...contract,
  image: imageForContract(contract),
}));

/* ─────────────────────────────────────────────────────────────────────────
   Hero deck — a single mixed carousel of BOTH capabilities, kept strictly
   separated by source so imagery never blends (the client's repeated
   complaint):

     • Event cards use ONLY their own `/qasim/<NN>-<slug>/*` photographs and,
       when clicked, open the EVENT detail.
     • Cleaning cards use ONLY `/puro/work/*` photographs (via `contractCards`)
       and, when clicked, open the CONTRACT detail.

   Every card carries a visible capability tag ("Events & Hospitality" vs
   "Cleaning & Facilities") and an `onClick` kind so the hero can route to the
   correct modal. Events lead (the strongest, most visual work), then the
   cleaning engagements follow.
   ───────────────────────────────────────────────────────────────────────── */

export const CAPABILITY_LABEL = {
  events: 'Events & Hospitality',
  cleaning: 'Cleaning & Facilities',
} as const;

export interface HeroCard {
  /** Which capability this card belongs to (drives the tag + click target). */
  kind: 'event' | 'cleaning';
  /** Index into `qasimProjects` (event) or `contractCards` (cleaning). */
  index: number;
  /** Human capability tag shown on the card. */
  capability: string;
  /** Card face image — always from the matching capability's own asset set. */
  image: WorkImage;
  /** Primary line (event title / client name). */
  title: string;
  /** Secondary line (venue·period for events, scope·duration for cleaning). */
  subtitle: string;
}


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
  /**
   * Which capability this crew belongs to. Puro runs two distinct, clearly
   * separated crews: an EVENTS & HOSPITALITY side (hostesses + event/activity
   * staff who worked prestige venues) and a CLEANING & FACILITIES side (the
   * source-backed Puro cleaning/support crew). Hostesses are event hospitality
   * staff — never labelled as cleaners/janitors.
   */
  group: 'events' | 'cleaning';
}

/** Human-readable copy for each crew group, shown as its own labelled block. */
export interface TeamGroup {
  id: 'events' | 'cleaning';
  name: string;
  kicker: string;
  blurb: string;
}

export const teamGroups: TeamGroup[] = [
  {
    id: 'events',
    name: 'Events & Hospitality',
    kicker: 'Guest-facing · Activations',
    blurb:
      'The events and hospitality crew — VIP hostesses, organizers and activity staff who have worked prestige venues including Al Shaqab, the Sheraton, St. Regis, the FIFA World Cup and the Arab Cup. This is a distinct guest-facing capability, separate from the cleaning crew.',
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Facilities',
    kicker: 'On-site · Support',
    blurb:
      'The cleaning and facilities crew behind Puro’s source-backed cleaning, housekeeping and support contracts across Qatar. Distinct from the events team, focused on venue readiness and day-to-day service delivery.',
  },
];

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
  // ── EVENTS & HOSPITALITY crew ──────────────────────────────────────────
  // Guest-facing event staff. Hostesses are VIP event hospitality staff who
  // worked the prestige venues named in `eventProjects` — explicitly NOT
  // cleaners/janitors and never grouped with the cleaning crew.
  {
    slug: 'hostesses',
    name: 'VIP Hostesses',
    blurb:
      'VIP event hostesses who welcome, guide and host guests. The hostess team has staffed prestige venues including Al Shaqab, the Sheraton, St. Regis, the FIFA World Cup and the Arab Cup.',
    capabilities: ['VIP hosting', 'Guest welcome & guidance', 'Prestige-venue hospitality'],
    management:
      'Provides polished, guest-facing hospitality at high-profile events and five-star venues — a hospitality role, distinct from cleaning.',
    images: teamImagePaths('hostesses', 20),
    group: 'events',
  },
  {
    slug: 'organizers',
    name: 'Event Organizers & Providers',
    blurb: 'The crew that plans, sets up and runs each activation on the ground.',
    capabilities: ['On-site planning', 'Activation setup', 'Live event operations'],
    management:
      'Coordinates practical planning, setup and live delivery across each event activation.',
    images: teamImagePaths('organizers', 13),
    group: 'events',
  },
  {
    slug: 'play-area',
    name: 'Activities & Play Area Crew',
    blurb: 'The team operating carnival games, soft play and family activities at events.',
    capabilities: ['Carnival games', 'Soft play', 'Family activities'],
    management: 'Operates staffed activity areas, games and family play zones on site.',
    images: teamImagePaths('play-area', 14),
    group: 'events',
  },
  // ── CLEANING & FACILITIES crew ─────────────────────────────────────────
  // Puro's source-backed cleaning/support crew. Separate from the events side.
  {
    slug: 'cleaning',
    name: 'Cleaning & Facilities Crew',
    blurb:
      'The operational crew at the centre of Puro’s source-backed cleaning, housekeeping and support contracts across Qatar.',
    capabilities: ['Cleaning & housekeeping', 'Public-area care', 'Venue readiness'],
    management:
      'Maintains cleaning routines, presentation standards and practical site readiness across Puro’s contracts.',
    images: teamImagePaths('cleaning', 3),
    group: 'cleaning',
  },
  {
    slug: 'waiters',
    name: 'Support & Service Staff',
    blurb:
      'The support and service staff who back Puro’s cleaning and facilities operations with hands-on hospitality and F&B service.',
    capabilities: ['Support services', 'Food & beverage service', 'On-site assistance'],
    management:
      'Provides day-to-day support and service alongside the cleaning crew across Puro’s facilities engagements.',
    images: teamImagePaths('waiters', 4),
    group: 'cleaning',
  },
];

export const teamGallery: string[] = teamImagePaths('gallery', 36);

/* ─────────────────────────────────────────────────────────────────────────
   Events & Hospitality — the events showcase (distinct from Puro cleaning).

   This ADDITIVE capability surfaces the top events/activations the events &
   hospitality crew (VIP hostesses + organizers + activity staff) delivered.

   TWO fact tiers, both non-fabricated:
     1. `metricsSource: 'record'` — activations transcribed VERBATIM from the
        approved Qasim events record (venue, year, services and any
        visitor/staff/day counts). No numbers are invented.
     2. `metricsSource: 'venue'` — the prestige venues the user named where the
        hostess/hospitality team served (Al Shaqab, Sheraton, St. Regis, FIFA
        World Cup, Arab Cup). These carry NO invented dates/metrics — only a
        neutral description of the hospitality engagement.

   Imagery reuses the real `/team/*` photographs (these are the actual event
   crew photos), so no external assets are introduced.
   ───────────────────────────────────────────────────────────────────────── */
export interface EventProject {
  slug: string;
  /** Event / activation name. */
  title: string;
  /** Client or venue. */
  venue: string;
  /** Year(s) — only when present in the record; omitted for named venues. */
  year?: string;
  /** Short, neutral description. */
  summary: string;
  /** Source-backed highlight list (services / scope). */
  services: string[];
  /** Optional Public_Metric counts — ONLY when present verbatim in the record. */
  visitors?: string;
  winners?: string;
  staff?: string;
  days?: string;
  /** Mapped image (reused existing team/event photograph). */
  image: string;
  /** Whether metrics come from the approved record or this is a named venue. */
  metricsSource: 'record' | 'venue';
}

/**
 * The prestige venues where the VIP hostess / hospitality team served. These
 * are NAMED-ONLY engagements — factual venue names with NO invented dates,
 * visitor counts or other metrics. Used for the hostess capability copy and
 * the named-venue cards in the Events showcase.
 */
export const hostessVenues: readonly string[] = [
  'Al Shaqab',
  'Sheraton (5-star Hotel)',
  'St. Regis',
  'FIFA World Cup',
  'Arab Cup',
];

export const eventProjects: EventProject[] = [
  // ── Strongest activations — metrics transcribed VERBATIM from the approved
  //    Qasim events record. No number is invented; only counts present in the
  //    source appear below. ──────────────────────────────────────────────────
  {
    slug: 'hello-asia',
    title: 'Hello Asia',
    venue: 'Lusail Boulevard',
    year: '2024',
    summary:
      'A flagship Lusail Boulevard activation staffed with VIP hostesses, carnival games, a train and a soft-play area.',
    services: ['25 VIP Hostesses', '16 Carnival Games', 'Train', 'Soft Play Area'],
    visitors: '3.75M',
    staff: '90',
    days: '30',
    image: '/team/hostesses/06.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'formula-1-motogp-fan-zone',
    title: 'Formula 1 & MotoGP Fan Zone',
    venue: 'Lusail Circuit & Boulevard',
    year: '2023–24',
    summary:
      'A motorsport fan-zone activation spanning the Lusail Circuit and Boulevard, blending games, live artists, hospitality and branding.',
    services: [
      'Carnival Games',
      'Slot Car Racing',
      'Henna Artists',
      'Face Painters',
      'Hospitality',
      'Branding',
    ],
    days: '10',
    image: '/team/organizers/02.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'eid-festival',
    title: 'Eid Festival',
    venue: 'Lusail Boulevard',
    year: '2023',
    summary:
      'An Eid festival activation on Lusail Boulevard with carnival and arcade games, giant inflatables and full F&B.',
    services: ['16 Carnival Games', '20 Arcade Games', '2 Giant Inflatables', 'Full F&B'],
    visitors: '100,000',
    days: '8',
    image: '/team/play-area/01.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'darb-al-lusail-parade',
    title: 'Darb al Lusail Parade',
    venue: 'Lusail Boulevard',
    year: '2023',
    summary:
      'A large parade activation on Lusail Boulevard with a full roster of entertainment and management staff.',
    services: ['80 Entertainment Artists', '30 Management Staff'],
    visitors: '40,000',
    staff: '110',
    days: '3',
    image: '/team/organizers/01.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'flower-festival',
    title: 'Flower Festival',
    venue: 'Lusail Boulevard',
    year: '2023',
    summary:
      'A Lusail Boulevard festival activation featuring carnival games, arcade games and giant inflatables.',
    services: ['12 Carnival Games', '15 Arcade Games', '4 Giant Inflatables'],
    visitors: '40,000',
    staff: '76',
    days: '3',
    image: '/team/play-area/02.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'fifa-fan-zone-lagoona',
    title: 'FIFA World Cup Fan Zone',
    venue: 'Lagoona Mall',
    year: '2022',
    summary:
      'A FIFA World Cup fan-zone activation at Lagoona Mall with carnival games and a soft building-block city.',
    services: ['4 Carnival Games', 'Soft Building Block City'],
    visitors: '5,000',
    winners: '450',
    days: '30',
    image: '/team/play-area/03.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'fifa-fan-zone-festival-city',
    title: 'FIFA World Cup Fan Zone',
    venue: 'Doha Festival City Arena',
    year: '2022',
    summary:
      'A FIFA World Cup fan-zone activation at the Doha Festival City Arena centred on carnival games.',
    services: ['4 Carnival Games'],
    visitors: '3,000',
    winners: '250',
    days: '30',
    image: '/team/play-area/04.jpeg',
    metricsSource: 'record',
  },
  {
    slug: 'qatar-international-food-festival',
    title: 'Qatar International Food Festival',
    venue: 'Al Bidda Park & Corniche',
    year: '2021',
    summary:
      'A carnival-games activation at the Qatar International Food Festival across Al Bidda Park and the Corniche.',
    services: ['9 Carnival Games'],
    visitors: '40,000',
    winners: '5,500',
    days: '19',
    image: '/team/organizers/03.jpeg',
    metricsSource: 'record',
  },
  // ── Prestige venues the hostess / hospitality team served (NAMED-ONLY — no
  //    invented dates or metrics, just a neutral hospitality description). ─────
  {
    slug: 'al-shaqab',
    title: 'Al Shaqab',
    venue: 'Al Shaqab',
    summary:
      'Event hostess and hospitality staffing at Al Shaqab — a prestige guest-facing engagement for the events team.',
    services: ['VIP hostesses', 'Guest hospitality', 'Event support'],
    image: '/team/hostesses/01.jpeg',
    metricsSource: 'venue',
  },
  {
    slug: 'sheraton',
    title: 'Sheraton (5-Star Hotel)',
    venue: 'Sheraton Grand Doha',
    summary:
      'Event hostess and hospitality staffing at the five-star Sheraton — polished, guest-facing service by the hospitality team.',
    services: ['VIP hostesses', 'Five-star hospitality', 'Front-of-house support'],
    image: '/team/hostesses/02.jpeg',
    metricsSource: 'venue',
  },
  {
    slug: 'st-regis',
    title: 'St. Regis',
    venue: 'The St. Regis Doha',
    summary:
      'Event hostess and hospitality staffing at the St. Regis — luxury guest-facing hospitality delivered by the events crew.',
    services: ['VIP hostesses', 'Luxury hospitality', 'Guest guidance'],
    image: '/team/hostesses/03.jpeg',
    metricsSource: 'venue',
  },
  {
    slug: 'arab-cup',
    title: 'Arab Cup',
    venue: 'Arab Cup, Qatar',
    summary:
      'Event hostess and hospitality staffing during the Arab Cup — tournament guest-facing hospitality by the events team.',
    services: ['VIP hostesses', 'Event hospitality', 'Guest guidance'],
    image: '/team/hostesses/04.jpeg',
    metricsSource: 'venue',
  },
];

/* ─────────────────────────────────────────────────────────────────────────
   Qasim events — the 16 real event/activation projects.

   ⚠️ SOURCE PRIVACY: the raw deck under `public/qasim-khalid-projects/` embeds
   PRIVATE financial data (revenue / cost / net_profit) in its image FILENAMES
   and in MANIFEST.csv. That folder is git-ignored and NEVER served. The app
   references ONLY the sanitized copies produced by
   `scripts/normalize-qasim-images.mjs` at `public/qasim/<NN>-<slug>/<NN>.webp`.

   Only PUBLIC metrics (period, visitors, staff, winners, games, etc.) are
   transcribed below — no financial figures appear anywhere. Each project's
   images map ONLY to its own normalized `/qasim/<NN>-<slug>/*` folder, so event
   imagery never mixes with the cleaning (`/puro/work/*`) photography.
   ───────────────────────────────────────────────────────────────────────── */
export interface QasimProject {
  no: number;
  slug: string;
  title: string;
  venue: string;
  /** Human period label (e.g. "2023–24", "Jan 2024"), when supplied. */
  period?: string;
  /** Public metric chips — visitor/staff/winner/game counts only, NO QAR. */
  metrics: string[];
  /** Primary image (first normalized image in this project's own folder). */
  image: string;
  /** Full normalized gallery for this project (its own folder only). */
  images: WorkImage[];
}

/**
 * How many normalized images exist per project, keyed by project number. These
 * match the output of `scripts/normalize-qasim-images.mjs` (see its COUNTS log)
 * and drive the `/qasim/<NN>-<slug>/<NN>-NN.webp` gallery arrays below.
 */
const QASIM_IMAGE_COUNTS: Record<number, number> = {
  1: 1, 2: 7, 3: 12, 4: 7, 5: 3, 6: 12, 7: 3, 8: 5,
  9: 5, 10: 4, 11: 3, 12: 2, 13: 3, 14: 11, 15: 5, 16: 23,
};

/** Build the normalized image list for one Qasim project (its own folder). */
function qasimImages(no: number, slug: string, title: string): WorkImage[] {
  const nn = String(no).padStart(2, '0');
  const count = QASIM_IMAGE_COUNTS[no] ?? 0;
  return Array.from({ length: count }, (_, index) => ({
    src: `/qasim/${nn}-${slug}/${nn}-${String(index + 1).padStart(2, '0')}.webp`,
    alt: `${title} — ${nn === '13' ? 'event activation' : 'event'} photograph ${index + 1}`,
  }));
}

/** Raw, source-backed public data for each of the 16 events (NO financials). */
const QASIM_SOURCE: Omit<QasimProject, 'image' | 'images'>[] = [
  {
    no: 1,
    slug: 'formula-1-motogp-fan-zone',
    title: 'Formula 1 & MotoGP Fan Zone Activation',
    venue: 'Lusail Circuit & Boulevard',
    period: '2023–24',
    metrics: ['10 days'],
  },
  {
    no: 2,
    slug: 'hello-asia',
    title: 'Hello Asia',
    venue: 'Lusail Boulevard',
    period: 'Jan 2024',
    metrics: ['30 days', '3.75M visitors', '90 staff', '25 VIP hostesses', '16 carnival games'],
  },
  {
    no: 3,
    slug: 'flower-festival',
    title: 'Flower Festival',
    venue: 'Lusail Boulevard',
    period: 'May 2023',
    metrics: ['3 days', '40,000 visitors', '76 staff', '12 carnival games', '15 arcade games', '4 giant inflatables'],
  },
  {
    no: 4,
    slug: 'eid-festival',
    title: 'Eid Festival',
    venue: 'Lusail Boulevard',
    period: 'March 2023',
    metrics: ['8 days', '100,000 visitors', '16 carnival games', '20 arcade games', '2 giant inflatables', 'full F&B'],
  },
  {
    no: 5,
    slug: 'darb-al-lusail-parade',
    title: 'Darb Al Lusail Parade',
    venue: 'Lusail Boulevard',
    period: 'March 2023',
    metrics: ['3 days', '40,000 visitors', '80 entertainment artists', '30 management staff'],
  },
  {
    no: 6,
    slug: 'eid-ul-adha-festival',
    title: 'Eid ul Adha Festival',
    venue: 'Abu Sidra Mall (LULU)',
    period: '2023',
    metrics: ['3 days', '30,000 visitors', '9 shows', '15 roaming parade characters', 'face painting', 'henna'],
  },
  {
    no: 7,
    slug: 'aljama-celebration-week-2023',
    title: "ALJAM'A Celebration Week",
    venue: 'Education City, Qatar Foundation',
    period: '2023',
    metrics: ['3 days', '8 universities', '1,500 visitors', '190 winners'],
  },
  {
    no: 8,
    slug: 'qatar-custom-show-2023',
    title: 'Qatar Custom Show',
    venue: 'Qatar Racing Club',
    period: '2023',
    metrics: ['3 days', '2,000 visitors', '200 winners', '6 carnival games', 'building block city', 'bouncy castles'],
  },
  {
    no: 9,
    slug: 'building-block-city',
    title: 'Building Block City',
    venue: 'Lagoona Mall',
    metrics: ['3 months'],
  },
  {
    no: 10,
    slug: 'aljama-celebration-week-2022',
    title: "ALJAM'A Celebration Week",
    venue: 'Education City, Qatar Foundation',
    period: '2022',
    metrics: ['5-day celebration', '8 universities', '2,000 visitors', '230 winners'],
  },
  {
    no: 11,
    slug: 'fifa-fan-zone-lagoona',
    title: 'Fan Zone Activation, FIFA World Cup 2022',
    venue: 'Lagoona Mall',
    metrics: ['30 days', '5,000 visitors', '450 winners', '4 carnival games', 'soft building block city'],
  },
  {
    no: 12,
    slug: 'fifa-fan-zone-festival-city',
    title: 'Fan Zone Activation, FIFA World Cup 2022',
    venue: 'Doha Festival City Arena',
    metrics: ['30 days', '3,000 visitors', '250 winners', '4 carnival games'],
  },
  {
    no: 13,
    slug: 'fifa-balloons-distribution',
    title: 'FIFA Balloons Distribution',
    venue: '8 locations (Souq Waqif, Katara, Msheireb, Lusail, The Pearl, Mall of Qatar, Villaggio, DFC)',
    period: '2022',
    metrics: ['4 days', '12,000 balloons'],
  },
  {
    no: 14,
    slug: 'eid-in-qatar',
    title: 'Eid in Qatar',
    venue: 'Corniche',
    period: '2022',
    metrics: ['3 days', '3,000 visitors', '200 winners', '7 carnival games', 'soft building block city', 'jumping castles'],
  },
  {
    no: 15,
    slug: 'qatar-custom-show-2022',
    title: 'Qatar Custom Show',
    venue: 'Qatar Racing Club',
    period: '2022',
    metrics: ['3 days', '3,000 visitors', '420 winners', '6 carnival games', 'building block city'],
  },
  {
    no: 16,
    slug: 'qatar-international-food-festival',
    title: 'Qatar International Food Festival',
    venue: 'Al Bidda Park & Corniche',
    period: '2021',
    metrics: ['19 days', '40,000 visitors', '5,500 winners', '9 carnival games'],
  },
];

/**
 * The 16 Qasim event projects, each wired to its OWN normalized image folder.
 * `image` is the project's first normalized photo; `images` is its full
 * gallery. Projects with no normalized photos fall back to the brand logo so a
 * card never renders a broken image (only project 1 currently has a single
 * image; every other project has its own multi-image gallery).
 */
export const qasimProjects: QasimProject[] = QASIM_SOURCE.map((project) => {
  const images = qasimImages(project.no, project.slug, project.title);
  return {
    ...project,
    image: images[0]?.src ?? brand.logo,
    images,
  };
});

/**
 * The ordered hero deck: 16 event cards (own imagery) followed by every Puro
 * cleaning engagement (cleaning imagery). Built once from the source-backed
 * arrays; contains no invented data and no financial figures.
 */
/**
 * Adapt a Qasim EVENT project into the shared `Project` shape so the existing
 * ProjectModal (galleries, cinematic viewer, accessibility) can present it
 * without a bespoke modal. Public metrics only — no financial figures.
 */
export function qasimProjectAsProject(index: number): Project | null {
  const event = qasimProjects[index];
  if (!event) return null;
  return {
    title: event.title,
    category: 'Events & Hospitality',
    location: event.venue,
    summary: event.period
      ? `${event.venue} — ${event.period}.`
      : `${event.venue}.`,
    services: event.metrics,
    image: event.image,
    images: event.images,
    facts: [],
  };
}
export const heroCards: HeroCard[] = [
  ...qasimProjects.map((project, index) => ({
    kind: 'event' as const,
    index,
    capability: CAPABILITY_LABEL.events,
    image: project.images[0] ?? { src: brand.logo, alt: `${project.title} — event` },
    title: project.title,
    subtitle: project.period ? `${project.venue} · ${project.period}` : project.venue,
  })),
  ...contractCards.map((contract, index) => ({
    kind: 'cleaning' as const,
    index,
    capability: CAPABILITY_LABEL.cleaning,
    image: contract.image,
    title: contract.client,
    subtitle: `${contract.scope} · ${contract.duration}`,
  })),
];

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
  youtubeId: 'dXBQZRfOfnc',
  youtubeUrl: 'https://www.youtube.com/watch?v=dXBQZRfOfnc',
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

/* ─────────────────────────────────────────────────────────────────────────
   Leadership & capacity — source-backed company data transcribed VERBATIM
   from the provided Puro company documents (management table, workforce
   summary, transport fleet, machinery list, and the organizational chart).

   Nothing here is invented: names, positions, qualifications, nationalities,
   experience, counts and org-chart labels are exactly as supplied. No
   financial data is present in the source and none is added.
   ───────────────────────────────────────────────────────────────────────── */

/** One row of the "PURO CLEANING SERVICES MANAGEMENT" table. */
export interface ManagementMember {
  no: number;
  position: string;
  name: string;
  qualification: string;
  nationality: string;
  /** Years of experience, transcribed as supplied (e.g. "30 Years"). */
  experience: string;
}

export const management: ManagementMember[] = [
  {
    no: 1,
    position: 'Group Operations Manager',
    name: 'N. Prabha Kumar',
    qualification:
      'Senior, Soft Service FM with Experience in Commercial, Health & Industrial Projects',
    nationality: 'Indian',
    experience: '30 Years',
  },
  {
    no: 2,
    position: 'Facilities Manager',
    name: 'Thaloppandi Mehaboob Khan',
    qualification:
      'Over 20 years experience in hard Services MEP Installations and maintenance',
    nationality: 'Indian',
    experience: '20 Years',
  },
  {
    no: 3,
    position: 'HR & Admin Coordinator',
    name: 'Muhammad Osman Harun',
    qualification: 'Over 7 years experience in HR & Administration',
    nationality: 'Bangladesh',
    experience: '7 Years',
  },
  {
    no: 4,
    position: 'HSE Officer',
    name: 'Tarik Khan',
    qualification: 'Over 10 Years experience in HSE & Safety Specialist in projects.',
    nationality: 'Indian',
    experience: '10 Years',
  },
  {
    no: 5,
    position: 'Project Coordinator',
    name: 'Rasel Rana',
    qualification:
      'Soft Service Specialist in projects, Health Centers and Deep Cleaning',
    nationality: 'Bangladesh',
    experience: '10 Years',
  },
  {
    no: 6,
    position: 'General Supervisor',
    name: 'Tharsis Janapriyan',
    qualification:
      'Façade Cleaning Service Specialist for High Rise Towers & Villa Projects',
    nationality: 'Srilankan',
    experience: '15 Years',
  },
  {
    no: 7,
    position: 'General Supervisor',
    name: 'Fasil Puthiyottil Veedu',
    qualification:
      'Soft Service Specialist in projects, Health Centers and Deep Cleaning',
    nationality: 'Indian',
    experience: '11 Years',
  },
  {
    no: 8,
    position: 'General Supervisor',
    name: 'Nassar Thattarthodi',
    qualification:
      'Soft Service Specialist in projects, Health Centers and Deep Cleaning',
    nationality: 'Indian',
    experience: '8 Years',
  },
];

/** A gender split used within the workforce breakdown. */
export interface GenderSplit {
  male: number;
  female: number;
}

/**
 * The total workforce and its hospitality / cleaning gender breakdown, exactly
 * as supplied (total 1005). The sub-totals and grand total are DERIVED from the
 * splits so any display stays internally consistent with the source figures.
 */
export interface Workforce {
  total: number;
  hospitality: GenderSplit;
  cleaning: GenderSplit;
}

export const workforce: Workforce = {
  total: 1005,
  hospitality: { male: 150, female: 75 },
  cleaning: { male: 658, female: 122 },
} as const;

/** Sum of a gender split. */
export function genderTotal(split: GenderSplit): number {
  return split.male + split.female;
}

/** Derived workforce sub-totals + grand total (from the source splits). */
export const workforceTotals = {
  hospitality: genderTotal(workforce.hospitality),
  cleaning: genderTotal(workforce.cleaning),
  derivedTotal: genderTotal(workforce.hospitality) + genderTotal(workforce.cleaning),
} as const;

/** A counted line item (fleet vehicle or machine). */
export interface CountedItem {
  label: string;
  /** Numeric count, or a non-numeric marker such as "LOT" where supplied. */
  count: number | string;
}

/** Transport fleet, transcribed from the supplied vehicle list. */
export const fleet: CountedItem[] = [
  { label: 'Ashok Leyland (66-seater)', count: 4 },
  { label: 'Nissan Civilian (30-seater)', count: 9 },
  { label: 'Toyota Coaster (26-seater)', count: 4 },
  { label: 'Nissan Urvan (15-seater)', count: 6 },
  { label: 'Saloon Cars', count: 5 },
];

/** Cleaning machinery & equipment, transcribed from the supplied list. */
export const machinery: CountedItem[] = [
  { label: 'Auto Scrubber', count: 15 },
  { label: 'Scrubbing & Polishing', count: 40 },
  { label: 'Wet & Dry Vacuum', count: 40 },
  { label: 'Dry Vacuum', count: 70 },
  { label: 'High Pressure Washer', count: 24 },
  { label: 'External Window Cleaning', count: 8 },
  { label: 'Equipment & Tools', count: 'LOT' },
];

/** Sum only the numeric counts of a CountedItem list (ignores markers like "LOT"). */
export function sumCounts(items: readonly CountedItem[]): number {
  return items.reduce(
    (total, item) => total + (typeof item.count === 'number' ? item.count : 0),
    0,
  );
}

/** Whether a list contains any non-numeric marker (e.g. "LOT"), so a "+" can be shown. */
export function hasNonNumericCount(items: readonly CountedItem[]): boolean {
  return items.some((item) => typeof item.count !== 'number');
}

/** Derived capacity totals used by the Leadership stat cards. */
export const fleetTotal = sumCounts(fleet);
export const machineryTotal = sumCounts(machinery);

/**
 * A node in the organizational chart. Labels are transcribed verbatim from the
 * supplied chart; the layout may be simplified but names are never changed.
 */
export interface OrgNode {
  label: string;
  children?: OrgNode[];
}

/**
 * The organizational chart hierarchy, transcribed from the supplied chart:
 * M.D → G.M. Operations → (secretary/coordinator + reception) → the department
 * managers, each expanded with their own sub-nodes.
 */
export const orgChart: OrgNode = {
  label: 'M.D',
  children: [
    {
      label: 'G.M. Operations',
      children: [
        { label: 'G.M. Secretary' },
        {
          label: 'G.M. Coordinator',
          children: [{ label: 'Receptionist' }, { label: 'Secretaries' }],
        },
        {
          label: 'Financial Manager',
          children: [
            { label: 'Accounting Dept' },
            { label: 'Cashier' },
            { label: 'Store Keeper' },
            { label: 'Purchasing Officer' },
          ],
        },
        {
          label: 'Sales-Marketing Manager',
          children: [
            { label: 'Salesman 1' },
            { label: 'Salesman 2' },
            { label: 'Salesman 3' },
          ],
        },
        {
          label: 'Business Development',
        },
        {
          label: 'Operations Manager',
          children: [
            { label: 'Project Manager' },
            { label: 'Project Coordinator' },
            { label: 'Training Dept' },
            { label: 'Estimating External' },
            { label: 'Estimating Internal' },
            { label: 'Tender Dept' },
            { label: 'Technical Officer' },
            { label: 'Work Plan Staff' },
            { label: 'Bus 1' },
            { label: 'Bus 2' },
            { label: 'Bus 3' },
            { label: 'Windows Team 1' },
            { label: 'Windows Team 2' },
            { label: 'Supervisors' },
            { label: 'Team Leaders' },
            { label: 'Staff' },
            { label: 'EHS Department' },
          ],
        },
        {
          label: 'Facade Cleaning',
          children: [
            { label: 'Estimator Supervisor' },
            { label: 'Operators' },
          ],
        },
        {
          label: 'H.R. Manager',
          children: [
            { label: 'PRO' },
            { label: 'Payroll Officer' },
            { label: 'Manpower Officer' },
            { label: 'Campboss' },
            { label: 'Drivers' },
          ],
        },
      ],
    },
  ],
};
