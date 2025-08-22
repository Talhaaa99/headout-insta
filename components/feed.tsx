"use client";
import useSWRInfinite from "swr/infinite";
import Image from "next/image";
import { useState, useEffect } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const getKey = (pageIndex: number, prev: any) =>
  prev && !prev.nextCursor
    ? null
    : `/api/posts?limit=10${
        prev?.nextCursor ? `&cursor=${encodeURIComponent(prev.nextCursor)}` : ""
      }`;

export default function Feed() {
  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const items = data?.flatMap((d: any) => d.items) ?? [];

  return (
    <div className="space-y-4">
      {items.map((p: any) => (
        <FeedCard key={p.id} post={p} />
      ))}
      <button
        onClick={() => setSize(size + 1)}
        disabled={isValidating || (data && !data[data.length - 1]?.nextCursor)}
        className="w-full py-2 border rounded"
      >
        {isValidating ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}

function FeedCard({ post }: { post: any }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/posts/${post.id}/image`)
      .then((r) => r.json())
      .then((d) => setImgUrl(d.url));
  }, [post.id]);

  return (
    <div className="rounded-lg border p-3">
      {imgUrl && (
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-md">
          <Image
            src={imgUrl}
            alt={post.caption ?? "POI"}
            fill
            sizes="(max-width:768px) 100vw, 600px"
          />
        </div>
      )}
      <div className="mt-2 text-sm">{post.caption}</div>
      {/* Like/Comment buttons here */}
    </div>
  );
}
