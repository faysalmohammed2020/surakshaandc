import { notFound } from "next/navigation";

// Any unknown URL lands here so the localized not-found page renders inside the locale layout.
export default function CatchAll() {
  notFound();
}
