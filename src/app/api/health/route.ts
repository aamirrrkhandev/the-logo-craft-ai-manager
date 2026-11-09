import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ ok: true, service: "The Logo Craft AI Manager", mode: "read-only" });
}
