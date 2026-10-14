"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export default function HotelFilters({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const minPrice = searchParams.minPrice ?? "";
  const maxPrice = searchParams.maxPrice ?? "";
  const category = searchParams.category ?? "ALL";
  const bedType = searchParams.bedType ?? "ALL";
  const minBeds = searchParams.minBeds ?? "";

  const [priceError, setPriceError] = useState<string | null>(null);
  const [bedsError, setBedsError] = useState<string | null>(null);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (!value || value === "ALL") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleMinPriceChange = (val: string) => {
    if (val !== "" && Number(val) < 0) return;
    if (maxPrice !== "" && Number(val) > Number(maxPrice)) {
      setPriceError("Min price cannot exceed Max price.");
    } else {
      setPriceError(null);
    }
    updateParam("minPrice", val);
  };

  const handleMaxPriceChange = (val: string) => {
    if (val !== "" && Number(val) < 0) return;
    if (minPrice !== "" && Number(val) < Number(minPrice)) {
      setPriceError("Max price cannot be less than Min price.");
    } else {
      setPriceError(null);
    }
    updateParam("maxPrice", val);
  };

  const handleMinBedsChange = (val: string) => {
    const num = Number(val);
    if (val !== "" && (isNaN(num) || num < 1 || num > 10)) {
      setBedsError("Beds must be between 1 and 10.");
    } else {
      setBedsError(null);
    }
    updateParam("minBeds", val);
  };

  const handleResetFilters = () => {
    const params = new URLSearchParams(window.location.search);
    ["minPrice", "maxPrice", "category", "bedType", "minBeds"].forEach((k) =>
      params.delete(k)
    );
    setPriceError(null);
    setBedsError(null);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const hasActiveFilters =
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    category !== "ALL" ||
    bedType !== "ALL" ||
    Boolean(minBeds);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Filter Results {isPending && <span className="text-xs text-slate-400 ml-2">Updating...</span>}
          </h3>
          <p className="text-xs text-slate-500">Refine available hotel inventory</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {hasActiveFilters && (
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 font-medium mr-1">Active:</span>
              {minPrice && <span className="bg-slate-200 px-2 py-0.5 rounded-md">Min: {minPrice}</span>}
              {maxPrice && <span className="bg-slate-200 px-2 py-0.5 rounded-md">Max: {maxPrice}</span>}
              {category !== "ALL" && <span className="bg-slate-200 px-2 py-0.5 rounded-md">{category}</span>}
              {bedType !== "ALL" && <span className="bg-slate-200 px-2 py-0.5 rounded-md">Bed: {bedType}</span>}
              {minBeds && <span className="bg-slate-200 px-2 py-0.5 rounded-md">Beds ≥ {minBeds}</span>}
            </div>
          )}

          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-40"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Min Price</span>
          <input
            type="number"
            min={0}
            placeholder="0"
            defaultValue={minPrice}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 bg-white"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium ">Max Price</span>
          <input
            type="number"
            min={0}
            placeholder="e.g. 1000"
            defaultValue={maxPrice}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1"
          />
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Category</span>
          <select
            defaultValue={category}
            onChange={(e) => updateParam("category", e.target.value)}
             className="rounded border border-slate-300 px-2 py-1"
          >
            <option value="ALL">All Categories</option>
            <option value="STANDARD_ROOM">Standard Room</option>
            <option value="SUPERIOR_ROOM">Superior Room</option>
            <option value="DELUXE_ROOM">Deluxe Room</option>
          </select>
        </label>

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Bed Type</span>
          <select
            defaultValue={bedType}
            onChange={(e) => updateParam("bedType", e.target.value)}
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

        <label className="flex flex-col text-sm">
          <span className="mb-1 font-medium text-slate-700">Min Beds</span>
          <input
            type="number"
            min={1}
            max={10}
            placeholder="1"
            defaultValue={minBeds}
            onChange={(e) => handleMinBedsChange(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 bg-white"
          />
        </label>
      </div>

      {(priceError || bedsError) && (
        <div className="text-xs text-red-600 font-medium space-y-1 pt-1">
          {priceError && <p>• {priceError}</p>}
          {bedsError && <p>• {bedsError}</p>}
        </div>
      )}
    </div>
  );
}