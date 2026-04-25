"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCompany,
  saveCompany,
  type CompanyRecord,
  type GeneratedContent,
  type EsContent,
  type ReverseQuestion,
  PHASE_ORDER,
  PHASE_STYLES,
} from "@/lib/companies";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<"research" | "prep" | "es">(
    company?.generatedContent ? "prep" : "research"
  );
  const [generatingEs, setGeneratingEs] = useState(false);

  // ── Research editing ──────────────────────────────────
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchForm, setResearchForm] = useState(() => ({
    companyPhilosophy: company?.companyPhilosophy ?? "",
    desiredTalent: company?.desiredTalent ?? "",
    articles: company?.articles ?? "",
    interviewPhase: company?.interviewPhase ?? "1次面接",
  }));

  // ── Content editing (regular sections) ───────────────
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  // ── Reverse question editing ──────────────────────────
  const [editingRQIndex, setEditingRQIndex] = useState<number | null>(null);
  const [rqDraft, setRqDraft] = useState<ReverseQuestion>({ opinion: "", question: "" });

  useEffect(() => {
    if (!company) router.push("/companies");
  }, [company, router]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const updateCompany = (next: ExtendedCompanyRecord) => {
    saveCompany(next);
    setCompany(next);
  };

  // ── Research save ─────────────────────────────────────
  const saveResearch = () => {
    if (!company) return;
    updateCompany({
      ...company,
      companyPhilosophy: researchForm.companyPhilosophy,
      desiredTalent: researchForm.desiredTalent,
      articles: researchForm.articles,
      interviewPhase: researchForm.interviewPhase,
    });
    setEditingResearch(false);
  };

  const handlePhaseChange = (phase: string) => {
    if (!company) return;
    updateCompany({ ...company, interviewPhase: phase });
    setResearchForm((prev) => ({ ...prev, interviewPhase: phase }));
  };

  // ── Regenerate ────────────────────────────────────────
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

  // ── ES generation ────────────────────────────────────
  const handleGenerateEs = async () => {
    if (!company) return;
    setGeneratingEs(true);
    const profile = localStorage.getItem("naiteiNaviProfile");
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
          strengthsOverride: (company as ExtendedCompanyRecord).strengthsOverride ?? "",
          weaknessesOverride: (company as ExtendedCompanyRecord).weaknessesOverride ?? "",
          motivationMemo: (company as ExtendedCompanyRecord).motivationMemo ?? "",
          mode: "es",
        }),
      });
      const esContent: EsContent = await res.json();
      updateCompany({ ...company, esContent });
      setActiveTab("es");
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingEs(false);
    }
  };

  // ── Content section edit ──────────────────────────────
  const startEditing = (key: string, text: string) => {
    setEditingRQIndex(null);
    setEditingKey(key);
    setEditDraft(text);
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditDraft("");
  };

  const saveContentEdit = (key: string) => {
    if (!company?.generatedContent) return;
    updateCompany({
      ...company,
      generatedContent: { ...company.generatedContent, [key]: editDraft },
    });
    setEditingKey(null);
    setEditDraft("");
  };

  // ── Reverse question edit ─────────────────────────────
  const startEditRQ = (index: number, rq: ReverseQuestion) => {
    setEditingKey(null);
    setEditingRQIndex(index);
    setRqDraft({ ...rq });
  };

  const cancelEditRQ = () => {
    setEditingRQIndex(null);
  };

  const saveRQEdit = (index: number) => {
    if (!company?.generatedContent) return;
    const updated = [...company.generatedContent.reverseQuestions];
    updated[index] = rqDraft;
    updateCompany({
      ...company,
      generatedContent: { ...company.generatedContent, reverseQuestions: updated },
    });
    setEditingRQIndex(null);
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
    { key: "companyPhilosophy", label: "企業理念・ビジョン", placeholder: "採用ページやコーポレートサイトのビジョンをメモ" },
    { key: "desiredTalent", label: "求める人材像", placeholder: "採用ページの人物像や期待される行動を整理" },
    { key: "articles", label: "ニュース・IR・印象に残った情報", placeholder: "直近のニュース、事業トピック、競合比較など" },
  ] as const;

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

        {/* ── ES tab ───────────────────────────────────── */}
        {activeTab === "es" ? (
          <div className="space-y-5">
            {!company.esContent ? (
              <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 text-center shadow-[0_24px_60px_rgba(26,45,122,0.08)]">
                <p className="text-2xl font-bold text-[var(--navy)]">ES・書類対策を生成します</p>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--ink-soft)]">
                  自己PR・ガクチカ・志望動機を各200字程度のES用文章として生成します。<br />
                  面接対策を先に生成しておくと、より精度が上がります。
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
                  { key: "esSelfPR", label: "自己PR" },
                  { key: "esAppealPoints", label: "アピールポイント" },
                  { key: "esMotivation", label: "志望理由" },
                ].map((section) => {
                  const text = company.esContent?.[section.key as keyof EsContent] ?? "";
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
          /* ── Prep tab ──────────────────────────────────── */
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
                  {/* Regular sections */}
                  {sections.map((section) => (
                    <article
                      key={section.key}
                      className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                        <h3 className="font-serif text-3xl text-[var(--navy)]">{section.label}</h3>
                        <div className="flex items-center gap-2">
                          {editingKey === section.key ? (
                            <>
                              <button
                                onClick={cancelEditing}
                                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--paper)]"
                              >
                                キャンセル
                              </button>
                              <button
                                onClick={() => saveContentEdit(section.key)}
                                className="rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
                              >
                                保存
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => copyToClipboard(section.text, section.key)}
                                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                              >
                                {copied === section.key ? "コピー済み" : "コピー"}
                              </button>
                              <button
                                onClick={() => startEditing(section.key, section.text)}
                                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                              >
                                編集
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-5">
                        {editingKey === section.key ? (
                          <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={8}
                            className="w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-8 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
                          />
                        ) : (
                          <p className="whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">
                            {section.text}
                          </p>
                        )}
                      </div>
                    </article>
                  ))}

                  {/* Reverse questions */}
                  <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(26,45,122,0.07)]">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
                      <h3 className="font-serif text-3xl text-[var(--navy)]">逆質問</h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            content.reverseQuestions.map((q, i) => `Q${i + 1}\n${q.opinion}\n${q.question}`).join("\n\n"),
                            "reverse-all"
                          )
                        }
                        className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                      >
                        {copied === "reverse-all" ? "コピー済み" : "全てコピー"}
                      </button>
                    </div>

                    <div className="mt-6 space-y-4">
                      {content.reverseQuestions.map((question, index) => (
                        <div key={index} className="rounded-[1.5rem] bg-[var(--paper)] p-5">
                          {editingRQIndex === index ? (
                            /* Edit mode for this question */
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={cancelEditRQ}
                                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:bg-white"
                                  >
                                    キャンセル
                                  </button>
                                  <button
                                    onClick={() => saveRQEdit(index)}
                                    className="rounded-full bg-[var(--gold)] px-3 py-1.5 text-xs font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
                                  >
                                    保存
                                  </button>
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                                <textarea
                                  value={rqDraft.opinion}
                                  onChange={(e) => setRqDraft((prev) => ({ ...prev, opinion: e.target.value }))}
                                  rows={3}
                                  className="mt-2 w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
                                />
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                                <textarea
                                  value={rqDraft.question}
                                  onChange={(e) => setRqDraft((prev) => ({ ...prev, question: e.target.value }))}
                                  rows={2}
                                  className="mt-2 w-full resize-y rounded-[1.25rem] border border-[var(--line)] bg-white px-4 py-3 text-sm leading-7 text-[var(--ink)] focus:border-[var(--navy)] focus:outline-none"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Read mode */
                            <div>
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => copyToClipboard(`${question.opinion}\n${question.question}`, `q${index}`)}
                                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                                  >
                                    {copied === `q${index}` ? "コピー済み" : "コピー"}
                                  </button>
                                  <button
                                    onClick={() => startEditRQ(index, question)}
                                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                                  >
                                    編集
                                  </button>
                                </div>
                              </div>
                              <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                              <p className="mt-2 text-sm leading-8 text-[var(--ink-soft)]">{question.opinion}</p>
                              <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                              <p className="mt-2 text-sm font-semibold leading-8 text-[var(--navy)]">{question.question}</p>
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
              {content && (
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
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
