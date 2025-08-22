import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabase-server";
import { notFound } from "next/navigation";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: post } = await supabaseAdmin
    .from("posts_with_counts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  const { data: signed } = await supabaseAdmin.storage
    .from("posts")
    .createSignedUrl(post.image_path, 60 * 60);

  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg border">
        {signed?.signedUrl && (
          <Image
            src={signed.signedUrl}
            alt={post.caption ?? "POI"}
            fill
            sizes="100vw"
          />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm">{post.caption}</p>
        <div className="text-xs text-muted-foreground">
          ❤️ {post.like_count} · 💬 {post.comment_count} · 📤 {post.share_count}
        </div>
      </div>
    </main>
  );
}
