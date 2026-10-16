"use client";

import { useSyncExternalStore } from "react";
import { properties } from "@/data/properties";
import type { WizardDraft } from "./types";

/**
 * Client-side store for the onboarding wizard.
 *
 * - Survives client navigation between steps (module singleton).
 * - Persists to sessionStorage so a refresh keeps progress. Passwords are never
 *   stored, and photos picked from disk (object URLs) are kept in memory only.
 * - Uses useSyncExternalStore, so server HTML renders the default draft and the
 *   saved draft is applied after hydration without mismatches.
 *
 * Nothing here talks to a server — replace `persist`/`load` with API calls later.
 */

const STORAGE_KEY = "stayowned:onboarding-draft:v1";
const sample = properties[0];

export const DEFAULT_DRAFT: WizardDraft = {
  account: null,
  property: {
    name: sample.name,
    type: sample.type,
    location: `${sample.location.locality}, ${sample.location.region}, ${sample.location.country}`,
    bedrooms: sample.bedrooms,
    bathrooms: sample.bathrooms,
    maxGuests: sample.maxGuests,
    amenities: ["private-pool", "wifi", "air-conditioning", "kitchen"],
    currency: sample.price.currency,
    price: sample.price.amount,
    slug: sample.slug,
    slugEdited: false,
  },
  photos: sample.images.slice(0, 4).map((image, index) => ({
    id: `sample-${index + 1}`,
    src: image.src,
    alt: image.alt,
    local: false,
  })),
  content: {
    tone: "warm",
    headlineVariant: 0,
    descriptionVariant: 0,
    faqVariant: 0,
    headlineOverride: null,
    descriptionOverride: null,
    faqOverride: null,
  },
  theme: "casa",
  published: false,
};

let state: WizardDraft = DEFAULT_DRAFT;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<WizardDraft>;
    state = {
      ...DEFAULT_DRAFT,
      ...saved,
      property: { ...DEFAULT_DRAFT.property, ...saved.property },
      content: { ...DEFAULT_DRAFT.content, ...saved.content },
      photos: Array.isArray(saved.photos) ? saved.photos.filter((photo) => !photo.local) : DEFAULT_DRAFT.photos,
    };
  } catch {
    // Storage unavailable or corrupt: keep defaults.
  }
}

function persist() {
  try {
    const serialisable: WizardDraft = { ...state, photos: state.photos.filter((photo) => !photo.local) };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
  } catch {
    // Private mode / quota: the wizard still works for this page session.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return DEFAULT_DRAFT;
}

export function updateDraft(updater: (draft: WizardDraft) => WizardDraft) {
  load();
  state = updater(state);
  persist();
  listeners.forEach((listener) => listener());
}

export function resetDraft() {
  state.photos.forEach((photo) => photo.local && URL.revokeObjectURL(photo.src));
  state = DEFAULT_DRAFT;
  persist();
  listeners.forEach((listener) => listener());
}

export function useDraft(): WizardDraft {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
