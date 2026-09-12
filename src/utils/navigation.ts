import { Href } from 'expo-router';

export function detailsHref(id: string): Href {
  return { pathname: '/details/[id]', params: { id } };
}
