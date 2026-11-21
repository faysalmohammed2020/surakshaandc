import type { Block } from "./types";

// English translations of the (Bangla) blog posts in content.ts, keyed by slug.
export const postsEn: Record<string, { title: string; excerpt: string; blocks: Block[] }> = {
  "suraksha-center-inauguration": {
    title: "Inauguration of Suraksha Autism & Neuro Disorder Center: The Start of a New Journey",
    excerpt:
      "Today we proudly announce the formal inauguration of Suraksha Autism & Neuro Disorder Center. Our goal is to support every child’s natural development, education and social skills.",
    blocks: [
      {
        type: "lead",
        text: "Today we proudly announce the formal inauguration of Suraksha Autism & Neuro Disorder Center. Our goal is to support every child’s natural development, education and social skills.",
      },
      { type: "h3", text: "What makes the centre special" },
      {
        type: "list",
        items: [
          { label: "Multidisciplinary therapy team", text: "Coordinated support from specialists, shaped around each child’s needs." },
          { label: "Child-centred, family-focused approach", text: "Families are involved as a full part of the process." },
          { label: "Smart therapy tools and sensory room", text: "Effective therapy through modern technology and equipment." },
          { label: "Science-based therapy", text: "Evidence-based care and education for the best possible progress." },
        ],
      },
      {
        type: "p",
        text: "We provide a range of developmental therapies including Speech & Language Therapy, Behaviour Therapy (ABA), Special Education, Occupational Therapy, Sensory Integration and Parent Guidance & Counseling. By giving every child and family a personalised plan and continuous support, we are committed to helping them reach their full potential.",
      },
      {
        type: "p",
        text: "On our inauguration day, directors, specialist therapists and representatives of the local community were present, and all of them praised this initiative.",
      },
      { type: "h3", text: "The purpose of Suraksha" },
      { type: "p", text: "To create a safe, supportive environment for children — one that is right for a bright future." },
      {
        type: "p",
        text: "Join us on this journey, where we work to make every child capable, confident and independent.",
      },
      { type: "h3", text: "Our Latest News" },
      {
        type: "list",
        items: [
          {
            label: "Inauguration of Suraksha Autism & Neuro Disorder Center",
            text: "The start of a new journey",
          },
        ],
      },
    ],
  },
};
