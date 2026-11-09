import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { runAgent } from "@/lib/agent/run";
import { prisma } from "@/lib/prisma";

const Input = z.object({ message: z.string().trim().min(3).max(2000) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a message between 3 and 2000 characters." }, { status: 400 });
  const task = await prisma.task.create({
    data: { type: "AI_COMMAND", title: parsed.data.message.slice(0, 100), instruction: parsed.data.message, status: "RUNNING" }
  });
  try {
    const result = await runAgent(parsed.data.message);
    await prisma.task.update({ where: { id: task.id }, data: { status: "COMPLETED", result: { answer: result } } });
    await prisma.auditLog.create({ data: { actor: session.user.email ?? "admin", action: "AGENT_READ_COMMAND", resource: task.id } });
    return NextResponse.json({ taskId: task.id, answer: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent failed.";
    await prisma.task.update({ where: { id: task.id }, data: { status: "FAILED", error: message } });
    return NextResponse.json({ taskId: task.id, error: message }, { status: 500 });
  }
}
