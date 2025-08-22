"use client";
import useSWRInfinite from "swr/infinite";
import Image from "next/image";
import { useState, useEffect } from "react";
import React from "react";

interface Post {
  id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
  user_id: string;
  viewer_liked?: boolean;
  like_count?: number;
  profiles?: {
    username: string;
  };
  likes?: {
    count: number;
  };
  comments?: {
    count: number;
  };
}

interface ApiResponse {
  items: Post[];
  nextCursor: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const getKey = (pageIndex: number, prev: ApiResponse | null) =>
  prev && !prev.nextCursor
    ? null
    : `/api/posts?limit=10${
        prev?.nextCursor ? `&cursor=${encodeURIComponent(prev.nextCursor)}` : ""
      }`;

export default function Feed() {
  const { data, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher);
  const items = data?.flatMap((d: ApiResponse) => d.items) ?? [];

  return (
    <div className="space-y-4">
      {items.map((p: Post) => (
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

function LikeButton({ post }: { post: Post }) {
  const [liked, setLiked] = React.useState<boolean>(post.viewer_liked ?? false);
  const [count, setCount] = React.useState<number>(post.like_count ?? 0);

  const toggle = async () => {
    setLiked((v) => !v);
    setCount((c) => (liked ? c - 1 : c + 1)); // optimistic
    const res = await fetch("/api/likes", {
      method: liked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    });
    if (!res.ok) {
      // rollback on failure
      setLiked((v) => !v);
      setCount((c) => (liked ? c + 1 : c - 1));
    }
  };

  return <button onClick={toggle}>❤️ {count}</button>;
}

function FeedCard({ post }: { post: Post }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/posts/${post.id}/image`)
      .then((r) => r.json())
      .then((d: { url: string }) => setImgUrl(d.url));
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
      <div className="flex gap-2">
        <LikeButton post={post} />
        <button onClick={() => sharePost(post.id)}>Share</button>
      </div>
    </div>
  );
}

async function sharePost(postId: string) {
  const url = `${location.origin}/p/${postId}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Vistagram", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
    await fetch("/api/share", {
      method: "POST",
      body: JSON.stringify({ postId }),
    });
  } catch {
    // ignore cancellations
  }
}
