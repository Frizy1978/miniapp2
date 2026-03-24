const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_PREFIX = "fh_catalog_cache_v2:";

type CacheEnvelope<T> = {
  data: T;
  timestamp: number;
};

export function readCatalogCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(`${CACHE_PREFIX}${key}`);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as CacheEnvelope<T>;

    if (Date.now() - parsed.timestamp > CATALOG_CACHE_TTL_MS) {
      window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return parsed.data;
  } catch {
    window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
}

export function writeCatalogCache<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: CacheEnvelope<T> = {
    data,
    timestamp: Date.now()
  };

  window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
}

export function preloadImages(urls: Array<string | null | undefined>) {
  if (typeof window === "undefined") {
    return;
  }

  for (const url of urls) {
    if (!url) {
      continue;
    }

    const image = new Image();
    image.src = url;
  }
}
