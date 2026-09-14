// Static content module for the Qasim Events site.
// All page content is hardcoded here (Req 1.4, 3.1, 3.3, 4.1, 4.3, 5.1, 5.5, 6.3, 6.5).
// Image paths are derived from index (see lib/format.ts imagePathForIndex), not stored here,
// keeping the project data and file mapping in sync (Req 4.2).

/** A single project card in the Work grid (Req 4.3). */
export interface Project {
  title: string;
  venue: string;
  year: string;
  stat: string;
}

/** A single statistic block in the Numbers bar (Req 5.1). */
export interface StatItem {
  target: number;
  suffix: string;
  label: string;
}

/**
 * Contact details for the Contact section.
 * Both fields are EDITABLE:
 * - `email` defaults to hello@qasim-events.qa (Req 6.3).
 * - `phone` is a Qatar international-format number beginning with country code 974 (Req 6.5).
 *   The trailing digits are a placeholder — replace 'XXXXXXXX' with the real number.
 */
export const contact = {
  email: 'hello@qasim-events.qa', // editable (Req 6.3)
  phone: '974XXXXXXXX', // editable, Qatar intl format beginning with 974 (Req 6.5)
};

/** Trusted-by wordmarks, rendered as text in EXACT order (Req 3.1, 3.3). */
export const wordmarks = [
  'Qatari Diar',
  'Lusail',
  'Qatar Tourism',
  'Qatar Foundation',
  'LULU',
  'Lagoona Mall',
  'Doha Festival City',
] as const;

/**
 * Numbers-bar statistics: activation and visitor counts only.
 * No revenue or profit figures (Req 5.1, 5.5).
 */
export const numbers: StatItem[] = [
  { target: 13, suffix: '+', label: 'Activations' },
  { target: 3.75, suffix: 'M+', label: 'Visitors at peak event' },
  { target: 3, suffix: '', label: 'FIFA World Cup 2022 activations' },
];

/**
 * Work-grid projects: EXACTLY 13 entries, in definition order, mapped sequentially
 * to img-000.png through img-012.png (Req 4.1, 4.2, 4.3, 1.4).
 */
export const projects: Project[] = [
  { title: 'Formula 1 & MotoGP Fan Zone', venue: 'Lusail Circuit & Boulevard', year: '2023–24', stat: '10 days activated' },
  { title: 'Hello Asia', venue: 'Lusail Boulevard', year: '2024', stat: '3.75M visitors' },
  { title: 'Flower Festival', venue: 'Lusail Boulevard', year: '2023', stat: '40,000 visitors' },
  { title: 'Eid Festival', venue: 'Lusail Boulevard', year: '2023', stat: '100,000 visitors' },
  { title: 'Darb al Lusail Parade', venue: 'Lusail Boulevard', year: '2023', stat: '80 entertainers' },
  { title: 'Eid ul Adha Festival', venue: 'Abu Sidra Mall (LULU)', year: '2023', stat: '30,000 visitors' },
  { title: "ALJAM'A Celebration Week", venue: 'Education City, Qatar Foundation', year: '2022–23', stat: '8 universities' },
  { title: 'Qatar Custom Show', venue: 'Qatar Racing Club', year: '2022–23', stat: '420 winners' },
  { title: 'Building Block City', venue: 'Lagoona Mall', year: '2022', stat: '3-month run' },
  { title: 'FIFA World Cup Fan Zone', venue: 'Lagoona Mall', year: '2022', stat: '5,000 visitors' },
  { title: 'FIFA World Cup Fan Zone', venue: 'Doha Festival City Arena', year: '2022', stat: '3,000 visitors' },
  { title: 'Eid in Qatar', venue: 'Corniche', year: '2022', stat: 'fireworks finale' },
  { title: 'Qatar International Food Festival', venue: 'Al Bidda Park & Corniche', year: '2021', stat: '40,000 visitors' },
];
