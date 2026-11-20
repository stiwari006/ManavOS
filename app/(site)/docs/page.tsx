import { DocsPage } from "@/components/templates/MiscPages";
import { DOCS } from "@/lib/content/docs";
export const metadata = { title: "Docs — HumanOS" };
export default function Page() { return <DocsPage d={DOCS[0]} />; }
