import { PostForm } from "@/components/post-form";

type PageProps = {
  searchParams?: {
    community?: string;
  };
};

export default function SubmitPage({ searchParams }: PageProps) {
  return <PostForm initialCommunity={searchParams?.community} />;
}
