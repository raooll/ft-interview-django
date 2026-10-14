// app/favorites/page.tsx
import { cookies } from "next/headers";
import { FavoriteItem, getFavorites, getHotel } from "@/lib/api";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  let favorites:FavoriteItem[] = [];
  let error: string | null = null;

  try {
    favorites = await getFavorites(token);
  } catch (err: any) {
    error = err.message || "Failed to load favorites";
  }

  // Fetch full details for each favorited hotel in parallel
  const hotelPromises = favorites.map(async (fav) => {
    try {
      return await getHotel({ hotelId: fav.hotel_id }, token);
    } catch {
      return null;
    }
  });

  const hotels = (await Promise.all(hotelPromises)).filter(Boolean);

  return (
    <main className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Favorite Hotels</h1>
        <p className="text-sm text-slate-500">Manage and view all the hotels you have saved.</p>
      </div>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error} (Please make sure you are logged in)
        </div>
      )}

      {!error && hotels.length === 0 ? (
        <div className="text-center py-12 space-y-3 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-sm">You haven't added any hotels to your favorites yet.</p>
          <Link
            href="/"
            className="inline-block rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Search Hotels
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {hotels.map((hotel: any) => (
            <li
              key={hotel.hotelId}
              className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <FavoriteButton hotelId={hotel.hotelId} initialIsFavorite={true} />
                <div>
                  <Link
                    href={`/hotels/${hotel.hotelId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline text-blue-600 text-base"
                  >
                    {hotel.name}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {hotel.cityCode}
                    {hotel.category ? ` · ${hotel.category.replace(/_/g, " ")}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {hotel.basePrice ? (
                  <p className="font-mono text-base font-semibold text-slate-900">
                    {hotel.basePrice} {hotel.currency}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">no price</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}