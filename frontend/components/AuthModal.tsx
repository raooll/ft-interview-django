// components/AuthModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginAction, registerAction } from "@/actions/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialTab = "login", onSuccess }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(initialTab === "login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setIsLoginTab(initialTab === "login");
    setError(null);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;

    try {
      let result;
      if (isLoginTab) {
        result = await loginAction(formData);
      } else {
        result = await registerAction(formData);
      }

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      
      login(username);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (err.message?.includes("NEXT_REDIRECT")) {
        onClose();
        if (onSuccess) onSuccess();
        return;
      }
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

return (
  <dialog
    ref={dialogRef}
    onClose={onClose}
    className="m-auto w-[calc(100%-2rem)] max-w-lg bg-transparent p-0 backdrop:bg-black/50 backdrop:backdrop-blur-sm focus:outline-none"
  >
    <div className="flex max-h-[90vh] w-full flex-col gap-7 overflow-y-auto rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-2xl sm:px-10 sm:py-12">
      {/* Header & Close Button */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-7">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {isLoginTab ? "Welcome Back" : "Create Account"}
          </h3>
          <p className="text-sm text-slate-500 sm:text-base">
            {isLoginTab
              ? "Log in to access your favorites."
              : "Sign up to save your favorite hotels."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-2 -mt-2 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-3xl leading-none text-slate-400 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          &times;
        </button>
      </div>

      {/* Tab Switcher */}
      <div
        role="tablist"
        className="flex w-full flex-row gap-1.5 rounded-2xl bg-slate-100 p-1.5 text-base font-medium"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isLoginTab}
          onClick={() => {
            setIsLoginTab(true);
            setError(null);
          }}
          className={`inline-flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-6 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
            isLoginTab
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLoginTab}
          onClick={() => {
            setIsLoginTab(false);
            setError(null);
          }}
          className={`inline-flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-6 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
            !isLoginTab
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          Register
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-base text-red-700"
        >
          {error}
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="auth-username" className="text-base font-medium text-slate-700">
            Username
          </label>
          <input
            id="auth-username"
            name="username"
            required
            autoComplete="username"
            disabled={loading}
            placeholder="johndoe"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-900 shadow-sm transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {!isLoginTab && (
          <div className="flex flex-col gap-2.5">
            <label htmlFor="auth-email" className="text-base font-medium text-slate-700">
              Email
            </label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required={!isLoginTab}
              autoComplete="email"
              disabled={loading}
              placeholder="john@example.com"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-900 shadow-sm transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <label htmlFor="auth-password" className="text-base font-medium text-slate-700">
            Password
          </label>
          <input
            id="auth-password"
            name="password"
            type="password"
            required
            autoComplete={isLoginTab ? "current-password" : "new-password"}
            disabled={loading}
            placeholder="••••••••"
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-5 text-base text-slate-900 shadow-sm transition-all duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-6 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-slate-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? "Processing..." : isLoginTab ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  </dialog>
);
}