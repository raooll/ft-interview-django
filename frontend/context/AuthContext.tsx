// context/AuthContext.tsx
"use client";

import { logoutAction } from "@/actions/auth";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AuthModal from "@/components/AuthModal";

interface AuthContextType {
  username: string | null;
  login: (username: string) => void;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultTab?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalTab: "login" | "register";
}

const AuthContext = createContext<AuthContextType>({
  username: null,
  login: () => {},
  logout: async () => {},
  isAuthModalOpen: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  authModalTab: "login",
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  useEffect(() => {
    const savedUser = localStorage.getItem("authUsername");
    if (savedUser) setUsername(savedUser);
  }, []);

  // Debug log to monitor state changes
  useEffect(() => {
    console.log("🔍 AuthProvider State Change - isAuthModalOpen:", isAuthModalOpen, "authModalTab:", authModalTab);
  }, [isAuthModalOpen, authModalTab]);

  const login = (newUsername: string) => {
    localStorage.setItem("authUsername", newUsername);
    setUsername(newUsername);
  };

  const logout = async () => {
    localStorage.removeItem("authUsername");
    setUsername(null);
    await logoutAction();
  };

  const openAuthModal = (tab: "login" | "register" = "login") => {
    console.log("🟢 openAuthModal fired! Setting modal open to true with tab:", tab);
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    console.log("🔴 closeAuthModal fired!");
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        username,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalTab,
      }}
    >
      {children}
      
      {/* Embedded AuthModal so it renders globally at the DOM root */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);