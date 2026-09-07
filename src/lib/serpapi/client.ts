import { getSettingsService } from "@/lib/settings/service";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";

export type SerpApiParams = Record<
  string,
  boolean | number | string | null | undefined
>;

export async function searchSerpApi<T>(
  params: SerpApiParams,
  signal?: AbortSignal,
): Promise<T> {
  const apiKey = getSettingsService().getRaw().serpapi.apiKey.value;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY no configurado");
  }

  const url = new URL(SERPAPI_ENDPOINT);
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`SerpAPI respondió con HTTP ${response.status}`);
  }

  const body = (await response.json()) as T & { error?: string };
  if (body.error) {
    throw new Error(`SerpAPI: ${body.error}`);
  }
  return body;
}
