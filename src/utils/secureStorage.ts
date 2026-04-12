import * as SecureStore from "expo-secure-store";

// Clés stockées de façon sécurisée (Keychain iOS / Keystore Android)
const SECURE_KEYS = ["token", "refreshToken", "user"] as const;
type SecureKey = (typeof SECURE_KEYS)[number];

function isSecureKey(key: string): key is SecureKey {
  return (SECURE_KEYS as readonly string[]).includes(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isSecureKey(key)) {
    await SecureStore.setItemAsync(key, value);
  } else {
    throw new Error(`secureStorage: clé non autorisée "${key}"`);
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (isSecureKey(key)) {
    return SecureStore.getItemAsync(key);
  }
  return null;
}

export async function removeItem(key: string): Promise<void> {
  if (isSecureKey(key)) {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function multiRemove(keys: string[]): Promise<void> {
  await Promise.all(keys.map((k) => removeItem(k)));
}
