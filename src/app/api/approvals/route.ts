import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Input = z.object({
  actionType: z.string().min(2).max(80),
  target: z.string().min(1).max(500),
  proposedChange: z.record(z.string(), z.unknown()),
  rationale: z.string().min(5).max(2000)
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.approval.findMany({ orderBy: { createdAt: "desc" }, take: 50 }));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid approval proposal." }, { status: 400 });
  // Creating a proposal is not permission to execute it. No production execution endpoint exists in this MVP.
  const approval = await prisma.approval.create({ data: { ...parsed.data, risk: "MEDIUM" } });
  await prisma.auditLog.create({ data: { actor: session.user.email ?? "admin", action: "APPROVAL_PROPOSAL_CREATED", resource: approval.id } });
  return NextResponse.json(approval, { status: 201 });
}
