import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

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
        <AuthProvider>
          <div className="mx-auto max-w-5xl px-6 py-8">
            <Header />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}