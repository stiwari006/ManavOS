import "@fontsource/dm-mono/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { AuthShell } from "@/components/app/AuthShell";
export default function AuthLayout({ children }: { children: React.ReactNode }) { return <AuthShell>{children}</AuthShell>; }
