// app/api/posts/route.ts
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import { ratelimit } from "../_lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });

  const cursor = req.nextUrl.searchParams.get("cursor"); // created_at iso
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

  try {
    // Query posts with profile information
    let query = supabaseAdmin
      .from("posts")
      .select(
        `
          id, 
          caption, 
          image_path, 
          created_at, 
          user_id,
          profiles!posts_user_id_fkey(
            clerk_user_id,
            username,
            display_name,
            profile_picture_url
          )
        `
      )
      .order("created_at", { ascending: false })
      .limit(limit + 1);

    if (cursor) query = query.lt("created_at", cursor);

    const { data: posts, error } = await query;
    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    if (!posts) {
      return Response.json({ items: [], nextCursor: null });
    }

    // Add basic properties that the frontend expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedPosts = posts.map((post: any) => ({
      ...post,
      like_count: 0, // Default to 0, will be updated when likes system is working
      viewer_liked: false,
      profiles: {
        username:
          post.profiles?.display_name ||
          post.profiles?.username ||
          "Unknown User",
        imageUrl: post.profiles?.profile_picture_url || null,
      },
    }));

    const hasMore = enhancedPosts.length > limit;
    const items = enhancedPosts.slice(0, limit);
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    return Response.json({ items, nextCursor });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
