// app/api/profile/sync/route.ts
import { supabaseAdmin } from "@/lib/supabase-server";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  new Response("Too Many Requests", { status: 429 });

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin.from("profiles").insert({ clerk_user_id: userId });
  }
  return Response.json({ ok: true });
}
