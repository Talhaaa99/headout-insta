// app/api/likes/route.ts
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ratelimit } from "../_lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { postId } = await req.json();

  let { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) {
    // Create profile if it doesn't exist
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ clerk_user_id: userId })
      .select("id")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return new Response("Failed to create profile", { status: 500 });
    }
    profile = newProfile;
  }

  const { error } = await supabaseAdmin
    .from("likes")
    .insert({ post_id: postId, user_id: profile.id });
  if (error && !error.message.includes("duplicate key"))
    return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const { postId } = await req.json();

  let { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (!profile) {
    // Create profile if it doesn't exist
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ clerk_user_id: userId })
      .select("id")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return new Response("Failed to create profile", { status: 500 });
    }
    profile = newProfile;
  }

  const { error } = await supabaseAdmin
    .from("likes")
    .delete()
    .match({ post_id: postId, user_id: profile.id });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}
