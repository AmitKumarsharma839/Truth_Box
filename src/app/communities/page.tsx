import { CommunityForm } from "@/components/community-form";
import { CommunityList } from "@/components/community-list";

export default function CommunitiesPage() {
  return (
    <main className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <section className="min-w-0">
        <CommunityForm />
      </section>
      <section className="min-w-0">
        <CommunityList />
      </section>
    </main>
  );
}
