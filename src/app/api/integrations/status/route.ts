import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWordPressSiteInfo } from "@/lib/integrations/wordpress";
import { getVercelDeployments } from "@/lib/integrations/vercel";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const checks = await Promise.allSettled([
    getWordPressSiteInfo(),
    getVercelDeployments()
  ]);
  return NextResponse.json({
    wordpress: checks[0].status === "fulfilled"
      ? { connected: true, site: checks[0].value.name }
      : { connected: false, error: checks[0].reason instanceof Error ? checks[0].reason.message : "Connection failed" },
    vercel: checks[1].status === "fulfilled"
      ? { connected: true, recentDeployments: checks[1].value }
      : { connected: false, error: checks[1].reason instanceof Error ? checks[1].reason.message : "Connection failed" },
    productionWritesEnabled: false
  });
}
