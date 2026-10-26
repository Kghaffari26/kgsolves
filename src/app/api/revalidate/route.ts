import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

type WebhookPayload = { _type?: string; slug?: string };

/**
 * Sanity webhook → on-demand revalidation. Configure the webhook in sanity.io/manage with
 * projection `{_type, "slug": slug.current}` and the secret in SANITY_REVALIDATE_SECRET.
 * The signature is verified; unsigned or mis-signed requests get 401.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret)
    return NextResponse.json({ message: "SANITY_REVALIDATE_SECRET is not set" }, { status: 500 });
  try {
    const { isValidSignature, body } = await parseBody<WebhookPayload>(req, secret, true);
    if (!isValidSignature)
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    if (!body?._type) return NextResponse.json({ message: "Missing _type" }, { status: 400 });
    revalidateTag(body._type, "max");
    // Settings feed the header/footer of every page; projects feed several listings.
    revalidateTag("sanity", "max");
    return NextResponse.json({
      revalidated: [body._type, "sanity"],
      slug: body.slug ?? null,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
