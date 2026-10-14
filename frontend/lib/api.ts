// lib/api.ts

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HotelSearchParams = {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
};

export type GetHotelParam = {
  hotelId: string;
};

export type Hotel = {
  hotelId: string;
  name: string;
  chainCode: string;
  latitude: number;
  longitude: number;
  basePrice: number;
  currency: string;
  category: string;
  beds: number;
  bedType: string;
  favorite: boolean;
};

export type HotelOffer = Record<string, unknown> & {
  hotel?: { name?: string; cityCode?: string; hotelId?: string; favorite: boolean };
  offers?: Array<{
    price?: { total?: string; currency?: string };
    room?: { typeEstimated?: { category?: string; beds?: number , bedType?: string} };
  }>;
};

export type HotelSearchResponse = {
  query: HotelSearchParams;
  count: number;
  results: HotelOffer[];
};

/**
 * Helper to retrieve token from explicit argument or browser document.cookie
 */
function getAuthToken(explicitToken?: string): string | null {
  if (explicitToken) return explicitToken;

  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
    if (match) return match[2];
  }

  return null;
}

export async function searchHotels(
  params: HotelSearchParams,
  token?: string
): Promise<HotelSearchResponse> {
  const url = new URL(`${API_URL}/api/hotels/search`);
  url.searchParams.set("cityCode", params.cityCode);
  url.searchParams.set("checkInDate", params.checkInDate);
  url.searchParams.set("checkOutDate", params.checkOutDate);
  url.searchParams.set("adults", String(params.adults));

  const headers: Record<string, string> = {};
  const authToken = getAuthToken(token);
  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const res = await fetch(url.toString(), { headers, cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search failed (${res.status}): ${body}`);
  }
  return res.json();
}

export async function getHotel(
  params: GetHotelParam,
  token?: string
): Promise<Hotel> {
  const url = new URL(`${API_URL}/api/hotels/${params.hotelId}`);

  const headers: Record<string, string> = {};
  const authToken = getAuthToken(token);
  
  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const res = await fetch(url.toString(), { 
    headers, 
    credentials: "include", // Crucial for sending HttpOnly cookies from browser client-side fetches
    cache: "no-store" 
  });
  
  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search failed (${res.status}): ${body}`);
  }
  
  return res.json();
}

/* ==========================================================================
   FAVORITES API FUNCTIONS
   ========================================================================== */

export interface FavoriteItem {
  id: number;
  hotel_id: string;
  created_at: string;
}

export async function getFavorites(token?: string): Promise<FavoriteItem[]> {
  const authToken = getAuthToken(token);
  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const response = await fetch(`${API_URL}/api/hotels/favorites/`, {
    method: "GET",
    headers,
    credentials: "include", // Ensures HttpOnly cookies are sent with client fetch!
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Failed to fetch favorites");
  }

  return response.json();
}

export async function addFavorite(hotelId: string, token?: string): Promise<FavoriteItem> {
  const authToken = getAuthToken(token);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const response = await fetch(`${API_URL}/api/hotels/favorites/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ hotel_id: hotelId }),
    credentials: "include", // Ensures HttpOnly cookies are sent!
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Failed to add favorite");
  }

  return response.json();
}

export async function removeFavorite(hotelId: string, token?: string): Promise<boolean> {
  const authToken = getAuthToken(token);
  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`;
  }

  const response = await fetch(`${API_URL}/api/hotels/favorites/${hotelId}/`, {
    method: "DELETE",
    headers,
    credentials: "include", // Ensures HttpOnly cookies are sent!
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.error || "Failed to remove favorite");
  }

  return true;
}