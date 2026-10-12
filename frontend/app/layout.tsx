import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FT Interview — Hotels",
  description: "Hotel search powered by Amadeus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">FT Interview — Hotels</h1>
            <span className="text-xs text-slate-500">Django + Next.js</span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
