import { PostType } from "@prisma/client";
import { NextResponse } from "next/server";

import { jsonError, validationError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getCurrentUserId, requireCurrentUser } from "@/lib/session";
import { postIncludeFor, toPostDto } from "@/lib/serializers";
import { postSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") === "popular" ? "popular" : "latest";
  const communitySlug = searchParams.get("community");
  const userId = await getCurrentUserId();

  const posts = await prisma.post.findMany({
    where: communitySlug
      ? {
          community: {
            slug: communitySlug
          }
        }
      : undefined,
    include: postIncludeFor(userId),
    orderBy:
      sort === "popular"
        ? [
            {
              score: "desc"
            },
            {
              createdAt: "desc"
            }
          ]
        : {
            createdAt: "desc"
          },
    take: 50
  });

  return NextResponse.json({
    posts: posts.map(toPostDto)
  });
}

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return jsonError("You must be logged in", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const community = await prisma.community.findUnique({
    where: {
      slug: parsed.data.communitySlug
    },
    select: {
      id: true
    }
  });

  if (!community) {
    return jsonError("Community not found", 404);
  }

  const post = await prisma.post.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content || null,
      url: parsed.data.type === PostType.LINK ? parsed.data.url ?? null : null,
      imageUrl: parsed.data.type === PostType.IMAGE ? parsed.data.imageUrl ?? null : null,
      type: parsed.data.type,
      authorId: user.id,
      communityId: community.id
    },
    include: postIncludeFor(user.id)
  });

  return NextResponse.json({ post: toPostDto(post) }, { status: 201 });
}
