import { API_URLS } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let workingUrl: string | null = null;

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

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 401) {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    }
    try {
      const errJson = JSON.parse(errText);
      throw new Error(JSON.stringify(errJson));
    } catch {
      throw new Error(errText || `HTTP ${res.status}`);
    }
  }
  return (await res.json()) as T;
}
