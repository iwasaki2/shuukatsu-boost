"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  getCompanies,
  deleteCompany,
  saveCompany,
  type CompanyRecord,
  PHASE_STYLES,
  PHASE_ORDER,
} from "@/lib/companies";

const PROFILE_KEY = "naiteiNaviProfile";

interface Profile {
  name: string;
  university: string;
  faculty: string;
  background: string;
  gakuchika: string;
  strengths: string;
  weaknesses: string;
  jobAxis: string;
}

const notes = [
  {
    title: "結論から話す",
    body: "冒頭15秒で結論を出し、そこから理由と具体例へ展開すると、面接官が評価しやすくなります。",
  },
  {
    title: "企業研究を一段深く",
    body: "採用ページだけでなく、事業内容、プレスリリース、競合比較まで見ると志望理由が立体的になります。",
  },
  {
    title: "面接後の再設計",
    body: "実際に聞かれた質問や詰まった箇所を残し、次回面接の再生成へつなげると改善が早くなります。",
  },
];

function getStoredProfile(): Profile | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(PROFILE_KEY);
  return saved ? (JSON.parse(saved) as Profile) : null;
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-sm leading-8 text-[var(--ink-soft)] whitespace-pre-line">{value}</p>
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"companies" | "profile">("companies");
  const [companies, setCompanies] = useState<CompanyRecord[]>(() => getCompanies());
  const [profile] = useState<Profile | null>(() => getStoredProfile());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const refreshCompanies = () => setCompanies(getCompanies());

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」を選考リストから削除しますか？`)) return;
    deleteCompany(id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    refreshCompanies();
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`選択した ${selected.size} 社を削除しますか？`)) return;
    selected.forEach((id) => deleteCompany(id));
    setSelected(new Set());
    refreshCompanies();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === companies.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(companies.map((c) => c.id)));
    }
  };

  const handlePhaseChange = (company: CompanyRecord, phase: string) => {
    saveCompany({ ...company, interviewPhase: phase });
    refreshCompanies();
  };

  const activeCount = companies.filter((c) => c.interviewPhase !== "内定").length;
  const generatedCount = companies.filter((c) => c.generatedContent).length;
  const offerCount = companies.filter((c) => c.interviewPhase === "内定").length;
  const phaseCounts = PHASE_ORDER.reduce<Record<string, number>>((acc, phase) => {
    acc[phase] = companies.filter((company) => company.interviewPhase === phase).length;
    return acc;
  }, {});

  const profileFields = profile
    ? [
        { label: "名前", filled: !!profile.name },
        { label: "大学", filled: !!profile.university },
        { label: "学部", filled: !!profile.faculty },
        { label: "自己背景", filled: !!profile.background },
        { label: "ガクチカ", filled: !!profile.gakuchika },
        { label: "強み", filled: !!profile.strengths },
        { label: "弱み", filled: !!profile.weaknesses },
        { label: "就活の軸", filled: !!profile.jobAxis },
      ]
    : [];
  const filledCount = profileFields.filter((field) => field.filled).length;
  const completeness = profileFields.length > 0 ? Math.round((filledCount / profileFields.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(26,45,122,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => router.push("/")}>
            <img src="/logo-icon.png" alt="ガクチカBoost" className="h-10 w-10 rounded-full" />
          </button>
          <button
            onClick={() => router.push("/input")}
            className="rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
          >
            新しい企業を追加
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(20,36,100,0.92), rgba(20,36,100,0.68)), url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,127,229,0.24),transparent_25%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-18">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Progress Overview</p>
            <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
              複数社の面接準備を、
              <br />
              一つの視界に収める。
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/72 md:text-base">
              生成した回答、選考フェーズ、企業研究メモをまとめて管理。
              選考の進捗と面接準備を、一つの画面で確認できます。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "選考中", value: activeCount },
              { label: "対策済み", value: generatedCount },
              { label: "内定", value: offerCount },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold leading-none tracking-tight text-[var(--gold-soft)]">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/55">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-wrap gap-3">
          {(["companies", "profile"] as const).map((current) => (
            <button
              key={current}
              onClick={() => setTab(current)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                tab === current
                  ? "bg-[var(--navy)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--navy)] hover:text-[var(--navy)]"
              }`}
            >
              {current === "companies" ? `選考中の企業 (${companies.length})` : `自己情報 ${profile ? `${completeness}%` : ""}`}
            </button>
          ))}
        </div>

        {tab === "companies" ? (
          <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Selection Phase</p>
                    <h2 className="mt-3 text-2xl font-bold text-[var(--navy)]">進行中の選考を一覧管理</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        {selected.size}社を削除
                      </button>
                    )}
                    <button
                      onClick={() => router.push("/input")}
                      className="rounded-full border border-[var(--navy)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
                    >
                      面接対策を追加
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {PHASE_ORDER.map((phase) => (
                    <div
                      key={phase}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${PHASE_STYLES[phase] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}
                    >
                      {phaseCounts[phase]} / {phase}
                    </div>
                  ))}
                </div>

                {companies.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="font-serif text-3xl text-[var(--navy)]">まだ企業が登録されていません</p>
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-[var(--ink-soft)]">
                      最初の企業を追加すると、面接対策、逆質問、研究メモまで一つの流れで管理できます。
                    </p>
                    <button
                      onClick={() => router.push("/input")}
                      className="mt-8 rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
                    >
                      最初の企業を追加
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {/* 全選択行 */}
                    <div className="flex items-center justify-between px-1 pb-2">
                      <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--navy)]">
                        <input
                          type="checkbox"
                          checked={selected.size === companies.length && companies.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded accent-[var(--navy)]"
                        />
                        全選択 ({companies.length}社)
                      </label>
                      {selected.size > 0 && (
                        <span className="text-xs text-[var(--muted)]">{selected.size}社を選択中</span>
                      )}
                    </div>

                    {companies.map((company) => {
                      const phaseIndex = PHASE_ORDER.indexOf(company.interviewPhase);
                      const initial = company.companyName.replace(/株式会社|有限会社|合同会社/g, "").trim().charAt(0);
                      const updatedDate = new Date(company.updatedAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
                      return (
                        <article
                          key={company.id}
                          className={`overflow-hidden rounded-[1.5rem] border transition duration-200 hover:shadow-[0_12px_40px_rgba(26,45,122,0.09)] ${
                            selected.has(company.id)
                              ? "border-[var(--gold)] bg-[var(--sand)]"
                              : "border-[var(--line)] bg-white"
                          }`}
                        >
                          {/* Main row */}
                          <div className="flex items-center gap-3 p-4 lg:p-5">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={selected.has(company.id)}
                              onChange={() => toggleSelect(company.id)}
                              className="h-4 w-4 shrink-0 rounded accent-[var(--navy)]"
                              onClick={(e) => e.stopPropagation()}
                            />
                            {/* Avatar */}
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--navy)] text-base font-bold text-[var(--gold-soft)]">
                              {initial}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-[var(--navy)]">{company.companyName}</h3>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PHASE_STYLES[company.interviewPhase] ?? ""}`}>
                                  {company.interviewPhase}
                                </span>
                                {company.generatedContent && (
                                  <span className="rounded-full bg-[rgba(26,45,122,0.06)] px-2.5 py-0.5 text-xs font-semibold text-[var(--ink-soft)]">
                                    対策済み
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-[var(--muted)]">{company.jobType}</p>

                              {/* Phase progress dots */}
                              <div className="mt-2.5 flex items-center gap-1.5">
                                {PHASE_ORDER.map((phase, i) => (
                                  <Fragment key={phase}>
                                    <div
                                      title={phase}
                                      className={`h-2 w-2 rounded-full transition ${
                                        phase === company.interviewPhase
                                          ? "bg-[var(--navy)] ring-2 ring-[rgba(26,45,122,0.18)] ring-offset-1"
                                          : phaseIndex > i
                                          ? "bg-[var(--navy)]"
                                          : "bg-[var(--line)]"
                                      }`}
                                    />
                                    {i < PHASE_ORDER.length - 1 && (
                                      <div className={`h-px w-4 ${phaseIndex > i ? "bg-[var(--navy)]" : "bg-[var(--line)]"}`} />
                                    )}
                                  </Fragment>
                                ))}
                                <span className="ml-1.5 text-[11px] text-[var(--muted)]">{updatedDate}更新</span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex shrink-0 gap-2">
                              <button
                                onClick={() => router.push(`/companies/${company.id}`)}
                                className="rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#14246a]"
                              >
                                詳細
                              </button>
                              <button
                                onClick={() => handleDelete(company.id, company.companyName)}
                                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                              >
                                削除
                              </button>
                            </div>
                          </div>

                          {/* Phase change strip */}
                          <div className="flex flex-wrap gap-1.5 border-t border-[var(--line)] bg-[var(--paper)] px-5 py-2.5">
                            {PHASE_ORDER.map((phase) => (
                              <button
                                key={phase}
                                onClick={() => handlePhaseChange(company, phase)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                                  company.interviewPhase === phase
                                    ? PHASE_STYLES[phase]
                                    : "text-[var(--muted)] hover:text-[var(--navy)]"
                                }`}
                              >
                                {phase}
                              </button>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(26,45,122,0.06)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">面接対策のコツ</p>
                <div className="mt-5 space-y-4">
                  {notes.map((note) => (
                    <div key={note.title} className="flex gap-3 border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" style={{marginTop: "7px"}} />
                      <div>
                        <p className="text-sm font-semibold text-[var(--navy)]">{note.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{note.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-[var(--line)] pt-6">
                  <button
                    onClick={() => router.push("/input")}
                    className="w-full rounded-full bg-[var(--navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#14246a]"
                  >
                    新しい企業を追加
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
              <div
                className="h-56 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(26,45,122,0.12), rgba(26,45,122,0.48)), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="p-6">
                {!profile ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Profile</p>
                    <h2 className="mt-3 font-serif text-3xl text-[var(--navy)]">自己情報がまだありません</h2>
                    <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                      自己分析の土台を登録しておくと、企業ごとの面接対策を一貫した設計で生成できます。
                    </p>
                    <button
                      onClick={() => router.push("/input")}
                      className="mt-8 rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
                    >
                      自己情報を入力する
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Profile Completeness</p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <h2 className="font-serif text-3xl text-[var(--navy)]">{profile.name}さんの自己情報</h2>
                      <p className="font-serif text-4xl text-[var(--navy)]">{completeness}%</p>
                    </div>
                    <div className="mt-5 h-2 rounded-full bg-[var(--sand)]">
                      <div className="h-2 rounded-full bg-[var(--gold)]" style={{ width: `${completeness}%` }} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {profileFields.map((field) => (
                        <span
                          key={field.label}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            field.filled ? "bg-emerald-50 text-emerald-700" : "bg-[var(--paper)] text-[var(--muted)]"
                          }`}
                        >
                          {field.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
              {profile ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Personal Foundation</p>
                      <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">面接のベース情報</h3>
                    </div>
                    <button
                      onClick={() => router.push("/input")}
                      className="rounded-full border border-[var(--navy)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
                    >
                      編集する
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-[var(--paper)] p-5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">氏名</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--navy)]">{profile.name}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[var(--paper)] p-5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">大学</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--navy)]">{profile.university}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[var(--paper)] p-5 md:col-span-2">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">学部・学科</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--navy)]">{profile.faculty}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <ProfileRow label="自己バックグラウンド" value={profile.background} />
                    <ProfileRow label="ガクチカ" value={profile.gakuchika} />
                    <ProfileRow label="強み" value={profile.strengths} />
                    <ProfileRow label="弱み" value={profile.weaknesses} />
                    <ProfileRow label="就活の軸" value={profile.jobAxis} />
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center text-center">
                  <div>
                    <p className="font-serif text-3xl text-[var(--navy)]">自己情報を登録してください</p>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-[var(--ink-soft)]">
                      ここに保存された内容が、各企業の志望理由、自己PR、逆質問の土台になります。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
