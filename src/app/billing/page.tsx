"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PLANS, type PlanId } from "@/lib/plans";

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPlan, setCurrentPlan] = useState<PlanId>("starter");
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [toast, setToast] = useState("");
  const [planLoaded, setPlanLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/plan")
      .then(r => r.json())
      .then(d => {
        setCurrentPlan(d.planId ?? "starter");
        setPlanLoaded(true);
      })
      .catch(() => {
        setCurrentPlan("starter");
        setPlanLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!planLoaded) return;
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const plan = searchParams.get("plan") as PlanId | null;

    if (success === "1" && plan) {
      const msg = `${plan === "growth" ? "Growth" : "Executive"} プランへのアップグレードが完了しました！`;
      fetch("/api/plan")
        .then(r => r.json())
        .then(d => {
          setCurrentPlan(d.planId ?? "starter");
          setToast(msg);
          setTimeout(() => setToast(""), 4000);
        })
        .catch(() => {
          setToast(msg);
          setTimeout(() => setToast(""), 4000);
        });
    }
    if (canceled === "1") {
      fetch("/api/plan")
        .then(r => r.json())
        .then(d => {
          setCurrentPlan(d.planId ?? "starter");
          setToast("決済がキャンセルされました");
          setTimeout(() => setToast(""), 3000);
        })
        .catch(() => {
          setToast("決済がキャンセルされました");
          setTimeout(() => setToast(""), 3000);
        });
    }
  }, [searchParams, planLoaded]);

  const handleUpgrade = async (planId: PlanId) => {
    if (planId === "starter") {
      if (confirm("Starter（無料）プランにダウングレードしますか？\n※解約はStripeダッシュボードで行ってください。")) {
        setToast("解約手続きはメールにてご連絡ください");
        setTimeout(() => setToast(""), 4000);
      }
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (res.status === 401) {
        router.push("/login?from=/billing");
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setToast(data.error ?? "決済URLの取得に失敗しました");
        setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("ネットワークエラーが発生しました");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      {toast && (
        <div className="fixed right-4 top-4 z-50 rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(26,45,122,0.90)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <button onClick={() => router.back()} className="text-sm font-semibold text-white/70 transition hover:text-white">
            ← 戻る
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-white">プランと料金</p>
            <p className="text-[10px] text-white/50">
              現在: <span className="font-semibold text-[var(--gold-soft)]">
                {!planLoaded ? "..." : currentPlan === "starter" ? "Starter（無料）" : currentPlan === "growth" ? "Growth" : "Executive"}
              </span>
            </p>
          </div>
          <div className="w-12" />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[var(--navy)]">プランを選択</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">いつでもアップグレード・ダウングレードできます</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`rounded-[2rem] border p-7 transition ${
                  plan.featured
                    ? "border-[var(--navy)] bg-[var(--navy)] text-white shadow-[0_24px_60px_rgba(26,45,122,0.24)]"
                    : "border-[var(--line)] bg-white text-[var(--ink)]"
                } ${isCurrent ? "ring-2 ring-[var(--gold)] ring-offset-2" : ""}`}
              >
                {isCurrent && (
                  <span className="mb-4 inline-block rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-bold text-[var(--navy)]">
                    現在のプラン
                  </span>
                )}
                <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${plan.featured ? "text-[var(--gold-soft)]" : "text-[var(--accent)]"}`}>
                  {plan.description}
                </p>
                <h2 className="mt-3 text-2xl font-bold">{plan.name}</h2>
                <p className="mt-2 text-4xl font-bold">
                  {plan.priceLabel}
                  <span className={`ml-1 text-sm font-normal ${plan.featured ? "text-white/60" : "text-[var(--muted)]"}`}>
                    {plan.price > 0 ? "/ 月" : ""}
                  </span>
                </p>

                <ul className={`mt-6 space-y-2.5 text-sm ${plan.featured ? "text-white/80" : "text-[var(--ink-soft)]"}`}>
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 text-base leading-none ${plan.featured ? "text-[var(--gold-soft)]" : "text-[var(--gold)]"}`}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || loading === plan.id}
                  className={`mt-7 w-full rounded-full py-3 text-sm font-semibold transition disabled:opacity-50 ${
                    isCurrent
                      ? plan.featured
                        ? "bg-white/10 text-white"
                        : "border border-[var(--line)] text-[var(--muted)]"
                      : plan.featured
                      ? "bg-[var(--gold)] text-[var(--navy)] hover:bg-[#50a8ff]"
                      : "bg-[var(--navy)] text-white hover:bg-[#14246a]"
                  }`}
                >
                  {loading === plan.id
                    ? "処理中..."
                    : isCurrent
                    ? "現在のプラン"
                    : plan.id === "starter"
                    ? "ダウングレード"
                    : `${plan.name} にアップグレード`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-14 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_8px_30px_rgba(26,45,122,0.06)]">
          <div className="p-6">
            <h2 className="text-lg font-bold text-[var(--navy)]">機能の比較</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-[var(--line)] bg-[var(--paper)]">
                <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--muted)]">機能</th>
                {PLANS.map((p) => (
                  <th key={p.id} className={`px-4 py-3 text-center text-xs font-semibold ${p.id === currentPlan ? "text-[var(--gold)]" : "text-[var(--muted)]"}`}>
                    {p.name}
                    {p.id === currentPlan && " ✓"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "面接回答の自動生成", starter: "✓", growth: "✓", executive: "✓" },
                { label: "登録できる企業数", starter: "2社", growth: "無制限", executive: "無制限" },
                { label: "ES・書類対策（自己PR等）", starter: "—", growth: "✓", executive: "✓" },
                { label: "暗記モード", starter: "—", growth: "✓", executive: "✓" },
                { label: "一括削除・管理", starter: "—", growth: "✓", executive: "✓" },
                { label: "AIモデル品質", starter: "標準", growth: "高品質", executive: "最高品質" },
                { label: "最終面接特化の深掘り", starter: "—", growth: "—", executive: "✓" },
                { label: "競合比較軸の生成", starter: "—", growth: "—", executive: "✓" },
                { label: "複数バリエーション生成", starter: "—", growth: "—", executive: "✓" },
              ].map((row) => (
                <tr key={row.label} className="border-t border-[var(--line)]">
                  <td className="px-6 py-3.5 text-[var(--ink-soft)]">{row.label}</td>
                  {(["starter", "growth", "executive"] as PlanId[]).map((p) => (
                    <td key={p} className={`px-4 py-3.5 text-center ${
                      row[p] === "—" ? "text-[var(--muted)]" : "font-semibold text-[var(--navy)]"
                    } ${p === currentPlan ? "bg-[rgba(26,45,122,0.03)]" : ""}`}>
                      {row[p]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          お支払いは Stripe の安全な決済システムを通じて処理されます。いつでもキャンセル可能です。
        </p>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}
