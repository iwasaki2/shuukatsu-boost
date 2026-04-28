"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/companies";

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login"
      ? { email, password }
      : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "エラーが発生しました");
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/logo-icon.png" alt="ガクチカBoost" width={64} height={64} className="mx-auto mb-4 rounded-full" />
          <h1 className="text-2xl font-bold text-[var(--navy)]">ガクチカBoost</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">AI面接対策ツール</p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_16px_48px_rgba(26,45,122,0.1)]">
          <div className="flex border-b border-[var(--line)]">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-4 text-sm font-semibold transition ${
                  mode === m
                    ? "border-b-2 border-[var(--navy)] text-[var(--navy)]"
                    : "text-[var(--muted)] hover:text-[var(--navy)]"
                }`}
              >
                {m === "login" ? "ログイン" : "新規登録"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-7">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-[var(--navy)]">名前</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="山田 太郎"
                  required
                  className="mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)]">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--navy)]">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "6文字以上" : "パスワード"}
                required
                className="mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
              />
            </div>

            {error && (
              <p className="rounded-[1.25rem] bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--navy)] py-3.5 text-sm font-semibold text-white transition hover:bg-[#14246a] disabled:opacity-60"
            >
              {loading ? "処理中..." : mode === "login" ? "ログイン" : "アカウントを作成"}
            </button>

            <p className="text-center text-xs text-[var(--muted)]">
              {mode === "login" ? "アカウントをお持ちでない方は" : "すでにアカウントをお持ちの方は"}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="ml-1 font-semibold text-[var(--navy)] underline-offset-2 hover:underline"
              >
                {mode === "login" ? "新規登録" : "ログイン"}
              </button>
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          登録不要でお試しの場合は{" "}
          <Link href="/companies" className="font-semibold text-[var(--navy)] underline-offset-2 hover:underline">
            ゲストとして続ける
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
