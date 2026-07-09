import { NextResponse } from "next/server";
import { setStrategyActivation } from "@/lib/persistence";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({ enabled: true })) as { enabled?: boolean };
  return NextResponse.json(await setStrategyActivation(id, Boolean(body.enabled)));
}
