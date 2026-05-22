import { NextResponse } from "next/server";

import { jsonError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { postIncludeFor, toPostDto } from "@/lib/serializers";

type RouteContext = {
  params: {
    postId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const userId = await getCurrentUserId();
  const post = await prisma.post.findUnique({
    where: {
      id: params.postId
    },
    include: postIncludeFor(userId)
  });

  if (!post) {
    return jsonError("Post not found", 404);
  }

  return NextResponse.json({
    post: toPostDto(post)
  });
}
