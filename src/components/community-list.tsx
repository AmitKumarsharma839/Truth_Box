"use client";

import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ListSkeleton } from "@/components/skeletons";
import { timeAgo } from "@/lib/format";
import type { CommunityDto } from "@/types/api";

type CommunityListProps = {
  compact?: boolean;
};

export function CommunityList({ compact = false }: CommunityListProps) {
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommunities() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/communities", {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load communities");
        }

        const data = (await response.json()) as { communities: CommunityDto[] };

        if (active) {
          setCommunities(data.communities);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load communities");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCommunities();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className={compact ? "text-base font-bold text-slate-950" : "text-xl font-bold text-slate-950"}>
          Communities
        </h1>
        <Link
          href="/communities"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New
        </Link>
      </div>

      {loading ? <ListSkeleton /> : null}

      {!loading && error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-3">
          {communities.map((community) => (
            <Link
              key={community.id}
              href={`/c/${community.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 shadow-soft transition hover:border-brand-200 hover:bg-brand-50"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
                  r/
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <h2 className="truncate text-sm font-bold text-slate-950">r/{community.name}</h2>
                    <span className="shrink-0 text-xs text-slate-500">{timeAgo(community.createdAt)}</span>
                  </div>
                  {community.description ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{community.description}</p>
                  ) : null}
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {community.postsCount} posts
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
