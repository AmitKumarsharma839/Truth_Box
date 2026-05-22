"use client";

import clsx from "clsx";
import { Clock3, Flame, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { PostCard } from "@/components/post-card";
import { FeedSkeleton } from "@/components/skeletons";
import type { PostDto } from "@/types/api";

type SortMode = "latest" | "popular";

type FeedProps = {
  communitySlug?: string;
};

export function Feed({ communitySlug }: FeedProps) {
  const [sort, setSort] = useState<SortMode>("latest");
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const submitHref = useMemo(() => {
    if (!communitySlug) {
      return "/submit";
    }

    return `/submit?community=${encodeURIComponent(communitySlug)}`;
  }, [communitySlug]);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({ sort });
      if (communitySlug) {
        params.set("community", communitySlug);
      }

      try {
        const response = await fetch(`/api/posts?${params.toString()}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load posts");
        }

        const data = (await response.json()) as { posts: PostDto[] };

        if (active) {
          setPosts(data.posts);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load posts");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [communitySlug, sort]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-soft">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSort("latest")}
            className={clsx(
              "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
              sort === "latest" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Clock3 className="h-4 w-4" aria-hidden />
            Latest
          </button>
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={clsx(
              "inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition",
              sort === "popular" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Flame className="h-4 w-4" aria-hidden />
            Popular
          </button>
        </div>
        <Link
          href={submitHref}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Post
        </Link>
      </div>

      {loading ? <FeedSkeleton /> : null}

      {!loading && error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error && posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          body="Start the conversation in this community."
          href={submitHref}
          action="Create post"
        />
      ) : null}

      {!loading && !error && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
