// Read-only deployment listing. No deploy, promote, delete, env-var, or rollback calls exist here.
export async function getVercelDeployments() {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!token || !projectId) throw new Error("Vercel integration is not configured.");
  const url = new URL("https://api.vercel.com/v6/deployments");
  url.searchParams.set("projectId", projectId);
  url.searchParams.set("limit", "10");
  if (process.env.VERCEL_TEAM_ID) url.searchParams.set("teamId", process.env.VERCEL_TEAM_ID);
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Vercel returned HTTP ${response.status}`);
  const data = await response.json();
  return (data.deployments ?? []).map((d: Record<string, unknown>) => ({
    uid: d.uid, name: d.name, url: d.url, state: d.state,
    createdAt: d.createdAt, target: d.target
  }));
}
