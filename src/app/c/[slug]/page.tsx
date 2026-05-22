import { CommunityScreen } from "@/components/community-screen";

type PageProps = {
  params: {
    slug: string;
  };
};

export default function CommunityPage({ params }: PageProps) {
  return <CommunityScreen slug={params.slug} />;
}
