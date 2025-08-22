// app/api/upload/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ratelimit } from "../_lib/rate-limit";

export const runtime = "nodejs"; // (or "edge" without FormData file stream)

export async function POST(req: NextRequest) {
  try {
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

    // get or create profile id
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (!profile) {
      // Create profile if it doesn't exist
      console.log("Creating new profile for user:", userId);
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({ clerk_user_id: userId })
        .select("id")
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        return new Response(
          JSON.stringify({
            error: "Failed to create profile",
            details: profileError.message,
          }),
          { status: 500 }
        );
      }
      profile = newProfile;
      console.log("Profile created:", profile.id);
    }

    const ext = file.name.split(".").pop() || "jpg";
    const objectKey = `user_${profile.id}/${crypto.randomUUID()}.${ext}`;

    // upload to Storage
    console.log("Uploading to storage:", objectKey);
    const arrayBuffer = await file.arrayBuffer();
    const { error: upErr } = await supabaseAdmin.storage
      .from("posts")
      .upload(objectKey, Buffer.from(arrayBuffer), {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) {
      console.error("Storage upload error:", upErr);
      return new Response(
        JSON.stringify({
          error: "Storage upload failed",
          details: upErr.message,
        }),
        { status: 500 }
      );
    }

    // insert post
    console.log("Inserting post to database");
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

    if (insErr) {
      console.error("Database insert error:", insErr);
      return new Response(
        JSON.stringify({
          error: "Database insert failed",
          details: insErr.message,
        }),
        { status: 500 }
      );
    }
    return Response.json({ post });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
