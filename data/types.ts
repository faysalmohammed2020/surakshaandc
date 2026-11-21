export type ListItem = { label?: string; text: string };

export type Block =
  | { type: "h2" | "h3" | "p" | "lead"; text: string }
  | { type: "list"; items: ListItem[] };

export type Category = {
  slug: string;
  oldSlug: string;
  name: string;
  nameBn: string;
  description: string;
  image: string;
  services: string[];
};

export type Service = {
  slug: string;
  category: string;
  title: string;
  image: string | null;
  excerpt: string;
  blocks: Block[];
};

export type Post = {
  slug: string;
  oldSlug: string;
  title: string;
  date: string;
  image: string;
  excerpt: string;
  blocks: Block[];
};
