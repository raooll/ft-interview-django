"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { 
        error: data.non_field_errors?.[0] || data.error || data.detail || "Invalid credentials" 
      };
    }

    // Securely set the HttpOnly cookie on the Next.js server
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

  } catch (err) {
    return { error: "Network error connecting to authentication server." };
  }

  // Redirect or return success after setting cookie
  redirect("/");
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const email = formData.get("email") as string;

  try {
    const response = await fetch(`${API_URL}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data.username?.[0] ||
        data.password?.[0] ||
        data.email?.[0] ||
        data.error ||
        "Registration failed";
      return { error: errorMsg };
    }

    // Securely set HttpOnly cookie upon successful registration
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

  } catch (err) {
    return { error: "Network error during registration." };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  redirect("/");
}