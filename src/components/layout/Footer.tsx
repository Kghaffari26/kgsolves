import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { Todo } from "@/components/ui/Todo";
import { PhoneLink } from "./PhoneLink";
import { CurrentYear } from "./CurrentYear";
import { mainNav, serviceAreas } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

const serviceLinks = [
  { label: "Custom homes", href: "/services/custom-homes" },
  { label: "Remodels & additions", href: "/services/remodels-additions" },
  { label: "ADUs", href: "/services/adus" },
  { label: "Concrete & framing", href: "/services/concrete-framing" },
  { label: "Owner's representation", href: "/services/owners-representation" },
  { label: "Project management", href: "/services/project-management" },
];

export function Footer({ settings }: { settings: SiteSettings }) {
  const buildYear = new Date().getFullYear();
  return (
    <footer className="theme-dark relative overflow-hidden">
      <Container className="pt-[var(--section-y)]">
        <p className="eyebrow text-fg-muted">Start a project</p>
        <h2 className="mt-6 max-w-[14ch] font-display text-display text-fg-strong">
          Let&rsquo;s build something that lasts.
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button href="/contact" arrow>
            Start a project
          </Button>
          <PhoneLink
            phone={settings.phone}
            location="footer_cta"
            className="link-underline text-lead text-fg-strong tabular-nums"
          />
        </div>

        <Divider variant="blueprint" className="mt-[var(--section-y-sm)]" />

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" aria-label="JM Kelley Inc. — home">
              <Logo className="h-9 text-fg-strong" />
            </Link>
            <p className="mt-5 max-w-xs text-small text-fg-muted">
              General contractor building coastal homes from the foundation up. Newport Beach,
              California.
            </p>
          </div>
          <nav aria-label="Footer" className="lg:col-span-2">
            <p className="eyebrow text-fg-muted">Explore</p>
            <ul className="mt-4 space-y-2 text-small">
              {mainNav.map((i) => (
                <li key={i.href}>
                  <Link className="link-underline" href={i.href}>
                    {i.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link className="link-underline" href="/journal">
                  Journal
                </Link>
              </li>
              <li>
                <Link className="link-underline" href="/contact">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Services" className="lg:col-span-2">
            <p className="eyebrow text-fg-muted">Services</p>
            <ul className="mt-4 space-y-2 text-small">
              {serviceLinks.map((i) => (
                <li key={i.href}>
                  <Link className="link-underline" href={i.href}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Service areas" className="lg:col-span-2">
            <p className="eyebrow text-fg-muted">Service areas</p>
            <ul className="mt-4 space-y-2 text-small">
              {serviceAreas.map((a) => (
                <li key={a.slug}>
                  <Link className="link-underline" href={`/areas/${a.slug}`}>
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-2">
            <p className="eyebrow text-fg-muted">Office</p>
            <address className="mt-4 space-y-2 text-small not-italic">
              <PhoneLink
                phone={settings.phone}
                location="footer"
                className="link-underline tabular-nums"
              />
              <p>
                {settings.city}, {settings.region}
              </p>
              {settings.streetAddress ? (
                <p>{settings.streetAddress}</p>
              ) : (
                <Todo>street address (mailing address is a PO Box)</Todo>
              )}
            </address>
            <dl className="mt-5 space-y-1 text-small">
              {settings.hours.map((h) => (
                <div key={h.days} className="flex gap-2">
                  <dt className="text-fg-muted">{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-rule py-8 text-small text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>
            © <CurrentYear fallback={buildYear} /> {settings.companyName} · {settings.license.board}{" "}
            License #{settings.license.number}
            {!settings.license.verified && (
              <>
                {" "}
                <Todo>verify license # and add insurance/bonding statement</Todo>
              </>
            )}
          </p>
          <ul className="flex flex-wrap items-center gap-5">
            {settings.social.map((s) =>
              s.url ? (
                <li key={s.label}>
                  <a
                    className="link-underline"
                    href={s.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {s.label}
                  </a>
                </li>
              ) : null,
            )}
            {settings.social.every((s) => !s.url) && (
              <li>
                <Todo>social links</Todo>
              </li>
            )}
            <li>
              <Link className="link-underline" href="/privacy">
                Privacy
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
