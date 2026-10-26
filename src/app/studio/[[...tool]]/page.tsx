import { isSanityConfigured } from "@/lib/sanity/env";
import { Studio } from "./Studio";

export { metadata, viewport } from "next-sanity/studio";
export const dynamic = "force-static";

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main
        style={{
          fontFamily: "system-ui, sans-serif",
          maxWidth: 640,
          margin: "15vh auto",
          padding: 24,
          lineHeight: 1.6,
        }}
      >
        <h1>Sanity Studio isn&rsquo;t configured yet</h1>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and <code>NEXT_PUBLIC_SANITY_DATASET</code>{" "}
          (see
          <code> .env.example</code> and <code>README.md</code>), then reload. The public site is
          running from the local JSON fallback in the meantime.
        </p>
      </main>
    );
  }
  return <Studio />;
}
