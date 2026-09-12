export type MediaKind = 'image' | 'video';
export type Category = 'galaxy' | 'nebula' | 'planet' | 'earth' | 'moon';
export type MediaFilter = 'all' | MediaKind;
export type CategoryFilter = 'all' | Category;

export type SpaceItem = {
  id: string;
  date: string;
  title: string;
  explanation: string;
  credit: string;
  url: string;
  hdurl?: string;
  mediaType: MediaKind;
  category: Category;
  thumbnail?: string;
};

export function previewUrl(item: SpaceItem): string {
  return item.thumbnail || item.url;
}
