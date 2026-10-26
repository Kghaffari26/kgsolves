import { Header } from "./Header";
import { Footer } from "./Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { MotionDirector } from "@/components/motion/MotionDirector";
import { getSiteSettings } from "@/lib/sanity/api";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationLd } from "@/lib/seo/jsonld";

/** Header, footer, smooth scroll and cursor. Used by the (site) layout and the 404 page. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <JsonLd data={organizationLd(settings)} />
      <a
        href="#main"
        className="fixed top-3 left-3 z-[70] -translate-y-24 rounded-full bg-ink px-5 py-3 text-paper transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <Header phone={settings.phone} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer settings={settings} />
      <SmoothScroll />
      <CustomCursor />
      <MotionDirector />
    </>
  );
}
