// app/api/upload/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { ratelimit } from "../_lib/rate-limit";

// Dynamic import for Sharp to handle production issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharp: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sharp = require("sharp");
} catch (error) {
  console.error("Sharp import failed:", error);
  sharp = null;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const revalidate = 0;

export async function GET() {
  try {
    // Test if environment variables are available
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasClerkKey = !!process.env.CLERK_SECRET_KEY;

    return Response.json({
      status: "Upload API is working",
      timestamp: new Date().toISOString(),
      methods: ["POST"],
      deployment: "v2.0.1",
      cache: "busted",
      env: {
        hasSupabaseUrl,
        hasSupabaseKey,
        hasClerkKey,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "GET method failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Explicitly handle other methods to prevent 405
export async function PUT() {
  return new Response("Method not allowed", { status: 405 });
}

export async function DELETE() {
  return new Response("Method not allowed", { status: 405 });
}

export async function PATCH() {
  return new Response("Method not allowed", { status: 405 });
}

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
    const userDataStr = (form.get("userData") as string) || "";
    const userData = userDataStr ? JSON.parse(userDataStr) : null;

    if (!file) return new Response("No file", { status: 400 });

    // get or create profile id
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, profile_picture_url")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (!profile) {
      // Create profile if it doesn't exist
      console.log("Creating new profile for user:", userId);
      const { data: newProfile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          clerk_user_id: userId,
          username: userData?.username || `user_${userId.slice(-6)}`,
          display_name:
            userData?.displayName ||
            userData?.username ||
            `user_${userId.slice(-6)}`,
          profile_picture_url: userData?.profilePictureUrl || null,
        })
        .select("id, username, display_name, profile_picture_url")
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
    } else if (
      userData &&
      (profile.username !== userData.username ||
        profile.profile_picture_url !== userData.profilePictureUrl)
    ) {
      // Update existing profile with new user data
      console.log("Updating profile with new user data");
      const { data: updatedProfile, error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          username: userData.username || profile.username,
          display_name:
            userData.displayName || userData.username || profile.display_name,
          profile_picture_url:
            userData.profilePictureUrl || profile.profile_picture_url,
        })
        .eq("id", profile.id)
        .select("id, username, display_name, profile_picture_url")
        .single();

      if (updateError) {
        console.error("Profile update error:", updateError);
      } else {
        profile = updatedProfile;
        console.log("Profile updated:", profile.id);
      }
    }

    const objectKey = `user_${profile.id}/${crypto.randomUUID()}.jpg`;

    // Process image for better quality and dimensions
    console.log("Processing image for upload");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if Sharp is available and process image
    let finalBuffer: Buffer;
    let contentType: string;

    if (!sharp) {
      console.error("Sharp is not available, using original image");
      finalBuffer = buffer;
      contentType = file.type;
    } else {
      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      console.log(
        "Original image dimensions:",
        metadata.width,
        "x",
        metadata.height
      );

      // Process image with better quality
      let processedBuffer = sharp(buffer, {
        failOnError: false,
        limitInputPixels: false,
      });

      // If image is too large, resize while maintaining aspect ratio
      const maxDimension = 2048;
      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > maxDimension || metadata.height > maxDimension)
      ) {
        processedBuffer = processedBuffer.resize(maxDimension, maxDimension, {
          fit: "inside",
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3, // Better resizing algorithm
        });
        console.log("Resized image to max dimension:", maxDimension);
      }

      // Convert to high-quality JPEG if not already
      finalBuffer = await processedBuffer
        .jpeg({
          quality: 95,
          progressive: true,
          mozjpeg: true,
          chromaSubsampling: "4:4:4", // Better color quality
        })
        .toBuffer();
      contentType = "image/jpeg";
    }

    // upload to Storage
    console.log("Uploading image to storage:", objectKey);
    const { error: upErr } = await supabaseAdmin.storage
      .from("posts")
      .upload(objectKey, finalBuffer, {
        contentType,
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
