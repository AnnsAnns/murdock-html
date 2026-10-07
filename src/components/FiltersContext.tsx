import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface FiltersContextValue {
  /** Whether the dashboard filter panel is expanded. */
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

interface FiltersProviderProps {
  children: ReactNode;
}

/** Shares the filter panel's open state so the top-bar toggle and the panel
 *  rendered on the dashboard stay in sync. */
export function FiltersProvider({ children }: FiltersProviderProps) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((value) => !value), []);
  const value = useMemo(() => ({ open, toggle, setOpen }), [open, toggle]);

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) throw new Error('useFilters must be used within FiltersProvider');
  return context;
}
