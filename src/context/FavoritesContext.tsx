import { CATALOG } from '@/data/catalog';
import { isValidSpaceItem } from '@/services/apod';
import { SpaceItem } from '@/types/space';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const FAVORITES_STORAGE_KEY = '@space_explorer/favorites';
const SEEDED_IDS = ['2026-09-11', '2026-08-12'];

type FavoritesContextValue = {
  items: SpaceItem[];
  hydrated: boolean;
  error: string | null;
  canReset: boolean;
  retry: () => void;
  reset: () => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: SpaceItem) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SpaceItem[]>(seededItems);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canReset, setCanReset] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw === null) {
          setCanReset(false);
          setItems(seededItems());
          setHydrated(true);
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          setCanReset(true);
          throw new Error('Invalid favorites data');
        }
        if (!Array.isArray(parsed) || !parsed.every(isValidSpaceItem)) {
          setCanReset(true);
          throw new Error('Invalid favorites data');
        }
        setCanReset(false);
        setItems(parsed);
        setHydrated(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load saved favorites.');
          setHydrated(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [retryAttempt]);

  const retry = useCallback(() => {
    setError(null);
    setHydrated(false);
    setCanReset(false);
    setRetryAttempt((attempt) => attempt + 1);
  }, []);

  const reset = useCallback(() => {
    if (!canReset) return;

    AsyncStorage.removeItem(FAVORITES_STORAGE_KEY)
      .then(() => {
        setItems(seededItems());
        setError(null);
        setCanReset(false);
        setHydrated(true);
      })
      .catch(() => {
        setError('Unable to reset saved favorites.');
        setHydrated(false);
      });
  }, [canReset]);

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

  const value = useMemo(() => ({ items, hydrated, error, canReset, retry, reset, isFavorite, toggleFavorite }), [items, hydrated, error, canReset, retry, reset, isFavorite, toggleFavorite]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

function seededItems(): SpaceItem[] {
  return SEEDED_IDS.map((id) => CATALOG.find((item) => item.id === id)).filter((item): item is SpaceItem => Boolean(item));
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
