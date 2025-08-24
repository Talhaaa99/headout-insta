"use client";
import useSWRInfinite from "swr/infinite";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatTimeAgo } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

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
    imageUrl?: string | null;
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
  const hasMore = data && data[data.length - 1]?.nextCursor;
  const loadingRef = useRef<HTMLDivElement>(null);

  // Auto-load more when scrolling to the bottom
  const loadMore = useCallback(() => {
    if (hasMore && !isValidating) {
      setSize(size + 1);
    }
  }, [hasMore, isValidating, setSize, size]);

  // Intersection observer for auto-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isValidating]);

  return (
    <div className="space-y-4">
      {/* Initial Loading State */}
      {items.length === 0 && isValidating && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <PostSkeleton key={index} />
          ))}
        </div>
      )}

      {/* No Posts State */}
      {items.length === 0 && !isValidating && (
        <div className="text-center py-12">
          <div className="glass-effect rounded-2xl p-8">
            <h3 className="text-xl font-title text-foreground mb-2">
              No posts yet
            </h3>
            <p className="text-muted-foreground">
              Be the first to share a photo!
            </p>
          </div>
        </div>
      )}

      {/* Posts */}
      {items.length > 0 && (
        <>
          {items.map((p: Post, index: number) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FeedCard post={p} />
            </motion.div>
          ))}

          {/* Loading indicator - also serves as intersection observer target */}
          {(isValidating || hasMore) && (
            <motion.div
              ref={loadingRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-muted-foreground font-medium">
                  {isValidating ? "Loading posts..." : "Loading more..."}
                </span>
              </div>
            </motion.div>
          )}

          {!hasMore && items.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-muted-foreground font-text">
                You&apos;ve reached the end! 🎉
              </p>
            </motion.div>
          )}
        </>
      )}
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
      toast.error("Failed to update like");
    } else {
      toast.success(liked ? "Unliked" : "Liked!");
    }
  };

  // Generate like preview text
  const getLikePreview = () => {
    if (count === 0) return "";
    if (count === 1 && liked) return "You";
    if (count === 1) return "1 person";
    if (liked) {
      return count === 2 ? "You + 1" : `You + ${count - 1}`;
    }
    return `${count} people`;
  };

  return (
    <motion.button
      onClick={toggle}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{ scale: liked ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.2 }}
      >
        {liked ? (
          <svg
            className="w-5 h-5 text-red-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </motion.div>
      <span className="text-sm font-medium">{getLikePreview()}</span>
    </motion.button>
  );
}

function FeedCard({ post }: { post: Post }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
    
    fetch(`/api/posts/${post.id}/image`)
      .then((r) => r.json())
      .then((d: { url: string }) => {
        setImgUrl(d.url);
        setImageLoading(false);
      })
      .catch(() => {
        setImageError(true);
        setImageLoading(false);
      });
  }, [post.id]);

  // Get user display info
  const getUserDisplayInfo = () => {
    // If this is the current user's post, show their Clerk data
    if (user && post.user_id === user.id) {
      return {
        name: user.username || user.firstName || "You",
        avatar: user.imageUrl,
      };
    }

    // Otherwise show the stored profile data
    if (post.profiles?.username && post.profiles.username !== "Unknown User") {
      return {
        name: post.profiles.username,
        avatar: post.profiles.imageUrl || null,
      };
    }

    return {
      name: "Unknown User",
      avatar: null,
    };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <div className="glass-effect rounded-2xl overflow-hidden glow-hover transition-all duration-300">
      {/* User Profile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          {userInfo.avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={userInfo.avatar}
                alt={userInfo.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {userInfo.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {userInfo.name}
            </p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTimeAgo(post.created_at)}
        </span>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-muted/20">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading image...</span>
            </div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-muted/40 rounded-full flex items-center justify-center">
                <span className="text-muted-foreground">📷</span>
              </div>
              <p className="text-sm text-muted-foreground">Failed to load image</p>
            </div>
          </div>
        )}
        
        {imgUrl && !imageLoading && !imageError && (
          <Image
            src={imgUrl}
            alt={post.caption ?? "Post"}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 600px"
            quality={95}
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        )}
      </div>

      {/* Caption and Actions */}
      <div className="p-4 space-y-4">
        {post.caption && (
          <p className="text-foreground font-text text-sm leading-relaxed">
            {post.caption}
          </p>
        )}
        <div className="flex items-center gap-4">
          <LikeButton post={post} />
          <button
            onClick={() => sharePost(post.id)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            Share
          </button>
        </div>
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
      toast.success("Link copied to clipboard!");
    }
    await fetch("/api/share", {
      method: "POST",
      body: JSON.stringify({ postId }),
    });
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      toast.error("Failed to share post");
    }
  }
}

// Skeleton loader component
function PostSkeleton() {
  return (
    <div className="glass-effect rounded-2xl overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted/60"></div>
          <div className="space-y-1">
            <div className="h-3 w-20 bg-muted/60 rounded"></div>
          </div>
        </div>
        <div className="h-3 w-16 bg-muted/60 rounded"></div>
      </div>

      {/* Image Skeleton */}
      <div className="relative w-full aspect-[4/5] bg-muted/40">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-muted/60 animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/60 rounded"></div>
          <div className="h-4 w-3/4 bg-muted/60 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-5 w-16 bg-muted/60 rounded"></div>
        </div>
      </div>
    </div>
  );
}
