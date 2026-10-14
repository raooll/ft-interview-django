"use client";

import { useState, useMemo } from "react";
import {
  searchHotels,
  type HotelOffer,
  type HotelSearchResponse,
} from "@/lib/api";

import Link from "next/link";

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Page() {
  const [cityCode, setCityCode] = useState("PAR");
  const [checkInDate, setCheckInDate] = useState(isoDateOffset(7));
  const [checkOutDate, setCheckOutDate] = useState(isoDateOffset(9));
  const [adults, setAdults] = useState(1);
  const [data, setData] = useState<HotelSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await searchHotels({
        cityCode: cityCode.trim().toUpperCase(),
        checkInDate,
        checkOutDate,
        adults,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-5"
        >
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">City (IATA)</span>
            <input
              required
              value={cityCode}
              onChange={(e) => setCityCode(e.target.value)}
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
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Check-out</span>
            <input
              required
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium">Adults</span>
            <input
              required
              type="number"
              min={1}
              max={9}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="rounded border border-slate-300 px-2 py-1"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="self-end rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-slate-800 transition-colors"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      </section>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {data && <Results data={data} />}
    </main>
  );
}

function Results({ data }: { data: HotelSearchResponse }) {
  // Filter States
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("ALL");
  const [bedType, setBedType] = useState<string>("ALL");
  const [minBeds, setMinBeds] = useState<string>("");

  // Validation Error States
  const [priceError, setPriceError] = useState<string | null>(null);
  const [bedsError, setBedsError] = useState<string | null>(null);

  // Filter Handlers with Validation
  const handleMinPriceChange = (val: string) => {
    if (val !== "" && Number(val) < 0) return;
    setMinPrice(val);

    const min = val !== "" ? Number(val) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    if (min !== null && max !== null && min > max) {
      setPriceError("Min price cannot exceed Max price.");
    } else {
      setPriceError(null);
    }
  };

  const handleMaxPriceChange = (val: string) => {
    if (val !== "" && Number(val) < 0) return;
    setMaxPrice(val);

    const max = val !== "" ? Number(val) : null;
    const min = minPrice !== "" ? Number(minPrice) : null;

    if (min !== null && max !== null && min > max) {
      setPriceError("Max price cannot be less than Min price.");
    } else {
      setPriceError(null);
    }
  };

  const handleMinBedsChange = (val: string) => {
    const num = Number(val);
    if (val !== "" && (isNaN(num) || num < 1 || num > 10)) {
      setBedsError("Beds must be between 1 and 10.");
      setMinBeds(val);
    } else {
      setBedsError(null);
      setMinBeds(val);
    }
  };

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setCategory("ALL");
    setBedType("ALL");
    setMinBeds("");
    setPriceError(null);
    setBedsError(null);
  };

  // Check if any filters are actively set
  const hasActiveFilters =
    minPrice !== "" ||
    maxPrice !== "" ||
    category !== "ALL" ||
    bedType !== "ALL" ||
    minBeds !== "";

  // Filter logic aligned with mock schema
  const filteredResults = useMemo(() => {
    if (priceError || bedsError) return data.results;

    const parsedMinPrice = minPrice !== "" ? Number(minPrice) : null;
    const parsedMaxPrice = maxPrice !== "" ? Number(maxPrice) : null;
    const parsedMinBeds = minBeds !== "" ? Number(minBeds) : null;

    return data.results.filter((offer) => {
      const topOffer = offer.offers?.[0];
      const rawPrice = topOffer?.price?.total;
      const price = rawPrice ? parseFloat(rawPrice) : null;

      const roomType = topOffer?.room?.typeEstimated;
      const offerCategory = roomType?.category ?? "";
      const offerBeds = roomType?.beds ?? 0;
      const offerBedType = roomType?.bedType ?? "";

      if (parsedMinPrice !== null && (price === null || price < parsedMinPrice)) {
        return false;
      }
      if (parsedMaxPrice !== null && (price === null || price > parsedMaxPrice)) {
        return false;
      }
      if (category !== "ALL" && offerCategory !== category) {
        return false;
      }
      if (bedType !== "ALL" && offerBedType !== bedType) {
        return false;
      }
      if (parsedMinBeds !== null && offerBeds < parsedMinBeds) {
        return false;
      }

      return true;
    });
  }, [data.results, minPrice, maxPrice, category, bedType, minBeds, priceError, bedsError]);

  if (data.count === 0) {
    return (
      <p className="text-sm text-slate-600">
        No offers returned for {data.query.cityCode} on {data.query.checkInDate}
        . Try a different city or date.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      {/* Filters Panel */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-4">
        {/* Header with Active Filters Summary & Reset Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Filter Results</h3>
            <p className="text-xs text-slate-500">Refine available hotel inventory</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Active Filters Summary Pills */}
            {hasActiveFilters && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium mr-1">Active:</span>
                {minPrice && (
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Min: {minPrice}
                  </span>
                )}
                {maxPrice && (
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Max: {maxPrice}
                  </span>
                )}
                {category !== "ALL" && (
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    {category.replace(/_/g, " ")}
                  </span>
                )}
                {bedType !== "ALL" && (
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Bed: {bedType}
                  </span>
                )}
                {minBeds && (
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                    Beds ≥ {minBeds}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters && !priceError && !bedsError}
              className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-40 disabled:hover:no-underline"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {/* Min Price */}
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium text-slate-700">Min Price</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className={`rounded border px-2 py-1 bg-white ${
                priceError ? "border-red-500 focus:ring-red-500" : "border-slate-300"
              }`}
            />
          </label>

          {/* Max Price */}
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium text-slate-700">Max Price</span>
            <input
              type="number"
              min={0}
              placeholder="e.g. 1000"
              value={maxPrice}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className={`rounded border px-2 py-1 bg-white ${
                priceError ? "border-red-500 focus:ring-red-500" : "border-slate-300"
              }`}
            />
          </label>

          {/* Room Category */}
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium text-slate-700">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 bg-white"
            >
              <option value="ALL">All Categories</option>
              <option value="STANDARD_ROOM">Standard Room</option>
              <option value="SUPERIOR_ROOM">Superior Room</option>
              <option value="DELUXE_ROOM">Deluxe Room</option>
            </select>
          </label>

          {/* Bed Type */}
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium text-slate-700">Bed Type</span>
            <select
              value={bedType}
              onChange={(e) => setBedType(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 bg-white"
            >
              <option value="ALL">All Bed Types</option>
              <option value="KING">King</option>
              <option value="QUEEN">Queen</option>
              <option value="DOUBLE">Double</option>
              <option value="TWIN">Twin</option>
              <option value="BUNK">Bunk</option>
            </select>
          </label>

          {/* Min Beds Count */}
          <label className="flex flex-col text-sm">
            <span className="mb-1 font-medium text-slate-700">Min Beds</span>
            <input
              type="number"
              min={1}
              max={10}
              placeholder="1"
              value={minBeds}
              onChange={(e) => handleMinBedsChange(e.target.value)}
              className={`rounded border px-2 py-1 bg-white ${
                bedsError ? "border-red-500 focus:ring-red-500" : "border-slate-300"
              }`}
            />
          </label>
        </div>

        {/* Validation Errors Display */}
        {(priceError || bedsError) && (
          <div className="text-xs text-red-600 font-medium space-y-1 pt-1">
            {priceError && <p>• {priceError}</p>}
            {bedsError && <p>• {bedsError}</p>}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Showing {filteredResults.length} of {data.count} offer{data.count === 1 ? "" : "s"} for {data.query.cityCode}
        </h2>
      </div>

      {/* Results List */}
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