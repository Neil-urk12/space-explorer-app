import { CATALOG } from '@/data/catalog';
import { isValidSpaceItem } from '@/services/apod';
import { SpaceItem } from '@/types/space';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

const FAVORITES_STORAGE_KEY = '@space_explorer/favorites';
const SEEDED_IDS = ['2026-09-11', '2026-08-12'];

function seededItems(): SpaceItem[] {
  return SEEDED_IDS.map((id) => CATALOG.find((item) => item.id === id)).filter((item): item is SpaceItem => Boolean(item));
}

type FavoritesState = {
  items: SpaceItem[];
  favoriteIds: Set<string>;
  hydrated: boolean;
  error: string | null;
  canReset: boolean;
};

type FavoritesStore = {
  subscribe: (listener: () => void) => () => void;
  getState: () => FavoritesState;
  retry: () => void;
  reset: () => void;
  toggleFavorite: (item: SpaceItem) => void;
};

export type FavoritesContextValue = {
  items: SpaceItem[];
  hydrated: boolean;
  error: string | null;
  canReset: boolean;
  retry: () => void;
  reset: () => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: SpaceItem) => void;
};

const FavoritesContext = createContext<FavoritesStore | null>(null);

function createFavoritesStore(): FavoritesStore {
  const initial = seededItems();
  let state: FavoritesState = {
    items: initial,
    favoriteIds: new Set(initial.map((item) => item.id)),
    hydrated: false,
    error: null,
    canReset: false,
  };

  const listeners = new Set<() => void>();
  let requestId = 0;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (patch: Partial<FavoritesState>) => {
    state = { ...state, ...patch };
    notify();
  };

  const loadFromStorage = () => {
    const currentRequestId = ++requestId;
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((raw) => {
        if (currentRequestId !== requestId) return;
        if (raw === null) {
          const nextItems = seededItems();
          setState({
            items: nextItems,
            favoriteIds: new Set(nextItems.map((item) => item.id)),
            canReset: false,
            error: null,
            hydrated: true,
          });
          return;
        }
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
          setState({ canReset: true, error: 'Unable to load saved favorites.', hydrated: false });
          return;
        }
        if (!Array.isArray(parsed) || !parsed.every(isValidSpaceItem)) {
          setState({ canReset: true, error: 'Unable to load saved favorites.', hydrated: false });
          return;
        }
        setState({
          items: parsed,
          favoriteIds: new Set(parsed.map((item) => item.id)),
          canReset: false,
          error: null,
          hydrated: true,
        });
      })
      .catch(() => {
        if (currentRequestId !== requestId) return;
        setState({
          error: 'Unable to load saved favorites.',
          hydrated: false,
        });
      });
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getState: () => state,
    retry: () => {
      setState({ error: null, hydrated: false, canReset: false });
      loadFromStorage();
    },
    reset: () => {
      if (!state.canReset) return;
      const currentRequestId = ++requestId;
      AsyncStorage.removeItem(FAVORITES_STORAGE_KEY)
        .then(() => {
          if (currentRequestId !== requestId) return;
          const nextItems = seededItems();
          setState({
            items: nextItems,
            favoriteIds: new Set(nextItems.map((item) => item.id)),
            error: null,
            canReset: false,
            hydrated: true,
          });
        })
        .catch(() => {
          if (currentRequestId !== requestId) return;
          setState({
            error: 'Unable to reset saved favorites.',
            hydrated: false,
          });
        });
    },
    toggleFavorite: (item: SpaceItem) => {
      if (!state.hydrated) return;
      const exists = state.favoriteIds.has(item.id);
      const nextItems = exists ? state.items.filter((fav) => fav.id !== item.id) : [item, ...state.items];
      setState({
        items: nextItems,
        favoriteIds: new Set(nextItems.map((fav) => fav.id)),
      });
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextItems)).catch(() => {});
    },
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createFavoritesStore);

  useEffect(() => {
    store.retry();
  }, [store]);

  return <FavoritesContext.Provider value={store}>{children}</FavoritesContext.Provider>;
}

export function useIsFavorite(id: string): boolean {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error('useIsFavorite must be used within FavoritesProvider');
  const getSnapshot = useCallback(() => store.getState().favoriteIds.has(id), [store, id]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export function useToggleFavorite(): (item: SpaceItem) => void {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error('useToggleFavorite must be used within FavoritesProvider');
  return store.toggleFavorite;
}

export function useFavorites(): FavoritesContextValue {
  const store = useContext(FavoritesContext);
  if (!store) throw new Error('useFavorites must be used within FavoritesProvider');
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);

  const isFavorite = useCallback((id: string) => state.favoriteIds.has(id), [state.favoriteIds]);

  return useMemo(
    () => ({
      items: state.items,
      hydrated: state.hydrated,
      error: state.error,
      canReset: state.canReset,
      retry: store.retry,
      reset: store.reset,
      isFavorite,
      toggleFavorite: store.toggleFavorite,
    }),
    [state.items, state.hydrated, state.error, state.canReset, store.retry, store.reset, isFavorite, store.toggleFavorite],
  );
}
