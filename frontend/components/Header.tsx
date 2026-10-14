// components/Header.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { username, logout, openAuthModal } = useAuth();

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <Link
          href="/"
          className="text-xl font-semibold transition-colors hover:text-slate-700"
        >
          FT Interview — Hotels
        </Link>
        <p className="text-xs text-slate-500">Django + Next.js</p>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        

        {username ? (
          <>
          <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          Search
        </Link>
            <Link
              href="/favorites"
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              ⭐ Favorites
            </Link>

            <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4">
              <span className="text-sm font-semibold text-slate-700">
                Hi, {username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Log Out
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-400 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-slate-800 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Register
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}