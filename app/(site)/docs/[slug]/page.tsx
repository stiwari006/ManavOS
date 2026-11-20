import { notFound } from "next/navigation";
import { DocsPage } from "@/components/templates/MiscPages";
import { DOCS } from "@/lib/content/docs";
export const dynamicParams = false;
export function generateStaticParams() { return DOCS.map((d) => ({ slug: d.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const d = DOCS.find((x) => x.slug === slug); return { title: d ? `${d.title} — HumanOS Docs` : "Docs" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const d = DOCS.find((x) => x.slug === slug); if (!d) notFound(); return <DocsPage d={d} />;
}
