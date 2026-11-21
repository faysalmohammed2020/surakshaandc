import type { Dict } from "@/i18n/en";
import type { Locale } from "@/i18n/config";

const IMG = "https://www.surakshaandc.com/backend/img";

export const site = {
  name: "Suraksha",
  fullName: "Suraksha Autism and Neuro Disorder Center",
  fullNameBn: "সুরক্ষা অটিজম এন্ড নিউরো ডিজঅর্ডার সেন্টার",
  url: "https://www.surakshaandc.com",
  tagline: "Empowering Every Child to Thrive",
  description:
    "Comprehensive Autism, Neuro-Developmental & Behavioral Therapy Services with Compassion, Expertise & Evidence-Based Care.",
  descriptionBn:
    "অটিজম, নিউরো-ডেভেলপমেন্টাল ও আচরণগত সমস্যার জন্য সমন্বিত, নিরাপদ ও বিজ্ঞানভিত্তিক থেরাপি সেবা।",
  address: "Road # 10, House # 16, Rupnagar R/A, Mirpur, Dhaka-1216",
  phones: ["01602-300826", "01746-645640"],
  // WhatsApp number in international format (no + or spaces): 01602-300826
  whatsapp: "8801602300826",
  email: "info@surakshaandc.com",
  // TODO: confirm opening hours with the client (not available on the current site)
  hours: "",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.17532422614!2d90.356239!3d23.812363800000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1569babebab%3A0xafb41db15c0db663!2sSuraksha%20Autism%20and%20Neuro%20Disorder%20Center!5e0!3m2!1sen!2sbd!4v1775026286827!5m2!1sen!2sbd",
  mapLink: "https://maps.google.com/?q=Suraksha+Autism+and+Neuro+Disorder+Center",
  // TODO: add real social profile URLs (current site links to empty facebook.com / twitter.com)
  socials: { facebook: "", youtube: "", instagram: "" },
  founder: {
    name: "A K M Samsuzzaman",
    nameBn: "এ কে এম সামসুজ্জামান",
    role: "Founder & Senior Consultant, Paediatrics",
    years: 32,
  },
  opened: "2026-01-09",
  images: {
    logo: `${IMG}/website/4ncRTAYkyBIzCHPHcZBS.png`,
    logoWide: `${IMG}/company-info/BslwC9j7paDkMqkiONhT.webp`,
    hero: `${IMG}/website/dkaPLABLlajafECTX5fG.jpg`,
    about: `${IMG}/about-us/Yl35jW6WOinOaHRkF4X6.jpg`,
    banners: [
      `${IMG}/slider/NLzELv8GdVdBOKyCpcgR.jpeg`,
      `${IMG}/slider/l20QFTPt49rxNtx16RlQ.jpeg`,
      `${IMG}/slider/DwdzxxbO3NDpyziSyae2.jpeg`,
    ],
  },
};

export const telHref = (p: string) => `tel:+88${p.replace(/\D/g, "")}`;

/** Multidisciplinary team (from About page) */
export const teamRoles = [
  { en: "Paediatrician", bn: "পেডিয়াট্রিসিয়ান" },
  { en: "Paediatric Neurologist", bn: "পেডিয়াট্রিক নিউরোলজিস্ট" },
  { en: "Children Physician", bn: "চিলড্রেন ফিজিশিয়ান" },
  { en: "Speech & Language Therapist", bn: "স্পিচ এন্ড ল্যাঙ্গুয়েজ থেরাপিস্ট" },
  { en: "Occupational Therapist", bn: "অকুপেশনাল থেরাপিস্ট" },
  { en: "Psychologist", bn: "সাইকোলজিস্ট" },
  { en: "Physiotherapist", bn: "ফিজিওথেরাপিস্ট" },
  { en: "Developmental Therapist", bn: "ডেভেলপমেন্টাল থেরাপিস্ট" },
  { en: "Special Educator", bn: "স্পেশাল এডুকেটর" },
];

/** Facilities & programmes (from About page) */
export const facilities = [
  { en: "RNDA", bn: "আরএনডিএ" },
  { en: "Special School & School-Based Therapy", bn: "স্পেশাল স্কুল এন্ড স্কুল বেসড থেরাপি" },
  { en: "Outdoor-Based Therapy Services", bn: "আউট ডোর বেসড থেরাপি সার্ভিসেস" },
  { en: "Pre-Inclusive Education", bn: "প্রি-ইনক্লসিভ এডুকেশন" },
  { en: "Special School", bn: "স্পেশাল স্কুল" },
  { en: "Parents Training", bn: "প্যারেন্টস ট্রেনিং" },
];

export const therapies = [
  { en: "Occupational Therapy", bn: "অকুপেশনাল থেরাপি" },
  { en: "Speech & Language Therapy", bn: "স্পীচ এন্ড ল্যাঙ্গুয়েজ থেরাপি" },
  { en: "Physiotherapy", bn: "ফিজিওথেরাপি" },
  { en: "Play Therapy", bn: "প্লে থেরাপি" },
  { en: "Music Therapy", bn: "মিউজিক থেরাপি" },
  { en: "Art Therapy", bn: "আর্ট থেরাপি" },
  { en: "Hydro (Swimming) Therapy", bn: "হাইড্রো (সাতার) থেরাপি" },
];

/** "Why choose Suraksha" (from Home page) */
export const whyUs = [
  { title: "Experienced, certified clinical team", bn: "অভিজ্ঞ ও সার্টিফাইড ক্লিনিক্যাল টিম" },
  { title: "Child-centred, family-friendly space", bn: "শিশু-কেন্দ্রিক ও পরিবার-বান্ধব পরিবেশ" },
  { title: "Evidence-based therapy methods", bn: "বিজ্ঞানভিত্তিক (Evidence-Based) থেরাপি পদ্ধতি" },
  { title: "Modern equipment & sensory room", bn: "আধুনিক থেরাপি যন্ত্রপাতি ও সেন্সরি রুম সুবিধা" },
  { title: "Safe, clean & inclusive environment", bn: "নিরাপদ, পরিচ্ছন্ন ও অন্তর্ভুক্তিমূলক পরিবেশ" },
];

export const getNav = (d: Dict) => [
  { label: d.nav.home, href: "/" },
  { label: d.nav.about, href: "/about" },
  { label: d.nav.services, href: "/services", mega: true },
  { label: d.nav.blog, href: "/blog" },
  { label: d.nav.gallery, href: "/gallery" },
  { label: d.nav.contact, href: "/contact" },
];

/** Bilingual item → [primary, secondary] for the given locale (primary = the page language). */
export const bilingual = (item: { en: string; bn: string }, locale: Locale): [string, string] =>
  locale === "bn" ? [item.bn, item.en] : [item.en, item.bn];
