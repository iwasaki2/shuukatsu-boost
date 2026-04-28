"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AnticipatedQuestion, ReverseQuestion } from "@/lib/companies";

interface SheetExtras {
  mapping: { companyTrait: string; userEvidence: string }[];
  deepDives: { motivation: string; strengths: string; weaknesses: string; careerPlan: string };
  reverseQuestionsIntent: string[];
  episodeCards: { title: string; text: string }[];
  checklistItems: string[];
}

interface SheetResponse {
  company: {
    id: string;
    companyName: string;
    jobType: string;
    interviewPhase: string;
    desiredTalent: string;
    companyPhilosophy: string;
    articles: string;
  };
  profile: {
    name: string;
    university: string;
    faculty: string;
  };
  content: {
    selfIntro: string;
    motivation: string;
    jobAxis: string;
    strengths: string;
    weaknesses: string;
    careerPlan: string;
    closingStatement: string;
    reverseQuestions: ReverseQuestion[];
    anticipatedQuestions: AnticipatedQuestion[];
    preInterviewMemo: string;
  };
  extras: SheetExtras;
}

function renderInlineEmphasis(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function RichParagraphs({ text, className = "text-[14.5px] leading-[1.95] text-slate-800" }: { text: string; className?: string }) {
  return (
    <div className="space-y-3">
      {text.split("\n").filter((line) => line.trim()).map((line, index) => (
        <p key={index} className={className}>
          {renderInlineEmphasis(line.trim())}
        </p>
      ))}
    </div>
  );
}

function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^[^。]+。?/);
  return match?.[0] ?? trimmed;
}

