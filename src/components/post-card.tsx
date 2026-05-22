"use client";

/* eslint-disable @next/next/no-img-element */

import { ExternalLink, ImageIcon, LinkIcon, MessageCircle } from "lucide-react";
import Link from "next/link";

import { timeAgo } from "@/lib/format";
import type { PostDto } from "@/types/api";
import { VoteButtons } from "@/components/vote-buttons";

type PostCardProps = {
  post: PostDto;
  detail?: boolean;
};

export function PostCard({ post, detail = false }: PostCardProps) {
  const postHref = `/post/${post.id}`;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-soft transition hover:border-slate-300">
      <div className="flex gap-3">
        <VoteButtons postId={post.id} initialScore={post.score} initialVote={post.userVote} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <Link href={`/c/${post.community.slug}`} className="font-semibold text-slate-800 hover:text-brand-700">
              r/{post.community.name}
            </Link>
            <span>posted by u/{post.author.username}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          {detail ? (
            <h1 className="mt-2 break-words text-xl font-bold leading-snug text-slate-950">{post.title}</h1>
          ) : (
            <Link href={postHref}>
              <h2 className="mt-2 break-words text-lg font-bold leading-snug text-slate-950 hover:text-brand-700">
                {post.title}
              </h2>
            </Link>
          )}

          <PostBody post={post} detail={detail} />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={postHref}
              className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {post.commentsCount} comments
            </Link>
            {post.type === "LINK" && post.url ? (
              <a
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function PostBody({ post, detail }: { post: PostDto; detail: boolean }) {
  if (post.type === "IMAGE" && post.imageUrl) {
    return (
      <div className="mt-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <img src={post.imageUrl} alt="" className="max-h-[560px] w-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (post.type === "LINK" && post.url) {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:border-brand-200 hover:bg-brand-50"
      >
        <LinkIcon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        <span className="truncate">{post.url}</span>
      </a>
    );
  }

  if (!post.content) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
        <ImageIcon className="h-4 w-4" aria-hidden />
        No body
      </div>
    );
  }

  return (
    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
      {detail || post.content.length <= 260 ? post.content : `${post.content.slice(0, 260)}...`}
    </p>
  );
}
