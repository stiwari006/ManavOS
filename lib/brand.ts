/* Single source of truth for the brand. To rename the product everywhere
   (including copy in content files), run:
     node scripts/rebrand.mjs "New Name" newdomain.ai
   which rewrites this file and every text occurrence of the current name. */
export const BRAND = {
  name: "ManavOS",
  // Wordmark is drawn as two parts: strong + quiet ("human" + "OS")
  wordmark: ["manav", "OS"] as const,
  domain: "manavos.ai",
  tagline: "The human interface for AI",
  company: "The human interface company",
};
