import { NextResponse } from "next/server";

import { jsonError, validationError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";
import { commentInclude, toCommentDto } from "@/lib/serializers";
import { commentSchema } from "@/lib/validation";

type RouteContext = {
  params: {
    postId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const comments = await prisma.comment.findMany({
    where: {
      postId: params.postId
    },
    include: commentInclude(),
    orderBy: {
      createdAt: "asc"
    }
  });

  return NextResponse.json({
    comments: comments.map(toCommentDto)
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await requireCurrentUser();

  if (!user) {
    return jsonError("You must be logged in", 401);
  }

  const post = await prisma.post.findUnique({
    where: {
      id: params.postId
    },
    select: {
      id: true
    }
  });

  if (!post) {
    return jsonError("Post not found", 404);
  }

  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const comment = await prisma.comment.create({
    data: {
      body: parsed.data.body,
      authorId: user.id,
      postId: params.postId
    },
    include: commentInclude()
  });

  return NextResponse.json({ comment: toCommentDto(comment) }, { status: 201 });
}
