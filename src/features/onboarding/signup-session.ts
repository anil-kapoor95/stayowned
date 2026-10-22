"use client";

import { useSyncExternalStore } from "react";
import { signupApi, type SignupState } from "@/lib/api/signup";
import { resetDraft, syncDraftFromSignup } from "./draft-store";

/**
 * The host's sign-up on the server: the sign-up token (kept in localStorage so a
 * visitor who leaves can come back days later and continue where they stopped)
 * and the last state the server returned.
 */

const TOKEN_KEY = "stayowned:signup-token";

export interface SignupSession {
  token: string | null;
  state: SignupState | null;
  /** idle: not loaded yet · loading: asking the server · ready: known */
  phase: "idle" | "loading" | "ready";
  /** Problem loading the saved sign-up (network down, server error). */
  error: string | null;
  /** One-off message shown on the next page (e.g. "Calendar imported"). */
  flash: { tone: "success" | "info" | "warning"; text: string } | null;
}

const SERVER_SESSION: SignupSession = { token: null, state: null, phase: "idle", error: null, flash: null };

let session: SignupSession = SERVER_SESSION;
let initialised = false;
const listeners = new Set<() => void>();

function readToken(): string | null {
  try {
    const value = window.localStorage.getItem(TOKEN_KEY);
    return value && /^[a-f0-9]{64}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked: the sign-up still works for this visit.
  }
}

function init() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  session = { ...session, token: readToken() };
}

function emit(next: Partial<SignupSession>) {
  session = { ...session, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  init();
  return session;
}

export function useSignupSession(): SignupSession {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_SESSION);
}

/** Loads the saved sign-up once per visit (no-op when already loaded or loading). */
export async function ensureSignupLoaded(force = false) {
  init();
  if (!force && session.phase !== "idle") return;
  const token = session.token;
  if (!token) {
    emit({ phase: "ready", state: null, error: null });
    return;
  }
  emit({ phase: "loading", error: null });
  const result = await signupApi.status(token);
  if (result.ok) {
    syncDraftFromSignup(result.data);
    emit({ phase: "ready", state: result.data, error: null });
  } else if (result.code === 401) {
    // Token expired or unknown: start again (the visitor can still resume with e-mail + password).
    writeToken(null);
    emit({ phase: "ready", token: null, state: null, error: null });
  } else {
    emit({ phase: "ready", error: result.message });
  }
}

/** After step 1 (new or resumed sign-up): remember the token and the state. */
export function startSignupSession(token: string, state: SignupState) {
  writeToken(token);
  syncDraftFromSignup(state);
  emit({ token, state, phase: "ready", error: null });
}

/** After any later step: the server returns the new state. */
export function updateSignupState(state: SignupState) {
  syncDraftFromSignup(state);
  emit({ state, phase: "ready", error: null });
}

/** Forget this sign-up on this device (the account stays on the server). */
export function clearSignupSession() {
  writeToken(null);
  emit({ token: null, state: null, phase: "ready", error: null, flash: null });
}

/**
 * Log out: the server forgets the token, and this browser forgets the sign-up and its
 * preview draft, so someone else can register or log in here.
 */
export async function logoutSignup() {
  init();
  const token = session.token;
  writeToken(null);
  resetDraft();
  emit({ token: null, state: null, phase: "ready", error: null, flash: null });
  if (token) await signupApi.logout(token); // best effort: the token is gone from this browser anyway
}

export function setSignupFlash(flash: SignupSession["flash"]) {
  emit({ flash });
}

export function clearSignupFlash() {
  if (session.flash) emit({ flash: null });
}
