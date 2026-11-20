import { notFound } from "next/navigation";
import { ModelDetail } from "@/components/templates/ModelPages";
import { MODELS } from "@/lib/content/platform";
export const dynamicParams = false;
export function generateStaticParams() { return MODELS.map((m) => ({ slug: m.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const m = MODELS.find((x) => x.slug === slug); return { title: m ? `${m.name} — ManavOS` : "ManavOS" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const m = MODELS.find((x) => x.slug === slug); if (!m) notFound(); return <ModelDetail m={m} />;
}
