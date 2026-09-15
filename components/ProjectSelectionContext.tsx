'use client';

import { createContext, useContext } from 'react';

export interface ProjectSelectionValue {
  /** Open the service-project detail modal for `projects[index]`. */
  openProject: (index: number) => void;
  /** Open the contract-detail modal for `contractCards[index]`. */
  openContract: (index: number) => void;
}

const ProjectSelectionContext = createContext<ProjectSelectionValue | null>(null);

export const ProjectSelectionProvider = ProjectSelectionContext.Provider;

/** Returns null outside HomeClient so static/degraded renders remain safe. */
export function useProjectSelection(): ProjectSelectionValue | null {
  return useContext(ProjectSelectionContext);
}
