import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource/instrument-serif/400-italic.css";
import { Announcement } from "@/components/Announcement";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SiteProvider } from "@/components/SiteContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProvider>
      <Announcement />
      <Nav />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
    </SiteProvider>
  );
}
