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

  let query = supabaseAdmin
    .from("posts")
    .select(
      "id, caption, image_path, created_at, user_id, profiles(username), likes(count), comments(count)",
      { count: "exact", head: false }
    )
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) return new Response(error.message, { status: 500 });

  const hasMore = data.length > limit;
  const items = data.slice(0, limit);
  const nextCursor = hasMore ? items[items.length - 1].created_at : null;

  return Response.json({ items, nextCursor });
}
