import { Sprint, Task } from '../types';

export interface SharedDashboardSnapshot {
  version: 'v1';
  generatedAt: number;
  tasks: Task[];
  sprints: Sprint[];
}

const SHARE_PARAM = 'shared';

const encodeBase64Url = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const decodeBase64Url = (value: string): string => {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const paddingLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(paddingLength);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

export const createSharedDashboardLink = (
  snapshot: SharedDashboardSnapshot,
  baseUrl?: string
): string => {
  const payload = JSON.stringify(snapshot);
  const encoded = encodeBase64Url(payload);
  const resolvedBaseUrl = baseUrl || `${window.location.origin}${window.location.pathname}`;

  return `${resolvedBaseUrl}?${SHARE_PARAM}=${encoded}`;
};

export const getSharedDashboardSnapshotFromUrl = (url?: string): SharedDashboardSnapshot | null => {
  try {
    const parsedUrl = new URL(url || window.location.href);
    const encoded = parsedUrl.searchParams.get(SHARE_PARAM);

    if (!encoded) return null;

    const payload = decodeBase64Url(encoded);
    const parsed = JSON.parse(payload) as SharedDashboardSnapshot;

    if (
      parsed.version !== 'v1'
      || !Array.isArray(parsed.tasks)
      || !Array.isArray(parsed.sprints)
      || typeof parsed.generatedAt !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};