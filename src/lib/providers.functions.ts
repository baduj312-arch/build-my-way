import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const providerInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  workshop: z.string().min(1).max(160),
  type: z.enum(["mechanic", "vulcanizer", "tow", "battery", "fuel"]),
  avatar: z.string().max(8).optional().nullable(),
  rating: z.coerce.number().min(0).max(5).default(4.8),
  verified: z.boolean().default(false),
  home_lat: z.coerce.number(),
  home_lng: z.coerce.number(),
  phone: z.string().max(40).optional().nullable(),
  active: z.boolean().default(true),
  user_id: z.string().uuid().optional().nullable(),
});

export const listProviders = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("providers")
    .select("*")
    .eq("active", true)
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return { providers: data ?? [] };
});

export const listAllProvidersAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { providers: data ?? [] };
  });

export const upsertProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => providerInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    if (data.id) {
      const { error } = await supabase.from("providers").update(data).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const { error } = await supabase.from("providers").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteProvider = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("providers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { roles: (data ?? []).map((r) => r.role) };
  });

export const getMyProvider = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("providers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    return { provider: data };
  });
