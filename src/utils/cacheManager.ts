import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "@mtc_cache/";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

async function get<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.timestamp + entry.ttl) return null;
    return entry.data;
  } catch {
    return null;
  }
}

// Returns cached data even if expired (stale-while-revalidate)
async function getStale<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

async function set<T>(key: string, data: T, ttlMs: number): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl: ttlMs };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Silently ignore write failures (storage full, etc.)
  }
}

async function invalidate(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignore
  }
}

async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    // Ignore
  }
}

export const CacheManager = { get, getStale, set, invalidate, clearAll };

export const CACHE_KEYS = {
  TRIPS: "trips",
  BOOKINGS: "bookings",
  ADDRESSES: "addresses",
  FRIENDS: "friends",
  FRIEND_REQUESTS: "friend_requests",
  FRIEND_SUGGESTIONS: "friend_suggestions",
} as const;

export const CACHE_TTL = {
  TRIPS: 15 * 60 * 1000,
  BOOKINGS: 10 * 60 * 1000,
  ADDRESSES: 15 * 60 * 1000,
  FRIENDS: 30 * 60 * 1000,
  FRIEND_REQUESTS: 5 * 60 * 1000,
  FRIEND_SUGGESTIONS: 30 * 60 * 1000,
} as const;
