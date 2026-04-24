"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCompanies,
  deleteCompany,
  saveCompany,
  type CompanyRecord,
  PHASE_STYLES,
  PHASE_ORDER,
} from "@/lib/companies";

const PROFILE_KEY = "naiteiNaviProfile";

interface Profile {
  name: string;
  university: string;
  faculty: string;
  background: string;
  gakuchika: string;
  strengths: string;
  weaknesses: string;
  jobAxis: string;
}

const TIPS = [
  { icon: "💡", title: "結論ファーストで話す", body: "面接では最初に結論を述べてから理由を説明するPREP法が効果的。1分以内に収まるよう練習しておこう。", bg: "bg-yellow-50" },
  { icon: "📅", title: "逆質問は必ず準備", body: "「特にありません」は評価が下がる。企業の事業戦略や仕事内容に関する質問を3つ用意しておこう。", bg: "bg-blue-50" },
  { icon: "🎯", title: "企業研究は深く", body: "「御社が好き」では刺さらない。直近のプレスリリース・IR・社長インタビューを読んで具体的な言葉で語ろう。", bg: "bg-red-50" },
  { icon: "🔄", title: "面接後は振り返りを", body: "聞かれた質問・答えた内容・改善点をメモしておくと次の面接に活かせる。就活Boostで再生成するのも有効。", bg: "bg-purple-50" },
  { icon: "💬", title: "弱みは正直に", body: "「実はありません」は逆効果。自己理解の深さが伝わる正直な弱みのほうが面接官に刺さる。", bg: "bg-green-50" },
  { icon: "📊", title: "複数社を並行受験", body: "1社に絞ると精神的に追い詰められる。5〜10社並行して選考を進めるのが理想的なペース。", bg: "bg-orange-50" },
];

const PHASE_ACCENT: Record<string, string> = {
  "1次面接": "bg-blue-400",
  "2次面接": "bg-orange-400",
  "最終面接": "bg-red-400",
  "内定": "bg-emerald-500",
};

function ProfileRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}

