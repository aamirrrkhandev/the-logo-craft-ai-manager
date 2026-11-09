import { getWordPressPosts, getWordPressSiteInfo } from "@/lib/integrations/wordpress";
import { getVercelDeployments } from "@/lib/integrations/vercel";

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "list_published_wordpress_posts",
      description: "Read the latest published WordPress posts from the connected site.",
      parameters: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50 } }, required: [], additionalProperties: false }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_wordpress_site_info",
      description: "Read the public WordPress REST API site metadata.",
      parameters: { type: "object", properties: {}, additionalProperties: false }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "list_recent_vercel_deployments",
      description: "Read recent deployments for the configured Vercel project.",
      parameters: { type: "object", properties: {}, additionalProperties: false }
    }
  }
];

export async function executeReadTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "list_published_wordpress_posts":
      return getWordPressPosts(Number(args.limit ?? 20));
    case "get_wordpress_site_info":
      return getWordPressSiteInfo();
    case "list_recent_vercel_deployments":
      return getVercelDeployments();
    default:
      throw new Error("Tool not allowed.");
  }
}
