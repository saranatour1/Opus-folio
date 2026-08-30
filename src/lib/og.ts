/** Absolute URL for the 1200x630 social card (x, discord, reddit, slack, linkedin).
 *
 * With PUBLIC_IMAGEKIT_URL_ENDPOINT set, the card is served through ImageKit,
 * pinned to the exact card size so no platform re-crops it:
 * https://docs.astro.build/en/guides/media/imagekit/
 * Without it, the card is served straight from the site as /og.png. */
export function socialCard(site: URL | undefined, imagekitEndpoint?: string): string {
  const local = new URL("/og.png", site ?? "https://opus.example").href;
  if (!imagekitEndpoint) return local;
  const endpoint = imagekitEndpoint.replace(/\/$/, "");
  return `${endpoint}/og.png?tr=w-1200,h-630,cm-pad_resize,f-png`;
}
