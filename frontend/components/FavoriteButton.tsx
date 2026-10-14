// components/FavoriteButton.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addFavorite, removeFavorite } from "@/lib/api";

export default function FavoriteButton({ hotelId, initialIsFavorite = false }: { hotelId: string; initialIsFavorite?: boolean }) {
  const { username, openAuthModal } = useAuth();
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    // If the user is not logged in, open the auth modal
    if (!username) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    try {
      if (isFav) {
        await removeFavorite(hotelId);
        setIsFav(false);
      } else {
        await addFavorite(hotelId);
        setIsFav(true);
      }
    } catch (err) {
      console.error("Failed to update favorite status:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className="rounded-full border border-slate-200 bg-white p-2 text-lg shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
      title={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      {isFav ? "⭐" : "☆"}
    </button>
  );
}