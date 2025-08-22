import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  // lookup image_path
  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("image_path")
    .eq("id", params.id)
    .single();
  if (error || !post) return new Response("Not found", { status: 404 });
  const { data, error: sigErr } = await supabaseAdmin.storage
    .from("posts")
    .createSignedUrl(post.image_path, 60 * 60); // 1 hour
  if (sigErr) return new Response(sigErr.message, { status: 500 });
  return Response.json({ url: data.signedUrl });
}
