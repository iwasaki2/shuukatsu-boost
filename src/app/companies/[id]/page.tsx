"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCompany,
  saveCompany,
  type CompanyRecord,
  type GeneratedContent,
  PHASE_STYLES,
  PHASE_ORDER,
} from "@/lib/companies";

const PROFILE_KEY = "naiteiNaviProfile";

const SECTION_ACCENT: Record<string, string> = {
  selfIntro: "border-l-blue-400",
  motivation: "border-l-violet-400",
  jobAxis: "border-l-cyan-400",
  strengths: "border-l-emerald-400",
  weaknesses: "border-l-orange-400",
  careerPlan: "border-l-indigo-400",
  closingStatement: "border-l-rose-400",
};

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"research" | "prep">("prep");
  const [editingResearch, setEditingResearch] = useState(false);
  const [researchForm, setResearchForm] = useState({
    companyPhilosophy: "",
    desiredTalent: "",
    articles: "",
    interviewPhase: "",
  });

  useEffect(() => {
    const c = getCompany(id);
    if (!c) {
      router.push("/companies");
      return;
    }
    setCompany(c);
    setResearchForm({
      companyPhilosophy: c.companyPhilosophy,
      desiredTalent: c.desiredTalent,
      articles: c.articles,
      interviewPhase: c.interviewPhase,
    });
    if (c.generatedContent) {
      setActiveTab("prep");
    } else {
      setActiveTab("research");
    }
  }, [id, router]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveResearch = () => {
    if (!company) return;
    const updated = { ...company, ...researchForm };
    saveCompany(updated);
    setCompany(updated);
    setEditingResearch(false);
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
          strengthsOverride: (company as CompanyRecord & { strengthsOverride?: string }).strengthsOverride ?? "",
          weaknessesOverride: (company as CompanyRecord & { weaknessesOverride?: string }).weaknessesOverride ?? "",
          motivationMemo: (company as CompanyRecord & { motivationMemo?: string }).motivationMemo ?? "",
        }),
      });

      const content: GeneratedContent = await res.json();
      const updated = { ...company, generatedContent: content };
      saveCompany(updated);
      setCompany(updated);
      setActiveTab("prep");
    } catch (e) {
      console.error(e);
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
      label: "企業理念・ビジョン・ミッション",
      icon: "◈",
      placeholder: "HPや採用ページに記載されている理念・ビジョン・バリューを貼り付けてください",
    },
    {
      key: "desiredTalent",
      label: "求める人材像",
      icon: "◉",
      placeholder: "採用ページの「求める人材」「こんな人と働きたい」などを貼り付けてください",
    },
    {
      key: "articles",
      label: "気になった記事・ニュース・IR情報",
      icon: "◆",
      placeholder: "最近の取り組み・新事業・社長インタビュー・ニュースなど",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* ── Sticky header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-4">
          <button
            onClick={() => router.push("/companies")}
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm flex items-center gap-1 shrink-0"
          >
            ← 一覧
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="font-bold text-gray-900 truncate">{company.companyName}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 border ${PHASE_STYLES[company.interviewPhase] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
              {company.interviewPhase}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        {/* ── Phase switcher ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] shrink-0">選考フェーズ</span>
          <div className="flex gap-2 flex-wrap">
            {PHASE_ORDER.map((phase) => (
              <button
                key={phase}
                onClick={() => {
                  const updated = { ...company, interviewPhase: phase };
                  saveCompany(updated);
                  setCompany(updated);
                  setResearchForm((prev) => ({ ...prev, interviewPhase: phase }));
                }}
                className={`text-xs px-3.5 py-1.5 rounded-full border font-semibold transition-all ${
                  company.interviewPhase === phase
                    ? PHASE_STYLES[phase]
                    : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 bg-white"
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-2 flex">
            {(["research", "prep"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                  activeTab === t
                    ? "border-[#1B2D6B] text-[#1B2D6B]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {t === "research" ? "企業研究情報" : `面接対策${content ? " ✓" : "（未生成）"}`}
              </button>
            ))}
          </div>

          {/* ── Research tab ── */}
          {activeTab === "research" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">企業研究メモ</p>
                {!editingResearch ? (
                  <button
                    onClick={() => setEditingResearch(true)}
                    className="text-sm text-[#1B2D6B] border border-[#1B2D6B]/30 px-3.5 py-1.5 rounded-lg hover:bg-[#1B2D6B]/5 transition-colors font-semibold"
                  >
                    編集する
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingResearch(false)}
                      className="text-sm text-gray-400 px-3.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={saveResearch}
                      className="text-sm bg-[#1B2D6B] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#0F1B50] transition-colors font-semibold"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>

              {researchFields.map(({ key, label, icon, placeholder }) => (
                <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="text-[#1B2D6B] text-sm">{icon}</span>
                    <p className="text-xs font-bold text-gray-700">{label}</p>
                  </div>
                  <div className="px-4 py-4">
                    {editingResearch ? (
                      <textarea
                        value={researchForm[key as keyof typeof researchForm]}
                        onChange={(e) => setResearchForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        rows={4}
                        placeholder={placeholder}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#1B2D6B] focus:ring-2 focus:ring-[#1B2D6B]/10 transition-colors resize-none"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {researchForm[key as keyof typeof researchForm] || (
                          <span className="text-gray-300 italic">未入力 — 編集から追加できます</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="w-full bg-[#1B2D6B] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#0F1B50] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {regenerating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    生成中...
                  </>
                ) : content ? "企業情報をもとに再生成する ↺" : "この企業の面接対策を生成する"}
              </button>
            </div>
          )}

          {/* ── Interview prep tab ── */}
          {activeTab === "prep" && (
            <div className="p-6">
              {!content ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">📋</div>
                  <p className="font-bold text-gray-700 mb-2">まだ面接対策が生成されていません</p>
                  <p className="text-sm text-gray-400 mb-7">企業研究情報を入力すると精度が上がります</p>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="bg-[#1B2D6B] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#0F1B50] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mx-auto"
                  >
                    {regenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        生成中...
                      </>
                    ) : "面接対策を生成する"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {regenerating && (
                    <div className="bg-[#F5F6F8] rounded-xl border border-gray-200 p-6 text-center">
                      <div className="w-8 h-8 border-4 border-[#1B2D6B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-500 text-sm font-medium">再生成中...</p>
                    </div>
                  )}

                  {sections.map((s) => (
                    <div
                      key={s.key}
                      className={`bg-white border border-gray-200 border-l-4 ${SECTION_ACCENT[s.key] ?? "border-l-gray-300"} rounded-xl overflow-hidden shadow-sm`}
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-sm">{s.label}</h3>
                        <button
                          onClick={() => copyToClipboard(s.text, s.key)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                            copied === s.key
                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                              : "border-gray-200 text-gray-400 hover:border-[#1B2D6B] hover:text-[#1B2D6B]"
                          }`}
                        >
                          {copied === s.key ? "コピー済み ✓" : "コピー"}
                        </button>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{s.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* 逆質問 */}
                  <div className="bg-white border border-gray-200 border-l-4 border-l-[#1B2D6B] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center px-5 py-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900 text-sm flex-1">逆質問</h3>
                    </div>
                    <div className="px-5 py-4 space-y-4">
                      {content.reverseQuestions.map((q, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-black text-[#1B2D6B] tracking-wide">Q{i + 1}</span>
                            <button
                              onClick={() => copyToClipboard(`${q.opinion}${q.question}`, `q${i}`)}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                copied === `q${i}`
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                  : "border-gray-200 text-gray-400 hover:border-[#1B2D6B]"
                              }`}
                            >
                              {copied === `q${i}` ? "✓" : "コピー"}
                            </button>
                          </div>
                          <div className="bg-blue-50/60 px-4 py-3 border-b border-gray-100">
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] mb-1.5">自分の意見</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.opinion}</p>
                          </div>
                          <div className="px-4 py-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-1.5">質問</p>
                            <p className="text-sm text-[#1B2D6B] font-semibold leading-relaxed">{q.question}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="w-full mt-2 border-2 border-[#1B2D6B] text-[#1B2D6B] py-3.5 rounded-xl font-bold text-sm hover:bg-[#1B2D6B] hover:text-white transition-all disabled:opacity-60"
                  >
                    再生成する ↺
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
