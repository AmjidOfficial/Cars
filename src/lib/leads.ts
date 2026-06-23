import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Intent = Database["public"]["Enums"]["lead_intent"];

export async function captureLead(input: {
  intent: Intent;
  showroomId?: string | null;
  inventoryId?: string | null;
  visitorMobile?: string | null;
  visitorName?: string | null;
  notes?: string | null;
}) {
  try {
    await supabase.from("leads").insert({
      intent: input.intent,
      target_showroom_id: input.showroomId ?? null,
      target_inventory_id: input.inventoryId ?? null,
      visitor_mobile: input.visitorMobile ?? null,
      visitor_name: input.visitorName ?? null,
      notes: input.notes ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (e) {
    // Telemetry must never break UX
    console.warn("[lead] capture failed", e);
  }
}
