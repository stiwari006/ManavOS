import "@fontsource/dm-mono/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { AppShell } from "@/components/app/AppShell";
export const metadata = { title: "Dashboard — ManavOS", robots: { index: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return <AppShell>{children}</AppShell>; }
