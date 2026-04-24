"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReverseQuestion {
  opinion: string;
  question: string;
}

interface ResultData {
  selfIntro: string;
  motivation: string;
  jobAxis: string;
  strengths: string;
  weaknesses: string;
  careerPlan: string;
  reverseQuestions: ReverseQuestion[];
  closingStatement: string;
  formData: {
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
  };
}

function getStoredResult(): ResultData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("naiteiNaviResult");
  return stored ? (JSON.parse(stored) as ResultData) : null;
}

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(() => getStoredResult());
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (!data) router.push("/input");
  }, [data, router]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = async () => {
    const stored = localStorage.getItem("naiteiNaviResult");
    if (!stored) return;

    const { formData } = JSON.parse(stored) as ResultData;
    setRegenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const nextData = await response.json();
      const result = { ...nextData, formData };
      localStorage.setItem("naiteiNaviResult", JSON.stringify(result));
      setData(result);
    } finally {
      setRegenerating(false);
    }
  };

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--navy)] border-t-transparent" />
          <p className="mt-5 text-sm font-semibold text-[var(--navy)]">
            {regenerating ? "再生成中..." : "面接対策を準備しています"}
          </p>
        </div>
      </main>
    );
  }

  const sections = [
    { key: "selfIntro", label: "自己紹介", content: data.selfIntro },
    { key: "motivation", label: "志望理由", content: data.motivation },
    { key: "jobAxis", label: "就活の軸", content: data.jobAxis },
    { key: "strengths", label: "強み", content: data.strengths },
    { key: "weaknesses", label: "弱み", content: data.weaknesses },
    { key: "careerPlan", label: "キャリアプラン", content: data.careerPlan },
    { key: "closingStatement", label: "最後に一言", content: data.closingStatement },
  ];

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(10,25,47,0.82)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => router.push("/")} className="text-left">
            <p className="font-serif text-2xl tracking-[0.14em] text-white">就活Boost</p>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/45">Generated Interview Plan</p>
          </button>
          <button
            onClick={() => router.push("/companies")}
            className="text-sm font-semibold text-white/72 transition hover:text-white"
          >
            選考一覧へ
          </button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-22"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,18,35,0.9), rgba(7,18,35,0.66)), url('https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Generated Result</p>
            <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
              {data.formData.companyName} 向けの
              <br />
              面接対策が完成しました。
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/72">
              {data.formData.name}さんの経験と、{data.formData.interviewPhase} の文脈をもとに、
              志望理由から逆質問まで一連の回答を設計しています。
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">Current Brief</p>
            <div className="mt-5 space-y-4 text-sm text-white/78">
              <p>{data.formData.companyName}</p>
              <p>{data.formData.jobType}</p>
              <p>{data.formData.interviewPhase}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
              <button
                onClick={() => setShowBackground((prev) => !prev)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-[var(--paper)]"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Input Source</p>
                  <h2 className="mt-3 font-serif text-3xl text-[var(--navy)]">生成に使ったインプット</h2>
                </div>
                <span className="text-sm font-semibold text-[var(--ink-soft)]">{showBackground ? "閉じる" : "開く"}</span>
              </button>

              {showBackground && (
                <div className="border-t border-[var(--line)] px-6 py-6">
                  <BackgroundRow label="氏名・大学" value={`${data.formData.name} / ${data.formData.university} ${data.formData.faculty}`} />
                  <BackgroundRow label="自己バックグラウンド" value={data.formData.background || "未入力"} />
                  <BackgroundRow label="ガクチカ" value={data.formData.gakuchika} />
                  <BackgroundRow label="強み（入力原文）" value={data.formData.strengths} />
                  <BackgroundRow label="弱み（入力原文）" value={data.formData.weaknesses} />
                  <BackgroundRow label="就活の軸" value={data.formData.jobAxis} />
                  <BackgroundRow
                    label="応募先"
                    value={`${data.formData.companyName} / ${data.formData.jobType} / ${data.formData.interviewPhase}`}
                  />
                </div>
              )}
            </div>

            {sections.map((section) => (
              <SectionCard
                key={section.key}
                label={section.label}
                copyKey={section.key}
                copied={copied}
                onCopy={() => copyToClipboard(section.content, section.key)}
              >
                <p className="text-sm leading-8 text-[var(--ink-soft)] whitespace-pre-line">{section.content}</p>
              </SectionCard>
            ))}

            <SectionCard
              label="逆質問"
              copyKey="reverse"
              copied={copied}
              onCopy={() =>
                copyToClipboard(
                  data.reverseQuestions.map((q, i) => `Q${i + 1}\n${q.opinion}\n${q.question}`).join("\n\n"),
                  "reverse"
                )
              }
            >
              <div className="space-y-4">
                {data.reverseQuestions.map((question, index) => (
                  <div key={index} className="rounded-[1.5rem] bg-[var(--paper)] p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Q{index + 1}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">自分の意見</p>
                    <p className="mt-2 text-sm leading-8 text-[var(--ink-soft)]">{question.opinion}</p>
                    <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                    <p className="mt-2 text-sm font-semibold leading-8 text-[var(--navy)]">{question.question}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_24px_60px_rgba(10,25,47,0.08)]">
              <div
                className="h-52 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(10,25,47,0.14), rgba(10,25,47,0.46)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">Next Action</p>
                <h3 className="mt-3 font-serif text-3xl text-[var(--navy)]">次の面接に向けて更新する</h3>
                <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                  面接後に詰まった質問や、伝わりにくかったポイントを反映して再生成すると、回答の解像度が上がります。
                </p>
                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleRegenerate}
                    className="w-full rounded-full bg-[var(--navy)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#162c49]"
                  >
                    {regenerating ? "再生成中..." : "もう一度生成する"}
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("naiteiNaviResult");
                      router.push("/input?step=2");
                    }}
                    className="w-full rounded-full border border-[var(--navy)] px-6 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
                  >
                    別の企業で試す
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function BackgroundRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-sm leading-8 text-[var(--ink-soft)] whitespace-pre-line">{value}</p>
    </div>
  );
}

function SectionCard({
  label,
  copyKey,
  copied,
  onCopy,
  children,
}: {
  label: string;
  copyKey: string;
  copied: string | null;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-6 shadow-[0_20px_50px_rgba(10,25,47,0.07)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-4">
        <h3 className="font-serif text-3xl text-[var(--navy)]">{label}</h3>
        <button
          onClick={onCopy}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
        >
          {copied === copyKey ? "コピー済み" : "コピー"}
        </button>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}
