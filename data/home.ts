import type { Locale } from "@/i18n/config";
import { assets } from "./assets";

/**
 * Copy for the redesigned home page sections, in both languages.
 * Kept here (instead of i18n/en.ts + bn.ts) so each section's text sits together.
 */

const home = {
  en: {
    hero: {
      kicker: "Autism & Neuro Disorder Center · Mirpur, Dhaka",
      titleHi: "Every child",
      titleRest: "shines in their own colour",
      text: "Suraksha is a paediatrician-founded centre for children with autism and neuro-developmental needs. Play-based, one-to-one therapy and a family that is part of every step.",
      book: "Book an Appointment",
      services: "View our Services",
      badgeTop: "1 : 1",
      badgeBottom: "therapy, built around your child",
    },
    audience: {
      eyebrow: "Who we support",
      title: "Care for every stage of growing up",
      cards: [
        { title: "Little Learners (0–6)", image: assets.kidsPlayroom, href: "/services/early-intervention" },
        { title: "Growing Children", image: assets.kidsTableGame, href: "/services/behaviour-therapy" },
        { title: "Parents & Families", image: assets.familyGroup, href: "/services/parent-guidance-counseling" },
      ],
      stats: ["Therapy programmes", "Specialised services", "Specialist disciplines", "Years of paediatric care"],
    },
    stack: {
      eyebrow: "Top special services",
      title: "Six programmes. One caring team.",
      sub: "Scroll to meet each programme. Every plan is built around your child.",
      explore: "Explore programme",
      includes: "Includes",
    },
    pillars: {
      eyebrow: "The Suraksha way",
      items: [
        {
          title: "Therapy at Suraksha",
          text: "Our multidisciplinary team gives play-based, evidence-based therapy, one therapist for one child, so progress is steady and joyful.",
          points: [
            "Speech, ABA behaviour, occupational & sensory therapy",
            "Physio, play, music, art and hydro (swimming) therapy",
            "Every child gets a personal plan and regular reviews",
          ],
          image: assets.therapistsWithChild,
          primary: { label: "Request an Appointment", href: "/appointment" },
          secondary: { label: "Explore Therapies", href: "/services" },
        },
        {
          title: "Learning at Suraksha",
          text: "Beyond the therapy room, children build the confidence to learn with others, at a pace that respects them.",
          points: [
            "Special school & school-based therapy",
            "Pre-inclusive education to prepare for mainstream school",
            "Outdoor-based therapy services",
          ],
          image: assets.kidsClassroom,
          primary: { label: "About our Centre", href: "/about" },
          secondary: { label: "Talk to Us", href: "/contact" },
        },
        {
          title: "Families at Suraksha",
          text: "Parents are a child's first and best therapists. We coach you with simple strategies that fit your daily routine.",
          points: [
            "Parents training & counselling",
            "Home-based practice guidance",
            "Progress review & long-term planning",
          ],
          image: assets.familyOutdoor,
          primary: { label: "Parent Guidance", href: "/services/parent-guidance-counseling" },
          secondary: { label: "Book a Visit", href: "/appointment" },
        },
      ],
      prev: "Previous",
      next: "Next",
    },
    blog: {
      eyebrow: "Latest news",
      title: "Stories & tips for families",
      sub: "Updates from the centre and practical guidance for parents.",
      all: "View all posts",
      tag: "News",
    },
    reviews: {
      eyebrow: "Kind words",
      title: "Families who walk with us",
      // TODO: replace with real, permission-given parent reviews before launch.
      items: [
        { name: "Ayaan's mother", text: "In three months my son started saying words we waited years to hear. The therapists treat him like their own." },
        { name: "Rafi's father", text: "The parent sessions changed how we handle meltdowns at home. We finally feel we know what to do." },
        { name: "Mehreen's mother", text: "Clean, calm rooms and a sensory gym my daughter loves. She runs inside every morning." },
        { name: "Tahsin's parents", text: "Doctors, speech and OT all plan together. We don't have to run between different clinics anymore." },
        { name: "Nabil's grandmother", text: "Patient, gentle and always smiling. They explain everything simply, in Bangla." },
        { name: "Arisha's mother", text: "Her handwriting and focus improved so much that her school teacher noticed it first." },
      ],
    },
    faq: {
      eyebrow: "FAQ",
      title: "Questions parents often ask",
      mapTitle: "Find us in Rupnagar, Mirpur",
      directions: "Get directions",
      items: [
        ["How do I know if my child needs an assessment?", "If you notice delayed speech, little eye contact, difficulty with play or social interaction, strong sensory reactions or repeated behaviours, an early developmental assessment is the best first step. You don't need a referral."],
        ["What ages do you work with?", "Our early intervention programme is for children aged 0–6, and our therapy, special school and pre-inclusive education services continue to support older children as they grow."],
        ["Are therapy sessions one-to-one?", "Yes. Children with special needs learn best with one therapist for one child, so all our core therapy sessions follow a 1:1 approach."],
        ["Can parents join or learn the techniques?", "Absolutely. Parents are coached as co-therapists through parent training, home-based practice guidance and regular progress reviews."],
        ["How do I book the first visit?", "Fill in the appointment form or call us on 01602-300826. Our front desk will call you back to confirm a convenient time."],
      ] as [string, string][],
    },
    book: {
      eyebrow: "Book an Appointment",
      title: "Your first step, together",
      text: "Not sure where to start? That's okay. Book a developmental assessment and our multidisciplinary team will understand your child's strengths and needs, then build a plan with you.",
      onlineTitle: "Book online",
      onlineText: "Send us a short form. We'll call you to confirm a time.",
      onlineCta: "Request Appointment",
      callTitle: "Talk to us",
      callText: "Prefer to speak with someone? We're happy to help.",
    },
  },
  bn: {
    hero: {
      kicker: "অটিজম ও নিউরো ডিজঅর্ডার সেন্টার · মিরপুর, ঢাকা",
      titleHi: "প্রতিটি শিশু",
      titleRest: "উজ্জ্বল তার নিজের রঙে",
      text: "সুরক্ষা একজন অভিজ্ঞ শিশু বিশেষজ্ঞের প্রতিষ্ঠিত সেন্টার—অটিজম ও নিউরো-ডেভেলপমেন্টাল চাহিদাসম্পন্ন শিশুদের জন্য। খেলার মাধ্যমে ১:১ থেরাপি, আর প্রতিটি ধাপে পরিবার পাশে।",
      book: "অ্যাপয়েন্টমেন্ট নিন",
      services: "আমাদের সেবাসমূহ",
      badgeTop: "১ : ১",
      badgeBottom: "আপনার শিশুকে ঘিরে থেরাপি",
    },
    audience: {
      eyebrow: "আমরা যাদের পাশে",
      title: "বেড়ে ওঠার প্রতিটি ধাপে যত্ন",
      cards: [
        { title: "ছোট্ট শিশু (০–৬)", image: assets.kidsPlayroom, href: "/services/early-intervention" },
        { title: "বেড়ে ওঠা শিশু", image: assets.kidsTableGame, href: "/services/behaviour-therapy" },
        { title: "অভিভাবক ও পরিবার", image: assets.familyGroup, href: "/services/parent-guidance-counseling" },
      ],
      stats: ["থেরাপি প্রোগ্রাম", "বিশেষায়িত সেবা", "বিশেষজ্ঞ বিভাগ", "বছরের শিশু চিকিৎসা অভিজ্ঞতা"],
    },
    stack: {
      eyebrow: "বিশেষ সেবাসমূহ",
      title: "ছয়টি প্রোগ্রাম। একটি যত্নশীল টিম।",
      sub: "স্ক্রল করে প্রতিটি প্রোগ্রাম দেখুন। প্রতিটি পরিকল্পনা আপনার শিশুকে ঘিরে।",
      explore: "বিস্তারিত দেখুন",
      includes: "যা থাকছে",
    },
    pillars: {
      eyebrow: "সুরক্ষার পথচলা",
      items: [
        {
          title: "সুরক্ষায় থেরাপি",
          text: "আমাদের মাল্টিডিসিপ্লিনারি টিম খেলার মাধ্যমে, বিজ্ঞানভিত্তিক থেরাপি দেয়—একজন শিশুর জন্য একজন থেরাপিস্ট।",
          points: [
            "স্পিচ, এবিএ বিহেভিয়ার, অকুপেশনাল ও সেন্সরি থেরাপি",
            "ফিজিও, প্লে, মিউজিক, আর্ট ও হাইড্রো (সাঁতার) থেরাপি",
            "প্রতিটি শিশুর জন্য আলাদা পরিকল্পনা ও নিয়মিত রিভিউ",
          ],
          image: assets.therapistsWithChild,
          primary: { label: "অ্যাপয়েন্টমেন্ট নিন", href: "/appointment" },
          secondary: { label: "থেরাপিগুলো দেখুন", href: "/services" },
        },
        {
          title: "সুরক্ষায় শিক্ষা",
          text: "থেরাপি রুমের বাইরেও শিশুরা অন্যদের সাথে শেখার আত্মবিশ্বাস গড়ে তোলে—নিজের গতিতে।",
          points: [
            "স্পেশাল স্কুল ও স্কুল-বেসড থেরাপি",
            "মূলধারার স্কুলের প্রস্তুতিতে প্রি-ইনক্লুসিভ এডুকেশন",
            "আউটডোর-বেসড থেরাপি সেবা",
          ],
          image: assets.kidsClassroom,
          primary: { label: "আমাদের সম্পর্কে", href: "/about" },
          secondary: { label: "যোগাযোগ করুন", href: "/contact" },
        },
        {
          title: "সুরক্ষায় পরিবার",
          text: "অভিভাবকই শিশুর প্রথম ও সেরা থেরাপিস্ট। প্রতিদিনের রুটিনে মানানসই সহজ কৌশল শেখাই আমরা।",
          points: [
            "প্যারেন্টস ট্রেনিং ও কাউন্সেলিং",
            "বাড়িতে অনুশীলনের গাইডেন্স",
            "অগ্রগতি রিভিউ ও দীর্ঘমেয়াদি পরিকল্পনা",
          ],
          image: assets.familyOutdoor,
          primary: { label: "প্যারেন্ট গাইডেন্স", href: "/services/parent-guidance-counseling" },
          secondary: { label: "ভিজিট বুক করুন", href: "/appointment" },
        },
      ],
      prev: "আগেরটি",
      next: "পরেরটি",
    },
    blog: {
      eyebrow: "সর্বশেষ খবর",
      title: "পরিবারের জন্য গল্প ও পরামর্শ",
      sub: "সেন্টারের আপডেট ও অভিভাবকদের জন্য কাজের পরামর্শ।",
      all: "সব পোস্ট দেখুন",
      tag: "খবর",
    },
    reviews: {
      eyebrow: "ভালোবাসার কথা",
      title: "যে পরিবারগুলো আমাদের সাথে",
      // TODO: replace with real, permission-given parent reviews before launch.
      items: [
        { name: "আয়ানের মা", text: "তিন মাসে আমার ছেলে এমন শব্দ বলতে শুরু করেছে, যার জন্য আমরা বছরের পর বছর অপেক্ষা করেছি।" },
        { name: "রাফির বাবা", text: "প্যারেন্ট সেশনগুলো বাসায় আমাদের আচরণই বদলে দিয়েছে। এখন বুঝি কী করতে হবে।" },
        { name: "মেহরীনের মা", text: "পরিচ্ছন্ন, শান্ত রুম আর সেন্সরি জিম—মেয়ে প্রতিদিন দৌড়ে ভেতরে যায়।" },
        { name: "তাহসিনের বাবা-মা", text: "ডাক্তার, স্পিচ আর ওটি একসাথে পরিকল্পনা করেন। আলাদা আলাদা ক্লিনিকে ছুটতে হয় না।" },
        { name: "নাবিলের দাদি", text: "ধৈর্যশীল, কোমল আর সবসময় হাসিমুখ। সবকিছু সহজ বাংলায় বুঝিয়ে বলেন।" },
        { name: "আরিশার মা", text: "ওর হাতের লেখা আর মনোযোগ এত ভালো হয়েছে যে স্কুলের শিক্ষকই প্রথম খেয়াল করেছেন।" },
      ],
    },
    faq: {
      eyebrow: "জিজ্ঞাসা",
      title: "অভিভাবকদের সাধারণ প্রশ্ন",
      mapTitle: "রূপনগর, মিরপুরে আমাদের খুঁজে নিন",
      directions: "দিকনির্দেশনা দেখুন",
      items: [
        ["আমার শিশুর অ্যাসেসমেন্ট লাগবে কিনা কীভাবে বুঝব?", "দেরিতে কথা বলা, চোখে চোখ কম রাখা, খেলায় বা মেলামেশায় সমস্যা, শব্দ-স্পর্শে অতিরিক্ত প্রতিক্রিয়া বা একই আচরণ বারবার করলে শুরুতেই একটি ডেভেলপমেন্টাল অ্যাসেসমেন্ট সবচেয়ে ভালো পদক্ষেপ। কোনো রেফারেল লাগে না।"],
        ["কোন বয়সের শিশুদের সেবা দেন?", "আর্লি ইন্টারভেনশন প্রোগ্রাম ০–৬ বছরের শিশুদের জন্য। থেরাপি, স্পেশাল স্কুল ও প্রি-ইনক্লুসিভ এডুকেশন বড় শিশুদেরও সহায়তা করে।"],
        ["থেরাপি সেশন কি ১:১?", "হ্যাঁ। বিশেষ চাহিদাসম্পন্ন শিশুরা একজন থেরাপিস্টের সাথে সবচেয়ে ভালো শেখে, তাই আমাদের মূল থেরাপি সেশনগুলো ১:১ পদ্ধতিতে হয়।"],
        ["অভিভাবকরা কি কৌশলগুলো শিখতে পারবেন?", "অবশ্যই। প্যারেন্টস ট্রেনিং, বাড়িতে অনুশীলনের গাইডেন্স ও নিয়মিত রিভিউয়ের মাধ্যমে অভিভাবকদের কো-থেরাপিস্ট হিসেবে গড়ে তোলা হয়।"],
        ["প্রথম ভিজিট কীভাবে বুক করব?", "অ্যাপয়েন্টমেন্ট ফর্ম পূরণ করুন অথবা ০১৬০২-৩০০৮২৬ নম্বরে কল করুন। আমাদের ফ্রন্ট ডেস্ক ফোন করে সময় নিশ্চিত করবে।"],
      ] as [string, string][],
    },
    book: {
      eyebrow: "অ্যাপয়েন্টমেন্ট নিন",
      title: "প্রথম পদক্ষেপ, একসাথে",
      text: "কোথা থেকে শুরু করবেন বুঝতে পারছেন না? কোনো সমস্যা নেই। একটি ডেভেলপমেন্টাল অ্যাসেসমেন্ট বুক করুন—আমাদের টিম আপনার শিশুর শক্তি ও প্রয়োজন বুঝে আপনার সাথে মিলে পরিকল্পনা করবে।",
      onlineTitle: "অনলাইনে বুক করুন",
      onlineText: "ছোট একটি ফর্ম পাঠান। আমরা ফোন করে সময় নিশ্চিত করব।",
      onlineCta: "অ্যাপয়েন্টমেন্ট অনুরোধ",
      callTitle: "কথা বলুন",
      callText: "সরাসরি কথা বলতে চান? আমরা সাহায্য করতে প্রস্তুত।",
    },
  },
};

export type HomeCopy = (typeof home)["en"];
export const getHomeCopy = (locale: Locale): HomeCopy => home[locale];
