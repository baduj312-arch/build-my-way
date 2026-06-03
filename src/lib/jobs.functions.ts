import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      provider_id: z.string().uuid().nullable(),
      price: z.number().min(0),
      eta_min: z.number().int().min(0),
      pickup_lat: z.number(),
      pickup_lng: z.number(),
      dest_lat: z.number().optional(),
      dest_lng: z.number().optional(),
      notes: z.string().max(500).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("jobs")
      .insert({
        driver_id: userId,
        provider_id: data.provider_id,
        price: data.price,
        eta_min: data.eta_min,
        pickup_lat: data.pickup_lat,
        pickup_lng: data.pickup_lng,
        dest_lat: data.dest_lat,
        dest_lng: data.dest_lng,
        notes: data.notes,
        status: data.provider_id ? "assigned" : "pending",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { job: row };
  });

export const getJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase
      .from("jobs")
      .select("*, providers(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { job };
  });

export const logEvent = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      event: z.string().min(1).max(80),
      props: z.record(z.any()).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("analytics_events").insert({
      event: data.event,
      props: data.props ?? {},
    });
    return { ok: true };
  });
