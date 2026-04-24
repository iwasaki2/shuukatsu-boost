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

export default function ResultPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("naiteiNaviResult");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push("/input");
    }
  }, [router]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRegenerate = async () => {
    const stored = localStorage.getItem("naiteiNaviResult");
    if (!stored) return;
    const { formData } = JSON.parse(stored);
    setRegenerating(true);
    setData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newData = await res.json();
      const result = { ...newData, formData };
      localStorage.setItem("naiteiNaviResult", JSON.stringify(result));
      setData(result);
    } finally {
      setRegenerating(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1B2D6B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {regenerating ? "再生成中..." : "AIが面接対策を生成中..."}
          </p>
          <p className="text-gray-400 text-sm mt-1">少々お待ちください</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-[#F7F5F0]">
      <header className="bg-[#1B2D6B] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-xl tracking-wider">内定ナビ</span>
          <span className="text-white/70 text-sm">
            {data.formData.companyName} | {data.formData.interviewPhase}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-emerald-500 text-xl font-bold">✓</span>
          <div>
            <p className="font-semibold text-emerald-800 text-sm">
              {data.formData.companyName}の{data.formData.interviewPhase}対策が完成しました
            </p>
            <p className="text-emerald-600 text-xs mt-0.5">
              {data.formData.name}さん向けにパーソナライズされています
            </p>
          </div>
        </div>

        {/* バックグラウンド確認 */}
        <div className="bg-white border border-[#E8E4DC] rounded-xl mb-8 overflow-hidden">
          <button
            onClick={() => setShowBackground((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1B2D6B]">AIが参照したインプット内容</span>
              <span className="text-xs text-gray-400">（生成の根拠を確認）</span>
            </div>
            <span className="text-gray-400 text-sm">{showBackground ? "▲" : "▼"}</span>
          </button>

          {showBackground && (
            <div className="border-t border-[#E8E4DC] px-5 py-4 space-y-4">
              <BackgroundRow label="氏名・大学" value={`${data.formData.name} ／ ${data.formData.university} ${data.formData.faculty}`} />
              <BackgroundRow label="自己バックグラウンド" value={data.formData.background || "（未入力）"} />
              <BackgroundRow label="ガクチカ" value={data.formData.gakuchika} />
              <BackgroundRow label="強み（入力原文）" value={data.formData.strengths} />
              <BackgroundRow label="弱み（入力原文）" value={data.formData.weaknesses} />
              <BackgroundRow label="就活の軸" value={data.formData.jobAxis} />
              <BackgroundRow label="応募先" value={`${data.formData.companyName} ／ ${data.formData.jobType} ／ ${data.formData.interviewPhase}`} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.key}
              label={section.label}
              copyKey={section.key}
              copied={copied}
              onCopy={() => copyToClipboard(section.content, section.key)}
            >
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {section.content}
              </p>
            </SectionCard>
          ))}

          {/* 逆質問 */}
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm">
            <h3 className="font-bold text-[#1B2D6B] text-base mb-4">逆質問（面接官への質問）</h3>
            <div className="space-y-5">
              {data.reverseQuestions.map((q, i) => (
                <div key={i} className="border border-[#E8E4DC] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[#1B2D6B] font-bold text-sm shrink-0">Q{i + 1}</span>
                    <button
                      onClick={() => copyToClipboard(`${q.opinion}${q.question}`, `q${i}`)}
                      className={`text-xs px-2 py-1 rounded-lg border transition-all shrink-0 ${
                        copied === `q${i}`
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : "border-[#E8E4DC] text-gray-400 hover:border-[#1B2D6B] hover:text-[#1B2D6B]"
                      }`}
                    >
                      {copied === `q${i}` ? "✓" : "コピー"}
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs mb-1">自分の意見</p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">{q.opinion}</p>
                  <p className="text-gray-500 text-xs mb-1">質問</p>
                  <p className="text-[#1B2D6B] text-sm font-medium leading-relaxed">{q.question}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => {
              localStorage.removeItem("naiteiNaviResult");
              router.push("/input?step=2");
            }}
            className="flex-1 border-2 border-[#1B2D6B] text-[#1B2D6B] py-3 rounded-xl font-semibold text-sm hover:bg-[#1B2D6B]/5 transition-colors"
          >
            別の企業で試す
          </button>
          <button
            onClick={handleRegenerate}
            className="flex-1 bg-[#1B2D6B] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#152354] transition-colors"
          >
            もう一度生成する ↺
          </button>
        </div>
      </div>
    </div>
  );
}

function BackgroundRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}

function SectionCard({
  label, copyKey, copied, onCopy, children,
}: {
  label: string;
  copyKey: string;
  copied: string | null;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#1B2D6B] text-base">{label}</h3>
        <button
          onClick={onCopy}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
            copied === copyKey
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "border-[#E8E4DC] text-gray-500 hover:border-[#1B2D6B] hover:text-[#1B2D6B]"
          }`}
        >
          {copied === copyKey ? "コピー済み ✓" : "コピー"}
        </button>
      </div>
      {children}
    </div>
  );
}
