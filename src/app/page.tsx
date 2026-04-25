import Link from "next/link";
import { AnimateIn } from "@/components/AnimateIn";
import { MobileNav } from "@/components/MobileNav";

const strengths = [
  "志望理由・自己PR・逆質問を自動生成",
  "企業ごとに内容を変えて複数社管理",
  "1次〜最終面接まで対応",
];

const serviceHighlights = [
  {
    id: "01",
    title: "企業別に生成",
    heading: "同じ内容を使い回さず、企業ごとに回答を作ります。",
    copy:
      "企業名・職種・面接フェーズを指定すると、その企業に合わせた志望理由・自己PRを生成します。企業研究メモを追加するほど内容が具体的になります。",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "02",
    title: "8種類を一括生成",
    heading: "自己紹介から逆質問まで、まとめて出力します。",
    copy:
      "自己紹介・志望理由・就活の軸・強み・弱み・キャリアプラン・締めの一言・逆質問の8種類を一度に生成。面接前に必要なものが揃います。",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "03",
    title: "複数社を一括管理",
    heading: "生成した回答は企業ごとに保存・更新できます。",
    copy:
      "企業を追加するたびに回答が蓄積されます。面接後に内容を直接編集したり、企業研究を追記して再生成することもできます。",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
];

const metrics = [
  { value: "3ステップ", label: "入力から生成まで" },
  { value: "8種類", label: "自動生成コンテンツ" },
  { value: "2社", label: "無料でお試し" },
  { value: "24時間", label: "いつでも再生成" },
];

const featureCards = [
  {
    label: "企業別生成",
    title: "企業ごとに内容が変わります",
    description:
      "同じプロフィールでも、企業名・職種・フェーズを変えると回答の内容が変わります。使い回しではありません。",
  },
  {
    label: "逆質問",
    title: "逆質問も自動で生成します",
    description:
      "「何か質問はありますか」への回答も、企業情報をもとに3件生成します。自分の意見と質問をセットで出力します。",
  },
  {
    label: "フェーズ対応",
    title: "1次・2次・最終面接に対応",
    description:
      "選考フェーズを指定すると、その段階に合わせた内容で生成します。面接が進んだら再生成できます。",
  },
  {
    label: "企業研究メモ",
    title: "メモを追加すると内容が具体的になります",
    description:
      "採用ページの内容やニュースを貼り付けると、志望理由や逆質問がより具体的な内容になります。",
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
    text: "志望理由、自己PR、弱み、キャリアプラン、逆質問まで、まとめて生成します。",
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
        登録不要 — 最初の2社分は
        <span className="mx-1 font-semibold text-[var(--gold-soft)]">無料</span>
        でお試しいただけます
      </div>

      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(26,45,122,0.80)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <img src="/logo-icon.png" alt="ガクチカBoost" className="h-10 w-10 rounded-full" />
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#concept" className="transition hover:text-white">コンセプト</a>
            <a href="#service" className="transition hover:text-white">機能</a>
            <a href="#pricing" className="transition hover:text-white">料金</a>
            <Link href="/companies" className="transition hover:text-white">選考一覧</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/input"
              className="hidden rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff] md:inline-flex"
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
              "linear-gradient(90deg, rgba(20,36,100,0.92) 0%, rgba(20,36,100,0.75) 48%, rgba(20,36,100,0.52) 100%), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(26,127,229,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(74,123,160,0.25),transparent_28%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <div className="hero-1 mb-8">
              <div className="inline-block rounded-2xl bg-white px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <img src="/logo-full.png" alt="ガクチカBoost" className="h-16 md:h-20" />
              </div>
            </div>
            <h1 className="hero-2 max-w-4xl font-serif text-5xl leading-[1.05] tracking-[0.02em] text-white md:text-7xl">
              志望企業ごとの
              <br />
              面接回答を、
              <br />
              AIが作ります。
            </h1>
            <p className="hero-3 mt-8 max-w-xl text-base leading-8 text-white/72">
              プロフィールと企業情報を入力するだけで、志望理由・自己PR・逆質問など8種類の回答を自動生成します。
            </p>
            <div className="hero-4 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/input"
                className="shimmer-btn rounded-full bg-[var(--gold)] px-8 py-4 text-center text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
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
                      "linear-gradient(180deg, rgba(26,45,122,0.05), rgba(26,45,122,0.55)), url('https://images.unsplash.com/photo-1522202222206-b750486f3b95?auto=format&fit=crop&w=1200&q=80')",
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
              <div key={metric.label} className="border-l border-[var(--line)] pl-6 first:border-l-0 first:pl-0">
                <span className="block h-[2px] w-7 rounded-full bg-[var(--gold)]" />
                <p className="mt-3 text-3xl font-bold leading-none tracking-tight text-[var(--navy)]">{metric.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{metric.label}</p>
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
              入力した情報から、
              <br />
              企業別の回答を生成します。
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--ink-soft)]">
              ガクチカや強みを一度登録すれば、あとは企業情報を追加するだけです。企業研究メモを足すほど、生成される内容が具体的になります。
            </p>
          </AnimateIn>
          <div className="grid gap-5 md:grid-cols-2">
            {featureCards.map((card, i) => (
              <AnimateIn key={card.title} delay={i * 80}>
                <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-7 shadow-[0_24px_60px_rgba(26,45,122,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_rgba(26,45,122,0.14)]">
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
                このツールで
                <br />
                できること。
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-8 text-[var(--ink-soft)]">
              企業の追加・回答の生成・内容の編集・再生成まで、一つのアプリで完結します。
            </p>
          </AnimateIn>

          <div className="grid gap-8">
            {serviceHighlights.map((item, index) => (
              <AnimateIn key={item.id} delay={index * 80}>
                <article
                  className={`group grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] shadow-[0_32px_80px_rgba(26,45,122,0.08)] transition duration-300 hover:shadow-[0_40px_100px_rgba(26,45,122,0.14)] lg:grid-cols-2 ${
                    index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <div className="relative min-h-[320px] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[rgba(22,40,110,0.18)] to-[rgba(22,40,110,0.5)]" />
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
                使い方は
                <br />
                4ステップです。
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-8 text-white/68">
                初回のプロフィール登録が終われば、2回目以降は企業情報を入れるだけで面接対策が完成します。
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
                <article className="h-full rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_20px_60px_rgba(26,45,122,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(26,45,122,0.12)]">
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
                      ? "border-[var(--navy)] bg-[var(--navy)] text-white shadow-[0_28px_80px_rgba(26,45,122,0.24)] hover:shadow-[0_40px_100px_rgba(26,45,122,0.32)]"
                      : "border-[var(--line)] bg-white text-[var(--ink)] hover:shadow-[0_28px_80px_rgba(26,45,122,0.12)]"
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
                        ? "bg-[var(--gold)] text-[var(--navy)] hover:bg-[#50a8ff]"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,127,229,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_20%)]" />
        <AnimateIn className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Start Your Preparation</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
            まず2社分、
            <br />
            無料で試してみてください。
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-white/70">
            登録不要です。企業名と自分のプロフィールを入れると、すぐに回答が生成されます。
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/input"
              className="shimmer-btn rounded-full bg-[var(--gold)] px-8 py-4 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#50a8ff]"
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
              <img src="/logo-full.png" alt="ガクチカBoost" className="h-10" />
              <p className="mt-5 max-w-xs text-sm leading-7 text-[var(--ink-soft)]">
                プロフィールと企業情報を入力するだけで、志望理由・自己PR・逆質問をAIが生成します。
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
            © 2026 ガクチカBoost. Designed for focused interview preparation.
          </div>
        </div>
      </footer>
    </main>
  );
}
