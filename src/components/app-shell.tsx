"use client";

import clsx from "clsx";
import { LogIn, LogOut, Moon, Plus, Sun, Users } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/communities", label: "Communities" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState<"sand" | "dark">("sand");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("truthbox-theme");
    const nextTheme = savedTheme === "dark" ? "dark" : "sand";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "sand" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("truthbox-theme", nextTheme);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-sm font-black text-white">
              T
            </span>
            <span className="hidden text-base font-bold text-black sm:inline">TruthBox</span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-100",
                  pathname === item.href ? "text-brand-700" : "text-slate-600"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
              title={theme === "dark" ? "Use sandy background" : "Use dark background"}
              aria-label={theme === "dark" ? "Use sandy background" : "Use dark background"}
              aria-pressed={theme === "dark"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>

            <Link
              href="/submit"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Post</span>
            </Link>

            {status === "loading" ? (
              <div className="h-10 w-20 animate-pulse rounded-md bg-slate-200" />
            ) : session?.user ? (
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                title={`Logout ${session.user.username}`}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                <span className="hidden max-w-24 truncate sm:inline">{session.user.username}</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <LogIn className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">Login</span>
                </Link>
                <Link
                  href="/signup"
                  className="hidden h-10 items-center gap-2 rounded-md border border-orange-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-100 sm:inline-flex"
                >
                  <Users className="h-4 w-4" aria-hidden />
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-4">{children}</div>
    </div>
  );
}
