import { SOLUTIONS } from "./solutions";

/* The handful of example PALs shown on the website (like Tavus' gallery).
   Keep it short: four strong examples beat a long catalogue. */
export const FEATURED_PALS = ["ai-interviewer", "ai-tutor", "ai-coach", "customer-experience"]
  .map((slug) => SOLUTIONS.find((s) => s.slug === slug)!)
  .filter(Boolean);
