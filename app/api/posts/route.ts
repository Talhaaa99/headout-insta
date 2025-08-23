// app/api/posts/route.ts
import { supabaseAdmin } from "@/lib/supabase-server";
import { NextRequest } from "next/server";
import { ratelimit } from "../_lib/rate-limit";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "global";
  const { success } = await ratelimit.limit(ip);
  if (!success) return new Response("Too Many Requests", { status: 429 });

  const cursor = req.nextUrl.searchParams.get("cursor"); // created_at iso
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10);

  // Get current user for like status
  const { userId } = await auth();

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

    // Get current user's profile for like status
    let currentUserProfile = null;
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", userId)
        .maybeSingle();
      currentUserProfile = profile;
    }

    // Get all like counts and user likes in batch
    const postIds = posts.map((post: any) => post.id);

    // Get like counts for all posts
    const { data: likeCounts } = await supabaseAdmin
      .from("likes")
      .select("post_id")
      .in("post_id", postIds);

    // Get current user's likes for all posts
    let userLikes: any[] = [];
    if (currentUserProfile) {
      const { data: likes } = await supabaseAdmin
        .from("likes")
        .select("post_id")
        .in("post_id", postIds)
        .eq("user_id", currentUserProfile.id);
      userLikes = likes || [];
    }

    // Count likes per post
    const likeCountMap = new Map<string, number>();
    likeCounts?.forEach((like: any) => {
      likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) || 0) + 1);
    });

    // Create set of posts user liked
    const userLikedSet = new Set(userLikes.map((like: any) => like.post_id));

    // Add basic properties that the frontend expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enhancedPosts = posts.map((post: any) => ({
      ...post,
      like_count: likeCountMap.get(post.id) || 0,
      viewer_liked: userLikedSet.has(post.id),
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
