import { CATALOG } from '@/data/catalog';
import { Category, SpaceItem } from '@/types/space';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_STORAGE_KEY = '@space_explorer/apod_cache';
const API_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY?.trim() ?? '';
const HAS_API_KEY = API_KEY.length > 0 && API_KEY !== 'DEMO_KEY';
const MISSING_KEY_ERROR = 'NASA API key missing. Set EXPO_PUBLIC_NASA_API_KEY in .env and restart with `npx expo start -c`.';
const BASE_URL = 'https://api.nasa.gov/planetary/apod';
// APOD moved to science.nasa.gov; its WordPress feed is the fallback source.
// Past this, treat api.nasa.gov as not working well and switch to science.nasa.gov.
const API_TIMEOUT_MS = 2000;
const SCIENCE_URL = 'https://science.nasa.gov/wp-json/wp/v2/image-article';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
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
  // Set when api.nasa.gov failed and science.nasa.gov supplied the items instead.
  notice?: string;
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

// api.nasa.gov still scrapes the retired apod.nasa.gov pages and returns the site logo for every date.
function isPlaceholderApod(raw: Partial<NasaApodRaw>): boolean {
  return [raw.url, raw.hdurl].some((u) => typeof u === 'string' && u.includes('/nasa-logo'));
}

function isValidNasaApodRaw(value: unknown, expectedDate?: string): value is NasaApodRaw {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const raw = value as Partial<NasaApodRaw>;
  return (
    !isPlaceholderApod(raw) &&
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
    !isPlaceholderApod({ url: item.url, hdurl: item.hdurl }) &&
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

interface SciencePost {
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url?: string }[] };
}

function decodeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+([.,;:!?)])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Slugs look like "apod-2026-september-30-arp-78-peculiar-galaxy-in-aries".
function dateFromSlug(slug: string): string | null {
  const match = /^apod-(\d{4})-([a-z]+)-(\d{1,2})-/.exec(slug);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month < 0) return null;
  const date = `${match[1]}-${String(month + 1).padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  return isIsoDate(date) ? date : null;
}

// The feed's per-size URLs all point at the full image, so ask the image service for a width instead.
function sizedImage(url: string, width: number): string {
  return `${url}${url.includes('?') ? '&' : '?'}w=${width}&fit=clip`;
}

function mapSciencePost(post: SciencePost): SpaceItem | null {
  const date = dateFromSlug(post.slug ?? '');
  const full = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (!date || !full) return null;

  const title = decodeHtml(post.title?.rendered ?? '').replace(/^APOD:\s*\d{4} \w+ \d{1,2}\s*[–-]\s*/, '');
  const text = decodeHtml(post.content?.rendered ?? '');
  // Most posts label the body "Explanation:"; the rest start it right after the title.
  const titleEnd = title ? text.indexOf(title) : -1;
  const body = text.includes('Explanation:')
    ? text.slice(text.indexOf('Explanation:') + 'Explanation:'.length)
    : titleEnd >= 0
      ? text.slice(titleEnd + title.length)
      : '';
  const explanation = /^\s*(.*?)\s*(?:Tomorrow['’]s picture|APOD['’]s (?:email|main)|\bDate [A-Z][a-z]+ \d|\bCredit\b|$)/
    .exec(body)?.[1]
    ?.trim();
  const credit = /Credit(?:\s*&\s*Copyright)?\s*:?\s*(.*?)\s*Authors\b/.exec(text)?.[1];
  if (!title || !explanation) return null;

  return {
    id: date,
    date,
    title,
    explanation,
    credit: credit || 'NASA',
    url: sizedImage(full, 1600),
    hdurl: full,
    thumbnail: sizedImage(full, 600),
    mediaType: 'image',
    category: inferCategory(title, explanation),
  };
}

async function fetchSciencePosts(search: string, perPage: number): Promise<SpaceItem[]> {
  const url = `${SCIENCE_URL}?search=${encodeURIComponent(search)}&per_page=${perPage}&_embed=wp:featuredmedia&_fields=slug,title,content,_links,_embedded`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`NASA Science error: ${response.status}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Invalid NASA Science response');
  const byDate = new Map<string, SpaceItem>();
  for (const post of data as SciencePost[]) {
    const item = mapSciencePost(post);
    if (item && isValidSpaceItem(item) && !byDate.has(item.id)) byDate.set(item.id, item);
  }
  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// api.nasa.gov is the primary source; science.nasa.gov takes over when it fails, stalls, or sends placeholders.
export async function fetchRecentApod(days: number = 8): Promise<ApodFetchResult> {
  const apiResult = await fetchRecentFromApi(days);
  if (!apiResult.isFallback) return apiResult;

  try {
    const items = (await fetchSciencePosts('apod', Math.min(days, 50))).slice(0, days);
    if (items.length > 0) {
      await saveCachedApodItems(items);
      const reason = (apiResult.error ?? '').replace(/\s*Showing cached \/ offline archive\.?$/, '').replace(/\.$/, '');
      return {
        items,
        isFallback: false,
        isRateLimited: false,
        notice: `api.nasa.gov isn't working${reason ? `: ${reason}` : ''}. Switched to science.nasa.gov.`,
      };
    }
  } catch {
    // Both sources failed; keep the api.nasa.gov error and fallback items.
  }
  return apiResult;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (err: any) {
    if (controller.signal.aborted) throw new Error(`NASA API did not respond within ${timeoutMs / 1000}s`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRecentFromApi(days: number): Promise<ApodFetchResult> {

  // Let NASA choose the end date; include an extra UTC day for timezone boundaries.
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - days);
  const startDate = start.toISOString().slice(0, 10);
  if (!HAS_API_KEY) {
    const cached = await getCachedApodItems();
    return {
      items: cached.length > 0 ? cached : CATALOG,
      isFallback: true,
      isRateLimited: false,
      error: MISSING_KEY_ERROR,
    };
  }
  const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&start_date=${encodeURIComponent(startDate)}&thumbs=true`;

  try {
    const response = await fetchWithTimeout(url, API_TIMEOUT_MS);

    if (response.status === 429) {
      const cached = await getCachedApodItems();
      return {
        items: cached.length > 0 ? cached : CATALOG,
        isFallback: true,
        isRateLimited: true,
        error: 'NASA API rate limit reached. Showing cached / offline archive.',
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
    if (mapped.length === 0) {
      throw new Error('NASA APOD API is returning placeholder data (logo only). Showing cached / offline archive.');
    }

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
  return (await fetchApiByDate(date)) ?? (await fetchScienceByDate(date));
}

async function fetchApiByDate(date: string): Promise<SpaceItem | null> {
  if (!HAS_API_KEY) return null;
  const url = `${BASE_URL}?api_key=${encodeURIComponent(API_KEY)}&date=${encodeURIComponent(date)}&thumbs=true`;

  try {
    const response = await fetchWithTimeout(url, API_TIMEOUT_MS);
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

async function fetchScienceByDate(date: string): Promise<SpaceItem | null> {
  try {
    const [year, month, day] = date.split('-').map(Number);
    const posts = await fetchSciencePosts(`APOD: ${year} ${MONTHS[month - 1]} ${day}`, 5);
    const item = posts.find((post) => post.date === date);
    if (!item) return null;
    await saveCachedApodItems([item]);
    return item;
  } catch {
    return null;
  }
}
