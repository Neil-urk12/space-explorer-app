import { CATALOG } from '@/data/catalog';
import { Category, SpaceItem } from '@/types/space';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_STORAGE_KEY = '@space_explorer/apod_cache';
const API_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY || 'DEMO_KEY';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';
const VIDEO_PLACEHOLDER = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=520&q=80';
// ponytail: one global queue; add per-key locking only if cache write throughput matters.
let cacheWriteQueue: Promise<void> = Promise.resolve();

const CATEGORIES: readonly Category[] = ['galaxy', 'nebula', 'planet', 'earth', 'moon'];

export interface NasaApodRaw {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
  copyright?: string;
  thumbnail_url?: string;
}

export interface ApodFetchResult {
  items: SpaceItem[];
  isFallback: boolean;
  isRateLimited: boolean;
  error?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isValidNasaApodRaw(value: unknown, expectedDate?: string): value is NasaApodRaw {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const raw = value as Partial<NasaApodRaw>;
  return (
    isIsoDate(raw.date) &&
    (!expectedDate || raw.date === expectedDate) &&
    isNonEmptyString(raw.explanation) &&
    isNonEmptyString(raw.service_version) &&
    isNonEmptyString(raw.title) &&
    isNonEmptyString(raw.url) &&
    (raw.media_type === 'image' || raw.media_type === 'video') &&
    isOptionalString(raw.hdurl) &&
    isOptionalString(raw.copyright) &&
    isOptionalString(raw.thumbnail_url)
  );
}

export function isValidSpaceItem(value: unknown): value is SpaceItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const item = value as Partial<SpaceItem>;
  return (
    isIsoDate(item.id) &&
    item.id === item.date &&
    isNonEmptyString(item.title) &&
    isNonEmptyString(item.explanation) &&
    isNonEmptyString(item.credit) &&
    isNonEmptyString(item.url) &&
    (item.mediaType === 'image' || item.mediaType === 'video') &&
    CATEGORIES.includes(item.category as Category) &&
    isOptionalString(item.hdurl) &&
    isOptionalString(item.thumbnail)
  );
}

function inferCategory(title: string, explanation: string): Category {
  const text = `${title} ${explanation}`.toLowerCase();
  if (text.includes('moon') || text.includes('lunar')) return 'moon';
  if (text.includes('earth') || text.includes('atmosphere') || text.includes('ocean')) return 'earth';
  if (text.includes('nebula')) return 'nebula';
  if (
    text.includes('planet') ||
    text.includes('jupiter') ||
    text.includes('saturn') ||
    text.includes('mars') ||
    text.includes('venus') ||
    text.includes('mercury')
  ) {
    return 'planet';
  }
  return 'galaxy';
}

export function mapApodToSpaceItem(raw: NasaApodRaw): SpaceItem {
  if (!isValidNasaApodRaw(raw)) throw new Error('Invalid NASA APOD item');
  const credit = raw.copyright?.trim().replace(/\r?\n/g, ' ') || 'NASA';
  const isVideo = raw.media_type === 'video';
  const thumbnail = raw.thumbnail_url || (isVideo ? VIDEO_PLACEHOLDER : raw.url);

  return {
    id: raw.date,
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    credit,
    url: raw.url,
    hdurl: raw.hdurl,
    thumbnail,
    mediaType: isVideo ? 'video' : 'image',
    category: inferCategory(raw.title, raw.explanation),
  };
}

export async function getCachedApodItems(): Promise<SpaceItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidSpaceItem) : [];
  } catch {
    return [];
  }
}

export async function saveCachedApodItems(newItems: SpaceItem[]): Promise<void> {
  cacheWriteQueue = cacheWriteQueue.then(async () => {
    try {
      const existing = await getCachedApodItems();
      const map = new Map<string, SpaceItem>();
      newItems.filter(isValidSpaceItem).forEach((item) => map.set(item.id, item));
      existing.forEach((item) => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
      const combined = Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
      await AsyncStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(combined.slice(0, 50)));
    } catch {
      // Cache failures shouldn't crash the app
    }
  });
  return cacheWriteQueue;
}

export async function fetchRecentApod(days: number = 8): Promise<ApodFetchResult> {
  // Let NASA choose the end date; include an extra UTC day for timezone boundaries.
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  const startDate = start.toISOString().slice(0, 10);
  const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&start_date=${encodeURIComponent(startDate)}&thumbs=true`;

  try {
    const response = await fetch(url);

    if (response.status === 429) {
      const cached = await getCachedApodItems();
      return {
        items: cached.length > 0 ? cached : CATALOG,
        isFallback: true,
        isRateLimited: true,
        error: 'NASA API rate limit reached (DEMO_KEY). Showing cached / offline archive.',
      };
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `NASA API error: ${response.status}`;
      try {
        const json = JSON.parse(errorBody);
        if (typeof json?.error?.message === 'string' && json.error.message) errorMsg = json.error.message;
        else if (typeof json?.msg === 'string' && json.msg) errorMsg = json.msg;
      } catch {}

      const cached = await getCachedApodItems();
      return {
        items: cached.length > 0 ? cached : CATALOG,
        isFallback: true,
        isRateLimited: errorMsg.toLowerCase().includes('rate limit'),
        error: errorMsg,
      };
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid NASA APOD response');
    const mapped = data
      .filter((entry): entry is NasaApodRaw => isValidNasaApodRaw(entry))
      .map(mapApodToSpaceItem)
      .reverse()
      .slice(0, days); // Newest first
    if (mapped.length === 0) throw new Error('Invalid NASA APOD response');

    await saveCachedApodItems(mapped);

    return {
      items: mapped,
      isFallback: false,
      isRateLimited: false,
    };
  } catch (err: any) {
    const cached = await getCachedApodItems();
    return {
      items: cached.length > 0 ? cached : CATALOG,
      isFallback: true,
      isRateLimited: false,
      error: err?.message || 'Network error fetching NASA APOD',
    };
  }
}

export async function fetchApodByDate(date: string): Promise<SpaceItem | null> {
  if (!isIsoDate(date)) return null;
  const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&date=${encodeURIComponent(date)}&thumbs=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!isValidNasaApodRaw(data, date)) return null;
    const item = mapApodToSpaceItem(data);
    await saveCachedApodItems([item]);
    return item;
  } catch {
    return null;
  }
}
