import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { MobileNav } from "@/components/MobileNav";

const strengths = [
  "志望企業ごとに面接回答を最適化",
  "ES・ガクチカ・逆質問を一気通貫で設計",
  "選考フェーズ別に答え方の温度を調整",
];

const serviceHighlights = [
  {
    id: "01",
    title: "Strategic Interview Design",
    heading: "企業理解を前提に、通る回答へ再構成する。",
    copy:
      "就活Boostは、あなたの経験をただ整えるだけではありません。企業の価値観、募集職種、面接フェーズを踏まえて、評価される伝え方へ設計し直します。",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "02",
    title: "Personal Story Architecture",
    heading: "自己分析の素材を、面接で使える言葉に変える。",
    copy:
      "学生時代の経験、強み、弱み、就活の軸。断片的な情報を、面接官が理解しやすいストーリーラインに整理します。",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "03",
    title: "Operational Follow Through",
    heading: "複数社の選考進行まで、ひとつの画面で管理する。",
    copy:
      "面接対策は作って終わりではありません。企業ごとの生成履歴、面接メモ、次回に向けた改善ポイントまで蓄積し、動ける状態を維持します。",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
];

const metrics = [
  { value: "3 steps", label: "入力から生成まで" },
  { value: "8 items", label: "自動生成コンテンツ" },
  { value: "2社", label: "無料でお試し" },
  { value: "24h", label: "いつでも再生成" },
];

const featureCards = [
  {
    label: "Interview Fit",
    title: "企業別に温度感まで合わせる面接生成",
    description:
      "同じ自己PRを使い回さず、企業の事業内容やカルチャーに合わせてニュアンスを調整します。",
  },
  {
    label: "Question Design",
    title: "逆質問まで一貫した設計",
    description:
      "面接終盤の逆質問も、企業理解とあなたの志向をつなげた内容に整えます。",
  },
  {
    label: "Selection Flow",
    title: "1次から最終までフェーズ別に更新",
    description:
      "初回面接向けのわかりやすさと、最終面接向けの解像度の高さを切り分けて生成します。",
  },
  {
    label: "Knowledge Layer",
    title: "企業研究メモを蓄積して精度を上げる",
    description:
      "説明会メモやIR情報、採用ページの印象を追加すると、次回以降の回答品質がさらに上がります。",
  },
];

const flow = [
  {
    step: "01",
    title: "プロフィールを入力",
    text: "ガクチカ、強み、弱み、価値観を登録。次の企業でも使い回せる土台を作ります。",
  },
  {
    step: "02",
    title: "企業と選考状況を指定",
    text: "志望企業、職種、面接回数、重視される要素を入力して面接の前提を明確にします。",
  },
  {
    step: "03",
    title: "AIが回答と逆質問を生成",
    text: "志望理由、自己PR、弱み、キャリアプラン、逆質問まで一連で出力します。",
  },
  {
    step: "04",
    title: "面接後の改善に反映",
    text: "聞かれた質問や手応えを残し、次回面接に向けて内容を再構成します。",
  },
];

const voices = [
  {
    title: "「答え方が浅い」と言われなくなった",
    body:
      "企業ごとに言い回しが変わるので、以前より志望度の伝わり方が明らかに良くなりました。特に最終面接前の再生成が助かりました。",
    meta: "大学4年 / 総合商社志望",
  },
  {
    title: "逆質問の質で会話が変わった",
    body:
      "テンプレ感のない逆質問が作れるので、面接の最後にしっかり会話を残せるようになりました。企業研究の抜け漏れにも気づけます。",
    meta: "大学3年 / IT・SaaS志望",
  },
  {
    title: "複数社の管理が一気に楽になった",
    body:
      "面接メモと生成内容を同じ場所で見返せるので、次の面接直前でも焦らず準備できます。就活全体の運用が軽くなりました。",
    meta: "修士1年 / メーカー志望",
  },
];

const plans = [
  {
    name: "Starter",
    price: "¥0",
    note: "最初の導入に",
    features: ["2社まで生成", "プロフィール保存", "1次面接対策"],
    featured: false,
  },
  {
    name: "Growth",
    price: "¥980",
    note: "就活を本格運用する人向け",
    features: ["企業数無制限", "企業研究メモ保存", "選考管理ダッシュボード", "逆質問強化"],
    featured: true,
  },
  {
    name: "Executive",
    price: "¥1,980",
    note: "最終面接まで見据える",
    features: ["Growthの全機能", "最終面接対策", "競合比較生成", "優先生成"],
    featured: false,
  },
];

const footerNav = [
  { href: "#concept", label: "コンセプト" },
  { href: "#service", label: "機能一覧" },
  { href: "#pricing", label: "料金プラン" },
];

const footerService = [
  { href: "/input", label: "面接対策を始める" },
  { href: "/companies", label: "選考一覧を見る" },
];

export default function Home() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">

      {/* ── Announcement bar ─────────────────────────────── */}
      <div className="border-b border-white/8 bg-[var(--navy)] py-2.5 text-center text-xs tracking-[0.14em] text-white/55">
        AI就活面接対策 — 初回2社まで
        <span className="mx-1 font-semibold text-[var(--gold-soft)]">完全無料</span>
        でご利用いただけます
      </div>

      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,25,47,0.80)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div>
            <p className="font-serif text-2xl tracking-[0.14em] text-white">就活Boost</p>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/45">Interview Intelligence</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#concept" className="transition hover:text-white">コンセプト</a>
            <a href="#service" className="transition hover:text-white">機能</a>
            <a href="#pricing" className="transition hover:text-white">料金</a>
            <Link href="/companies" className="transition hover:text-white">選考一覧</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/input"
              className="hidden rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d] md:inline-flex"
            >
              無料で始める
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,18,35,0.92) 0%, rgba(7,18,35,0.75) 48%, rgba(7,18,35,0.52) 100%), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(209,175,97,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(74,123,160,0.25),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="hero-1 mb-5 text-xs uppercase tracking-[0.45em] text-[var(--gold-soft)]">
              AI Interview Platform For Serious Candidates
            </p>
            <h1 className="hero-2 max-w-4xl font-serif text-5xl leading-[1.05] tracking-[0.02em] text-white md:text-7xl">
              面接対策を、
              <br />
              企業に通じる
              <br />
              企画へ変える。
            </h1>
            <p className="hero-3 mt-8 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              就活Boostは、就活生の経験を企業別の説得力に変換する面接設計ツールです。
              テンプレートを並べるのではなく、志望企業ごとに通り方を再設計します。
            </p>
            <div className="hero-4 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/input"
                className="shimmer-btn rounded-full bg-[var(--gold)] px-8 py-4 text-center text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
              >
                面接対策を始める
              </Link>
              <Link
                href="/companies"
                className="rounded-full border border-white/20 px-8 py-4 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                選考中企業を見る
              </Link>
            </div>
            <div className="hero-5 mt-10 grid gap-3 md:grid-cols-3">
              {strengths.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/78 backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-card self-end">
            <div className="animate-float rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-[1.5rem] bg-white text-[var(--ink)]">
                <div
                  className="h-60 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "linear-gradient(180deg, rgba(10,25,47,0.05), rgba(10,25,47,0.55)), url('https://images.unsplash.com/photo-1522202222206-b750486f3b95?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
                <div className="grid gap-6 p-6">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Live Brief</p>
                      <p className="mt-2 font-serif text-2xl text-[var(--navy)]">面接準備の現在地</p>
                    </div>
                    <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--navy)]">
                      2nd Interview
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[var(--paper)] p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Current Focus</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        志望理由の深掘りと、競合比較を踏まえた差別化ポイントを再生成。
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[var(--paper)] p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Next Action</p>
                      <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                        面接官の想定質問に対する回答を、30秒版と90秒版の2パターンで作成。
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[var(--navy)] px-5 py-4 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Generated Assets</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                      <span className="rounded-full border border-white/15 px-3 py-1">志望理由</span>
                      <span className="rounded-full border border-white/15 px-3 py-1">自己PR</span>
                      <span className="rounded-full border border-white/15 px-3 py-1">弱みの答え方</span>
                      <span className="rounded-full border border-white/15 px-3 py-1">逆質問</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-5 absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
          <p className="text-[10px] uppercase tracking-[0.38em] text-white/30">Scroll</p>
          <div className="relative h-8 w-px overflow-hidden rounded-full bg-white/15">
            <div className="animate-scroll-down absolute inset-x-0 top-0 h-3 rounded-full bg-white/55" />
          </div>
        </div>
      </section>

      {/* ── Metrics ──────────────────────────────────────── */}
      <AnimateIn>
        <section className="border-b border-[var(--line)] bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-4 lg:px-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-l border-[var(--line)] pl-5 first:border-l-0 first:pl-0">
                <p className="font-serif text-4xl text-[var(--navy)]">{metric.value}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--muted)]">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>
      </AnimateIn>

      {/* ── Concept ──────────────────────────────────────── */}
      <section id="concept" className="bg-[var(--paper)] py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <AnimateIn className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Concept</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              企業の意図を読んで、
              <br />
              通じる言葉を設計する。
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--ink-soft)]">
              AIの力だけに頼らない設計です。企業研究のメモ、選考フェーズ、過去の面接の手応えを積み重ねることで、
              生成される内容の解像度は回を追うごとに高まっていきます。
            </p>
          </AnimateIn>
          <div className="grid gap-5 md:grid-cols-2">
            {featureCards.map((card, i) => (
              <AnimateIn key={card.title} delay={i * 80}>
                <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-7 shadow-[0_24px_60px_rgba(10,25,47,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(10,25,47,0.14)]">
                  <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">{card.label}</p>
                  <h3 className="mt-4 font-serif text-2xl leading-tight text-[var(--navy)]">{card.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{card.description}</p>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Design ───────────────────────────────── */}
      <section id="service" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimateIn className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Service Design</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
                就活のフローごとに、
                <br />
                必要なアクションがつながる。
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-8 text-[var(--ink-soft)]">
              機能を揃えるだけでなく、企業研究・面接準備・改善サイクルを一つのプラットフォームで完結させる設計にしました。
            </p>
          </AnimateIn>

          <div className="grid gap-8">
            {serviceHighlights.map((item, index) => (
              <AnimateIn key={item.id} delay={index * 80}>
                <article
                  className={`group grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] shadow-[0_32px_80px_rgba(10,25,47,0.08)] transition duration-300 hover:shadow-[0_40px_100px_rgba(10,25,47,0.14)] lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative min-h-[320px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(9,22,43,0.18)] to-[rgba(9,22,43,0.5)]" />
                  </div>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent)]">
                      {item.id} / {item.title}
                    </p>
                    <h3 className="mt-5 font-serif text-3xl leading-tight text-[var(--navy)]">{item.heading}</h3>
                    <p className="mt-6 text-sm leading-8 text-[var(--ink-soft)]">{item.copy}</p>
                    <Link
                      href="/input"
                      className="mt-8 inline-flex w-fit items-center rounded-full border border-[var(--navy)] px-5 py-3 text-sm font-semibold text-[var(--navy)] transition hover:bg-[var(--navy)] hover:text-white"
                    >
                      この流れで試す
                    </Link>
                  </div>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="bg-[var(--navy)] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <AnimateIn>
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">How It Works</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
                面接準備を、
                <br />
                手戻りの少ない運用にする。
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-8 text-white/68">
                準備、生成、改善までの流れを一つのシステムに閉じ込めることで、就活中の思考コストを減らします。
              </p>
            </AnimateIn>
            <div className="grid gap-5 md:grid-cols-2">
              {flow.map((item, i) => (
                <AnimateIn key={item.step} delay={i * 80}>
                  <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-sm transition duration-300 hover:bg-white/10">
                    <p className="font-serif text-4xl text-[var(--gold-soft)]">{item.step}</p>
                    <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/72">{item.text}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── User Voices ──────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimateIn className="mb-12 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">User Voices</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              実際の就活の現場で、
              <br />
              使い続けられる設計へ。
            </h2>
          </AnimateIn>
          <div className="grid gap-6 lg:grid-cols-3">
            {voices.map((voice, i) => (
              <AnimateIn key={voice.title} delay={i * 80}>
                <article className="h-full rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_20px_60px_rgba(10,25,47,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(10,25,47,0.12)]">
                  <p className="font-serif text-2xl leading-tight text-[var(--navy)]">{voice.title}</p>
                  <p className="mt-5 text-sm leading-8 text-[var(--ink-soft)]">{voice.body}</p>
                  <p className="mt-8 text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{voice.meta}</p>
                </article>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="bg-[var(--paper)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimateIn className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Pricing</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              必要な深さに応じて選べる、
              <br />
              シンプルな料金設計。
            </h2>
          </AnimateIn>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => (
              <AnimateIn key={plan.name} delay={i * 100}>
                <div
                  className={`h-full rounded-[2rem] border p-8 transition duration-300 hover:-translate-y-1 ${
                    plan.featured
                      ? "border-[var(--navy)] bg-[var(--navy)] text-white shadow-[0_28px_80px_rgba(10,25,47,0.24)] hover:shadow-[0_40px_100px_rgba(10,25,47,0.32)]"
                      : "border-[var(--line)] bg-white text-[var(--ink)] hover:shadow-[0_28px_80px_rgba(10,25,47,0.12)]"
                  }`}
                >
                  <p className={`text-xs uppercase tracking-[0.35em] ${plan.featured ? "text-[var(--gold-soft)]" : "text-[var(--accent)]"}`}>
                    {plan.note}
                  </p>
                  <h3 className="mt-5 font-serif text-3xl">{plan.name}</h3>
                  <p className="mt-4 text-4xl font-semibold">
                    {plan.price}
                    <span className="ml-1 text-sm font-normal opacity-70">/ 月</span>
                  </p>
                  <ul className={`mt-8 grid gap-3 text-sm leading-7 ${plan.featured ? "text-white/80" : "text-[var(--ink-soft)]"}`}>
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className={plan.featured ? "text-[var(--gold-soft)]" : "text-[var(--accent)]"}>●</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/input"
                    className={`mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-[var(--gold)] text-[var(--navy)] hover:bg-[#f8d58d]"
                        : "border border-[var(--navy)] text-[var(--navy)] hover:bg-[var(--navy)] hover:text-white"
                    }`}
                  >
                    このプランで始める
                  </Link>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--navy)] py-20 text-white lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,175,97,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_20%)]" />
        <AnimateIn className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Start Your Preparation</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
            企業に刺さる面接準備を、
            <br />
            今日から始める。
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
            最初の2社は無料。志望企業ごとに通じる面接設計を、AIと一緒に構築してください。
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/input"
              className="shimmer-btn rounded-full bg-[var(--gold)] px-8 py-4 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
            >
              無料で始める
            </Link>
            <Link
              href="/companies"
              className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              選考一覧を確認
            </Link>
          </div>
        </AnimateIn>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
            <div>
              <p className="font-serif text-2xl text-[var(--navy)]">就活Boost</p>
              <p className="mt-1 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">AI Interview Platform</p>
              <p className="mt-5 max-w-xs text-sm leading-7 text-[var(--ink-soft)]">
                就活生の経験を企業別の説得力に変換する、AIを活用した面接設計ツール。
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Menu</p>
              <div className="mt-5 space-y-3">
                {footerNav.map((item) => (
                  <a key={item.href} href={item.href} className="block text-sm text-[var(--ink-soft)] transition hover:text-[var(--navy)]">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Service</p>
              <div className="mt-5 space-y-3">
                {footerService.map((item) => (
                  <Link key={item.href} href={item.href} className="block text-sm text-[var(--ink-soft)] transition hover:text-[var(--navy)]">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">Plan</p>
              <div className="mt-5 space-y-3 text-sm text-[var(--ink-soft)]">
                <p>Starter（無料）</p>
                <p>Growth（¥980/月）</p>
                <p>Executive（¥1,980/月）</p>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-[var(--line)] pt-6 text-center text-xs text-[var(--muted)]">
            © 2026 就活Boost. Designed for focused interview preparation.
          </div>
        </div>
      </footer>
    </main>
  );
}
