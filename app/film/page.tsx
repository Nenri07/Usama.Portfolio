import type { Metadata } from 'next';
import { brand, film } from '@/lib/data';
import FilmStage from '@/components/film/FilmStage';

/**
 * /film — the dedicated cinematic 3D video route (Part D).
 *
 * Stays a Server Component for metadata; the interactive WebGL + iframe stage
 * lives in the FilmStage client component. Reachable from the nav and the
 * Services "Watch the film" CTA, with back-navigation to home inside the stage.
 */
export const metadata: Metadata = {
  title: `${film.title} · ${brand.name}`,
  description: film.tagline,
  openGraph: {
    title: `${film.title} · ${brand.name}`,
    description: film.tagline,
    type: 'video.other',
  },
};

export default function FilmPage() {
  return <FilmStage />;
}
