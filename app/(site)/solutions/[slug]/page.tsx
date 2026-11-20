import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolutionTemplate } from "@/components/templates/SolutionTemplate";
import { SOLUTIONS, solution } from "@/lib/content/solutions";

export const dynamicParams = false;
export function generateStaticParams() {
  return SOLUTIONS.filter((s) => s.slug !== "ai-interviewer").map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = solution((await params).slug);
  return { title: s ? `${s.name} — ManavOS` : "ManavOS", description: s?.sub };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const s = solution((await params).slug);
  if (!s) notFound();
  return <SolutionTemplate s={s} />;
}