export default function CompanySheetPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<SheetResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id }),
    })
      .then((r) => r.json())
      .then((json) => {
        setData(json as SheetResponse);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-sm text-slate-500">読み込み中...</main>;
  }

  if (!data) {
    return <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-sm text-slate-500">面接対策シートを読み込めませんでした。</main>;
  }

  const { company, profile, content, extras } = data;
  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  const sections = [
    { number: "01", title: "志望理由", body: content.motivation, deepDive: extras.deepDives.motivation },
    { number: "02", title: "強み", body: content.strengths, deepDive: extras.deepDives.strengths },
    { number: "03", title: "弱み", body: content.weaknesses, deepDive: extras.deepDives.weaknesses },
    { number: "04", title: "キャリアプラン", body: content.careerPlan, deepDive: extras.deepDives.careerPlan },
    { number: "05", title: "就活の軸", body: content.jobAxis },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] print:bg-white">
      <div className="mx-auto max-w-[820px] bg-white px-6 pb-20 shadow-[0_0_24px_rgba(0,0,0,0.06)] print:max-w-none print:px-8 print:shadow-none">
        <div className="sticky top-0 z-50 mb-9 flex items-center justify-between border-b border-[#e0e0e0] bg-white py-3 print:hidden">
          <Link href={`/companies/${company.id}`} className="text-sm font-semibold text-slate-700">
            ← 詳細へ戻る
          </Link>
          <button onClick={() => window.print()} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white">
            PDFとして保存
          </button>
        </div>

        <header className="mb-10 pt-2">
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#888]">Interview Notes</p>
          <h1 className="text-[22px] font-bold leading-[1.4] text-[#1a1a1a]">
            {company.companyName} {company.interviewPhase}｜{profile.name}
          </h1>
          <p className="mt-2.5 text-[13px] text-[#666]">
            {profile.university} {profile.faculty} / {company.jobType} / {today}
          </p>
        </header>

        {content.preInterviewMemo && (
          <div className="mb-9 rounded-r-md border border-[#e8d888] border-l-4 border-l-[#e0aa00] bg-[#fffbf0] px-[18px] py-[14px]">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#a07800]">入室5分前メモ</p>
            <div className="space-y-1.5">
              {content.preInterviewMemo.split("\n").filter(Boolean).map((line, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-1 text-[#e0aa00]">●</span>
                  <p className="text-[13.5px] leading-[1.9] text-[#4a3a00]">{renderInlineEmphasis(line.replace(/^・/, ""))}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {extras.mapping.length > 0 && (
          <div className="mb-9 rounded-r-md border border-[#c8b8f0] border-l-4 border-l-[#6c3fd9] bg-[#f5f0ff] px-[18px] py-[14px]">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#4a1fa8]">
              {company.companyName}が求める人物像 × 自分の経験（対応表）
            </p>
            <div className="space-y-2">
              {extras.mapping.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_16px_1fr] gap-x-2 text-[13px] leading-[1.65]">
                  <div className="font-semibold text-[#4a1fa8]">{renderInlineEmphasis(item.companyTrait)}</div>
                  <div className="text-center text-[#aaa]">→</div>
                  <div>{renderInlineEmphasis(item.userEvidence)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.map((section) => (
          <section key={section.number} className="mb-11 border-t-2 border-t-[#1a1a1a] pt-[18px]">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#888]">
              {section.number} &nbsp;{section.title}
            </h2>
            <div className="mb-[18px] rounded-r-md border-l-4 border-l-[#3a5bd9] bg-[#f0f4ff] px-[18px] py-[14px] text-[15px] font-semibold leading-[1.7] text-[#1a2a5a]">
              {renderInlineEmphasis(firstSentence(section.body))}
            </div>
            <RichParagraphs text={section.body} />
            {section.deepDive && (
              <div className="mt-4 rounded-md border border-[#e8d888] bg-[#fffbf0] px-[18px] py-[14px]">
                <p className="mb-2 text-[11px] font-bold tracking-[0.08em] text-[#a07800]">深掘り</p>
                <RichParagraphs text={section.deepDive} className="text-[13.5px] leading-[1.85] text-[#4a3a00]" />
              </div>
            )}
          </section>
        ))}

        {content.anticipatedQuestions.length > 0 && (
          <section className="mb-11 border-t-2 border-t-[#1a1a1a] pt-[18px]">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#888]">06 &nbsp;深掘り想定問答</h2>
            <div className="space-y-5">
              {content.anticipatedQuestions.map((item, index) => (
                <article key={index} className="rounded-md border border-[#e3e7ef] bg-[#fbfcfe] p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold tracking-[0.08em] text-[#3a5bd9]">Q {String(index + 1).padStart(2, "0")}</span>
                    {item.category && <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold text-[#3a5bd9]">{item.category}</span>}
                  </div>
                  <p className="text-[15px] font-bold leading-[1.6] text-[#1a1a1a]">{renderInlineEmphasis(item.question)}</p>
                  {item.intent && <p className="mt-1.5 text-[12px] italic text-[#888]">狙い：{renderInlineEmphasis(item.intent)}</p>}
                  {item.hook && (
                    <div className="mt-3 rounded-r-md border-l-4 border-l-[#3a5bd9] bg-[#f0f4ff] px-4 py-3 text-[14px] font-semibold leading-[1.7] text-[#1a2a5a]">
                      {renderInlineEmphasis(item.hook)}
                    </div>
                  )}
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {item.answerShort && (
                      <div className="rounded-md bg-white px-4 py-3">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#666]">短答</p>
                        <RichParagraphs text={item.answerShort} className="text-[13.5px] leading-[1.8] text-[#333]" />
                      </div>
                    )}
                    <div className="rounded-md bg-white px-4 py-3">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#666]">本番回答</p>
                      <RichParagraphs text={item.answer} className="text-[13.5px] leading-[1.85] text-[#333]" />
                    </div>
                  </div>
                  {(item.mustMention?.length ?? 0) > 0 && (
                    <div className="mt-3 rounded-r-md border-l-4 border-l-[#6c3fd9] bg-[#f5f0ff] px-4 py-3">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#4a1fa8]">絶対に入れるキーワード</p>
                      <p className="text-[13px] leading-[1.7] text-[#1a1a1a]">{item.mustMention?.join(" / ")}</p>
                    </div>
                  )}
                  {(item.followUps?.length ?? 0) > 0 && (
                    <div className="mt-3 rounded-md bg-white px-4 py-3">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#666]">次に来る深掘り</p>
                      {item.followUps?.map((followUp, followIndex) => (
                        <p key={followIndex} className="text-[13.5px] leading-[1.8] text-[#333]">
                          {followIndex + 1}. {renderInlineEmphasis(followUp)}
                        </p>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="mb-11 border-t-2 border-t-[#1a1a1a] pt-[18px]">
          <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#888]">07 &nbsp;逆質問</h2>
          <div className="space-y-6">
            {content.reverseQuestions.map((item, index) => (
              <article key={index} className="border-b border-[#eee] pb-6">
                <p className="mb-1 text-[11px] font-bold tracking-[0.08em] text-[#3a5bd9]">Q {String(index + 1).padStart(2, "0")}</p>
                <p className="mb-1.5 text-[15px] font-bold text-[#1a1a1a]">{renderInlineEmphasis(item.question)}</p>
                {extras.reverseQuestionsIntent[index] && (
                  <p className="mb-2 text-[12px] italic text-[#888]">意図：{renderInlineEmphasis(extras.reverseQuestionsIntent[index])}</p>
                )}
                <div className="rounded-md bg-[#f8f8f8] px-[14px] py-3">
                  <RichParagraphs text={item.opinion} className="text-[13.5px] leading-[1.85] text-[#333]" />
                </div>
              </article>
            ))}
          </div>
        </section>

        {extras.episodeCards.length > 0 && (
          <section className="mb-11 border-t-2 border-t-[#1a1a1a] pt-[18px]">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#888]">08 &nbsp;エピソードカンペ</h2>
            {extras.episodeCards.map((item, index) => (
              <div key={index} className="mb-4 rounded-r-md border border-[#f4c07a] border-l-4 border-l-[#e67e22] bg-[#fff8f0] px-[18px] py-[14px]">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#a05000]">{item.title}</p>
                <RichParagraphs text={item.text} className="text-[14px] leading-[1.9] text-[#2a1a00]" />
              </div>
            ))}
          </section>
        )}

        {extras.checklistItems.length > 0 && (
          <section className="border-t-2 border-t-[#1a1a1a] pt-[18px]">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#888]">09 &nbsp;当日チェックリスト</h2>
            <div className="space-y-2">
              {extras.checklistItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 border-b border-[#f0f0f0] py-2.5 text-[14px] leading-[1.7]">
                  <span className="mt-[3px] h-4 w-4 shrink-0 rounded-[3px] border-2 border-[#3a5bd9]" />
                  <p>{renderInlineEmphasis(item)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
