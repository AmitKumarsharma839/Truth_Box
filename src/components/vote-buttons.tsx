"use client";

import clsx from "clsx";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { formatCount } from "@/lib/format";

type VoteValue = -1 | 0 | 1;

type VoteButtonsProps = {
  postId: string;
  initialScore: number;
  initialVote: VoteValue;
};

export function VoteButtons({ postId, initialScore, initialVote }: VoteButtonsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [score, setScore] = useState(initialScore);
  const [vote, setVote] = useState<VoteValue>(initialVote);
  const [pending, setPending] = useState(false);

  async function submitVote(nextVote: VoteValue) {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    const targetVote = vote === nextVote ? 0 : nextVote;
    const previousVote = vote;
    const previousScore = score;
    const optimisticScore = score + targetVote - previousVote;

    setVote(targetVote);
    setScore(optimisticScore);
    setPending(true);

    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ value: targetVote })
      });

      if (!response.ok) {
        throw new Error("Vote failed");
      }

      const data = (await response.json()) as { score: number; userVote: VoteValue };
      setScore(data.score);
      setVote(data.userVote);
    } catch {
      setScore(previousScore);
      setVote(previousVote);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex w-10 shrink-0 flex-col items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      <button
        type="button"
        disabled={pending}
        onClick={() => submitVote(1)}
        className={clsx(
          "flex h-9 w-full items-center justify-center transition hover:bg-orange-50 disabled:cursor-wait",
          vote === 1 ? "text-brand-600" : "text-slate-500"
        )}
        title="Upvote"
      >
        <ArrowBigUp className="h-5 w-5" aria-hidden />
      </button>
      <span className="flex min-h-7 w-full items-center justify-center border-y border-slate-200 bg-white px-1 text-xs font-bold text-slate-800">
        {formatCount(score)}
      </span>
      <button
        type="button"
        disabled={pending}
        onClick={() => submitVote(-1)}
        className={clsx(
          "flex h-9 w-full items-center justify-center transition hover:bg-sky-50 disabled:cursor-wait",
          vote === -1 ? "text-sky-600" : "text-slate-500"
        )}
        title="Downvote"
      >
        <ArrowBigDown className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
