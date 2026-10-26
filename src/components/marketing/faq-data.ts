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

/*
 * Pricing and Themes pages. The questions and the first (open) answer of each list are
 * taken from the Figma "pricing page" and "Themes page" frames. The design shows the other
 * questions collapsed, so their answers are NOT in Figma: they were written from the plan
 * features shown in the designs and must be confirmed before launch (marked "Draft").
 */
export const PRICING_FAQS: FaqItem[] = [
  {
    id: "hidden-fees",
    question: "Are there any hidden fees or commissions on my bookings?",
    answer:
      "No. We charge 0% commission on all your bookings. You keep 100% of your rental revenue and only pay the flat subscription fee for your chosen plan.",
  },
  {
    id: "try-first",
    question: "Can I try it out before committing to a paid plan?",
    // Draft — not in Figma.
    answer: "Yes. The Starter plan is free to use, and Pro comes with a 14-day trial so you can test every feature first.",
  },
  {
    id: "change-plan",
    question: "What happens if I want to upgrade or downgrade my plan?",
    // Draft — not in Figma.
    answer:
      "You can change your plan at any time. Your page, photos and texts stay as they are; only the features of the new plan change.",
  },
  {
    id: "guest-fees",
    question: "Do my guests pay extra processing fees?",
    // Draft — not in Figma.
    answer:
      "StayOwned adds no fee for your guests. Payments run through your own gateway (Razorpay on Starter), whose standard charges apply to your account.",
  },
  {
    id: "cancel",
    question: "Can I cancel my subscription at any time?",
    // Draft — not in Figma.
    answer: "Yes. You can cancel at any time and move back to the free Starter plan.",
  },
];

export const THEMES_FAQS: FaqItem[] = [
  {
    id: "themes-in-plan",
    question: "Are all themes included in my plan?",
    answer:
      "You get full access to our Default Free Theme forever. To unlock our premium, high-converting themes, you can upgrade to any paid plan at any time.",
  },
  {
    id: "switch-themes",
    question: "Can I switch between themes without losing my content?",
    // Draft — not in Figma.
    answer:
      "Yes. Your texts, photos and prices stay the same when you change theme, and you can switch any time.",
  },
  {
    id: "free-vs-premium",
    question: "What is the difference between the Free Theme and Premium Themes?",
    // Draft — not in Figma.
    answer:
      "Casa is free and works for any stay. Pro unlocks four designer looks — Luxe, Homestay, Urban and Coastal — with their own palettes, fonts and booking styling.",
  },
  {
    id: "customise",
    question: "Can I customize the colors and fonts of the themes?",
    // Draft — not in Figma.
    answer:
      "Each theme comes with its own colour palettes and fonts. Pick the palette that suits your property when you choose your theme.",
  },
  {
    id: "coding-themes",
    question: "Do I need coding skills to use these themes?",
    // Draft — not in Figma.
    answer: "No. Choose a theme and your page is built for you. There is nothing to design or code.",
  },
];
