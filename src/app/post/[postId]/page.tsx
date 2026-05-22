import { PostDetail } from "@/components/post-detail";

type PageProps = {
  params: {
    postId: string;
  };
};

export default function PostPage({ params }: PageProps) {
  return <PostDetail postId={params.postId} />;
}
