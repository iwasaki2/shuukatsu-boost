"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserInfo {
  id: string;
  email: string;
  name: string;
}

export function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        setUser(data.user ?? null);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.push("/login");
    router.refresh();
  };

  if (!loaded) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        ログイン
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-[10px] font-bold text-[var(--navy)]">
          {user.name.charAt(0)}
        </span>
        <span className="max-w-[80px] truncate">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[rgba(26,45,122,0.96)] shadow-lg backdrop-blur-xl">
          <p className="border-b border-white/10 px-4 py-2.5 text-xs text-white/50 truncate">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
