import type { Prisma } from "@prisma/client";

import type { CommentDto, CommunityDto, PostDto } from "@/types/api";

export function communityInclude() {
  return {
    owner: {
      select: {
        id: true,
        username: true
      }
    },
    _count: {
      select: {
        posts: true
      }
    }
  } satisfies Prisma.CommunityInclude;
}

export function postIncludeFor(userId?: string | null) {
  return {
    author: {
      select: {
        id: true,
        username: true
      }
    },
    community: {
      select: {
        id: true,
        name: true,
        slug: true
      }
    },
    votes: {
      where: {
        userId: userId ?? "__anonymous__"
      },
      select: {
        value: true
      }
    },
    _count: {
      select: {
        comments: true
      }
    }
  } satisfies Prisma.PostInclude;
}

export function commentInclude() {
  return {
    author: {
      select: {
        id: true,
        username: true
      }
    }
  } satisfies Prisma.CommentInclude;
}

type CommunityWithMeta = Prisma.CommunityGetPayload<{
  include: ReturnType<typeof communityInclude>;
}>;

type PostWithMeta = Prisma.PostGetPayload<{
  include: ReturnType<typeof postIncludeFor>;
}>;

type CommentWithMeta = Prisma.CommentGetPayload<{
  include: ReturnType<typeof commentInclude>;
}>;

export function toCommunityDto(community: CommunityWithMeta): CommunityDto {
  return {
    id: community.id,
    name: community.name,
    slug: community.slug,
    description: community.description,
    createdAt: community.createdAt.toISOString(),
    owner: community.owner,
    postsCount: community._count.posts
  };
}

export function toPostDto(post: PostWithMeta): PostDto {
  const rawVote = post.votes[0]?.value ?? 0;
  const userVote = rawVote === 1 || rawVote === -1 ? rawVote : 0;

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    url: post.url,
    imageUrl: post.imageUrl,
    type: post.type,
    score: post.score,
    userVote,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    community: post.community,
    commentsCount: post._count.comments
  };
}

export function toCommentDto(comment: CommentWithMeta): CommentDto {
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    author: comment.author
  };
}
