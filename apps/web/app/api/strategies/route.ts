import { NextResponse } from "next/server";
import { getStrategyMarketplaceSnapshot } from "@/lib/persistence";

export async function GET() {
  return NextResponse.json(await getStrategyMarketplaceSnapshot());
}
