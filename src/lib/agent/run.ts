import OpenAI from "openai";
import { toolDefinitions, executeReadTool } from "./tools";

const systemPrompt = `You are the read-only Website Management Agent for The Logo Craft.
You may inspect connected WordPress and Vercel data using the provided read-only tools.
Never claim an action was performed unless a tool confirms it. Never ask for or reveal secrets.
You cannot publish, edit, delete, deploy, change DNS, modify plugins, or alter production.
If the user requests a write action, explain that this MVP can only prepare a proposal; it cannot execute it.
Be concise, evidence-based, and clearly distinguish observed facts from recommendations.`;

export async function runAgent(message: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message }
  ];
  for (let step = 0; step < 5; step++) {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages,
      tools: toolDefinitions,
      tool_choice: "auto",
      temperature: 0.2
    });
    const response = completion.choices[0]?.message;
    if (!response) throw new Error("AI returned an empty response.");
    messages.push(response);
    if (!response.tool_calls?.length) return response.content ?? "No response.";
    for (const call of response.tool_calls) {
      if (call.type !== "function") continue;
      let args: Record<string, unknown> = {};
      try { args = JSON.parse(call.function.arguments || "{}"); } catch { throw new Error("Invalid tool arguments."); }
      const result = await executeReadTool(call.function.name, args);
      messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result).slice(0, 18000) });
    }
  }
  return "Stopped after the safe tool-call limit. Please narrow the request.";
}
