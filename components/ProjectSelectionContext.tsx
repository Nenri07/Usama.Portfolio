'use client';

import { createContext, useContext } from 'react';

export interface ProjectSelectionValue {
  openProject: (index: number) => void;
}

const ProjectSelectionContext = createContext<ProjectSelectionValue | null>(null);

export const ProjectSelectionProvider = ProjectSelectionContext.Provider;

/** Returns null outside HomeClient so static/degraded renders remain safe. */
export function useProjectSelection(): ProjectSelectionValue | null {
  return useContext(ProjectSelectionContext);
}
