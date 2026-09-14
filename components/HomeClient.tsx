'use client';

import { useCallback, useState } from 'react';
import HeroSlider from './HeroSlider';
import ProjectModal from './ProjectModal';
import { projects } from '@/lib/data';

/**
 * HomeClient — the thin client wrapper that owns the selected-project state
 * (Step 5). It renders the HeroSlider and the ProjectModal together so
 * `app/page.tsx` can stay a Server Component: the interactive modal state lives
 * here, and the static sections below are passed through as `children` (a
 * Server Component rendered into a Client Component slot).
 *
 * A card click on the hero slider (or, if wired, a Work row) sets the selected
 * index, which opens the modal for `projects[index]`.
 */
export default function HomeClient({ children }: { children: React.ReactNode }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openProject = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeProject = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const selectedProject =
    selectedIndex != null ? projects[selectedIndex] ?? null : null;

  return (
    <>
      <HeroSlider onCardClick={openProject} />

      {/* Static sections below the hero (Marquee, WorkList, Numbers, Team,
          Contact) — rendered on the server and passed through as children. */}
      {children}

      <ProjectModal
        project={selectedProject}
        index={selectedIndex}
        onClose={closeProject}
      />
    </>
  );
}
