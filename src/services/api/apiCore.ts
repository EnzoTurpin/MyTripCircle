import { API_URLS } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let workingUrl: string | null = null;

// Callback déclenché quand le refresh échoue, pour notifier l'AuthContext de déconnecter l'utilisateur
let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedCallback(cb: () => void): void {
  onUnauthorizedCallback = cb;
}

export function clearUnauthorizedCallback(): void {
  onUnauthorizedCallback = null;
}

async function findWorkingUrl(): Promise<string> {
  if (workingUrl) return workingUrl;

  console.log("[ApiService] Starting to find working URL...");

  for (const url of API_URLS) {
    try {
      console.log(`[ApiService] Trying ${url}...`);
      const response = await fetch(`${url}/health`, { method: "GET" });
      if (response.ok) {
        workingUrl = url;
        console.log(`[ApiService] ✅ Success! Using URL: ${url}`);
        return url;
      } else {
        console.log(`[ApiService] ❌ ${url} returned status: ${response.status}`);
      }
    } catch (error: any) {
      console.log(`[ApiService] ❌ Failed to connect to ${url}: ${error?.message ?? String(error)}`);
    }
  }

  console.log("[ApiService] ❌ No working URL found!");
  throw new Error("No working API URL found. Make sure the backend is running.");
}

// Tente de renouveler l'access token via le refresh token.
// Retourne le nouveau token en cas de succès, null sinon.
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const baseUrl = await findWorkingUrl();
    const res = await fetch(`${baseUrl}/users/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.token) {
      await AsyncStorage.setItem("token", data.token);
      // Rotation : sauvegarde le nouveau refresh token si le serveur en a émis un
      if (data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", data.refreshToken);
      }
      return data.token;
    }
    return null;
  } catch {
    return null;
  }
}

async function clearSession(): Promise<void> {
  await AsyncStorage.multiRemove(["token", "refreshToken", "user"]);
  onUnauthorizedCallback?.();
}

export async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: any,
): Promise<T> {
  const baseUrl = await findWorkingUrl();
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Tentative de refresh silencieux avant de déconnecter
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Rejoue la requête originale avec le nouveau token
      const retryRes = await fetch(`${baseUrl}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (retryRes.ok) {
        return (await retryRes.json()) as T;
      }

      // Si la requête échoue à nouveau après refresh, on déconnecte
      if (retryRes.status === 401) {
        await clearSession();
        const errText = await retryRes.text();
        throw new Error(errText || `HTTP ${retryRes.status}`);
      }

      const retryErrText = await retryRes.text();
      try {
        throw new Error(JSON.stringify(JSON.parse(retryErrText)));
      } catch {
        throw new Error(retryErrText || `HTTP ${retryRes.status}`);
      }
    }

    // Pas de refresh token disponible ou refresh échoué → déconnexion
    await clearSession();
    const errText = await res.text();
    try {
      throw new Error(JSON.stringify(JSON.parse(errText)));
    } catch {
      throw new Error(errText || `HTTP ${res.status}`);
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      throw new Error(JSON.stringify(errJson));
    } catch {
      throw new Error(errText || `HTTP ${res.status}`);
    }
  }

  return (await res.json()) as T;
}
