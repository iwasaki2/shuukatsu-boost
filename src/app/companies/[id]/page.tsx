"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { CompanyRecord, GeneratedContent, EsContent, ReverseQuestion, AnticipatedQuestion } from "@/lib/companies";
import { PHASE_ORDER, PHASE_STYLES } from "@/lib/companies";
import type { PlanId } from "@/lib/plans";

type ExtendedGeneratedContent = GeneratedContent & {
  finalInterviewDeepDive?: string;
  competitorComparison?: string;
  variations?: Record<string, string[]>;
  anticipatedQuestions?: AnticipatedQuestion[];
  preInterviewMemo?: string;
};

type ExtendedCompanyRecord = Omit<CompanyRecord, "generatedContent"> & {
  strengthsOverride?: string;
  weaknessesOverride?: string;
  motivationMemo?: string;
  generatedContent: ExtendedGeneratedContent | null;
};

const researchFields = [
  { key: "companyPhilosophy" as const, label: "企業理念・ビジョン", placeholder: "採用ページやコーポレートサイトのビジョンをメモ" },
  { key: "desiredTalent" as const, label: "求める人材像", placeholder: "採用ページの人物像や期待される行動を整理" },
  { key: "articles" as const, label: "ニュース・IR・印象に残った情報", placeholder: "直近のニュース、事業トピック、競合比較など" },
] as const;

function renderInlineEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-[var(--navy)]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function RichTextBlock({ text }: { text: string }) {
  return (
    <div className="space-y-3">
      {text.split("\n").map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={index} className="h-2" />;
        }

        if (line.startsWith("深掘り：") || line.startsWith("深掘り:")) {
          return (
            <div key={index} className="rounded-[1.15rem] border border-[rgba(26,127,229,0.16)] bg-[rgba(26,127,229,0.06)] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)]">Deep Dive</p>
              <p className="mt-2 text-sm leading-8 text-[var(--ink)]">{renderInlineEmphasis(line)}</p>
            </div>
          );
        }

        if (/^\d+.*年目/.test(line)) {
          return (
            <div key={index} className="pt-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--accent)]">{renderInlineEmphasis(line)}</p>
            </div>
          );
        }

        if (line.startsWith("・")) {
          return (
            <div key={index} className="flex items-start gap-3">
              <span className="mt-[9px] shrink-0 text-[var(--gold)]">•</span>
              <p className="text-sm leading-8 text-[var(--ink-soft)]">{renderInlineEmphasis(line.slice(1).trim())}</p>
            </div>
          );
        }

        return (
          <p key={index} className="text-sm leading-8 text-[var(--ink-soft)]">
            {renderInlineEmphasis(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<ExtendedCompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"research" | "prep" | "es">("research");
  const [generatingEs, setGeneratingEs] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanId>("starter");

  const [editingResearch, setEditingResearch] = useState(false);
  const [researchForm, setResearchForm] = useState({
    companyPhilosophy: "",
    desiredTalent: "",
    articles: "",
    interviewPhase: "1次面接",
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [editingRQIndex, setEditingRQIndex] = useState<number | null>(null);
  const [rqDraft, setRqDraft] = useState<ReverseQuestion>({ opinion: "", question: "" });
  const [openAnswerIndex, setOpenAnswerIndex] = useState<number | null>(null);


  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then(r => r.json())
      .then(data => {
        const c = data.company as ExtendedCompanyRecord;
        setCompany(c);
        setResearchForm({
          companyPhilosophy: c.companyPhilosophy ?? "",
          desiredTalent: c.desiredTalent ?? "",
          articles: c.articles ?? "",
          interviewPhase: c.interviewPhase ?? "1次面接",
        });
        if (c.generatedContent) setActiveTab("prep");
        setLoading(false);
      })
      .catch(() => {
        router.push("/companies");
        setLoading(false);
      });
    fetch("/api/plan")
      .then(r => r.json())
      .then(d => setUserPlan(d.planId ?? "starter"))
      .catch(() => setUserPlan("starter"));
  }, [id, router]);

  const updateCompany = useCallback(async (updates: Partial<ExtendedCompanyRecord>) => {
    const res = await fetch(`/api/companies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const data = await res.json();
      setCompany(data.company as ExtendedCompanyRecord);
    }
  }, [id]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveResearch = async () => {
    await updateCompany({
      companyPhilosophy: researchForm.companyPhilosophy,
      desiredTalent: researchForm.desiredTalent,
      articles: researchForm.articles,
      interviewPhase: researchForm.interviewPhase,
    });
    setEditingResearch(false);
  };

  const handlePhaseChange = async (phase: string) => {
    await updateCompany({ interviewPhase: phase });
    setResearchForm((prev) => ({ ...prev, interviewPhase: phase }));
  };

  const getProfileData = (): Record<string, string> => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("naiteiNaviProfile") : null;
    return saved ? JSON.parse(saved) : {};
  };

  const handleRegenerate = async () => {
    if (!company) return;
    setRegenerating(true);
    const profileData = getProfileData();
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
      const generatedContent = await res.json();
      await updateCompany({ generatedContent });
      setActiveTab("prep");
    } catch (error) {
      console.error(error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleGenerateEs = async () => {
    if (!company) return;
    setGeneratingEs(true);
    const profileData = getProfileData();
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
          mode: "es",
        }),
      });
      const esContent: EsContent = await res.json();
      await updateCompany({ esContent });
      setActiveTab("es");
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingEs(false);
    }
  };

  const startEditing = (key: string, text: string) => {
    setEditingRQIndex(null);
    setEditingKey(key);
    setEditDraft(text);
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditDraft("");
  };

  const saveContentEdit = async (key: string) => {
    if (!company?.generatedContent) return;
    const updated = { ...company.generatedContent, [key]: editDraft };
    await updateCompany({ generatedContent: updated });
    setEditingKey(null);
    setEditDraft("");
  };

  const startEditRQ = (index: number, rq: ReverseQuestion) => {
    setEditingKey(null);
    setEditingRQIndex(index);
    setRqDraft({ ...rq });
  };

  const cancelEditRQ = () => { setEditingRQIndex(null); };

  const saveRQEdit = async (index: number) => {
    if (!company?.generatedContent) return;
    const updated = [...company.generatedContent.reverseQuestions];
    updated[index] = rqDraft;
    await updateCompany({
      generatedContent: { ...company.generatedContent, reverseQuestions: updated },
    });
    setEditingRQIndex(null);
  };

  const canUseEs = userPlan === "growth" || userPlan === "executive";
  const canUseMemorize = userPlan === "growth" || userPlan === "executive";
  const isExecutive = userPlan === "executive";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper)]">
        <p className="text-sm text-[var(--muted)]">読み込み中...</p>
      </main>
    );
  }

  if (!company) return null;

  const content = company.generatedContent;
  const hasStarterPack = !!content;
  const anticipatedQuestionsText = content?.anticipatedQuestions?.map((item, index) => `Q${index + 1}\n${item.question}\n${item.answer}`).join("\n\n") ?? "";
  const sections = content
    ? [
        { key: "motivation", label: "志望理由", text: content.motivation, number: "01" },
        { key: "strengths", label: "強み", text: content.strengths, number: "02" },
        { key: "weaknesses", label: "弱み", text: content.weaknesses, number: "03" },
        { key: "careerPlan", label: "キャリアプラン", text: content.careerPlan, number: "04" },
        { key: "jobAxis", label: "就活の軸", text: content.jobAxis, number: "05" },
        { key: "selfIntro", label: "自己紹介", text: content.selfIntro, number: "06" },
        { key: "closingStatement", label: "最後に一言", text: content.closingStatement, number: "07" },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(26,45,122,0.82)] backdrop-blur-xl">
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
              "linear-gradient(90deg, rgba(20,36,100,0.9), rgba(20,36,100,0.68)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,127,229,0.22),transparent_25%)]" />
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
          {(["research", "prep", "es"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[var(--navy)] text-white"
                  : "border border-[var(--line)] bg-white text-[var(--ink-soft)] hover:border-[var(--navy)] hover:text-[var(--navy)]"
              }`}
            >
              {tab === "research" ? "企業研究" : tab === "prep" ? `面接対策${content ? "" : "（未生成）"}` : `ES対策${company.esContent ? "" : "（未生成）"}`}
            </button>
          ))}
        </div>

        {activeTab === "es" ? (
          <div className="space-y-5">
            {!canUseEs ? (
              <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                <span className="inline-block rounded-full bg-[var(--gold)] px-4 py-1.5 text-xs font-bold text-[var(--navy)]">Growth プランで利用可能</span>
                <p className="mt-4 text-xl font-bold text-[var(--navy)]">ES・書類対策は Growth プランの機能です</p>
                <p className="mt-3 text-sm text-[var(--muted)]">自己PR・アピールポイント・志望理由を各200字で自動生成します</p>
                <Link href="/billing" className="mt-6 inline-block rounded-full bg-[var(--navy)] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#14246a]">
                  プランを見る（¥980/月〜）
                </Link>
              </div>
            ) : !company.esContent ? (
              <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                <p className="text-2xl font-bold text-[var(--navy)]">ES・書類対策を生成します</p>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--ink-soft)]">
                  自己PR・アピールポイント・志望理由を各200字程度のES用文章として生成します。
                </p>
                <button
                  onClick={handleGenerateEs}
                  disabled={generatingEs}
                  className="mt-8 rounded-full bg-[var(--gold)] px-8 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff] disabled:opacity-60"
                >
                  {generatingEs ? "生成中..." : "ES用文章を生成する"}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--muted)]">各200〜250字のES用文章です。コピーしてそのまま使えます。</p>
                  <button
                    onClick={handleGenerateEs}
                    disabled={generatingEs}
                    className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)] disabled:opacity-50"
                  >
                    {generatingEs ? "生成中..." : "再生成"}
                  </button>
                </div>
                {[
                  { key: "esSelfPR" as keyof EsContent, label: "自己PR" },
                  { key: "esAppealPoints" as keyof EsContent, label: "アピールポイント" },
                  { key: "esMotivation" as keyof EsContent, label: "志望理由" },
                ].map((section) => {
                  const text = company.esContent?.[section.key] ?? "";
                  return (
                    <article
                      key={section.key}
                      className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_16px_40px_rgba(26,45,122,0.06)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <div>
                          <h3 className="text-base font-bold text-[var(--navy)]">{section.label}</h3>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">{text.length}字</p>
                        </div>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(text);
                            setCopied(section.key);
                            setTimeout(() => setCopied(null), 2000);
                          }}
                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                        >
                          {copied === section.key ? "コピー済み" : "コピー"}
                        </button>
                      </div>
                      <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">{text}</p>
                    </article>
                  );
                })}
              </>
            )}
          </div>

        ) : activeTab === "research" ? (
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
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
                      className="rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
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
                        onChange={(e) => setResearchForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        rows={5}
                        placeholder={field.placeholder}
                        className="mt-4 w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
                      />
                    ) : (
                      <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">
                        {researchForm[field.key] || "未入力"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                <div
                  className="h-52 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(26,45,122,0.16), rgba(26,45,122,0.52)), url('https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80')",
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
                    className="mt-8 w-full rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#14246a] disabled:opacity-60"
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
                <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                  <p className="font-serif text-4xl text-[var(--navy)]">面接対策はまだ生成されていません</p>
                  <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-[var(--ink-soft)]">
                    企業研究タブに情報を加えてから生成すると、志望理由や逆質問の精度がさらに高まります。
                  </p>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="mt-8 rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff] disabled:opacity-60"
                  >
                    {regenerating ? "生成中..." : "面接対策を生成する"}
                  </button>
                </div>
              ) : (
                <>
                  <article className="overflow-hidden rounded-[1.9rem] border border-[rgba(26,45,122,0.14)] bg-white shadow-[0_24px_60px_rgba(26,45,122,0.07)]">
                    <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,rgba(26,45,122,0.06),rgba(26,127,229,0.12))] px-6 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Starter Pack</p>
                          <h3 className="mt-2 font-serif text-3xl text-[var(--navy)]">面接にそのまま持ち込める対策パック</h3>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                            志望理由だけで終わらず、入室前メモと想定問答まで先回りで用意します。無料プランでも「もう準備が進んでいる」と感じられる構成です。
                          </p>
                        </div>
                        <div className="grid min-w-[220px] grid-cols-2 gap-3">
                          <div className="rounded-[1.25rem] border border-white/60 bg-white/70 p-4">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">直前メモ</p>
                            <p className="mt-2 text-2xl font-bold text-[var(--navy)]">{content.preInterviewMemo ? "5分" : "0"}</p>
                            <p className="mt-1 text-xs text-[var(--ink-soft)]">入室前の確認</p>
                          </div>
                          <div className="rounded-[1.25rem] border border-white/60 bg-white/70 p-4">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">想定問答</p>
                            <p className="mt-2 text-2xl font-bold text-[var(--navy)]">{content.anticipatedQuestions?.length ?? 0}</p>
                            <p className="mt-1 text-xs text-[var(--ink-soft)]">AI予測の質問</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 px-6 py-5 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-[1.4rem] bg-[var(--paper)] p-5">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">今回そろうもの</p>
                        <ul className="mt-3 space-y-2 text-sm leading-7 text-[var(--ink-soft)]">
                          <li>・企業向けに磨いた志望理由・強み・弱み</li>
                          <li>・入室5分前に読む一枚メモ</li>
                          <li>・深掘りに備える想定問答</li>
                          <li>・PDFとして保存しやすい面接対策シート</li>
                        </ul>
                      </div>
                      <div className="rounded-[1.4rem] border border-[rgba(26,45,122,0.12)] bg-white p-5">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">ひとこと</p>
                        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                          面接前に見返す順番は「直前メモ → 想定問答 → 志望理由」です。答えを丸暗記するより、話の芯だけを先に固定すると安定します。
                        </p>
                      </div>
                    </div>
                  </article>

                  {content.preInterviewMemo && (
                    <article className="rounded-[1.75rem] border-2 border-[var(--gold)] bg-gradient-to-br from-[#fffbf0] to-[#fff8e6] p-6 shadow-[0_20px_50px_rgba(200,160,0,0.12)]">
                      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(200,160,0,0.2)] pb-4">
                        <div>
                          <span className="inline-block rounded-full bg-[var(--gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--navy)]">面接直前チェックシート</span>
                          <h3 className="mt-2 font-serif text-2xl text-[var(--navy)]">入室5分前に読む、今日のまとめ</h3>
                        </div>
                        <button
                          onClick={() => copyToClipboard(content.preInterviewMemo ?? "", "preInterviewMemo")}
                          className="rounded-full border border-[rgba(200,160,0,0.4)] px-4 py-2 text-xs font-semibold text-[var(--navy)] transition hover:bg-[var(--gold)]"
                        >
                          {copied === "preInterviewMemo" ? "コピー済み" : "全文コピー"}
                        </button>
                      </div>
                      <ul className="mt-5 space-y-3">
                        {content.preInterviewMemo.split("\n").filter(line => line.trim()).map((line, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm leading-7 text-[var(--ink)]">
                            <span className="mt-[3px] shrink-0 text-[var(--gold)] font-bold">{line.startsWith("・") ? "" : "・"}</span>
                            <span>{line.startsWith("・") ? line.slice(1) : line}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}

                  {sections.map((section) => (
                    <article
                      key={section.key}
                      className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-[var(--navy)] px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-white">
                            {section.number}
                          </span>
                          <h3 className="font-serif text-3xl text-[var(--navy)]">{section.label}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingKey === section.key ? (
                            <>
                              <button onClick={cancelEditing} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--paper)]">
                                キャンセル
                              </button>
                              <button onClick={() => saveContentEdit(section.key)} className="rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]">
                                保存
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => copyToClipboard(section.text, section.key)} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">
                                {copied === section.key ? "コピー済み" : "コピー"}
                              </button>
                              <button onClick={() => startEditing(section.key, section.text)} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">
                                編集
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-5">
                        {editingKey === section.key ? (
                          <textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} rows={8} className="w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-8 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none" />
                        ) : (
                          <RichTextBlock text={section.text} />
                        )}
                      </div>
                    </article>
                  ))}

                  {/* Executive features */}
                  {isExecutive && content.finalInterviewDeepDive && (
                    <article className="rounded-[1.75rem] border border-[var(--gold)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Executive</span>
                          <h3 className="mt-1 font-serif text-3xl text-[var(--navy)]">最終面接 深掘り対策</h3>
                        </div>
                        <button onClick={() => copyToClipboard(content.finalInterviewDeepDive ?? "", "finalDeepDive")} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">
                          {copied === "finalDeepDive" ? "コピー済み" : "コピー"}
                        </button>
                      </div>
                      <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">{content.finalInterviewDeepDive}</p>
                    </article>
                  )}

                  {isExecutive && content.competitorComparison && (
                    <article className="rounded-[1.75rem] border border-[var(--gold)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Executive</span>
                          <h3 className="mt-1 font-serif text-3xl text-[var(--navy)]">競合比較・差別化軸</h3>
                        </div>
                        <button onClick={() => copyToClipboard(content.competitorComparison ?? "", "competitorComp")} className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">
                          {copied === "competitorComp" ? "コピー済み" : "コピー"}
                        </button>
                      </div>
                      <p className="mt-5 whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">{content.competitorComparison}</p>
                    </article>
                  )}

                  {isExecutive && content.variations && Object.keys(content.variations).length > 0 && (
                    <article className="rounded-[1.75rem] border border-[var(--gold)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                      <div className="border-b border-[var(--line)] pb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Executive</span>
                        <h3 className="mt-1 font-serif text-3xl text-[var(--navy)]">複数バリエーション</h3>
                        <p className="mt-1 text-xs text-[var(--muted)]">同じ質問への別アプローチを比較できます</p>
                      </div>
                      <div className="mt-5 space-y-4">
                        {Object.entries(content.variations).map(([key, variants]) => (
                          variants.length > 0 && (
                            <div key={key} className="rounded-[1.25rem] bg-[var(--paper)] p-4">
                              <p className="text-xs font-semibold text-[var(--navy)]">
                                {key === "strengths" ? "強み（別バリエーション）" : key === "motivation" ? "志望理由（別バリエーション）" : key}
                              </p>
                              {variants.map((variant, i) => (
                                <p key={i} className="mt-3 text-sm leading-8 text-[var(--ink-soft)]">{variant}</p>
                              ))}
                            </div>
                          )
                        ))}
                      </div>
                    </article>
                  )}

                  {content.anticipatedQuestions && content.anticipatedQuestions.length > 0 && (
                    <article className="rounded-[1.75rem] border border-[rgba(26,45,122,0.18)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">AI Predicted</p>
                          <h3 className="mt-1 font-serif text-3xl text-[var(--navy)]">AIが予測した想定問答</h3>
                          <p className="mt-1.5 text-xs text-[var(--muted)]">面接でこんな質問が来る可能性が高いです。クリックで回答例を確認。</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(anticipatedQuestionsText, "anticipated-all")}
                          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                        >
                          {copied === "anticipated-all" ? "コピー済み" : "全てコピー"}
                        </button>
                      </div>
                      <div className="mt-5 space-y-3">
                        {content.anticipatedQuestions.map((aq, index) => (
                          <div key={index} className="overflow-hidden rounded-[1.5rem] border border-[var(--line)]">
                            <button
                              onClick={() => setOpenAnswerIndex(openAnswerIndex === index ? null : index)}
                              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--paper)]"
                            >
                              <div className="flex items-start gap-3">
                                <span className="mt-0.5 shrink-0 rounded-full bg-[var(--navy)] px-2.5 py-0.5 text-[10px] font-bold text-white">Q{index + 1}</span>
                                <span className="text-sm font-semibold text-[var(--navy)]">{aq.question}</span>
                              </div>
                              <svg
                                className={`shrink-0 transition-transform ${openAnswerIndex === index ? "rotate-180" : ""}`}
                                width="16" height="16" viewBox="0 0 16 16" fill="none"
                              >
                                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {openAnswerIndex === index && (
                              <div className="border-t border-[var(--line)] bg-[var(--paper)] px-5 py-4">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">回答例</p>
                                <div className="mt-2">
                                  <RichTextBlock text={aq.answer} />
                                </div>
                                <button
                                  onClick={() => copyToClipboard(aq.answer, `aq-${index}`)}
                                  className="mt-3 rounded-full border border-[var(--line)] px-4 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                                >
                                  {copied === `aq-${index}` ? "コピー済み" : "コピー"}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </article>
                  )}

                  {/* Reverse questions */}
                  <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                      <h3 className="font-serif text-3xl text-[var(--navy)]">逆質問</h3>
                      <button
                        onClick={() => copyToClipboard(content.reverseQuestions.map((q, i) => `Q${i + 1}\n${q.opinion}\n${q.question}`).join("\n\n"), "reverse-all")}
                        className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                      >
                        {copied === "reverse-all" ? "コピー済み" : "全てコピー"}
                      </button>
                    </div>
                    <div className="mt-6 space-y-4">
                      {content.reverseQuestions.map((question, index) => (
                        <div key={index} className="rounded-[1.5rem] bg-[var(--paper)] p-5">
                          {editingRQIndex === index ? (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                                <div className="flex gap-2">
                                  <button onClick={cancelEditRQ} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-white">キャンセル</button>
                                  <button onClick={() => saveRQEdit(index)} className="rounded-full bg-[var(--gold)] px-3 py-1.5 text-xs font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]">保存</button>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                                <textarea value={rqDraft.opinion} onChange={(e) => setRqDraft((prev) => ({ ...prev, opinion: e.target.value }))} rows={3} className="mt-2 w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none" />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                                <textarea value={rqDraft.question} onChange={(e) => setRqDraft((prev) => ({ ...prev, question: e.target.value }))} rows={2} className="mt-2 w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none" />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                                <div className="flex gap-2">
                                  <button onClick={() => copyToClipboard(`${question.opinion}\n${question.question}`, `q${index}`)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">
                                    {copied === `q${index}` ? "コピー済み" : "コピー"}
                                  </button>
                                  <button onClick={() => startEditRQ(index, question)} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]">編集</button>
                                </div>
                              </div>
                              <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                              <div className="mt-2">
                                <RichTextBlock text={question.opinion} />
                              </div>
                              <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                              <p className="mt-2 text-sm font-semibold leading-8 text-[var(--navy)]">{renderInlineEmphasis(question.question)}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </article>
                </>
              )}
            </div>

            <aside className="space-y-4">
              {content && canUseMemorize && (
                <Link
                  href={`/companies/${id}/memorize`}
                  className="flex items-center justify-between rounded-[1.75rem] border border-[var(--gold)] bg-[var(--gold)] p-5 text-[var(--navy)] shadow-[0_8px_30px_rgba(26,45,122,0.15)] transition hover:bg-[#50a8ff]"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[rgba(26,45,122,0.6)]">Memorize</p>
                    <p className="mt-1 text-base font-bold">暗記モードで練習する</p>
                    <p className="mt-0.5 text-xs text-[rgba(26,45,122,0.65)]">フラッシュカードで回答を暗記</p>
                  </div>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )}
              <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--navy)] p-6 text-white shadow-[0_16px_40px_rgba(26,45,122,0.14)]">
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--gold-soft)]">Action</p>
                <p className="mt-3 text-base font-bold">次の面接に向けて更新する</p>
                <p className="mt-3 text-sm leading-7 text-white/72">
                  実際に聞かれた質問や伝わりにくかった箇所を企業研究タブに追記し、再生成してください。
                </p>
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="mt-6 w-full rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff] disabled:opacity-60"
                >
                  {regenerating ? "再生成中..." : "再生成する"}
                </button>
              </div>

              {content && (
                <div className="rounded-[1.75rem] border border-[rgba(26,45,122,0.12)] bg-white p-6 shadow-[0_16px_40px_rgba(26,45,122,0.08)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Starter Bonus</p>
                  <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">面接対策ファイルを自動生成</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    画面の内容を、印刷用レイアウトの面接対策シートにまとめます。PCでもスマホでも見やすく、必要ならそのままPDF保存できます。
                  </p>
                  <div className="mt-5 rounded-[1.4rem] bg-[var(--paper)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted)]">含まれる内容</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                      志望理由・強み・弱み・就活の軸・逆質問・想定問答・入室前メモ
                    </p>
                  </div>
                  <Link
                    href={`/companies/${id}/sheet`}
                    target="_blank"
                    className={`mt-6 flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                      hasStarterPack
                        ? "bg-[var(--gold)] text-[var(--navy)] hover:bg-[#50a8ff]"
                        : "cursor-not-allowed bg-slate-200 text-slate-500 pointer-events-none"
                    }`}
                  >
                    PDF用シートを開く
                  </Link>
                  {!content?.preInterviewMemo && !(content?.anticipatedQuestions?.length) && (
                    <p className="mt-3 text-xs leading-6 text-[var(--muted)]">
                      先に「再生成する」を押すと、想定問答が増えてPDFの内容もより充実します。
                    </p>
                  )}
                </div>
              )}
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
