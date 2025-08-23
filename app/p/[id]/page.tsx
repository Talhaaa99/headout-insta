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
    .from("posts")
    .select("id, caption, image_path, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  const { data: signed } = await supabaseAdmin.storage
    .from("posts")
    .createSignedUrl(post.image_path, 60 * 60);

  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          {signed?.signedUrl && (
            <Image
              src={signed.signedUrl}
              alt={post.caption ?? "Post"}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-4 space-y-3">
          {post.caption && (
            <p className="text-foreground font-text text-sm leading-relaxed">
              {post.caption}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>❤️ 0</span>
              <span>💬 0</span>
              <span>📤 0</span>
            </div>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
