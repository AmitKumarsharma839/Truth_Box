"use client";

import { Loader2, MessageCircle, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { timeAgo } from "@/lib/format";
import type { CommentDto } from "@/types/api";

export function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/posts/${postId}/comments`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Could not load comments");
        }

        const data = (await response.json()) as { comments: CommentDto[] };

        if (active) {
          setComments(data.comments);
        }
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : "Could not load comments");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [postId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: String(formData.get("body") || "")
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Could not add comment");
      }

      const data = (await response.json()) as { comment: CommentDto };
      setComments((current) => [...current, data.comment]);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not add comment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-slate-500" aria-hidden />
        <h2 className="text-lg font-bold text-slate-950">Comments</h2>
      </div>

      {session?.user ? (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <textarea
            name="body"
            rows={4}
            required
            maxLength={2000}
            className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 transition focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            Comment
          </button>
        </form>
      ) : (
        <Link
          href={`/login?callbackUrl=/post/${postId}`}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Login
        </Link>
      )}

      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mt-5 space-y-3">
        {loading ? (
          <>
            <div className="h-20 animate-pulse rounded-md bg-slate-100" />
            <div className="h-20 animate-pulse rounded-md bg-slate-100" />
          </>
        ) : null}

        {!loading && comments.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">No comments yet.</p>
        ) : null}

        {!loading
          ? comments.map((comment) => (
              <article key={comment.id} className="border-t border-slate-200 pt-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">u/{comment.author.username}</span>
                  <span>{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{comment.body}</p>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}
