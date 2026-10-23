/**
 * FAQ copy for the marketing pages. Questions come from the Figma "Faqs", "Homepage",
 * "How it works" and "Contact Us" frames; answers follow the plans and features shown there.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqGroup {
  id: string;
  title: string;
  icon: "check" | "card" | "calendar" | "globe" | "user";
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    icon: "check",
    items: [
      {
        id: "coding",
        question: "Do I need a website or any coding skills?",
        answer:
          "No. Sign up, add your property and AI builds your booking page for you. There is nothing to design or code.",
      },
      {
        id: "how-long",
        question: "How long does it take to go live?",
        answer:
          "About 5 minutes: one minute to sign up, two to add your property and photos, and a minute each for the AI to write your page and for you to publish it.",
      },
      {
        id: "airbnb-import",
        question: "Can I import my Airbnb listing?",
        answer:
          "Yes. Connect your Airbnb calendar link so booked dates are blocked automatically, and use your listing details and photos to fill in your property in a few minutes.",
      },
      {
        id: "free",
        question: "Is it really free to start?",
        answer:
          "Yes. The Starter plan is free: one property, a clean theme, an AI-written description and one payment gateway. No credit card is needed.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    icon: "card",
    items: [
      {
        id: "get-paid",
        question: "How do I get paid?",
        answer:
          "Guests pay on your booking page through your own payment gateway (Razorpay on the free plan). The money settles straight into your bank account.",
      },
      {
        id: "methods",
        question: "Which payment methods can guests use?",
        answer:
          "UPI (Google Pay, PhonePe and others), credit and debit cards and net banking. Pro adds Stripe, PayPal, Cashfree and PayU.",
      },
      {
        id: "commission",
        question: "Do you take a commission?",
        answer: "No. StayOwned charges 0% commission on direct bookings — you keep what your guests pay.",
      },
      {
        id: "international",
        question: "Can I accept international guests?",
        answer:
          "Yes. Razorpay accepts international cards, and with Pro you can add Stripe or PayPal for guests paying in other currencies.",
      },
    ],
  },
  {
    id: "calendar-sync",
    title: "Calendar sync",
    icon: "calendar",
    items: [
      {
        id: "double-bookings",
        question: "Will I get double bookings?",
        answer:
          "No. Dates booked on Airbnb are blocked on your page, and direct bookings block your Airbnb calendar, so the same night can't be sold twice.",
      },
      {
        id: "how-many-calendars",
        question: "How many calendars can I connect?",
        answer: "One Airbnb calendar on the free plan. Pro adds more calendars, including Booking.com.",
      },
      {
        id: "sync-speed",
        question: "How fast does the sync happen?",
        answer:
          "Calendars are checked automatically several times an hour, and you can refresh a calendar any time from your dashboard.",
      },
    ],
  },
  {
    id: "pro-and-domains",
    title: "Pro and domains",
    icon: "globe",
    items: [
      {
        id: "own-domain",
        question: "Can I use my own domain?",
        answer:
          "Yes, with Pro. Turn stayowned.com/your-property into www.yourproperty.com — SSL is included at no extra cost.",
      },
      {
        id: "premium-themes",
        question: "What do the premium themes include?",
        answer:
          "Four designer looks — Luxe, Homestay, Urban and Coastal — with their own colour palettes, fonts and booking styling.",
      },
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    icon: "user",
    items: [
      {
        id: "edit-page",
        question: "Can I edit my page after it is published?",
        answer:
          "Yes. Change your texts, photos, prices and theme any time from your dashboard — updates are live straight away.",
      },
      {
        id: "setup-help",
        question: "Who can help me set up?",
        answer:
          "Our onboarding team. Message us on WhatsApp or call us and we'll walk you through setup, payments and your calendar.",
      },
    ],
  },
];

/** The short list shown on the home page and the how-it-works page. */
export const HOME_FAQS: FaqItem[] = [
  {
    id: "leave-airbnb",
    question: "Do I need to leave Airbnb?",
    answer:
      "No. Keep your Airbnb listing for new guests. Use your StayOwned page for repeat guests and WhatsApp enquiries. Both calendars stay in sync.",
  },
  {
    id: "starter-free",
    question: "Is the Starter plan really free?",
    answer:
      "Yes. One property, a clean theme, an AI-written description and one payment gateway — free, with 0% commission and no card needed.",
  },
  {
    id: "custom-domain",
    question: "Can I use my own custom domain?",
    answer: "Yes, on Pro. Your page moves to www.yourproperty.com with free SSL.",
  },
  {
    id: "gateways",
    question: "Which payment gateways can I use?",
    answer: "Razorpay on the free plan (UPI, cards, net banking). Pro adds Stripe, PayPal, Cashfree and PayU.",
  },
  {
    id: "ai-assistant",
    question: "How does the AI assistant know about my property?",
    answer:
      "It uses your listing: the description, house rules, amenities, prices and your live calendar. Update those and its answers update too.",
  },
];

/** The short list shown on the contact page. */
export const CONTACT_FAQS: FaqItem[] = [
  HOME_FAQS[0],
  {
    id: "setup-speed",
    question: "How fast can I get set up?",
    answer: "Most hosts are live in about 5 minutes. If you'd like help, our team can set it up with you on a call.",
  },
  {
    id: "commission-bookings",
    question: "Do you take commission on bookings?",
    answer: "No — 0% commission on direct bookings, on every plan.",
  },
  HOME_FAQS[3],
  {
    id: "migrate",
    question: "Can your team migrate my listing for me?",
    answer:
      "Yes. Send us your Airbnb link on WhatsApp and our onboarding team will help you move your details, photos and calendar — free.",
  },
];
