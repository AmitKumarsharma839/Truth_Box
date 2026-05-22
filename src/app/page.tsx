import { CommunityList } from "@/components/community-list";
import { Feed } from "@/components/feed";

export default function HomePage() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main className="min-w-0">
        <Feed />
      </main>
      <aside className="min-w-0 lg:sticky lg:top-20 lg:h-fit">
        <CommunityList compact />
      </aside>
    </div>
  );
}
