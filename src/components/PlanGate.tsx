"use client";

import { useRouter } from "next/navigation";
import type { PlanId } from "@/lib/plans";

interface PlanGateProps {
  feature: string;
  requiredPlan: PlanId;
  children: React.ReactNode;
}

export function PlanGate({ feature, requiredPlan, children }: PlanGateProps) {
  const router = useRouter();
  const label = requiredPlan === "growth" ? "Growth" : "Executive";
  const price = requiredPlan === "growth" ? "¥980" : "¥1,980";

  return (
    <div className="relative">
      {/* ブラー表示 */}
      <div className="pointer-events-none select-none blur-[3px] opacity-40">
        {children}
      </div>
      {/* オーバーレイ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] bg-white/80 backdrop-blur-sm">
        <div className="text-center px-6">
          <span className="inline-block rounded-full bg-[var(--gold)] px-3 py-1 text-xs font-bold text-[var(--navy)]">
            {label} プランで利用可能
          </span>
          <p className="mt-3 text-base font-bold text-[var(--navy)]">{feature}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">月額 {price} からご利用いただけます</p>
          <button
            onClick={() => router.push("/billing")}
            className="mt-4 rounded-full bg-[var(--navy)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14246a]"
          >
            プランを見る
          </button>
        </div>
      </div>
    </div>
  );
}

export function CompanyLimitBanner({ current, max }: { current: number; max: number }) {
  const router = useRouter();
  if (current < max) return null;
  return (
    <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-5 py-4">
      <p className="text-sm font-semibold text-amber-800">
        Starter プランの上限（{max}社）に達しています
      </p>
      <p className="mt-1 text-xs text-amber-700">
        Growth プラン（¥980/月）にアップグレードすると企業数無制限になります。
      </p>
      <button
        onClick={() => router.push("/billing")}
        className="mt-3 rounded-full bg-amber-600 px-5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
      >
        アップグレードする
      </button>
    </div>
  );
}
