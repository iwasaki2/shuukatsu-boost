"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCompany,
  saveCompany,
  type CompanyRecord,
  type GeneratedContent,
  PHASE_ORDER,
  PHASE_STYLES,
} from "@/lib/companies";

const PROFILE_KEY = "naiteiNaviProfile";

type ExtendedCompanyRecord = CompanyRecord & {
  strengthsOverride?: string;
  weaknessesOverride?: string;
  motivationMemo?: string;
};

function getInitialCompany(id: string): ExtendedCompanyRecord | null {
  return getCompany(id) as ExtendedCompanyRecord | null;
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<ExtendedCompanyRecord | null>(() => getInitialCompany(id));
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"research" | "prep">(
    company?.generatedContent ? "prep" : "research"
  );
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchForm, setResearchForm] = useState(() => ({
    companyPhilosophy: company?.companyPhilosophy ?? "",
    desiredTalent: company?.desiredTalent ?? "",
    articles: company?.articles ?? "",
    interviewPhase: company?.interviewPhase ?? "1次面接",
  }));

  useEffect(() => {
    if (!company) {
      router.push("/companies");
    }
  }, [company, router]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const updateCompany = (nextCompany: ExtendedCompanyRecord) => {
    saveCompany(nextCompany);
    setCompany(nextCompany);
  };

  const saveResearch = () => {
    if (!company) return;
    const updated = {
      ...company,
      companyPhilosophy: researchForm.companyPhilosophy,
      desiredTalent: researchForm.desiredTalent,
      articles: researchForm.articles,
      interviewPhase: researchForm.interviewPhase,
    };
    updateCompany(updated);
    setEditingResearch(false);
  };

  const handlePhaseChange = (phase: string) => {
    if (!company) return;
    const updated = { ...company, interviewPhase: phase };
    updateCompany(updated);
    setResearchForm((prev) => ({ ...prev, interviewPhase: phase }));
  };

  const handleRegenerate = async () => {
    if (!company) return;
    setRegenerating(true);

    const profile = localStorage.getItem(PROFILE_KEY);
    const profileData = profile ? JSON.parse(profile) : {};

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          companyName: company.companyName,
          jobType: company.jobType,
          interviewPhase: company.interviewPhase,
          companyPhilosophy: company.companyPhilosophy,
          desiredTalent: company.desiredTalent,
          articles: company.articles,
          strengthsOverride: company.strengthsOverride ?? "",
          weaknessesOverride: company.weaknessesOverride ?? "",
          motivationMemo: company.motivationMemo ?? "",
        }),
      });

      const content: GeneratedContent = await res.json();
      updateCompany({ ...company, generatedContent: content });
      setActiveTab("prep");
    } catch (error) {
      console.error(error);
    } finally {
      setRegenerating(false);
    }
  };

  if (!company) return null;

  const content = company.generatedContent;
  const sections = content
    ? [
        { key: "selfIntro", label: "自己紹介", text: content.selfIntro },
        { key: "motivation", label: "志望理由", text: content.motivation },
        { key: "jobAxis", label: "就活の軸", text: content.jobAxis },
        { key: "strengths", label: "強み", text: content.strengths },
        { key: "weaknesses", label: "弱み", text: content.weaknesses },
        { key: "careerPlan", label: "キャリアプラン", text: content.careerPlan },
        { key: "closingStatement", label: "最後に一言", text: content.closingStatement },
      ]
    : [];

  const researchFields = [
    {
      key: "companyPhilosophy",
      label: "企業理念・ビジョン",
      placeholder: "採用ページやコーポレートサイトのビジョンをメモ",
    },
    {
      key: "desiredTalent",
      label: "求める人材像",
      placeholder: "採用ページの人物像や期待される行動を整理",
    },
    {
      key: "articles",
      label: "ニュース・IR・印象に残った情報",
      placeholder: "直近のニュース、事業トピック、競合比較など",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(10,25,47,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button
            onClick={() => router.push("/companies")}
            className="text-sm font-semibold text-white/72 transition hover:text-white"
          >
            ← 一覧へ戻る
          </button>
          <div className="text-right">
            <p className="font-serif text-2xl tracking-[0.1em] text-white">{company.companyName}</p>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/45">{company.jobType}</p>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-22"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,18,35,0.9), rgba(7,18,35,0.68)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Company Focus</p>
            <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
              企業研究と面接対策を、
              <br />
              同じ文脈で磨き込む。
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/72">
              企業の価値観、求める人物像、面接フェーズを一つの視界にまとめ、
              志望理由と逆質問の整合を崩さず更新できます。
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">Interview Phase</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {PHASE_ORDER.map((phase) => (
                <button
                  key={phase}
                  onClick={() => handlePhaseChange(phase)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    company.interviewPhase === phase
                      ? PHASE_STYLES[phase]
                      : "border border-white/12 bg-white/6 text-white/72 hover:bg-white/12"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="mb-8 flex flex-wrap gap-3">
          {(["research", "prep"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[var(--navy)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--navy)] hover:text-[var(--navy)]"
              }`}
            >
              {tab === "research" ? "企業研究" : `面接対策${content ? "" : "（未生成）"}`}
            </button>
          ))}
        </div>

        {activeTab === "research" ? (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Research Notes</p>
                  <h2 className="mt-3 font-serif text-3xl text-[var(--navy)]">企業理解のメモ</h2>
                </div>
                {!editingResearch ? (
                  <button
                    onClick={() => setEditingResearch(true)}
                    className="rounded-full border border-[var(--navy)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
                  >
                    編集する
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingResearch(false)}
                      className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--paper)]"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={saveResearch}
                      className="rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-5">
                {researchFields.map((field) => (
                  <div key={field.key} className="rounded-[1.5rem] bg-[var(--paper)] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">{field.label}</p>
                    {editingResearch ? (
                      <textarea
                        value={researchForm[field.key]}
                        onChange={(event) => setResearchForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                        rows={5}
                        placeholder={field.placeholder}
                        className="mt-4 w-full rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
                      />
                    ) : (
                      <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)] whitespace-pre-line">
                        {researchForm[field.key] || "未入力"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                <div
                  className="h-52 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(10,25,47,0.16), rgba(10,25,47,0.52)), url('https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Regenerate</p>
                  <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">研究内容を反映して再生成</h3>
                  <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                    企業理解が深まったタイミングで再生成すると、志望理由や逆質問の解像度が上がります。
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="mt-8 w-full rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#162c49] disabled:opacity-60"
                  >
                    {regenerating ? "生成中..." : content ? "内容を更新して再生成" : "この企業の面接対策を生成"}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-5">
              {!content ? (
                <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <p className="font-serif text-4xl text-[var(--navy)]">面接対策はまだ生成されていません</p>
                  <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-[var(--ink-soft)]">
                    企業研究タブに情報を加えてから生成すると、志望理由や逆質問の精度がさらに高まります。
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="mt-8 rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d] disabled:opacity-60"
                  >
                    {regenerating ? "生成中..." : "面接対策を生成する"}
                  </button>
                </div>
              ) : (
                <>
                  {sections.map((section) => (
                    <article
                      key={section.key}
                      className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(10,25,47,0.07)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
                        <h3 className="font-serif text-3xl text-[var(--navy)]">{section.label}</h3>
                        <button
                          onClick={() => copyToClipboard(section.text, section.key)}
                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                        >
                          {copied === section.key ? "コピー済み" : "コピー"}
                        </button>
                      </div>
                      <p className="mt-5 text-sm leading-8 text-[var(--ink-soft)] whitespace-pre-line">{section.text}</p>
                    </article>
                  ))}

                  <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(10,25,47,0.07)]">
                    <h3 className="font-serif text-3xl text-[var(--navy)]">逆質問</h3>
                    <div className="mt-6 space-y-4">
                      {content.reverseQuestions.map((question, index) => (
                        <div key={index} className="rounded-[1.5rem] bg-[var(--paper)] p-5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                            <button
                              onClick={() => copyToClipboard(`${question.opinion}${question.question}`, `q${index}`)}
                              className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                            >
                              {copied === `q${index}` ? "コピー済み" : "コピー"}
                            </button>
                          </div>
                          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                          <p className="mt-2 text-sm leading-8 text-[var(--ink-soft)]">{question.opinion}</p>
                          <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                          <p className="mt-2 text-sm font-semibold leading-8 text-[var(--navy)]">{question.question}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                </>
              )}
            </div>

            <aside className="space-y-6">
              <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--navy)] p-6 text-white shadow-[0_24px_60px_rgba(10,25,47,0.14)]">
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--gold-soft)]">Action</p>
                <h3 className="mt-3 font-serif text-3xl">次の面接に向けて更新する</h3>
                <p className="mt-4 text-sm leading-8 text-white/72">
                  実際に聞かれた質問や、伝わりにくかった箇所があれば企業研究タブに追記し、再生成してください。
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="mt-8 w-full rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d] disabled:opacity-60"
                >
                  {regenerating ? "再生成中..." : "再生成する"}
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
