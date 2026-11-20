import { notFound } from "next/navigation";
import { FeatureDetail } from "@/components/templates/FeaturePages";
import { FEATURES } from "@/lib/content/platform";
export const dynamicParams = false;
export function generateStaticParams() { return FEATURES.map((f) => ({ slug: f.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const f = FEATURES.find((x) => x.slug === slug); return { title: f ? `${f.name} — ManavOS` : "ManavOS" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const f = FEATURES.find((x) => x.slug === slug); if (!f) notFound(); return <FeatureDetail f={f} />;
}
