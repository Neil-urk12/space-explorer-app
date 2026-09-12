import { CATALOG } from '@/data/catalog';
import { SpaceItem } from '@/types/space';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

const SEEDED = ['2026-09-11', '2026-08-12'];

type FavoritesContextValue = {
  items: SpaceItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: SpaceItem) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(SEEDED);

  const items = useMemo(
    () => ids.map((id) => CATALOG.find((item) => item.id === id)).filter((item): item is SpaceItem => Boolean(item)),
    [ids],
  );

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavorite = useCallback((item: SpaceItem) => {
    setIds((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [item.id, ...current]));
  }, []);

  const value = useMemo(() => ({ items, isFavorite, toggleFavorite }), [items, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
