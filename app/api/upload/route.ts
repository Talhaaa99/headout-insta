// app/api/upload/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ratelimit } from "../_lib/rate-limit";

export const runtime = "nodejs"; // (or "edge" without FormData file stream)

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });

  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const caption = (form.get("caption") as string) || "";
  const location = (form.get("location") as string) || ""; // JSON string

  if (!file) return new Response("No file", { status: 400 });

  // get profile id
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!profile) return new Response("Profile not found", { status: 404 });

  const ext = file.name.split(".").pop() || "jpg";
  const objectKey = `user_${profile.id}/${crypto.randomUUID()}.${ext}`;

  // upload to Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: upErr } = await supabaseAdmin.storage
    .from("posts")
    .upload(objectKey, Buffer.from(arrayBuffer), {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
  if (upErr) return new Response(upErr.message, { status: 500 });

  // insert post
  const { error: insErr, data: post } = await supabaseAdmin
    .from("posts")
    .insert({
      user_id: profile.id,
      image_path: objectKey,
      caption,
      location: location ? JSON.parse(location) : null,
    })
    .select()
    .single();

  if (insErr) return new Response(insErr.message, { status: 500 });
  return Response.json({ post });
}
