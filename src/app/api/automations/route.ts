import { NextResponse } from "next/server";
import { getSettingsService, toPublicSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const settings = toPublicSettings(getSettingsService().getRaw());
  return NextResponse.json({ automations: settings.automations });
}
