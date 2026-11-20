import { notFound } from "next/navigation";
import { ResearchPost } from "@/components/templates/MiscPages";
import { POSTS } from "@/lib/content/research";
export const dynamicParams = false;
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = POSTS.find((x) => x.slug === slug); return { title: p ? `${p.title} — ManavOS` : "Research" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = POSTS.find((x) => x.slug === slug); if (!p) notFound(); return <ResearchPost p={p} />;
}
