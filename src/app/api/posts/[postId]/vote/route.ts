import { NextResponse } from "next/server";

import { jsonError, validationError } from "@/lib/http";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/session";
import { voteSchema } from "@/lib/validation";

type RouteContext = {
  params: {
    postId: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  const user = await requireCurrentUser();

  if (!user) {
    return jsonError("You must be logged in", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
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

  const result = await prisma.$transaction(async (tx) => {
    const existingVote = await tx.vote.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: params.postId
        }
      }
    });

    let delta = 0;

    if (parsed.data.value === 0) {
      if (existingVote) {
        delta = -existingVote.value;
        await tx.vote.delete({
          where: {
            userId_postId: {
              userId: user.id,
              postId: params.postId
            }
          }
        });
      }
    } else if (existingVote) {
      delta = parsed.data.value - existingVote.value;
      await tx.vote.update({
        where: {
          userId_postId: {
            userId: user.id,
            postId: params.postId
          }
        },
        data: {
          value: parsed.data.value
        }
      });
    } else {
      delta = parsed.data.value;
      await tx.vote.create({
        data: {
          value: parsed.data.value,
          userId: user.id,
          postId: params.postId
        }
      });
    }

    const updatedPost = await tx.post.update({
      where: {
        id: params.postId
      },
      data: {
        score: {
          increment: delta
        }
      },
      select: {
        score: true
      }
    });

    return {
      score: updatedPost.score,
      userVote: parsed.data.value
    };
  });

  return NextResponse.json(result);
}
