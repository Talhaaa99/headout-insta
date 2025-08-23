import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // lookup image_path
  const { data: post, error } = await supabaseAdmin
    .from("posts")
    .select("image_path")
    .eq("id", id)
    .single();
  if (error || !post) return new Response("Not found", { status: 404 });
  
  // Check if image_path is a direct URL (like Unsplash)
  if (post.image_path.startsWith('http')) {
    return Response.json({ url: post.image_path });
  }
  
  // Otherwise, get signed URL from Supabase storage
  const { data, error: sigErr } = await supabaseAdmin.storage
    .from("posts")
    .createSignedUrl(post.image_path, 60 * 60); // 1 hour
  if (sigErr) return new Response(sigErr.message, { status: 500 });
  return Response.json({ url: data.signedUrl });
}
