"use client";

import React, { useEffect, useState } from "react";
import { getHotel, Hotel } from "@/lib/api";
import FavoriteButton from "@/components/FavoriteButton";

interface HotelPageProps {
  params: {
    hotelId: string;
  };
}

export default function HotelPage({ params }: HotelPageProps) {
  const hotelId = params?.hotelId;

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hotel Information</h1>
        <HotelDetailClient hotelId={hotelId} />
      </div>
    </main>
  );
}

function HotelDetailClient({ hotelId }: { hotelId: string }) {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHotelData() {
      if (!hotelId) {
        if (isMounted) {
          setError("not_found");
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        // Using the imported getHotel function
        const data = await getHotel({ hotelId });
        
        if (isMounted) {
          setHotel(data);
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.message === "NOT_FOUND" || err.message?.includes("404")) {
            setError("not_found");
          } else {
            setError(err.message || "Failed to load hotel details.");
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHotelData();

    return () => {
      isMounted = false;
    };
  }, [hotelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-sm text-slate-500 animate-pulse">Loading hotel details...</p>
      </div>
    );
  }

  // Graceful 404 Not Found UI
  if (error === "not_found") {
    return (
      <div className="p-8 text-center rounded-lg border bg-white shadow-sm">
        <p className="text-lg font-semibold text-slate-800">Hotel Not Found</p>
        <p className="text-sm text-slate-500 mt-1">
          We couldn&apos;t find a hotel matching ID <span className="font-mono font-medium text-slate-700">{hotelId}</span>. It may have been removed or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200">
        Error: {error}
      </div>
    );
  }

  if (!hotel) {
    return <p className="text-sm text-slate-500">Hotel not found.</p>;
  }

 return (
    <div className="flex items-start justify-between gap-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {/* Add the Favorite Button here */}
          {hotelId && <FavoriteButton hotelId={hotelId} initialIsFavorite={hotel.favorite}/>}
          
          <p className="font-medium text-lg">{hotel.name}</p>
        </div>

        <p className="text-xs uppercase tracking-wide text-slate-500 pl-9">
          Chain: {hotel.chainCode}
          {hotel.category ? ` · ${hotel.category}` : ""}
          {hotel.beds ? ` · ${hotel.beds} bed${hotel.beds > 1 ? "s" : ""}` : ""}
          {hotel.bedType ? ` (${hotel.bedType})` : ""}
        </p>
        <p className="text-xs text-slate-400 mt-1 pl-9">
          Coords: {hotel.latitude}, {hotel.longitude}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {hotel.basePrice ? (
          <p className="font-mono text-base font-semibold">
            {hotel.basePrice} {hotel.currency}
          </p>
        ) : (
          <p className="text-xs text-slate-500">no price</p>
        )}
      </div>
    </div>
  );
}