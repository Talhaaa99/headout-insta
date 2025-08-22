// app/api/share/route.ts
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { postId } = await req.json();
  if (!postId) return new Response("postId required", { status: 400 });

  const { error } = await supabaseAdmin.rpc("increment_share_count", {
    _post_id: postId,
  });
  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ ok: true });
}