export default function CompaniesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"companies" | "profile">("companies");
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    setCompanies(getCompanies());
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`「${name}」を選考リストから削除しますか？`)) return;
    deleteCompany(id);
    setCompanies(getCompanies());
  };

  const handlePhaseChange = (company: CompanyRecord, phase: string) => {
    saveCompany({ ...company, interviewPhase: phase });
    setCompanies(getCompanies());
  };

  const activeCount = companies.filter((c) => c.interviewPhase !== "内定").length;
  const generatedCount = companies.filter((c) => c.generatedContent).length;
  const naiteiCount = companies.filter((c) => c.interviewPhase === "内定").length;
  const phaseCounts = PHASE_ORDER.reduce<Record<string, number>>((acc, p) => {
    acc[p] = companies.filter((c) => c.interviewPhase === p).length;
    return acc;
  }, {});

  const profileFields = profile
    ? [
        { label: "名前", filled: !!profile.name },
        { label: "大学", filled: !!profile.university },
        { label: "学部", filled: !!profile.faculty },
        { label: "バックグラウンド", filled: !!profile.background },
        { label: "ガクチカ", filled: !!profile.gakuchika },
        { label: "強み", filled: !!profile.strengths },
        { label: "弱み", filled: !!profile.weaknesses },
        { label: "就活の軸", filled: !!profile.jobAxis },
      ]
    : [];
  const filledCount = profileFields.filter((f) => f.filled).length;
  const completeness = profile ? Math.round((filledCount / profileFields.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      {/* ── Nav ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="text-[#1B2D6B] font-bold text-xl tracking-wide">
            就活Boost
          </button>
          <button
            onClick={() => router.push("/input")}
            className="bg-[#1B2D6B] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#0F1B50] transition-colors"
          >
            + 企業を追加
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">
        {/* ── Greeting + Stats ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-6 flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5">ダッシュボード</p>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.name ? `こんにちは、${profile.name}さん` : "就活ダッシュボード"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {companies.length > 0 ? `${companies.length}社の選考情報を管理中` : "企業を追加して選考管理を始めましょう"}
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { label: "選考中", value: activeCount, num: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                { label: "対策済み", value: generatedCount, num: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                { label: "内定", value: naiteiCount, num: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
              ].map(({ label, value, num, bg }) => (
                <div key={label} className={`border rounded-xl px-5 py-3.5 text-center ${bg}`}>
                  <p className={`text-2xl font-black ${num}`}>{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-2">
            <div className="flex">
              {(["companies", "profile"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 -mb-px ${
                    tab === t
                      ? "border-[#1B2D6B] text-[#1B2D6B]"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "companies"
                    ? `選考中の企業${companies.length > 0 ? ` (${companies.length})` : ""}`
                    : `自己情報${profile ? `  ${completeness}%` : ""}`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Companies Tab */}
            {tab === "companies" && (
              <div className="space-y-6">
                {companies.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-3">選考フェーズ別</p>
                    <div className="flex gap-2 flex-wrap">
                      {PHASE_ORDER.map((phase) => (
                        <div
                          key={phase}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
                            PHASE_STYLES[phase] ?? "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                        >
                          <span className="text-base font-black leading-none">{phaseCounts[phase]}</span>
                          <span className="text-xs opacity-75">{phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {companies.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 border border-gray-100">📋</div>
                    <p className="font-bold text-gray-700 mb-2">選考中の企業がまだありません</p>
                    <p className="text-sm text-gray-400 mb-7">企業を追加して面接対策を始めましょう</p>
                    <button
                      onClick={() => router.push("/input")}
                      className="bg-[#1B2D6B] text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-[#0F1B50] transition-colors"
                    >
                      最初の企業を追加する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="border border-gray-200 rounded-xl overflow-hidden flex hover:shadow-md transition-all hover:border-gray-300"
                      >
                        <div className={`w-1 shrink-0 ${PHASE_ACCENT[company.interviewPhase] ?? "bg-gray-300"}`} />
                        <div className="flex-1 px-5 py-4 flex items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                              <h3 className="font-bold text-gray-900">{company.companyName}</h3>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${PHASE_STYLES[company.interviewPhase] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>
                                {company.interviewPhase}
                              </span>
                              {company.generatedContent && (
                                <span className="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">✓ 対策済み</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 mb-3">{company.jobType}</p>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] text-gray-300 mr-1">フェーズ更新</span>
                              {PHASE_ORDER.map((phase) => (
                                <button
                                  key={phase}
                                  onClick={() => handlePhaseChange(company, phase)}
                                  className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-all ${
                                    company.interviewPhase === phase
                                      ? PHASE_STYLES[phase]
                                      : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                                  }`}
                                >
                                  {phase}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => router.push(`/companies/${company.id}`)}
                              className="bg-[#1B2D6B] text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-[#0F1B50] transition-colors whitespace-nowrap"
                            >
                              詳細・対策 →
                            </button>
                            <button
                              onClick={() => handleDelete(company.id, company.companyName)}
                              className="border border-gray-200 text-gray-400 text-xs px-4 py-2 rounded-lg hover:border-red-200 hover:text-red-400 hover:bg-red-50 transition-all"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {tab === "profile" && (
              <div className="space-y-5">
                {!profile ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5 border border-gray-100">👤</div>
                    <p className="font-bold text-gray-700 mb-2">自己情報がまだ保存されていません</p>
                    <p className="text-sm text-gray-400 mb-7">企業を追加する際に自動で保存されます</p>
                    <button
                      onClick={() => router.push("/input")}
                      className="bg-[#1B2D6B] text-white px-7 py-3 rounded-lg font-semibold text-sm hover:bg-[#0F1B50] transition-colors"
                    >
                      自己情報を入力する
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#F5F6F8] rounded-xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-700">プロフィール完成度</p>
                        <span className="text-base font-black text-[#1B2D6B]">{completeness}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                        <div className="bg-[#1B2D6B] h-1.5 rounded-full transition-all" style={{ width: `${completeness}%` }} />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {profileFields.map(({ label, filled }) => (
                          <span key={label} className={`text-xs px-2.5 py-1 rounded-full font-medium ${filled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-400"}`}>
                            {filled ? "✓ " : ""}{label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">基本情報</p>
                        <button onClick={() => router.push("/input")} className="text-xs text-[#1B2D6B] font-semibold hover:underline">編集する →</button>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl p-5 grid grid-cols-2 gap-5">
                        {[
                          { label: "氏名", value: profile.name },
                          { label: "大学", value: profile.university },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5">{label}</p>
                            <p className="text-sm font-semibold text-gray-900">{value}</p>
                          </div>
                        ))}
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-1.5">学部・学科</p>
                          <p className="text-sm font-semibold text-gray-900">{profile.faculty}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl px-5">
                      <ProfileRow label="自己バックグラウンド" value={profile.background} />
                      <ProfileRow label="ガクチカ" value={profile.gakuchika} />
                      <ProfileRow label="強み" value={profile.strengths} />
                      <ProfileRow label="弱み" value={profile.weaknesses} />
                      <ProfileRow label="就活の軸" value={profile.jobAxis} />
                    </div>

                    <button
                      onClick={() => router.push("/input")}
                      className="w-full border-2 border-[#1B2D6B] text-[#1B2D6B] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#1B2D6B] hover:text-white transition-all"
                    >
                      自己情報を編集する
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Tips ── */}
        {tab === "companies" && (
          <div>
            <div className="flex items-baseline gap-3 mb-4">
              <h3 className="font-bold text-gray-900">就活のヒント</h3>
              <p className="text-sm text-gray-400">面接対策に役立つアドバイス</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TIPS.map((tip, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all">
                  <div className={`w-10 h-10 ${tip.bg} rounded-xl flex items-center justify-center text-xl mb-4`}>
                    {tip.icon}
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-2 leading-snug">{tip.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{tip.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
