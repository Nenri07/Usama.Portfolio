'use client';

import { useCallback, useMemo, useState } from 'react';
import HeroSlider from './HeroSlider';
import ProjectModal from './ProjectModal';
import ContractModal from './ContractModal';
import PresentMode from './PresentMode';
import { ProjectSelectionProvider } from './ProjectSelectionContext';
import { projects, contractCards } from '@/lib/data';

/**
 * HomeClient — the thin client wrapper that owns the selected-project and
 * selected-contract modal state. It renders the HeroSlider, both detail
 * modals, and the Present-mode controller so `app/page.tsx` can stay a Server
 * Component: the interactive state lives here and the static sections below are
 * passed through as `children` (Server Components rendered into a Client slot).
 *
 * A hero card click opens the contract modal (one card per real contract);
 * Work/Projects rows open the service-project modal; the Projects engagement
 * index opens the contract modal. Both are exposed through the selection
 * provider so any descendant can trigger them without prop drilling.
 */
export default function HomeClient({ children }: { children: React.ReactNode }) {
  const [projectIndex, setProjectIndex] = useState<number | null>(null);
  const [contractIndex, setContractIndex] = useState<number | null>(null);

  const openProject = useCallback((index: number) => {
    setContractIndex(null);
    setProjectIndex(index);
  }, []);

  const openContract = useCallback((index: number) => {
    setProjectIndex(null);
    setContractIndex(index);
  }, []);

  const closeProject = useCallback(() => setProjectIndex(null), []);
  const closeContract = useCallback(() => setContractIndex(null), []);

  const selectedProject =
    projectIndex != null ? projects[projectIndex] ?? null : null;
  const selectedContract =
    contractIndex != null ? contractCards[contractIndex] ?? null : null;

  const selection = useMemo(
    () => ({ openProject, openContract }),
    [openProject, openContract],
  );

  return (
    <ProjectSelectionProvider value={selection}>
      <HeroSlider onCardClick={openContract} />

      {/* Server-rendered sections remain in their original client slot. */}
      {children}

      <ProjectModal
        project={selectedProject}
        index={projectIndex}
        onClose={closeProject}
      />

      <ContractModal contract={selectedContract} onClose={closeContract} />

      {/* Auto-running presentation controller (decoupled, disposable). */}
      <PresentMode />
    </ProjectSelectionProvider>
  );
}
