import { CATALOG, TODAY } from '@/data/catalog';
import { fetchRecentApod, getCachedApodItems } from '@/services/apod';
import { SpaceItem } from '@/types/space';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type ApodContextValue = {
  items: SpaceItem[];
  today: SpaceItem;
  recents: SpaceItem[];
  loading: boolean;
  refreshing: boolean;
  isFallback: boolean;
  isRateLimited: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getItemById: (id: string) => SpaceItem | undefined;
  getNeighbors: (id: string) => { prev?: SpaceItem; next?: SpaceItem };
};

const ApodContext = createContext<ApodContextValue | null>(null);

export function ApodProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SpaceItem[]>(CATALOG);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Check cache first for faster paint if initial load
      if (!isRefresh) {
        const cached = await getCachedApodItems();
        if (cached.length > 0) {
          setItems(cached);
        }
      }

      const result = await fetchRecentApod(10);
      setItems(result.items);
      setIsFallback(result.isFallback);
      setIsRateLimited(result.isRateLimited);
      setError(result.error ?? null);
    } catch (err: any) {
      setIsFallback(true);
      setError(err?.message || 'Failed to load astronomy pictures');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  const getItemById = useCallback(
    (id: string): SpaceItem | undefined => {
      const foundInItems = items.find((item) => item.id === id);
      if (foundInItems) return foundInItems;
      return CATALOG.find((item) => item.id === id);
    },
    [items],
  );

  const getNeighbors = useCallback(
    (id: string): { prev?: SpaceItem; next?: SpaceItem } => {
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) {
        return { prev: items[index + 1], next: items[index - 1] };
      }
      const catIndex = CATALOG.findIndex((item) => item.id === id);
      if (catIndex >= 0) {
        return { prev: CATALOG[catIndex + 1], next: CATALOG[catIndex - 1] };
      }
      return {};
    },
    [items],
  );

  const today = useMemo(() => items[0] ?? TODAY, [items]);
  const recents = useMemo(() => items.slice(1, 8), [items]);

  const value = useMemo(
    () => ({
      items,
      today,
      recents,
      loading,
      refreshing,
      isFallback,
      isRateLimited,
      error,
      refresh,
      getItemById,
      getNeighbors,
    }),
    [items, today, recents, loading, refreshing, isFallback, isRateLimited, error, refresh, getItemById, getNeighbors],
  );

  return <ApodContext.Provider value={value}>{children}</ApodContext.Provider>;
}

export function useApod(): ApodContextValue {
  const ctx = useContext(ApodContext);
  if (!ctx) {
    throw new Error('useApod must be used within an ApodProvider');
  }
  return ctx;
}
