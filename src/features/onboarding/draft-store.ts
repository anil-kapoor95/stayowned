"use client";

import { useSyncExternalStore } from "react";
import { properties } from "@/data/properties";
import type { SignupState } from "@/lib/api/signup";
import { slugify } from "@/lib/utils";
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

/** Empty draft for a brand-new sign-up (the sample property is only a placeholder preview). */
export const BLANK_DRAFT: WizardDraft = {
  ...DEFAULT_DRAFT,
  property: {
    ...DEFAULT_DRAFT.property,
    name: "",
    location: "",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    price: null,
    slug: "",
    slugEdited: false,
  },
  photos: [],
};

/**
 * Copies what the server knows about the sign-up into the local draft, which
 * drives the live preview and keeps the fields the API does not store yet
 * (type, guests, amenities, page link).
 */
export function syncDraftFromSignup(state: SignupState) {
  updateDraft((draft) => {
    const next: WizardDraft = { ...draft };
    // This browser still shows the sample property (new sign-up, or log-in on another device):
    // start from a blank preview so no sample data (amenities, guests…) mixes with the host's own.
    if (draft.photos.some((photo) => photo.id.startsWith("sample-"))) {
      Object.assign(next, BLANK_DRAFT);
    }
    next.account = {
      name: state.account.name,
      email: state.account.email,
      country: draft.account?.country ?? "IN",
      whatsapp: state.account.phone,
    };
    if (state.property) {
      const p = state.property;
      next.property = {
        ...next.property,
        name: p.name,
        location: [p.city, p.state].filter(Boolean).join(", "),
        bedrooms: p.bedrooms !== null && p.bedrooms !== "" ? Number(p.bedrooms) : next.property.bedrooms,
        bathrooms: p.bathrooms !== null && p.bathrooms !== "" ? Number(p.bathrooms) : next.property.bathrooms,
        slug: next.property.slugEdited ? next.property.slug : slugify(p.name),
        // The rate saved in the back office (it may have been changed there since the sign-up).
        price: p.price ?? next.property.price,
        maxGuests: p.max_guests ?? next.property.maxGuests,
        currency: p.currency || state.currency || next.property.currency,
      };
      next.photos = state.photos.map((photo) => ({
        id: `api-${photo.id}`,
        src: photo.url,
        alt: `Photo of ${p.name}: ${photo.file_name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}`,
        local: false,
      }));
    }
    if (!state.property && state.currency) {
      next.property = { ...next.property, currency: state.currency };
    }
    if (state.status === "completed" || state.completed_steps >= 5) {
      // The page texts are saved (or the property comes from the back office): show exactly those,
      // never the template copy used as a placeholder during the wizard ("" hides a text).
      next.content = {
        ...next.content,
        tone: state.tone ?? next.content.tone,
        headlineOverride: state.headline ?? "",
        descriptionOverride: state.description ?? "",
        faqOverride: state.faqs ?? [],
      };
    } else if (state.description || state.headline || state.faqs?.length) {
      next.content = {
        ...next.content,
        tone: state.tone ?? next.content.tone,
        headlineOverride: state.headline || next.content.headlineOverride,
        descriptionOverride: state.description || next.content.descriptionOverride,
        faqOverride: state.faqs?.length ? state.faqs : next.content.faqOverride,
      };
    }
    if (state.status === "completed") next.published = true;
    return next;
  });
}

export function useDraft(): WizardDraft {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
