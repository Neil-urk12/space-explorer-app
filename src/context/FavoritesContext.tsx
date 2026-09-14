import { CATALOG } from '@/data/catalog';
import { SpaceItem } from '@/types/space';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const FAVORITES_STORAGE_KEY = '@space_explorer/favorites';
const SEEDED_IDS = ['2026-09-11', '2026-08-12'];

type FavoritesContextValue = {
  items: SpaceItem[];
  hydrated: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: SpaceItem) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SpaceItem[]>(() =>
    SEEDED_IDS.map((id) => CATALOG.find((c) => c.id === id)).filter((c): c is SpaceItem => Boolean(c)),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setItems(parsed);
            }
          } catch {}
        }
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const toggleFavorite = useCallback((item: SpaceItem) => {
    if (!hydrated) return;

    setItems((current) => {
      const exists = current.some((fav) => fav.id === item.id);
      const next = exists ? current.filter((fav) => fav.id !== item.id) : [item, ...current];
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [hydrated]);

  const value = useMemo(() => ({ items, hydrated, isFavorite, toggleFavorite }), [items, hydrated, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
