import { LegalPage } from "@/components/templates/MiscPages";
import { LEGAL } from "@/lib/content/legal";
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(LEGAL).map((slug) => ({ slug })); }
export default async function Page({ params }: { params: Promise<{ slug: string }> }) { return <LegalPage slug={(await params).slug} />; }
