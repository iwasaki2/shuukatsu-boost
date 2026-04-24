import Link from "next/link";

const chips = [
  "✓ 企業別にパーソナライズ",
  "✓ 逆質問も自動生成",
  "✓ 選考フェーズ対応",
  "✓ 複数企業を管理",
  "✓ プロフィール保存",
];

const steps = [
  { n: "01", title: "ガクチカを入力", desc: "自分の経験・強み・弱みを一度入力するだけ。保存されるので次の企業からは不要。" },
  { n: "02", title: "企業を選ぶ", desc: "志望企業名・職種・面接フェーズを入力。企業理念や記事を追加すると精度がさらに上がる。" },
  { n: "03", title: "AIが即生成", desc: "志望理由・強み・弱み・逆質問・キャリアプランが数秒で完成。コピーしてすぐ使える。" },
];

const features = [
  { icon: "🎯", title: "企業別パーソナライズ", desc: "企業の理念・求める人材・記事をもとに、その企業だけの回答を生成。使い回しにならない。" },
  { icon: "💬", title: "逆質問も自動生成", desc: "自分の意見を添えた質問を3問生成。「何かありますか？」で終わらない面接に。" },
  { icon: "📋", title: "選考管理ダッシュボード", desc: "複数社の選考状況を一元管理。1次・2次・最終のフェーズ更新もワンクリック。" },
  { icon: "🔄", title: "何度でも再生成", desc: "面接フェーズが上がるたびに内容をアップデート。最終面接には競合比較も追加。" },
  { icon: "💾", title: "プロフィール保存", desc: "一度入力した自己情報は保存。20社目でも追加入力は企業名だけでOK。" },
  { icon: "✏️", title: "企業別カスタマイズ", desc: "強み・弱み・就活の軸を企業ごとに微調整。同じ内容で全社受けるリスクをゼロに。" },
];

const plans = [
  {
    name: "Free",
    price: "¥0",
    period: "",
    desc: "まず試してみたい方へ",
    items: ["2社まで無料生成", "1次面接対策のみ", "プロフィール保存"],
    cta: "無料で始める",
    highlighted: false,
    badge: null,
  },
  {
    name: "Standard",
    price: "¥980",
    period: "/月",
    desc: "本格的に就活を進める方へ",
    items: ["企業数無制限", "1次〜2次面接対応", "企業研究メモ保存", "選考管理ダッシュボード", "企業別カスタマイズ"],
    cta: "スタンダードを始める",
    highlighted: true,
    badge: "おすすめ",
  },
  {
    name: "Premium",
    price: "¥1,980",
    period: "/月",
    desc: "内定まで全力サポート",
    items: ["Standardの全機能", "最終面接対策", "競合他社との比較", "逆質問強化（5問）", "優先生成"],
    cta: "プレミアムを始める",
    highlighted: false,
    badge: null,
  },
];

const stats = [
  { value: "10,000+", label: "利用就活生" },
  { value: "3秒", label: "平均生成時間" },
  { value: "8項目", label: "自動生成コンテンツ" },
  { value: "無制限", label: "再生成回数" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[#1B2D6B] font-bold text-xl tracking-wide">就活Boost</span>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">機能</a>
            <a href="#pricing" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">料金</a>
            <Link href="/companies" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">選考中企業</Link>
          </nav>
          <Link
            href="/input"
            className="bg-[#1B2D6B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#152354] transition-colors"
          >
            無料で始める
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#0F1B50] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            就活生10,000人が使う面接AIサポート
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            AIが、<span className="text-blue-300">あなただけの</span>
            <br className="hidden md:block" />
            面接対策を作る。
          </h1>

          <p className="text-white/60 text-base md:text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
            ガクチカを入力するだけで、志望理由・強み・逆質問まで自動生成。
            <br className="hidden md:block" />
            企業ごとにパーソナライズされた対策が、数秒で完成。
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {chips.map((chip) => (
              <span
                key={chip}
                className="bg-white/10 border border-white/20 text-white/75 text-xs px-3.5 py-1.5 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
            <Link
              href="/input"
              className="bg-white text-[#0F1B50] px-8 py-4 rounded-2xl font-bold text-base hover:bg-blue-50 transition-colors"
            >
              無料で面接対策を始める →
            </Link>
            <Link
              href="/companies"
              className="border border-white/30 text-white/80 px-8 py-4 rounded-2xl font-semibold text-base hover:bg-white/10 transition-colors"
            >
              選考中企業を見る
            </Link>
          </div>
          <p className="text-white/30 text-sm">最初の2社まで無料 • クレジットカード不要</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-[#1B2D6B] mb-1">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#1B2D6B] text-sm font-semibold tracking-widest mb-3 uppercase">How it works</p>
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">たった3ステップで面接対策完成</h2>
            <p className="text-gray-400">複雑な設定は不要。アカウント登録も不要。すぐに使える。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative bg-white rounded-2xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-5xl font-black text-[#1B2D6B]/10 absolute top-6 right-6">{step.n}</span>
                <div className="w-11 h-11 bg-[#1B2D6B] text-white rounded-xl flex items-center justify-center font-bold text-lg mb-5">
                  {i + 1}
                </div>
                <h3 className="font-bold text-[#1A1A2E] text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <span className="hidden md:block absolute top-1/2 -right-4 text-gray-200 text-2xl z-10 -translate-y-1/2">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#1B2D6B] text-sm font-semibold tracking-widest mb-3 uppercase">Features</p>
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">就活の不安を、確信に変える機能</h2>
            <p className="text-gray-400">面接準備に必要なすべてを、一つのサービスで</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl p-6 hover:border-[#1B2D6B]/30 hover:shadow-md transition-all cursor-default"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-[#1A1A2E] mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[#1B2D6B] text-sm font-semibold tracking-widest mb-3 uppercase">Pricing</p>
            <h2 className="text-3xl font-bold text-[#1A1A2E] mb-3">シンプルな料金プラン</h2>
            <p className="text-gray-400">いつでもキャンセル可能。縛りなし。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlighted
                    ? "bg-[#1B2D6B] text-white shadow-2xl md:scale-105 z-10 relative"
                    : "bg-white border border-gray-100 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <span className="inline-block bg-blue-400/20 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                    {plan.badge}
                  </span>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.highlighted ? "text-white" : "text-[#1A1A2E]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-5 ${plan.highlighted ? "text-white/50" : "text-gray-400"}`}>{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-black ${plan.highlighted ? "text-white" : "text-[#1A1A2E]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-white/50" : "text-gray-400"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.items.map((item, j) => (
                    <li
                      key={j}
                      className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? "text-white/80" : "text-gray-600"}`}
                    >
                      <span className={plan.highlighted ? "text-blue-300" : "text-emerald-500"}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/input"
                  className={`block text-center py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-white text-[#1B2D6B] hover:bg-blue-50"
                      : "border-2 border-[#1B2D6B] text-[#1B2D6B] hover:bg-[#1B2D6B] hover:text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#0F1B50] py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            今すぐ始めよう
          </h2>
          <p className="text-white/50 mb-10 text-lg">最初の2社は無料。クレジットカード不要。</p>
          <Link
            href="/input"
            className="inline-block bg-white text-[#0F1B50] px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            無料で面接対策を始める →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-[#1B2D6B] font-bold">就活Boost</span>
          <p className="text-gray-400 text-sm">© 2026 就活Boost. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
