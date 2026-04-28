"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { GeneratedContent } from "@/lib/companies";

interface Card {
  question: string;
  answer: string;
  label: string;
}

function buildCards(content: GeneratedContent | null): Card[] {
  if (!content) return [];
  const cards: Card[] = [
    { label: "自己紹介", question: "1分間で自己紹介をお願いします", answer: content.selfIntro },
    { label: "志望理由", question: "志望理由を教えてください", answer: content.motivation },
    { label: "就活の軸", question: "就活の軸を教えてください", answer: content.jobAxis },
    { label: "強み", question: "あなたの強みを教えてください", answer: content.strengths },
    { label: "弱み", question: "弱みはありますか？", answer: content.weaknesses },
    { label: "キャリアプラン", question: "入社後のキャリアプランを聞かせてください", answer: content.careerPlan },
    { label: "最後に一言", question: "最後に何かありますか？", answer: content.closingStatement },
    ...content.reverseQuestions.map((q, i) => ({
      label: `逆質問 ${i + 1}`,
      question: "何か質問はありますか？",
      answer: `【自分の意見】\n${q.opinion}\n\n【質問】\n${q.question}`,
    })),
  ];
  return cards.filter((c) => c.answer?.trim());
}

export default function MemorizePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<number, "ok" | "ng">>({});
  const [done, setDone] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/companies/${id}`);
        if (!res.ok) { router.push("/companies"); return; }
        const { company } = await res.json();
        if (!company) { router.push("/companies"); return; }
        setCompanyName(company.companyName);
        const built = buildCards(company.generatedContent);
        if (built.length === 0) { router.push(`/companies/${id}`); return; }
        setCards(built);
      } catch {
        router.push("/companies");
      }
    };
    load();
  }, [id, router]);

  const current = cards[index];
  const okCount = Object.values(results).filter((v) => v === "ok").length;
  const progress = cards.length > 0 ? Math.round(((index) / cards.length) * 100) : 0;

  const handleResult = (result: "ok" | "ng") => {
    const next = { ...results, [index]: result };
    setResults(next);
    setShowAnswer(false);

    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setResults({});
    setDone(false);
    setShowAnswer(false);
  };

  const restartNg = () => {
    const ngIndices = Object.entries(results)
      .filter(([, v]) => v === "ng")
      .map(([k]) => Number(k));
    const ngCards = ngIndices.map((i) => cards[i]);
    setCards(ngCards);
    setIndex(0);
    setResults({});
    setDone(false);
    setShowAnswer(false);
  };

  if (cards.length === 0) return null;

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[rgba(26,45,122,0.90)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push(`/companies/${id}`)}
            className="text-sm font-semibold text-white/70 transition hover:text-white"
          >
            ← 戻る
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-white">{companyName}</p>
            <p className="text-[10px] text-white/50">暗記モード</p>
          </div>
          <p className="text-sm font-semibold text-white/70">
            {done ? cards.length : index + 1} / {cards.length}
          </p>
        </div>
      </header>

      {done ? (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="rounded-[2rem] border border-[var(--line)] bg-white p-10 shadow-[0_16px_48px_rgba(26,45,122,0.10)]">
            <p className="text-5xl font-bold text-[var(--navy)]">
              {okCount}<span className="text-2xl text-[var(--muted)]">/{cards.length}</span>
            </p>
            <p className="mt-2 text-lg font-semibold text-[var(--navy)]">覚えた！</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {cards.length - okCount > 0
                ? `あと ${cards.length - okCount} 枚を練習しましょう`
                : "全部覚えました！お疲れ様でした"}
            </p>

            <div className="mt-8 space-y-3">
              {cards.length - okCount > 0 && (
                <button
                  onClick={restartNg}
                  className="w-full rounded-full bg-[var(--navy)] py-3 text-sm font-semibold text-white transition hover:bg-[#14246a]"
                >
                  要練習の {cards.length - okCount} 枚をもう一度
                </button>
              )}
              <button
                onClick={restart}
                className="w-full rounded-full border border-[var(--line)] py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--sand)]"
              >
                全部最初からやり直す
              </button>
              <button
                onClick={() => router.push(`/companies/${id}`)}
                className="w-full rounded-full py-3 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--navy)]"
              >
                面接対策に戻る
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
              <span>{current?.label}</span>
              <span>{okCount} / {cards.length} 覚えた</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--sand)]">
              <div
                className="h-2 rounded-full bg-[var(--gold)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div
            className="cursor-pointer rounded-[2rem] border border-[var(--line)] bg-white shadow-[0_16px_48px_rgba(26,45,122,0.10)] transition-all duration-200 hover:shadow-[0_24px_60px_rgba(26,45,122,0.15)]"
            style={{ minHeight: "320px" }}
            onClick={() => setShowAnswer(!showAnswer)}
          >
            <div className="p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                  {current?.label}
                </span>
                {!showAnswer && (
                  <span className="text-xs text-[var(--muted)]">タップして回答を見る</span>
                )}
              </div>

              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">質問</p>
                <p className="mt-3 text-xl font-bold leading-tight text-[var(--navy)]">
                  {current?.question}
                </p>
              </div>

              {showAnswer && (
                <div className="mt-6 border-t border-[var(--line)] pt-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">回答</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-8 text-[var(--ink-soft)]">
                    {current?.answer}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleResult("ng")}
              className="rounded-full border-2 border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 transition hover:bg-red-100 active:scale-95"
            >
              もう一度
            </button>
            <button
              onClick={() => handleResult("ok")}
              className="rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] py-4 text-sm font-bold text-[var(--navy)] transition hover:bg-[#50a8ff] active:scale-95"
            >
              覚えた！
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            カードをタップすると回答が見られます
          </p>
        </div>
      )}
    </main>
  );
}
