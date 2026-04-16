import { environment } from '../../environments/environment';

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

export const API_BASE_URL = normalizeBaseUrl(environment.apiBaseUrl);

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildAssetUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function buildAppUrl(path: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
