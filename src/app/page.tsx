import Link from "next/link";

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
  { value: "10,000+", label: "利用就活生" },
  { value: "3 sec", label: "平均生成時間" },
  { value: "87%", label: "継続利用率" },
  { value: "24h", label: "いつでも改善" },
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

export default function Home() {
  return (
    <main className="bg-[var(--paper)] text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,25,47,0.76)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div>
            <p className="font-serif text-2xl tracking-[0.14em] text-white">就活Boost</p>
            <p className="text-[10px] uppercase tracking-[0.45em] text-white/45">Interview Intelligence</p>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#concept" className="transition hover:text-white">
              コンセプト
            </a>
            <a href="#service" className="transition hover:text-white">
              機能
            </a>
            <a href="#pricing" className="transition hover:text-white">
              料金
            </a>
            <Link href="/companies" className="transition hover:text-white">
              選考一覧
            </Link>
          </nav>
          <Link
            href="/input"
            className="rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
          >
            無料で始める
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[var(--navy)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(7,18,35,0.92) 0%, rgba(7,18,35,0.75) 48%, rgba(7,18,35,0.52) 100%), url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(209,175,97,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(74,123,160,0.25),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-[var(--gold-soft)]">
              AI Interview Platform For Serious Candidates
            </p>
            <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] tracking-[0.02em] text-white md:text-7xl">
              面接対策を、
              <br />
              企業に通じる
              <br />
              企画へ変える。
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
              就活Boostは、就活生の経験を企業別の説得力に変換する面接設計ツールです。
              テンプレートを並べるのではなく、志望企業ごとに通り方を再設計します。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/input"
                className="rounded-full bg-[var(--gold)] px-8 py-4 text-center text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
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
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {strengths.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm text-white/78 backdrop-blur-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="self-end">
            <div className="rounded-[2rem] border border-white/10 bg-[rgba(255,255,255,0.08)] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
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
      </section>

      <section className="border-b border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-4 lg:px-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="border-l border-[var(--line)] pl-5 first:border-l-0 first:pl-0">
              <p className="font-serif text-4xl text-[var(--navy)]">{metric.value}</p>
              <p className="mt-2 text-sm tracking-[0.18em] text-[var(--muted)] uppercase">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="concept" className="bg-[var(--paper)] py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Concept</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              上質なUIは、
              <br />
              迷わず動けるUXで完成する。
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--ink-soft)]">
              参考サイトのような静かな高級感を土台にしつつ、就活サービスとして必要な情報導線は明確に。
              写真、余白、タイポグラフィ、カードの密度を整理して、使う前から信頼できる印象へ引き上げました。
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.75rem] border border-[var(--line)] bg-white p-7 shadow-[0_24px_60px_rgba(10,25,47,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent)]">{card.label}</p>
                <h3 className="mt-4 font-serif text-2xl leading-tight text-[var(--navy)]">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="service" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Service Design</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
                写真と情報の質感を合わせ、
                <br />
                サービス価値を一段上で見せる。
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-8 text-[var(--ink-soft)]">
              ただの機能一覧ではなく、ユーザーがどの局面でどう助かるかを体感できる見せ方に変更。
              企業サイトの信頼感と、SaaSの使いやすさを両立させています。
            </p>
          </div>

          <div className="grid gap-8">
            {serviceHighlights.map((item, index) => (
              <article
                key={item.id}
                className={`grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] shadow-[0_32px_80px_rgba(10,25,47,0.08)] lg:grid-cols-2 ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div
                  className="min-h-[320px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(9,22,43,0.18), rgba(9,22,43,0.5)), url('${item.image}')`,
                  }}
                />
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
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--navy)] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">How It Works</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
                面接準備を、
                <br />
                手戻りの少ない運用にする。
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-8 text-white/68">
                準備、生成、改善までの流れを一つのシステムに閉じ込めることで、就活中の思考コストを減らします。
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {flow.map((item) => (
                <div key={item.step} className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 backdrop-blur-sm">
                  <p className="font-serif text-4xl text-[var(--gold-soft)]">{item.step}</p>
                  <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/72">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">User Voices</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              実際の就活の現場で、
              <br />
              使い続けられる設計へ。
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {voices.map((voice) => (
              <article
                key={voice.title}
                className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-7 shadow-[0_20px_60px_rgba(10,25,47,0.07)]"
              >
                <p className="font-serif text-2xl leading-tight text-[var(--navy)]">{voice.title}</p>
                <p className="mt-5 text-sm leading-8 text-[var(--ink-soft)]">{voice.body}</p>
                <p className="mt-8 text-xs uppercase tracking-[0.28em] text-[var(--muted)]">{voice.meta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[var(--paper)] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.38em] text-[var(--accent)]">Pricing</p>
            <h2 className="mt-5 font-serif text-4xl leading-tight text-[var(--navy)] md:text-5xl">
              必要な深さに応じて選べる、
              <br />
              シンプルな料金設計。
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-[2rem] border p-8 ${
                  plan.featured
                    ? "border-[var(--navy)] bg-[var(--navy)] text-white shadow-[0_28px_80px_rgba(10,25,47,0.24)]"
                    : "border-[var(--line)] bg-white text-[var(--ink)]"
                }`}
              >
                <p className={`text-xs uppercase tracking-[0.35em] ${plan.featured ? "text-[var(--gold-soft)]" : "text-[var(--accent)]"}`}>
                  {plan.note}
                </p>
                <h3 className="mt-5 font-serif text-3xl">{plan.name}</h3>
                <p className="mt-4 text-4xl font-semibold">{plan.price}<span className="ml-1 text-sm font-normal opacity-70">/ 月</span></p>
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
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--navy)] py-20 text-white lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(209,175,97,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_20%)]" />
        <div className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">
          <p className="text-xs uppercase tracking-[0.38em] text-[var(--gold-soft)]">Start Your Preparation</p>
          <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">
            企業に刺さる面接準備を、
            <br />
            今日から始める。
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/70 md:text-base">
            最初の2社は無料。写真と余白で信頼感をつくるだけでなく、実際の面接成果につながる導線まで整えています。
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/input"
              className="rounded-full bg-[var(--gold)] px-8 py-4 text-sm font-semibold text-[var(--navy)] transition hover:bg-[#f8d58d]"
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
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-serif text-2xl text-[var(--navy)]">就活Boost</p>
            <p className="mt-1 text-xs uppercase tracking-[0.35em]">AI Interview Platform</p>
          </div>
          <p>© 2026 就活Boost. Designed for focused interview preparation.</p>
        </div>
      </footer>
    </main>
  );
}
