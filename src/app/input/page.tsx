"use client";

import { Suspense, useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCompany, saveCompany, type CompanyRecord } from "@/lib/companies";

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

type ProfileData = Pick<
  FormData,
  "name" | "university" | "faculty" | "background" | "gakuchika" | "strengths" | "weaknesses" | "jobAxis"
>;

type ExtendedCompanyRecord = CompanyRecord & {
  strengthsOverride?: string;
  weaknessesOverride?: string;
  motivationMemo?: string;
};

const PROFILE_KEY = "naiteiNaviProfile";

const INITIAL_FORM: FormData = {
  name: "",
  university: "",
  faculty: "",
  background: "",
  gakuchika: "",
  strengths: "",
  weaknesses: "",
  jobAxis: "",
  companyName: "",
  jobType: "",
  interviewPhase: "1次面接",
  companyPhilosophy: "",
  desiredTalent: "",
  articles: "",
  strengthsOverride: "",
  weaknessesOverride: "",
  motivationMemo: "",
};

function getStoredProfile(): ProfileData | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(PROFILE_KEY);
  return saved ? (JSON.parse(saved) as ProfileData) : null;
}

function getPrefilledForm(editId: string | null): FormData {
  const profile = getStoredProfile();
  const base = { ...INITIAL_FORM, ...(profile ?? {}) };

  if (!editId) return base;

  const company = getCompany(editId) as ExtendedCompanyRecord | null;
  if (!company) return base;

  return {
    ...base,
    companyName: company.companyName,
    jobType: company.jobType,
    interviewPhase: company.interviewPhase,
    companyPhilosophy: company.companyPhilosophy,
    desiredTalent: company.desiredTalent,
    articles: company.articles,
    strengthsOverride: company.strengthsOverride ?? "",
    weaknessesOverride: company.weaknessesOverride ?? "",
    motivationMemo: company.motivationMemo ?? "",
  };
}

function InputForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const hasStoredProfile = !!getStoredProfile();
  const initialStep = editId || (searchParams.get("step") === "2" && hasStoredProfile) ? 2 : 1;

  const [step, setStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>(() => getPrefilledForm(editId));
  const [profileLoaded, setProfileLoaded] = useState(hasStoredProfile);
  const [justSaved, setJustSaved] = useState(false);
  const [showResearch, setShowResearch] = useState(
    !!editId || !!formData.companyPhilosophy || !!formData.desiredTalent || !!formData.articles
  );
  const [showOverrides, setShowOverrides] = useState(
    !!formData.strengthsOverride || !!formData.weaknessesOverride || !!formData.motivationMemo
  );
  const [researching, setResearching] = useState(false);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const saveProfile = (data: FormData) => {
    const profile: ProfileData = {
      name: data.name,
      university: data.university,
      faculty: data.faculty,
      background: data.background,
      gakuchika: data.gakuchika,
      strengths: data.strengths,
      weaknesses: data.weaknesses,
      jobAxis: data.jobAxis,
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
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: formData.companyName }),
      });
      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        companyPhilosophy: data.companyPhilosophy ?? prev.companyPhilosophy,
        desiredTalent: data.desiredTalent ?? prev.desiredTalent,
        articles: data.articles ?? prev.articles,
      }));
    } catch {
      // Ignore research fetch failures and leave manual entry available.
    } finally {
      setResearching(false);
    }
  };

  const clearProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
    setFormData((prev) => ({
      ...prev,
      name: "",
      university: "",
      faculty: "",
      background: "",
      gakuchika: "",
      strengths: "",
      weaknesses: "",
      jobAxis: "",
    }));
    setProfileLoaded(false);
  };

  const handleNext = () => {
    const { name, university, faculty, gakuchika, strengths, weaknesses, jobAxis } = formData;
    if (!name || !university || !faculty || !gakuchika || !strengths || !weaknesses || !jobAxis) {
      setError("必須項目を入力してください。");
      return;
    }

    saveProfile(formData);
    setError("");
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.jobType) {
      setError("企業名と希望職種を入力してください。");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Generation failed");

      const generatedContent = await response.json();
      const now = new Date().toISOString();
      const companyId = editId ?? Date.now().toString();
      const existing = editId ? (getCompany(editId) as ExtendedCompanyRecord | null) : null;

      const record: ExtendedCompanyRecord = {
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
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      saveCompany(record);
      router.push(`/companies/${companyId}`);
    } catch {
      setError("生成に失敗しました。もう一度お試しください。");
      setLoading(false);
    }
  };

  const infoPill = "rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/78";

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="relative hidden overflow-hidden bg-[var(--navy)] text-white lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-22"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(7,18,35,0.9), rgba(7,18,35,0.74)), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(209,175,97,0.2),transparent_24%)]" />
          <div className="relative flex h-full flex-col px-10 py-12 xl:px-14">
            <button onClick={() => router.push("/")} className="text-left">
              <p className="font-serif text-3xl tracking-[0.12em]">就活Boost</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.45em] text-white/45">Interview Builder</p>
            </button>

            {step === 1 ? (
              <>
                <div className="mt-14">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Step 1 / 2</p>
                  <h1 className="mt-4 font-serif text-5xl leading-tight">
                    プロフィールを
                    <br />
                    登録します
                  </h1>
                  <p className="mt-6 text-sm leading-8 text-white/68">
                    一度入力すると保存されます。次の企業でも同じ内容が引き継がれます。
                  </p>
                </div>
                <div className="mt-10">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/38">このプロフィールから生成される項目</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["志望理由", "自己PR", "強み・弱み", "キャリアプラン", "逆質問"].map((item) => (
                      <span key={item} className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/70">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <blockquote className="mt-auto max-w-md border-l border-white/20 pl-5">
                  <p className="text-sm leading-8 text-white/68">
                    「企業ごとに話すべき強みが整理されて、面接直前の迷いがかなり減りました。」
                  </p>
                  <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/35">ユーザーの声</p>
                </blockquote>
              </>
            ) : (
              <>
                <div className="mt-14">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">Step 2 / 2</p>
                  <h1 className="mt-4 font-serif text-5xl leading-tight">
                    企業情報を
                    <br />
                    入力します
                  </h1>
                  <p className="mt-6 text-sm leading-8 text-white/68">
                    企業名を入れたら「AI補助調査」を試してください。採用概要を自動で取得します。
                  </p>
                </div>
                <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                  <p className="text-xs font-semibold text-[var(--gold-soft)]">精度を上げるコツ</p>
                  <ul className="mt-4 space-y-3 text-sm text-white/68">
                    {[
                      "企業理念は採用ページからコピーして貼る",
                      "直近のニュースや新事業を1〜2件追加する",
                      "志望理由メモに結びつけたい経験を書く",
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2.5">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--gold-soft)]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/38">入力後に生成される内容</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["志望理由", "自己PR", "逆質問3件", "＋5種類"].map((item) => (
                      <span key={item} className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white/70">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(247,242,234,0.92)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <button onClick={() => router.push("/companies")} className="text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--navy)]">
                  ← 選考一覧
                </button>
                <button onClick={() => router.push("/")} className="font-serif text-2xl text-[var(--navy)] lg:hidden">
                  就活Boost
                </button>
              </div>
              {profileLoaded && (
                <div className="flex items-center gap-3">
                  <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                    プロフィール保存済み
                  </span>
                  <button onClick={clearProfile} className="text-xs font-semibold text-[var(--muted)] underline-offset-2 hover:underline">
                    リセット
                  </button>
                </div>
              )}
            </div>
          </header>

          {justSaved && (
            <div className="fixed right-5 top-5 z-50 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg">
              プロフィールを保存しました
            </div>
          )}

          <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8 lg:py-10">
            <div className="mb-8 flex items-center">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  step > 1 ? "bg-[var(--gold)] text-[var(--navy)]" : "bg-[var(--navy)] text-white"
                }`}>
                  {step > 1 ? (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path d="M1 4.5L4.5 8L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : "1"}
                </div>
                <span className="text-sm font-semibold text-[var(--navy)]">自己情報</span>
              </div>
              <div className={`mx-4 h-px w-10 rounded-full transition-colors duration-300 ${step > 1 ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`} />
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                  step >= 2 ? "bg-[var(--navy)] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)]"
                }`}>
                  2
                </div>
                <span className={`text-sm font-semibold transition ${step >= 2 ? "text-[var(--navy)]" : "text-[var(--muted)]"}`}>
                  企業情報
                </span>
              </div>
            </div>

            {step === 1 ? (
              <div className="space-y-5">
                <div className="pb-2">
                  <h2 className="font-serif text-3xl text-[var(--navy)]">あなたのプロフィールを入力</h2>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    一度入力すると保存され、次の企業でも引き継がれます。
                  </p>
                </div>

                <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">基本情報</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="名前" name="name" value={formData.name} onChange={handleChange} placeholder="山田 太郎" />
                    <Field label="大学名" name="university" value={formData.university} onChange={handleChange} placeholder="○○大学" />
                  </div>
                  <div className="mt-4">
                    <Field label="学部・学科" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="経済学部 経済学科" />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">自己分析</p>
                  <div className="space-y-5">
                    <TextArea
                      label="学生時代に力を入れたこと（ガクチカ）"
                      name="gakuchika"
                      value={formData.gakuchika}
                      onChange={handleChange}
                      placeholder="何に取り組み、何を考え、どんな工夫をして、どう成果につなげたか"
                      rows={5}
                      helper="取り組み・工夫・成果の順で書くと、より具体的な志望理由が生成されます"
                    />
                    <TextArea
                      label="強み"
                      name="strengths"
                      value={formData.strengths}
                      onChange={handleChange}
                      placeholder="行動の傾向、得意な進め方、周囲から言われることなど"
                      rows={3}
                      helper="過去の経験から自覚したことや、周囲から指摘されることを書いてください"
                    />
                    <TextArea
                      label="弱み"
                      name="weaknesses"
                      value={formData.weaknesses}
                      onChange={handleChange}
                      placeholder="苦手なこと、改善中のこと"
                      rows={3}
                      helper="正直に書くほど、面接での回答に説得力が出ます"
                    />
                    <TextArea
                      label="就活の軸"
                      name="jobAxis"
                      value={formData.jobAxis}
                      onChange={handleChange}
                      placeholder="仕事で重視したいこと、やりたいこと、避けたいこと"
                      rows={3}
                    />
                  </div>
                </section>

                <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">バックグラウンド（任意）</p>
                  <TextArea
                    label="自己バックグラウンド"
                    name="background"
                    value={formData.background}
                    onChange={handleChange}
                    placeholder="育った環境、価値観の原点、部活、アルバイト、印象に残る出来事など"
                    rows={4}
                    helper="任意項目ですが、書くと自己紹介や志望理由に個人らしさが出ます"
                  />
                </section>

                {error && <ErrorBanner message={error} />}

                <button
                  onClick={handleNext}
                  className="w-full rounded-full bg-[var(--navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#162c49] active:scale-[0.98]"
                >
                  企業情報の入力へ進む →
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <button
                      onClick={() => { setStep(1); setError(""); }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--navy)]"
                    >
                      ← 戻る
                    </button>
                    <h2 className="mt-3 font-serif text-3xl text-[var(--navy)]">企業情報を入力</h2>
                    <p className="mt-1.5 text-sm text-[var(--muted)]">情報を足すほど、生成される回答が具体的になります。</p>
                  </div>
                </div>

                <section className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">企業・選考情報</p>
                  <div className="space-y-4">
                    <Field label="企業名" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="○○株式会社" />
                    <Field label="希望職種" name="jobType" value={formData.jobType} onChange={handleChange} placeholder="営業職、企画職、エンジニアなど" />
                    <div>
                      <label className="block text-sm font-semibold text-[var(--navy)]">面接フェーズ</label>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {["1次面接", "2次面接", "最終面接"].map((phase) => (
                          <label
                            key={phase}
                            className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                              formData.interviewPhase === phase
                                ? "bg-[var(--navy)] text-white"
                                : "border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-soft)] hover:border-[var(--navy)] hover:text-[var(--navy)]"
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
                </section>

                <section className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">企業研究メモ</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">入力するほど志望理由・逆質問が具体的になります</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleResearch}
                        disabled={!formData.companyName || researching}
                        className="rounded-full bg-[var(--gold)] px-4 py-2 text-xs font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d] disabled:opacity-40"
                      >
                        {researching ? "取得中..." : "AI自動取得"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResearch((prev) => !prev)}
                        className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                      >
                        {showResearch ? "閉じる" : "手入力する"}
                      </button>
                    </div>
                  </div>

                  {showResearch && (
                    <div className="border-t border-[var(--line)] bg-[var(--paper)] px-6 py-5">
                      <div className="space-y-4">
                        <TextArea
                          label="企業理念・ビジョン"
                          name="companyPhilosophy"
                          value={formData.companyPhilosophy}
                          onChange={handleChange}
                          placeholder="採用ページの理念・ミッション・価値観"
                          rows={4}
                          helper="採用ページや企業サイトからコピーして貼り付けてください"
                        />
                        <TextArea
                          label="求める人材像"
                          name="desiredTalent"
                          value={formData.desiredTalent}
                          onChange={handleChange}
                          placeholder="採用ページで明示されている人物像"
                          rows={3}
                        />
                        <TextArea
                          label="ニュース・気になった情報"
                          name="articles"
                          value={formData.articles}
                          onChange={handleChange}
                          placeholder="直近の新規事業、プレスリリース、社長インタビューなど"
                          rows={3}
                          helper="1〜2件追加するだけで逆質問の内容が格段に良くなります"
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-[0_8px_30px_rgba(10,25,47,0.06)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">この企業向けのカスタマイズ（任意）</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">他社と強みの見せ方を変えたい場合に使います</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOverrides((prev) => !prev)}
                      className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                    >
                      {showOverrides ? "閉じる" : "開く"}
                    </button>
                  </div>

                  {showOverrides && (
                    <div className="border-t border-[var(--line)] px-6 py-6">
                      <div className="space-y-5">
                        <TextArea
                          label="強み（この企業向け）"
                          name="strengthsOverride"
                          value={formData.strengthsOverride}
                          onChange={handleChange}
                          placeholder="この企業で特に強調したい強みがあれば入力"
                          rows={4}
                        />
                        <TextArea
                          label="弱み（この企業向け）"
                          name="weaknessesOverride"
                          value={formData.weaknessesOverride}
                          onChange={handleChange}
                          placeholder="この企業での見せ方を変えたい弱みがあれば入力"
                          rows={4}
                        />
                        <TextArea
                          label="志望理由メモ"
                          name="motivationMemo"
                          value={formData.motivationMemo}
                          onChange={handleChange}
                          placeholder="この企業を選んだ理由、伝えたい経験、面接で触れたいこと"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {error && <ErrorBanner message={error} />}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-full bg-[var(--navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#162c49] active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "AIが面接対策を生成中..." : "AIで面接対策を生成する"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function InputPage() {
  return (
    <Suspense>
      <InputForm />
    </Suspense>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--navy)]">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 w-full rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows,
  helper,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--navy)]">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows ?? 4}
        className="mt-2 w-full resize-none rounded-[1.25rem] border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-7 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--navy)] focus:outline-none"
      />
      {helper && (
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">{helper}</p>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}
    </div>
  );
}
