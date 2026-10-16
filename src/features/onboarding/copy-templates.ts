import type { Faq } from "@/types/property";
import { PROPERTY_TYPE_LABELS } from "@/data/amenities";
import type { DraftContent, DraftProperty, Tone } from "./types";

/**
 * Local stand-in for the "AI description" step. There is no AI service in this
 * static build: copy is assembled from templates using the host's answers, and
 * "Rewrite" cycles through alternative templates. Swap `generateCopy` for an API
 * call when the backend exists.
 */

export const TONES: { value: Tone; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "premium", label: "Premium" },
  { value: "simple", label: "Simple" },
];

export const VARIANT_COUNT = 3;

/** Nearby landmark per locality, used to make copy specific. Unknown places fall back to the region. */
const NEARBY: Record<string, { name: string; kind: "beach" | "town"; minutes: number }> = {
  assagao: { name: "Vagator", kind: "beach", minutes: 5 },
  siolim: { name: "Morjim", kind: "beach", minutes: 10 },
  candolim: { name: "Candolim", kind: "beach", minutes: 2 },
  palolem: { name: "Palolem", kind: "beach", minutes: 2 },
  anjuna: { name: "Anjuna", kind: "beach", minutes: 3 },
};

function placeParts(location: string) {
  const [locality = "", ...rest] = location.split(",").map((part) => part.trim()).filter(Boolean);
  const region = rest.filter((part) => part.toLowerCase() !== "india").join(", ");
  return { locality: locality || "your area", region: region || locality || "the area" };
}

function facts(property: DraftProperty) {
  const { locality, region } = placeParts(property.location);
  const nearby = NEARBY[locality.toLowerCase()];
  const has = (id: DraftProperty["amenities"][number]) => property.amenities.includes(id);
  const pool = has("private-pool");
  const typeNoun = PROPERTY_TYPE_LABELS[property.type].toLowerCase();
  const isGoa = /goa/i.test(property.location);
  return {
    name: property.name.trim() || "Your place",
    locality,
    region,
    nearby,
    pool,
    ac: has("air-conditioning"),
    pets: has("pet-friendly"),
    chef: has("chef"),
    wifi: has("wifi"),
    workspace: has("workspace"),
    bedrooms: property.bedrooms,
    guests: property.maxGuests,
    typeNoun,
    cuisine: isGoa ? "Goan" : "local",
  };
}

function headlines(property: DraftProperty, tone: Tone): string[] {
  const f = facts(property);
  const kind = f.pool ? `private pool ${f.typeNoun}` : f.typeNoun;
  const near = f.nearby ? `minutes from ${f.nearby.name}` : `in ${f.locality}`;
  const byTone: Record<Tone, string[]> = {
    warm: [
      `Your ${kind}, ${near}`,
      `Slow mornings and sunny afternoons in ${f.locality}`,
      `A home away from home in ${f.region}`,
    ],
    premium: [
      `An exclusive ${kind} in ${f.locality}`,
      `Quiet luxury, ${near}`,
      `${f.name}: a refined escape in ${f.region}`,
    ],
    simple: [
      `${f.bedrooms}-bedroom ${f.typeNoun} in ${f.locality}`,
      `${f.name} · sleeps ${f.guests} · ${f.locality}`,
      `${capitalise(kind)} ${near}`,
    ],
  };
  return byTone[tone];
}

