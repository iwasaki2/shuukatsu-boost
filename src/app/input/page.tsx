"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveCompany, getCompany, type CompanyRecord } from "@/lib/companies";

interface FormData {
  name: string;
  university: string;
  faculty: string;
  background: string;
  gakuchika: string;
  strengths: string;
  weaknesses: string;
  jobAxis: string;
  companyName: string;
  jobType: string;
  interviewPhase: string;
  companyPhilosophy: string;
  desiredTalent: string;
  articles: string;
  strengthsOverride: string;
  weaknessesOverride: string;
  motivationMemo: string;
}

type ProfileData = Pick<FormData, "name" | "university" | "faculty" | "background" | "gakuchika" | "strengths" | "weaknesses" | "jobAxis">;

const PROFILE_KEY = "naiteiNaviProfile";

const INITIAL_FORM: FormData = {
  name: "", university: "", faculty: "", background: "",
  gakuchika: "", strengths: "", weaknesses: "", jobAxis: "",
  companyName: "", jobType: "", interviewPhase: "1次面接",
  companyPhilosophy: "", desiredTalent: "", articles: "",
  strengthsOverride: "", weaknessesOverride: "", motivationMemo: "",
};

function InputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [step, setStep] = useState(searchParams.get("step") === "2" ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [showOverrides, setShowOverrides] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [researching, setResearching] = useState(false);

  useEffect(() => {
    if (editId) {
      const company = getCompany(editId);
      if (company) {
        setFormData((prev) => ({
          ...prev,
          companyName: company.companyName,
          jobType: company.jobType,
          interviewPhase: company.interviewPhase,
          companyPhilosophy: company.companyPhilosophy,
          desiredTalent: company.desiredTalent,
          articles: company.articles,
          strengthsOverride: (company as CompanyRecord & { strengthsOverride?: string }).strengthsOverride ?? "",
          weaknessesOverride: (company as CompanyRecord & { weaknessesOverride?: string }).weaknessesOverride ?? "",
          jobAxisOverride: (company as CompanyRecord & { jobAxisOverride?: string }).jobAxisOverride ?? "",
        }));
        setStep(2);
      }
    }

    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      const profile: ProfileData = JSON.parse(saved);
      setFormData((prev) => ({ ...prev, ...profile }));
      setProfileLoaded(true);
    }
  }, [editId]);

  useEffect(() => {
    if (searchParams.get("step") === "2" && profileLoaded) {
      setStep(2);
    }
  }, [profileLoaded, searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const saveProfile = (data: FormData) => {
    const profile: ProfileData = {
      name: data.name, university: data.university, faculty: data.faculty,
      background: data.background, gakuchika: data.gakuchika,
      strengths: data.strengths, weaknesses: data.weaknesses, jobAxis: data.jobAxis,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setProfileLoaded(true);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleResearch = async () => {
    if (!formData.companyName) return;
    setResearching(true);
    setShowResearch(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: formData.companyName }),
      });
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        companyPhilosophy: data.companyPhilosophy ?? prev.companyPhilosophy,
        desiredTalent: data.desiredTalent ?? prev.desiredTalent,
        articles: data.articles ?? prev.articles,
      }));
    } catch {
      // fail silently
    } finally {
      setResearching(false);
    }
  };

  const clearProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
    setFormData(INITIAL_FORM);
    setProfileLoaded(false);
  };

  const handleNext = () => {
    const { name, university, faculty, gakuchika, strengths, weaknesses, jobAxis } = formData;
    if (!name || !university || !faculty || !gakuchika || !strengths || !weaknesses || !jobAxis) {
      setError("すべての必須項目を入力してください");
      return;
    }
    setError("");
    saveProfile(formData);
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    const { companyName, jobType } = formData;
    if (!companyName || !jobType) {
      setError("企業名と職種を入力してください");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Generation failed");

      const generatedContent = await res.json();
      const now = new Date().toISOString();
      const companyId = editId ?? Date.now().toString();

      const record: CompanyRecord & { strengthsOverride?: string; weaknessesOverride?: string; motivationMemo?: string } = {
        id: companyId,
        companyName: formData.companyName,
        jobType: formData.jobType,
        interviewPhase: formData.interviewPhase,
        companyPhilosophy: formData.companyPhilosophy,
        desiredTalent: formData.desiredTalent,
        articles: formData.articles,
        strengthsOverride: formData.strengthsOverride,
        weaknessesOverride: formData.weaknessesOverride,
        motivationMemo: formData.motivationMemo,
        generatedContent,
        createdAt: now,
        updatedAt: now,
      };

      saveCompany(record);
      router.push(`/companies/${companyId}`);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 min-h-screen bg-[#1B2D6B] sticky top-0 h-screen overflow-y-auto shrink-0">
        <div className="flex flex-col flex-1 px-10 py-12">
          <button
            onClick={() => router.push("/")}
            className="text-white font-bold text-2xl tracking-wide mb-2 text-left"
          >
            内定ナビ
          </button>
          <p className="text-white/50 text-xs mb-12">AI面接対策サービス</p>

          <div className="space-y-6 mb-12">
            {[
              { icon: "✦", title: "企業別に最適化", body: "企業理念・求める人材・最新ニュースを反映した回答を生成" },
              { icon: "✦", title: "全項目を網羅", body: "自己紹介から逆質問まで、面接で聞かれる内容をすべてカバー" },
              { icon: "✦", title: "何度でも再生成", body: "フィードバックをもとに改善。選考フェーズごとに調整可能" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="text-[#4B7BF5] text-sm mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold mb-1">{item.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <blockquote className="border-l-2 border-white/20 pl-5">
              <p className="text-white/60 text-sm leading-relaxed italic mb-3">
                「自分では気づいていなかった強みが言語化されて、自信を持って面接に臨めました」
              </p>
              <p className="text-white/40 text-xs">— 内定ナビ利用者</p>
            </blockquote>
          </div>
        </div>
      </aside>

      {/* ── Right: form area ── */}
      <div className="flex-1 min-w-0 bg-[#F5F6F8]">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/")} className="text-[#1B2D6B] font-bold text-lg lg:hidden">内定ナビ</button>
              <button onClick={() => router.push("/companies")} className="text-gray-400 text-sm hover:text-gray-600 transition-colors">
                ← 選考中企業
              </button>
            </div>
            <div className="flex items-center gap-3">
              {profileLoaded && (
                <>
                  <span className="text-emerald-600 text-xs font-semibold hidden sm:block">✓ プロフィール保存済み</span>
                  <button onClick={clearProfile} className="text-gray-400 text-xs hover:text-gray-600 transition-colors underline">リセット</button>
                </>
              )}
            </div>
          </div>

          {/* Step progress bar */}
          <div className="max-w-2xl mx-auto px-6 pb-0">
            <div className="flex">
              {[
                { n: 1, label: "自己情報" },
                { n: 2, label: "企業情報" },
              ].map(({ n, label }) => (
                <div key={n} className="flex-1">
                  <div className={`h-0.5 transition-colors ${step >= n ? "bg-[#1B2D6B]" : "bg-gray-200"}`} />
                  <div className="flex items-center gap-2 py-2.5 px-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-colors shrink-0 ${step >= n ? "bg-[#1B2D6B] text-white" : "bg-gray-200 text-gray-400"}`}>
                      {step > n ? "✓" : n}
                    </div>
                    <span className={`text-xs font-semibold transition-colors ${step >= n ? "text-[#1B2D6B]" : "text-gray-400"}`}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {justSaved && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
            ✓ プロフィールを保存しました
          </div>
        )}

        <div className="max-w-2xl mx-auto px-6 py-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">あなたについて教えてください</h2>
                  <p className="text-sm text-gray-500">複数企業の対策に使い回せるよう自動保存されます</p>
                </div>
                {profileLoaded && (
                  <span className="shrink-0 ml-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap">
                    ✓ 前回の情報を読み込み済み
                  </span>
                )}
              </div>

              {/* 基本情報 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">基本情報</p>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="名前" name="name" value={formData.name} onChange={handleChange} placeholder="山田 太郎" />
                  <Field label="大学名" name="university" value={formData.university} onChange={handleChange} placeholder="○○大学" />
                </div>
                <Field label="学部・学科" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="経済学部 経済学科" />
              </div>

              {/* バックグラウンド */}
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1B2D6B]">自己バックグラウンド</p>
                  <span className="text-xs text-blue-400 font-medium">任意 — 多いほど精度UP</span>
                </div>
                <p className="text-xs text-blue-600/70 mb-3 leading-relaxed">
                  出身・家族・趣味・アルバイト・インターン・印象的な出来事・価値観の源泉など
                </p>
                <textarea
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  rows={4}
                  placeholder="例）北海道出身で農家の長男。食の大切さを身近に感じて育った。居酒屋でフードロスに課題を感じ独自に調べていた。趣味は登山。"
                  className="w-full border border-blue-200 rounded-xl px-4 py-3 text-gray-900 placeholder-blue-300 focus:outline-none focus:border-[#1B2D6B] focus:ring-2 focus:ring-[#1B2D6B]/10 transition-colors resize-none bg-white text-sm"
                />
              </div>

              {/* ガクチカ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-5">ガクチカ</p>
                <TextArea
                  label="学生時代に力を入れたこと"
                  name="gakuchika"
                  value={formData.gakuchika}
                  onChange={handleChange}
                  placeholder="具体的なエピソード、取り組み内容、成果などを詳しく書いてください"
                  rows={5}
                />
              </div>

              {/* 強み・弱み・就活の軸 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">強み・弱み・就活の軸</p>
                  <span className="text-xs text-gray-400">企業別に調整可能</span>
                </div>
                <TextArea label="強み" name="strengths" value={formData.strengths} onChange={handleChange} placeholder="具体的な行動・癖・得意なことを書いてください" rows={3} />
                <TextArea label="弱み" name="weaknesses" value={formData.weaknesses} onChange={handleChange} placeholder="正直に書くほどオリジナリティのある回答になります" rows={3} />
                <TextArea label="就活の軸" name="jobAxis" value={formData.jobAxis} onChange={handleChange} placeholder="就職活動において大切にしていること" rows={3} />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-[#1B2D6B] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#0F1B50] transition-colors"
              >
                次へ — 企業情報を入力する
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => { setStep(1); setError(""); }}
                    className="text-gray-400 text-sm mb-2 flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    ← 自己情報に戻る
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">応募企業の情報</h2>
                  <p className="text-sm text-gray-500 mt-0.5">企業に合わせた面接対策を生成します</p>
                </div>
              </div>

              {/* 必須情報 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">必須情報</p>
                <Field label="企業名" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="○○株式会社" />
                <Field label="希望職種" name="jobType" value={formData.jobType} onChange={handleChange} placeholder="営業職・エンジニア・マーケティング など" />

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">面接フェーズ</label>
                  <div className="flex gap-2">
                    {["1次面接", "2次面接", "最終面接"].map((phase) => (
                      <label
                        key={phase}
                        className={`flex-1 border-2 rounded-xl py-3 px-2 text-center cursor-pointer transition-all text-sm font-semibold ${
                          formData.interviewPhase === phase
                            ? "border-[#1B2D6B] bg-[#1B2D6B] text-white"
                            : "border-gray-200 text-gray-500 hover:border-[#1B2D6B]/40 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="interviewPhase"
                          value={phase}
                          checked={formData.interviewPhase === phase}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        {phase}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 企業研究 accordion */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">企業研究情報</p>
                    <p className="text-xs text-gray-400 mt-0.5">任意 — 志望理由・逆質問の精度が上がります</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResearch}
                      disabled={!formData.companyName || researching}
                      className="flex items-center gap-1.5 bg-[#1B2D6B] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#0F1B50] transition-colors disabled:opacity-40"
                    >
                      {researching ? (
                        <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />調査中...</>
                      ) : "✦ AIで調べる"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResearch((v) => !v)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <svg className={`w-4 h-4 transition-transform ${showResearch ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {showResearch && (
                  <div className="border-t border-gray-100 px-6 py-5 space-y-5 bg-gray-50/50">
                    {researching && (
                      <div className="flex items-center gap-2 text-[#1B2D6B] text-xs font-medium">
                        <span className="w-3 h-3 border-2 border-[#1B2D6B] border-t-transparent rounded-full animate-spin" />
                        {formData.companyName}を調査中...
                      </div>
                    )}
                    <TextArea label="企業理念・ビジョン" name="companyPhilosophy" value={formData.companyPhilosophy} onChange={handleChange} placeholder="HPや採用ページの理念・ビジョン・バリューを貼り付け" rows={3} />
                    <TextArea label="求める人材像" name="desiredTalent" value={formData.desiredTalent} onChange={handleChange} placeholder="採用ページの「求める人材」「こんな人と働きたい」などを貼り付け" rows={3} />
                    <TextArea label="気になった記事・ニュース・IR情報" name="articles" value={formData.articles} onChange={handleChange} placeholder="最近の取り組み・新事業・社長インタビューなど" rows={3} />
                  </div>
                )}
              </div>

              {/* カスタマイズ accordion */}
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowOverrides((v) => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-amber-50 hover:bg-amber-100/70 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-amber-900">この企業向けにカスタマイズ</p>
                    <p className="text-xs text-amber-600 mt-0.5">強み・弱み・志望理由を企業別に調整</p>
                  </div>
                  <svg className={`w-4 h-4 text-amber-400 transition-transform shrink-0 ml-4 ${showOverrides ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showOverrides && (
                  <div className="px-6 py-5 space-y-5">
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                      空欄の場合はプロフィールの内容が使われます。この企業に特化した内容がある場合のみ入力してください。
                    </p>
                    <TextArea
                      label="強み（この企業向け）"
                      name="strengthsOverride"
                      value={formData.strengthsOverride}
                      onChange={handleChange}
                      placeholder={formData.strengths ? `デフォルト: "${formData.strengths.slice(0, 40)}..."` : "この企業で特に強調したい強みを入力"}
                      rows={3}
                    />
                    <TextArea
                      label="弱み（この企業向け）"
                      name="weaknessesOverride"
                      value={formData.weaknessesOverride}
                      onChange={handleChange}
                      placeholder={formData.weaknesses ? `デフォルト: "${formData.weaknesses.slice(0, 40)}..."` : "この企業で使いたい弱みを入力"}
                      rows={3}
                    />
                    <TextArea
                      label="志望理由のメモ（この企業に伝えたいこと）"
                      name="motivationMemo"
                      value={formData.motivationMemo}
                      onChange={handleChange}
                      placeholder="この企業を選んだ理由・きっかけ・特に伝えたいエピソードなど。AIが志望理由に組み込みます"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#1B2D6B] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#0F1B50] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    AIが面接対策を生成中...
                  </>
                ) : "AIで面接対策を生成する"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InputPage() {
  return <Suspense><InputForm /></Suspense>;
}

function Field({ label, name, value, onChange, placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#1B2D6B] focus:ring-2 focus:ring-[#1B2D6B]/10 transition-colors bg-white text-sm"
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange, placeholder, rows }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1.5">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows || 3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#1B2D6B] focus:ring-2 focus:ring-[#1B2D6B]/10 transition-colors resize-none bg-white text-sm"
      />
    </div>
  );
}
