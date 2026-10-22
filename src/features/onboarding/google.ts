"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { signupApi, type GoogleProfile } from "@/lib/api/signup";

/**
 * "Continue with Google" with Google Identity Services (OAuth token client, popup):
 * the browser gets an access token for this site's client id, the back end checks it
 * with Google (pjActionSignupGoogle) and logs the host in or starts a new sign-up.
 * Client id: NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local, or app/config/google.php in the back end
 * (the back end's value wins when both are set).
 */

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleOAuth2 {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    prompt?: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: { type?: string; message?: string }) => void;
  }): { requestAccessToken(overrides?: { prompt?: string }): void };
}

declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth2 } };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let clientIdRequest: Promise<string> | null = null;
let scriptRequest: Promise<void> | null = null;

/** Client id set in Next.js (.env.local: NEXT_PUBLIC_GOOGLE_CLIENT_ID). */
export const ENV_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";

/**
 * Google OAuth client id: NEXT_PUBLIC_GOOGLE_CLIENT_ID, otherwise the back end's app/config/google.php
 * ("" when neither is set, or the back end can't be reached).
 */
export function loadGoogleClientId(): Promise<string> {
  clientIdRequest ??= ENV_GOOGLE_CLIENT_ID
    ? Promise.resolve(ENV_GOOGLE_CLIENT_ID)
    : signupApi.authConfig().then((result) => (result.ok ? result.data.google_client_id : ""));
  return clientIdRequest;
}

/** true / false once known, null while loading. */
export function useGoogleAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void loadGoogleClientId().then((id) => active && setAvailable(Boolean(id)));
    return () => {
      active = false;
    };
  }, []);
  return available;
}

function loadScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  scriptRequest ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptRequest = null;
      reject(new Error("Google sign-in could not be loaded. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return scriptRequest;
}

export class GoogleCancelled extends Error {}

/** Opens Google's account chooser and resolves with an access token (rejects with a readable message). */
export async function requestGoogleAccessToken(): Promise<string> {
  const clientId = await loadGoogleClientId();
  if (!clientId) throw new Error("Google sign-in isn't set up yet. Please use your e-mail.");
  await loadScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) throw new Error("Google sign-in could not be loaded. Please try again.");
  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      prompt: "select_account",
      callback: (response) => {
        if (response.access_token) resolve(response.access_token);
        else reject(new Error(response.error_description || "Google sign-in failed. Please try again."));
      },
      error_callback: (error) => {
        if (error.type === "popup_closed") reject(new GoogleCancelled("cancelled"));
        else if (error.type === "popup_failed_to_open")
          reject(new Error("Your browser blocked the Google window. Allow pop-ups for this site and try again."));
        else reject(new Error("Google sign-in failed. Please try again."));
      },
    });
    client.requestAccessToken();
  });
}

/* A Google account that still needs step 1 (WhatsApp number): kept in memory only, never stored. */

export interface PendingGoogle extends GoogleProfile {
  accessToken: string;
  /** Client id the token was issued for (sent along while the back end has none configured). */
  clientId: string;
}

let pending: PendingGoogle | null = null;
const listeners = new Set<() => void>();

export function setPendingGoogle(value: PendingGoogle | null) {
  pending = value;
  listeners.forEach((listener) => listener());
}

export function usePendingGoogle(): PendingGoogle | null {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pending,
    () => null,
  );
}
