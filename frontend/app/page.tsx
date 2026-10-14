import { Suspense } from "react";
import { searchHotels, type HotelOffer, type HotelSearchResponse } from "@/lib/api";
import Link from "next/link";
import HotelFilters from "@/components/HotelFilters";

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

interface PageProps {
  searchParams: Promise<{
    cityCode?: string;
    checkInDate?: string;
    checkOutDate?: string;
    adults?: string;
    minPrice?: string;
    maxPrice?: string;
    category?: string;
    bedType?: string;
    minBeds?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const cityCode = params.cityCode ?? "PAR";
  const checkInDate = params.checkInDate ?? isoDateOffset(7);
  const checkOutDate = params.checkOutDate ?? isoDateOffset(9);
  const adults = params.adults ? Number(params.adults) : 1;

  return (
    <main className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
      {/* Search Form (Server-Driven via URL Navigation) */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">City (IATA)</span>
            <input
              required
              name="cityCode"
              defaultValue={cityCode}
              maxLength={3}
              className="rounded border border-slate-300 px-2 py-1 uppercase"
              placeholder="PAR"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Check-in</span>
            <input
              required
              type="date"
              name="checkInDate"
              defaultValue={checkInDate}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Check-out</span>
            <input
              required
              type="date"
              name="checkOutDate"
              defaultValue={checkOutDate}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Adults</span>
            <input
              required
              type="number"
              name="adults"
              min={1}
              max={9}
              defaultValue={adults}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      {/* Streaming Boundary */}
      <Suspense fallback={<SearchResultsSkeleton />}>
        <HotelResultsStream
          cityCode={cityCode}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          adults={adults}
          searchParams={params}
        />
      </Suspense>
    </main>
  );
}

async function HotelResultsStream({
  cityCode,
  checkInDate,
  checkOutDate,
  adults,
  searchParams,
}: {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  searchParams: Awaited<PageProps["searchParams"]>;
}) {
  let data: HotelSearchResponse;
  let error: string | null = null;

  try {
    data = await searchHotels({
      cityCode: cityCode.trim().toUpperCase(),
      checkInDate,
      checkOutDate,
      adults,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    data = { count: 0, query: { cityCode, checkInDate, checkOutDate, adults }, results: [] };
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  // Server-side filtering based on search parameters
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : null;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : null;
  const category = searchParams.category ?? "ALL";
  const bedType = searchParams.bedType ?? "ALL";
  const minBeds = searchParams.minBeds ? Number(searchParams.minBeds) : null;

  const filteredResults = data.results.filter((offer) => {
    const topOffer = offer.offers?.[0];
    const price = topOffer?.price?.total ? parseFloat(topOffer.price.total) : null;
    const roomType = topOffer?.room?.typeEstimated;

    if (minPrice !== null && (price === null || price < minPrice)) return false;
    if (maxPrice !== null && (price === null || price > maxPrice)) return false;
    if (category !== "ALL" && roomType?.category !== category) return false;
    if (bedType !== "ALL" && roomType?.bedType !== bedType) return false;
    if (minBeds !== null && (roomType?.beds ?? 0) < minBeds) return false;

    return true;
  });

  return (
    <section className="space-y-6">
      <HotelFilters searchParams={searchParams} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Showing {filteredResults.length} of {data.count} offer{data.count === 1 ? "" : "s"} for {data.query.cityCode}
        </h2>
      </div>

      {filteredResults.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">
          No hotels match your current filter criteria. Try adjusting your filters.
        </p>
      ) : (
        <ul className="space-y-3">
          {filteredResults.map((offer, i) => (
            <li
              key={(offer.hotel?.hotelId as string) ?? i}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all"
            >
              <HotelCard offer={offer} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-slate-100 rounded-lg" />
      <div className="h-6 w-48 bg-slate-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function HotelCard({ offer }: { offer: HotelOffer }) {
  const name = offer.hotel?.name ?? "Unknown hotel";
  const cityCode = offer.hotel?.cityCode ?? "—";
  const top = offer.offers?.[0];
  const price = top?.price?.total;
  const currency = top?.price?.currency;
  const beds = top?.room?.typeEstimated?.beds;
  const category = top?.room?.typeEstimated?.category;
  const bedType = top?.room?.typeEstimated?.bedType;
  const hotelId = offer.hotel?.hotelId;

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <Link
          href={`/hotels/${hotelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline text-blue-600 inline-flex items-center gap-1"
        >
          {name}
        </Link>
        <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">
          {cityCode}
          {category ? ` · ${category.replace(/_/g, " ")}` : ""}
          {beds ? ` · ${beds} bed${beds > 1 ? "s" : ""}` : ""}
          {bedType ? ` (${bedType})` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {price ? (
          <p className="font-mono text-base font-semibold text-slate-900">
            {price} {currency}
          </p>
        ) : (
          <p className="text-xs text-slate-500">no price</p>
        )}
      </div>
    </div>
  );
}