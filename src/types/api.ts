export type CommunityDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  owner: {
    id: string;
    username: string;
  };
  postsCount: number;
};

export type PostDto = {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  imageUrl: string | null;
  type: "TEXT" | "LINK" | "IMAGE";
  score: number;
  userVote: -1 | 0 | 1;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
  };
  community: {
    id: string;
    name: string;
    slug: string;
  };
  commentsCount: number;
};

export type CommentDto = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
};
