"use client";

import clsx from "clsx";
import { FileText, ImageIcon, LinkIcon, Loader2, Send, Upload } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { ListSkeleton } from "@/components/skeletons";
import type { CommunityDto, PostDto } from "@/types/api";

type PostTypeValue = "TEXT" | "LINK" | "IMAGE";

const postTypes: Array<{ value: PostTypeValue; label: string; icon: typeof FileText }> = [
  { value: "TEXT", label: "Text", icon: FileText },
  { value: "LINK", label: "Link", icon: LinkIcon },
  { value: "IMAGE", label: "Image", icon: ImageIcon }
];

export function PostForm({ initialCommunity }: { initialCommunity?: string }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState<CommunityDto[]>([]);
  const [postType, setPostType] = useState<PostTypeValue>("TEXT");
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFileName, setImageFileName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCommunities() {
      setLoadingCommunities(true);

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
          setLoadingCommunities(false);
        }
      }
    }

    loadCommunities();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      let imageUrl = "";

      if (postType === "IMAGE") {
        const imageFile = formData.get("imageFile");

        if (!(imageFile instanceof File) || imageFile.size === 0) {
          throw new Error("Choose an image from your computer");
        }

        const uploadFormData = new FormData();
        uploadFormData.set("file", imageFile);

        const uploadResponse = await fetch("/api/uploads", {
          method: "POST",
          body: uploadFormData
        });

        if (!uploadResponse.ok) {
          const data = (await uploadResponse.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || "Could not upload image");
        }

        const uploadData = (await uploadResponse.json()) as { imageUrl: string };
        imageUrl = uploadData.imageUrl;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: String(formData.get("title") || ""),
          content: String(formData.get("content") || ""),
          url: String(formData.get("url") || ""),
          imageUrl,
          type: postType,
          communitySlug: String(formData.get("communitySlug") || "")
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Could not create post");
      }

      const data = (await response.json()) as { post: PostDto };
      router.push(`/post/${data.post.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create post");
    } finally {
      setSubmitting(false);
    }
  }

  if (status !== "loading" && !session?.user) {
    return (
      <main className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h1 className="text-xl font-bold text-slate-950">Create post</h1>
          <Link
            href="/login?callbackUrl=/submit"
            className="mt-5 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-xl font-bold text-slate-950">Create post</h1>

        {loadingCommunities ? (
          <div className="mt-5">
            <ListSkeleton />
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Community</span>
              <select
                name="communitySlug"
                required
                defaultValue={initialCommunity || communities[0]?.slug || ""}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 transition focus:border-brand-500"
              >
                {communities.map((community) => (
                  <option key={community.id} value={community.slug}>
                    r/{community.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="text-sm font-semibold text-slate-700">Type</span>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {postTypes.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPostType(item.value)}
                      className={clsx(
                        "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
                        postType === item.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                name="title"
                required
                minLength={4}
                maxLength={160}
                className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 transition focus:border-brand-500"
              />
            </label>

            {postType === "TEXT" ? (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Body</span>
                <textarea
                  name="content"
                  rows={8}
                  required
                  className="mt-1 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 transition focus:border-brand-500"
                />
              </label>
            ) : null}

            {postType === "LINK" ? (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">URL</span>
                <input
                  name="url"
                  type="url"
                  required
                  placeholder="https://example.com"
                  className="mt-1 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 transition focus:border-brand-500"
                />
              </label>
            ) : null}

            {postType === "IMAGE" ? (
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Upload image</span>
                <span className="mt-1 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-brand-300 hover:bg-brand-50">
                  <Upload className="h-6 w-6 text-brand-600" aria-hidden />
                  <span className="mt-2 text-sm font-semibold text-slate-700">
                    {imageFileName || "Choose image from computer"}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, or GIF up to 2 MB</span>
                </span>
                <input
                  name="imageFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  required
                  onChange={(event) => setImageFileName(event.target.files?.[0]?.name || "")}
                  className="sr-only"
                />
              </label>
            ) : null}

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting || communities.length === 0}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              Post
            </button>

            {communities.length === 0 ? (
              <Link href="/communities" className="block text-center text-sm font-semibold text-brand-700">
                Create a community first
              </Link>
            ) : null}
          </form>
        )}
      </div>
    </main>
  );
}
