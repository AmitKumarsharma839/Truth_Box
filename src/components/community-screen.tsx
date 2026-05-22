"use client";

import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { Feed } from "@/components/feed";
import { ListSkeleton } from "@/components/skeletons";
import type { CommunityDto } from "@/types/api";

export function CommunityScreen({ slug }: { slug: string }) {
  const [community, setCommunity] = useState<CommunityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommunity() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/communities/${slug}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Community not found");
        }

        const data = (await response.json()) as { community: CommunityDto };

        if (active) {
          setCommunity(data.community);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Community not found");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCommunity();

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return <ListSkeleton />;
  }

  if (error || !community) {
    return (
      <EmptyState
        title="Community not found"
        body="The community may have been deleted or renamed."
        href="/communities"
        action="Browse communities"
      />
    );
  }

  return (
    <main className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-700">r/{community.slug}</p>
            <h1 className="mt-1 break-words text-2xl font-bold text-slate-950">{community.name}</h1>
            {community.description ? (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{community.description}</p>
            ) : null}
            <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Users className="h-4 w-4" aria-hidden />
              {community.postsCount} posts
            </div>
          </div>

          <Link
            href={`/submit?community=${community.slug}`}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Post
          </Link>
        </div>
      </section>

      <Feed communitySlug={community.slug} />
    </main>
  );
}
