import { z } from "zod";

const WpPostSchema = z.object({
  id: z.number(), date: z.string(), slug: z.string(), status: z.string(),
  link: z.string(), title: z.object({ rendered: z.string() }),
  modified: z.string().optional()
});

function credentials() {
  const base = process.env.WORDPRESS_URL?.replace(/\/$/, "");
  const user = process.env.WORDPRESS_USERNAME;
  const pass = process.env.WORDPRESS_APP_PASSWORD?.replace(/\s/g, "");
  if (!base || !user || !pass) throw new Error("WordPress integration is not configured.");
  return { base, auth: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}` };
}

// Only GET methods are implemented. There are deliberately no create/update/delete methods.
export async function getWordPressPosts(limit = 30) {
  const { base, auth } = credentials();
  const url = new URL(`${base}/wp-json/wp/v2/posts`);
  url.searchParams.set("per_page", String(Math.min(Math.max(limit, 1), 100)));
  url.searchParams.set("status", "publish");
  url.searchParams.set("_fields", "id,date,slug,status,link,title,modified");
  const response = await fetch(url, {
    headers: { Authorization: auth, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`WordPress returned HTTP ${response.status}`);
  const data: unknown = await response.json();
  return z.array(WpPostSchema).parse(data);
}

export async function getWordPressSiteInfo() {
  const { base } = credentials();
  const response = await fetch(`${base}/wp-json/`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`WordPress REST API returned HTTP ${response.status}`);
  const data = await response.json();
  return { name: String(data.name ?? "WordPress"), url: String(data.url ?? base), namespaces: data.namespaces ?? [] };
}