function descriptions(property: DraftProperty, tone: Tone): string[] {
  const f = facts(property);
  const nearPhrase = f.nearby
    ? `just a ${f.nearby.minutes}-minute drive from ${f.nearby.name} ${f.nearby.kind}`
    : `close to the best of ${f.region}`;
  const afternoon = f.pool ? "spend lazy afternoons by your private pool" : "spend lazy afternoons on the veranda";
  const evening = f.ac ? "come back to air-conditioned rooms after sunset" : "come back to breezy rooms after sunset";
  const kind = `${f.bedrooms}-bedroom ${f.pool ? "pool " : ""}${f.typeNoun}`;

  const byTone: Record<Tone, string[]> = {
    warm: [
      `${f.name} is a ${kind} tucked into the quiet lanes of ${f.locality}, ${nearPhrase}. Wake up to a home-cooked ${f.cuisine} breakfast, ${afternoon}, and ${evening}.`,
      `Welcome to ${f.name}, our ${kind} in ${f.locality}. There's room for ${f.guests} guests, ${f.wifi ? "fast Wi-Fi for slow workdays, " : ""}and plenty of corners to unwind in — we can't wait to host you.`,
      `Families and friends love ${f.name}: ${f.bedrooms} bedrooms, ${f.pool ? "a private pool, " : ""}and a kitchen made for long dinners, all ${nearPhrase}.`,
    ],
    premium: [
      `${f.name} is an exclusive ${kind} in ${f.locality}, ${nearPhrase}. Expect thoughtful design, ${f.pool ? "a private pool, " : ""}${f.chef ? "a chef on request " : "attentive service "}and complete privacy for up to ${f.guests} guests.`,
      `Set in ${f.locality}, ${f.name} pairs calm, considered interiors with ${f.pool ? "a private pool" : "a private garden"} — an effortless base for exploring ${f.region}.`,
      `Reserve the whole of ${f.name}: ${f.bedrooms} elegant bedrooms, ${f.ac ? "climate-controlled rooms, " : ""}and service tailored to your stay in ${f.region}.`,
    ],
    simple: [
      `${f.bedrooms}-bedroom ${f.typeNoun} in ${f.locality}, ${nearPhrase}. Sleeps ${f.guests}.${f.pool ? " Private pool." : ""}${f.ac ? " Air conditioning." : ""}${f.wifi ? " Wi-Fi." : ""}`,
      `${f.name} is in ${f.locality}, ${f.region}. ${f.bedrooms} bedrooms, up to ${f.guests} guests${f.pets ? ", pets allowed" : ""}.`,
      `Entire ${f.typeNoun} for ${f.guests} guests in ${f.locality}. Book directly with the host.`,
    ],
  };
  return byTone[tone];
}

function faqSets(property: DraftProperty): Faq[][] {
  const f = facts(property);
  const nearAnswer = f.nearby
    ? `${f.nearby.name} ${f.nearby.kind} is about ${f.nearby.minutes} minutes away by car.`
    : `Most sights in ${f.region} are a short drive away; we're happy to share directions.`;
  const base: Faq[] = [
    {
      question: "Is breakfast included?",
      answer: `Yes — a home-cooked ${f.cuisine} breakfast is included with every stay.`,
    },
    {
      question: "Can we bring our dog?",
      answer: f.pets
        ? "Yes, well-behaved pets are welcome. Please mention them when you book."
        : "Sorry, pets aren't allowed at this property.",
    },
    { question: `How far is the nearest ${f.nearby?.kind ?? "town"}?`, answer: nearAnswer },
    {
      question: "What are the check-in and check-out times?",
      answer: "Check-in is from 2:00 pm and check-out is by 11:00 am.",
    },
  ];
  const alternative: Faq[] = [
    { question: "How many guests can stay?", answer: `Up to ${f.guests} guests across ${f.bedrooms} bedrooms.` },
    {
      question: "Is there Wi-Fi?",
      answer: f.wifi ? "Yes, fast Wi-Fi is available throughout the property." : "Wi-Fi isn't available at the moment.",
    },
    { question: "Is parking available?", answer: property.amenities.includes("parking") ? "Yes, free parking on the premises." : "Street parking is available nearby." },
    { question: "How do I pay?", answer: "You can pay securely by UPI or card when you confirm your booking." },
  ];
  const third: Faq[] = [base[0], alternative[0], base[3], alternative[3]];
  return [base, alternative, third];
}

export interface GeneratedCopy {
  headline: string;
  description: string;
  faqs: Faq[];
}

export function generateCopy(property: DraftProperty, content: DraftContent): GeneratedCopy {
  const h = headlines(property, content.tone);
  const d = descriptions(property, content.tone);
  const q = faqSets(property);
  return {
    headline: content.headlineOverride ?? h[content.headlineVariant % h.length],
    description: content.descriptionOverride ?? d[content.descriptionVariant % d.length],
    faqs: content.faqOverride ?? q[content.faqVariant % q.length],
  };
}

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
