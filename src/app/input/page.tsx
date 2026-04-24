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

            <div className="mt-14">
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Structured Preparation</p>
              <h1 className="mt-5 font-serif text-5xl leading-tight">
                企業ごとの面接準備を、
                <br />
                気持ちではなく設計で進める。
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-8 text-white/72">
                自己分析、企業研究、逆質問の準備を一つの流れで入力し、企業に刺さる回答へ再構成します。
              </p>
            </div>

            <div className="mt-10 grid gap-3">
              {[
                "プロフィールは自動保存され、次回以降も再利用",
                "企業研究を足すほど志望理由と逆質問の精度が向上",
                "1次から最終までフェーズ別に出し分け可能",
              ].map((item) => (
                <div key={item} className={infoPill}>
                  {item}
                </div>
              ))}
            </div>

            <blockquote className="mt-auto max-w-md border-l border-white/20 pl-5">
              <p className="text-sm leading-8 text-white/72">
                「企業ごとに話すべき強みが整理されて、面接直前の迷いがかなり減りました。」
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.28em] text-white/38">User Voice</p>
            </blockquote>
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
            <div className="mb-8 flex gap-3">
              {[
                { n: 1, label: "自己情報" },
                { n: 2, label: "企業情報" },
              ].map((item) => (
                <div key={item.n} className="flex-1">
                  <div className={`h-1 rounded-full ${step >= item.n ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`} />
                  <div className="mt-3 flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        step >= item.n ? "bg-[var(--navy)] text-white" : "bg-white text-[var(--muted)] border border-[var(--line)]"
                      }`}
                    >
                      {step > item.n ? "✓" : item.n}
                    </div>
                    <span className={`text-sm font-semibold ${step >= item.n ? "text-[var(--navy)]" : "text-[var(--muted)]"}`}>
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)]">Step 01</p>
                  <h2 className="mt-4 font-serif text-4xl text-[var(--navy)]">あなた自身の土台を整理する</h2>
                  <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                    ここで入力した内容が、今後すべての企業の面接対策に使われます。抽象論より、具体的な経験や癖を書いた方が強いです。
                  </p>
                </div>

                <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Basic Profile</p>
                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Field label="名前" name="name" value={formData.name} onChange={handleChange} placeholder="山田 太郎" />
                    <Field label="大学名" name="university" value={formData.university} onChange={handleChange} placeholder="○○大学" />
                  </div>
                  <div className="mt-5">
                    <Field label="学部・学科" name="faculty" value={formData.faculty} onChange={handleChange} placeholder="経済学部 経済学科" />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Background</p>
                  <div className="mt-5">
                    <TextArea
                      label="自己バックグラウンド"
                      name="background"
                      value={formData.background}
                      onChange={handleChange}
                      placeholder="育った環境、価値観の原点、部活、アルバイト、趣味、印象に残る出来事など"
                      rows={5}
                    />
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Core Narrative</p>
                  <div className="mt-5 space-y-5">
                    <TextArea
                      label="学生時代に力を入れたこと"
                      name="gakuchika"
                      value={formData.gakuchika}
                      onChange={handleChange}
                      placeholder="何に取り組み、何を考え、どんな工夫をして、どう成果につなげたか"
                      rows={5}
                    />
                    <TextArea
                      label="強み"
                      name="strengths"
                      value={formData.strengths}
                      onChange={handleChange}
                      placeholder="行動の傾向、得意な進め方、周囲から言われることなど"
                      rows={4}
                    />
                    <TextArea
                      label="弱み"
                      name="weaknesses"
                      value={formData.weaknesses}
                      onChange={handleChange}
                      placeholder="正直に書くほど、面接での答え方に深みが出ます"
                      rows={4}
                    />
                    <TextArea
                      label="就活の軸"
                      name="jobAxis"
                      value={formData.jobAxis}
                      onChange={handleChange}
                      placeholder="働く上で重視すること、やりたいこと、避けたいこと"
                      rows={4}
                    />
                  </div>
                </section>

                {error && <ErrorBanner message={error} />}

                <button
                  onClick={handleNext}
                  className="w-full rounded-full bg-[var(--navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#162c49]"
                >
                  企業情報の入力へ進む
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button
                      onClick={() => {
                        setStep(1);
                        setError("");
                      }}
                      className="text-sm font-semibold text-[var(--ink-soft)] transition hover:text-[var(--navy)]"
                    >
                      ← 自己情報へ戻る
                    </button>
                    <p className="mt-4 text-xs uppercase tracking-[0.35em] text-[var(--accent)]">Step 02</p>
                    <h2 className="mt-4 font-serif text-4xl text-[var(--navy)]">企業別の面接設計をつくる</h2>
                    <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                      企業情報を足すほど、志望理由と逆質問の精度が上がります。必要なら企業ごとの強みの見せ方も変えられます。
                    </p>
                  </div>
                </div>

                <section className="rounded-[2rem] border border-[var(--line)] bg-white p-6 shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Company Brief</p>
                  <div className="mt-6 space-y-5">
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

                <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Research Layer</p>
                      <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">企業研究情報</h3>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleResearch}
                        disabled={!formData.companyName || researching}
                        className="rounded-full bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d] disabled:opacity-50"
                      >
                        {researching ? "調査中..." : "AIで補助調査"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResearch((prev) => !prev)}
                        className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                      >
                        {showResearch ? "閉じる" : "開く"}
                      </button>
                    </div>
                  </div>

                  {showResearch && (
                    <div className="border-t border-[var(--line)] bg-[var(--paper)] px-6 py-6">
                      <div className="space-y-5">
                        <TextArea
                          label="企業理念・ビジョン"
                          name="companyPhilosophy"
                          value={formData.companyPhilosophy}
                          onChange={handleChange}
                          placeholder="採用ページや企業サイトの理念、価値観、ビジョン"
                          rows={4}
                        />
                        <TextArea
                          label="求める人材像"
                          name="desiredTalent"
                          value={formData.desiredTalent}
                          onChange={handleChange}
                          placeholder="採用ページで明示されている人物像や期待される行動"
                          rows={4}
                        />
                        <TextArea
                          label="ニュース・IR・気になった記事"
                          name="articles"
                          value={formData.articles}
                          onChange={handleChange}
                          placeholder="最近の新規事業、プロダクト、インタビュー、社長メッセージなど"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Customization</p>
                      <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">この企業向けの調整</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowOverrides((prev) => !prev)}
                      className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
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
                  className="w-full rounded-full bg-[var(--navy)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#162c49] disabled:opacity-60"
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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
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
