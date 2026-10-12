"use client";

import { useState } from "react";
import {
  searchHotels,
  type HotelOffer,
  type HotelSearchResponse,
} from "@/lib/api";

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
    <main className="space-y-8">
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
            className="self-end rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
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
  if (data.count === 0) {
    return (
      <p className="text-sm text-slate-600">
        No offers returned for {data.query.cityCode} on {data.query.checkInDate}
        . Try a different city or date.
      </p>
    );
  }
  return (
    <section>
      <h2 className="mb-3 text-lg font-medium">
        {data.count} offer{data.count === 1 ? "" : "s"} for {data.query.cityCode}
      </h2>
      <ul className="space-y-3">
        {data.results.map((offer, i) => (
          <li
            key={(offer.hotel?.hotelId as string) ?? i}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <HotelCard offer={offer} />
          </li>
        ))}
      </ul>
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

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">
          {cityCode}
          {category ? ` · ${category}` : ""}
          {beds ? ` · ${beds} bed${beds > 1 ? "s" : ""}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {price ? (
          <p className="font-mono text-base">
            {price} {currency}
          </p>
        ) : (
          <p className="text-xs text-slate-500">no price</p>
        )}
      </div>
    </div>
  );
}
