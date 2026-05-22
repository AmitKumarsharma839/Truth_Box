import Link from "next/link";

type EmptyStateProps = {
  title: string;
  body: string;
  href?: string;
  action?: string;
};

export function EmptyState({ title, body, href, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{body}</p>
      {href && action ? (
        <Link
          href={href}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}
