"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CommentSection } from "@/components/comment-section";
import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/skeletons";
import type { PostDto } from "@/types/api";

export function PostDetail({ postId }: { postId: string }) {
  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPost() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/posts/${postId}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = (await response.json()) as { post: PostDto };

        if (active) {
          setPost(data.post);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Post not found");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => {
      active = false;
    };
  }, [postId]);

  if (loading) {
    return <FeedSkeleton />;
  }

  if (error || !post) {
    return <EmptyState title="Post not found" body="The post may have been deleted." href="/" action="Back home" />;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4">
      <Link href={`/c/${post.community.slug}`} className="inline-flex text-sm font-semibold text-brand-700 hover:text-brand-600">
        r/{post.community.name}
      </Link>
      <PostCard post={post} detail />
      <CommentSection postId={post.id} />
    </main>
  );
}
