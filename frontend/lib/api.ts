export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HotelSearchParams = {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
};

/** Result shape is the raw Amadeus hotel-offer object (kept untyped on purpose
 *  — candidates can model it themselves). */
export type HotelOffer = Record<string, unknown> & {
  hotel?: { name?: string; cityCode?: string; hotelId?: string };
  offers?: Array<{
    price?: { total?: string; currency?: string };
    room?: { typeEstimated?: { category?: string; beds?: number } };
  }>;
};

export type HotelSearchResponse = {
  query: HotelSearchParams;
  count: number;
  results: HotelOffer[];
};

export async function searchHotels(
  params: HotelSearchParams,
): Promise<HotelSearchResponse> {
  const url = new URL(`${API_URL}/api/hotels/search`);
  url.searchParams.set("cityCode", params.cityCode);
  url.searchParams.set("checkInDate", params.checkInDate);
  url.searchParams.set("checkOutDate", params.checkOutDate);
  url.searchParams.set("adults", String(params.adults));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Search failed (${res.status}): ${body}`);
  }
  return res.json();
}
