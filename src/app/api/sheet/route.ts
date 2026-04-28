import Groq from "groq-sdk";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface ReverseQuestion { opinion: string; question: string; }
interface AnticipatedQuestion { question: string; answer: string; }

interface SheetExtras {
  mapping: { companyTrait: string; userEvidence: string }[];
  deepDives: { motivation: string; strengths: string; weaknesses: string; careerPlan: string };
  reverseQuestionsIntent: string[];
  episodeCards: { title: string; text: string }[];
  checklistItems: string[];
}

async function generateSheetExtras(
  companyName: string,
  jobType: string,
  interviewPhase: string,
  desiredTalent: string,
  profile: { name: string; university: string; faculty: string; gakuchika: string; strengths: string; weaknesses: string; jobAxis: string; background: string },
  content: { motivation: string; strengths: string; weaknesses: string; careerPlan: string; reverseQuestions: ReverseQuestion[] }
): Promise<SheetExtras> {
  const prompt = `あなたは就活のプロコーチです。以下の情報をもとに、面接直前に読む「対策シート」の補足データをJSON形式で生成してください。

【応募者】${profile.name}（${profile.university} ${profile.faculty}）
【企業】${companyName}／${jobType}／${interviewPhase}
【求める人物像】${desiredTalent || "（未入力）"}
【ガクチカ】${profile.gakuchika}
【強み】${profile.strengths}
【弱み】${profile.weaknesses}
【就活の軸】${profile.jobAxis}
【バックグラウンド】${profile.background || "（未入力）"}

【生成済み内容（要約）】
志望理由: ${content.motivation.slice(0, 120)}...
強み: ${content.strengths.slice(0, 100)}...
弱み: ${content.weaknesses.slice(0, 100)}...
キャリアプラン: ${content.careerPlan.slice(0, 100)}...
逆質問: ${content.reverseQuestions.map(q => q.question).join(" / ")}

以下のJSON形式のみで回答（マークダウン不要）:
{
  "mapping": [
    { "companyTrait": "企業が求める人材像・特徴（短く）", "userEvidence": "それに対応する応募者の具体的な経験・証拠" },
    { "companyTrait": "...", "userEvidence": "..." },
    { "companyTrait": "...", "userEvidence": "..." },
    { "companyTrait": "...", "userEvidence": "..." },
    { "companyTrait": "...", "userEvidence": "..." }
  ],
  "deepDives": {
    "motivation": "「なぜうちの会社じゃないといけないのか」という深掘りへの回答（100〜150字）",
    "strengths": "強みのエピソードを具体的に聞かれたときの補足回答（100〜150字）",
    "weaknesses": "弱みをどう克服しているか深掘りされたときの補足回答（80〜120字）",
    "careerPlan": "キャリアプランが現実的かを確認されたときの補足回答（80〜120字）"
  },
  "reverseQuestionsIntent": [
    "逆質問1の意図（この質問で何を見せたいか30〜50字）",
    "逆質問2の意図",
    "逆質問3の意図"
  ],
  "episodeCards": [
    { "title": "エピソードの見出し（15字以内）", "text": "1分で話せる内容（150〜200字）" },
    { "title": "...", "text": "..." }
  ],
  "checklistItems": [
    "チェック項目（面接前にやること・確認すること）",
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });
    const text = completion.choices[0].message.content ?? "";
    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    return JSON.parse(cleaned.slice(start, end + 1)) as SheetExtras;
  } catch {
    return {
      mapping: [],
      deepDives: { motivation: "", strengths: "", weaknesses: "", careerPlan: "" },
      reverseQuestionsIntent: [],
      episodeCards: [],
      checklistItems: [],
    };
  }
}

function buildHtml(params: {
  companyName: string;
  jobType: string;
  interviewPhase: string;
  userName: string;
  university: string;
  faculty: string;
  content: {
    selfIntro: string; motivation: string; jobAxis: string; strengths: string;
    weaknesses: string; careerPlan: string; closingStatement: string;
    reverseQuestions: ReverseQuestion[];
    anticipatedQuestions: AnticipatedQuestion[];
    preInterviewMemo: string;
  };
  extras: SheetExtras;
}): string {
  const { companyName, jobType, interviewPhase, userName, university, faculty, content, extras } = params;

  const escape = (s: string) => s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const sectionHtml = (num: string, title: string, conclusion: string, body: string, deepDiveLabel: string, deepDiveText: string) => `
  <section>
    <h2>${num} &nbsp;${escape(title)}</h2>
    <div class="conclusion">${escape(conclusion).replace(/\n/g, "<br>")}</div>
    <p class="body-text">${escape(body).replace(/\n/g, "<br>")}</p>
    ${deepDiveText ? `<div class="deepdive">
      <div class="deepdive-label">深掘り：${escape(deepDiveLabel)}</div>
      <div class="deepdive-text">${escape(deepDiveText).replace(/\n/g, "<br>")}</div>
    </div>` : ""}
  </section>`;

  const mappingRows = extras.mapping.map(m => `
    <div class="mapping-row">
      <div class="mapping-left">${escape(m.companyTrait)}</div>
      <div class="mapping-arrow">→</div>
      <div class="mapping-right">${escape(m.userEvidence)}</div>
    </div>`).join("");

  const reverseQHtml = content.reverseQuestions.map((q, i) => `
    <div class="rq-item">
      <div class="rq-num">Q ${String(i + 1).padStart(2, "0")}</div>
      <div class="rq-q">${escape(q.question)}</div>
      ${extras.reverseQuestionsIntent[i] ? `<div class="rq-intent">意図：${escape(extras.reverseQuestionsIntent[i])}</div>` : ""}
      <div class="rq-body">${escape(q.opinion).replace(/\n/g, "<br>")}</div>
    </div>`).join("");

  const anticipatedHtml = content.anticipatedQuestions.map((q, i) => `
    <div class="rq-item">
      <div class="rq-num">予測 ${String(i + 1).padStart(2, "0")}</div>
      <div class="rq-q">${escape(q.question)}</div>
      <div class="rq-body">${escape(q.answer).replace(/\n/g, "<br>")}</div>
    </div>`).join("");

  const episodeHtml = extras.episodeCards.map(e => `
    <div class="canpe-block">
      <div class="canpe-label">${escape(e.title)}</div>
      <div class="canpe-text">${escape(e.text).replace(/\n/g, "<br>")}</div>
    </div>`).join("");

  const checklistHtml = extras.checklistItems.map(item => `
      <li>
        <span class="check-box"></span>
        <span>${escape(item)}</span>
      </li>`).join("");

  const memoLines = content.preInterviewMemo
    ? content.preInterviewMemo.split("\n").filter(l => l.trim()).map(l =>
        `<li class="memo-line">${escape(l.startsWith("・") ? l.slice(1) : l)}</li>`
      ).join("")
    : "";

  const today = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escape(companyName)} ${escape(interviewPhase)}｜${escape(userName)}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo', sans-serif; background: #f8f9fa; color: #1a1a1a; font-size: 14.5px; line-height: 1.85; }
.page { max-width: 820px; margin: 0 auto; background: #fff; min-height: 100vh; padding: 0 48px 80px; box-shadow: 0 0 24px rgba(0,0,0,0.06); }
.doc-header { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #e0e0e0; padding: 12px 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: 36px; }
.doc-header h1 { font-size: 13px; color: #555; font-weight: 400; }
.doc-header h1 strong { color: #1a1a1a; font-weight: 700; }
.clock { font-size: 16px; font-weight: 700; color: #c0392b; font-variant-numeric: tabular-nums; }
.title-area { margin-bottom: 40px; padding-top: 8px; }
.title-area .label { font-size: 11px; font-weight: 700; color: #888; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px; }
.title-area h2 { font-size: 22px; font-weight: 700; color: #1a1a1a; line-height: 1.4; }
.title-area .meta { margin-top: 10px; font-size: 13px; color: #666; }
.memo-banner { background: #fffbf0; border: 1px solid #e8d888; border-left: 4px solid #e0aa00; border-radius: 0 6px 6px 0; padding: 14px 18px; margin-bottom: 36px; }
.memo-banner .memo-label { font-size: 11px; font-weight: 700; color: #a07800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.memo-list { list-style: none; }
.memo-list .memo-line { font-size: 13.5px; color: #4a3a00; line-height: 1.9; padding: 4px 0; border-bottom: 1px solid rgba(200,160,0,0.15); display: flex; align-items: flex-start; gap: 8px; }
.memo-list .memo-line::before { content: '●'; color: #e0aa00; font-size: 10px; margin-top: 5px; flex-shrink: 0; }
.memo-list .memo-line:last-child { border-bottom: none; }
.mapping-banner { background: #f5f0ff; border: 1px solid #c8b8f0; border-left: 4px solid #6c3fd9; border-radius: 0 6px 6px 0; padding: 14px 18px; margin-bottom: 36px; }
.mapping-banner .mb-label { font-size: 11px; font-weight: 700; color: #4a1fa8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
.mapping-row { display: grid; grid-template-columns: 1fr 16px 1fr; gap: 6px 8px; align-items: start; margin-bottom: 7px; font-size: 13px; line-height: 1.65; }
.mapping-row:last-child { margin-bottom: 0; }
.mapping-left { color: #4a1fa8; font-weight: 600; }
.mapping-arrow { color: #aaa; text-align: center; padding-top: 1px; }
.mapping-right { color: #1a1a1a; }
section { margin-bottom: 44px; border-top: 2px solid #1a1a1a; padding-top: 18px; }
section > h2 { font-size: 12px; font-weight: 700; color: #888; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 16px; }
.conclusion { background: #f0f4ff; border-left: 4px solid #3a5bd9; border-radius: 0 6px 6px 0; padding: 14px 18px; font-size: 15px; font-weight: 600; color: #1a2a5a; margin-bottom: 18px; line-height: 1.7; }
.body-text { color: #2a2a2a; font-size: 14.5px; line-height: 1.95; margin-bottom: 14px; }
.deepdive { margin-top: 16px; background: #fffbf0; border: 1px solid #e8d888; border-radius: 6px; padding: 14px 18px; }
.deepdive-label { font-size: 11px; font-weight: 700; color: #a07800; letter-spacing: 0.08em; margin-bottom: 8px; }
.deepdive-text { font-size: 13.5px; color: #4a3a00; line-height: 1.85; }
.rq-item { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #eee; }
.rq-item:last-child { border-bottom: none; margin-bottom: 0; }
.rq-num { font-size: 11px; font-weight: 700; color: #3a5bd9; letter-spacing: 0.08em; margin-bottom: 4px; }
.rq-q { font-size: 15px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
.rq-intent { font-size: 12px; color: #888; margin-bottom: 8px; font-style: italic; }
.rq-body { font-size: 13.5px; color: #333; line-height: 1.85; background: #f8f8f8; border-radius: 6px; padding: 12px 14px; }
.canpe-block { background: #fff8f0; border: 1px solid #f4c07a; border-left: 4px solid #e67e22; border-radius: 0 6px 6px 0; padding: 14px 18px; margin-bottom: 16px; }
.canpe-label { font-size: 11px; font-weight: 700; color: #a05000; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
.canpe-text { font-size: 14px; color: #2a1a00; line-height: 1.9; }
.checklist { list-style: none; padding: 0; }
.checklist li { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; line-height: 1.7; }
.checklist li:last-child { border-bottom: none; }
.check-box { width: 16px; height: 16px; border: 2px solid #3a5bd9; border-radius: 3px; flex-shrink: 0; margin-top: 3px; }
strong { color: #1a1a1a; font-weight: 700; }
.accent { color: #3a5bd9; font-weight: 700; }
@media print { .doc-header { position: static; } .clock { display: none; } }
</style>
</head>
<body>
<div class="page">

  <div class="doc-header">
    <h1><strong>${escape(companyName)} ${escape(interviewPhase)}</strong>｜${escape(jobType)}</h1>
    <div class="clock" id="clock">--:--:--</div>
  </div>

  <div class="title-area">
    <div class="label">Interview Prep Sheet — Generated by ガクチカBoost</div>
    <h2>${escape(userName)}｜${escape(university)} ${escape(faculty)}</h2>
    <div class="meta">${escape(today)} &nbsp;／&nbsp; ${escape(interviewPhase)}</div>
  </div>

  ${memoLines ? `<div class="memo-banner">
    <div class="memo-label">⚡ 入室5分前に読む — 今日のまとめ</div>
    <ul class="memo-list">${memoLines}</ul>
  </div>` : ""}

  ${mappingRows ? `<div class="mapping-banner">
    <div class="mb-label">🎯 ${escape(companyName)}が求める人物像 × 自分の経験（対応表）</div>
    ${mappingRows}
  </div>` : ""}

  ${sectionHtml("01", "志望理由", content.motivation.split("。")[0] + "。", content.motivation, "なぜ他社ではなく？", extras.deepDives.motivation)}
  ${sectionHtml("02", "強み", content.strengths.split("。")[0] + "。", content.strengths, "具体的なエピソードを深掘りされたら", extras.deepDives.strengths)}
  ${sectionHtml("03", "弱み", content.weaknesses.split("。")[0] + "。", content.weaknesses, "克服している方法を深掘りされたら", extras.deepDives.weaknesses)}
  ${sectionHtml("04", "キャリアプラン", content.careerPlan.split("。")[0] + "。", content.careerPlan, "実現可能性を問われたら", extras.deepDives.careerPlan)}

  <section>
    <h2>05 &nbsp;就活の軸</h2>
    <div class="conclusion">${escape(content.jobAxis.split("。")[0])}。</div>
    <p class="body-text">${escape(content.jobAxis).replace(/\n/g, "<br>")}</p>
  </section>

  ${anticipatedHtml ? `<section>
    <h2>06 &nbsp;AIが予測した想定問答</h2>
    ${anticipatedHtml}
  </section>` : ""}

  <section>
    <h2>07 &nbsp;逆質問</h2>
    ${reverseQHtml}
  </section>

  ${episodeHtml ? `<section>
    <h2>08 &nbsp;エピソードカンペ（1分バージョン）</h2>
    ${episodeHtml}
  </section>` : ""}

  ${checklistHtml ? `<section>
    <h2>09 &nbsp;当日チェックリスト</h2>
    <ul class="checklist">
      ${checklistHtml}
    </ul>
  </section>` : ""}

  <section>
    <h2>10 &nbsp;締めの一言</h2>
    <div class="conclusion">${escape(content.closingStatement)}</div>
  </section>

</div>
<script>
function tick() {
  const n = new Date(), pad = v => String(v).padStart(2, '0');
  document.getElementById('clock').textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds());
}
setInterval(tick, 1000); tick();
</script>
</body>
</html>`;
}

function buildTextSheet(params: {
  companyName: string;
  jobType: string;
  interviewPhase: string;
  userName: string;
  university: string;
  faculty: string;
  content: {
    selfIntro: string; motivation: string; jobAxis: string; strengths: string;
    weaknesses: string; careerPlan: string; closingStatement: string;
    reverseQuestions: ReverseQuestion[];
    anticipatedQuestions: AnticipatedQuestion[];
    preInterviewMemo: string;
  };
  extras: SheetExtras;
}): string {
  const { companyName, jobType, interviewPhase, userName, university, faculty, content, extras } = params;

  const blocks: string[] = [
    `${companyName} ${interviewPhase} 面接対策シート`,
    `${userName} / ${university} ${faculty}`.trim(),
    `${jobType}`,
    "",
  ];

  if (content.preInterviewMemo) {
    blocks.push("【入室5分前メモ】");
    blocks.push(content.preInterviewMemo);
    blocks.push("");
  }

  if (extras.mapping.length > 0) {
    blocks.push("【企業が求める人物像 × 自分の経験】");
    extras.mapping.forEach((item) => {
      blocks.push(`- ${item.companyTrait} → ${item.userEvidence}`);
    });
    blocks.push("");
  }

  const section = (title: string, body: string, deepDive?: string) => {
    blocks.push(`【${title}】`);
    blocks.push(body);
    if (deepDive) {
      blocks.push("");
      blocks.push(`深掘り: ${deepDive}`);
    }
    blocks.push("");
  };

  section("志望理由", content.motivation, extras.deepDives.motivation);
  section("強み", content.strengths, extras.deepDives.strengths);
  section("弱み", content.weaknesses, extras.deepDives.weaknesses);
  section("キャリアプラン", content.careerPlan, extras.deepDives.careerPlan);
  section("就活の軸", content.jobAxis);
  section("自己紹介", content.selfIntro);

  if (content.anticipatedQuestions.length > 0) {
    blocks.push("【AIが予測した想定問答】");
    content.anticipatedQuestions.forEach((item, index) => {
      blocks.push(`Q${index + 1}. ${item.question}`);
      blocks.push(`A${index + 1}. ${item.answer}`);
      blocks.push("");
    });
  }

  blocks.push("【逆質問】");
  content.reverseQuestions.forEach((item, index) => {
    blocks.push(`Q${index + 1}. ${item.question}`);
    if (extras.reverseQuestionsIntent[index]) {
      blocks.push(`意図: ${extras.reverseQuestionsIntent[index]}`);
    }
    blocks.push(`自分の意見: ${item.opinion}`);
    blocks.push("");
  });

  if (extras.episodeCards.length > 0) {
    blocks.push("【エピソードカンペ】");
    extras.episodeCards.forEach((item) => {
      blocks.push(`${item.title}`);
      blocks.push(item.text);
      blocks.push("");
    });
  }

  if (extras.checklistItems.length > 0) {
    blocks.push("【当日チェックリスト】");
    extras.checklistItems.forEach((item) => {
      blocks.push(`- ${item}`);
    });
    blocks.push("");
  }

  blocks.push("【最後に一言】");
  blocks.push(content.closingStatement);

  return blocks.join("\n");
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyId } = await request.json() as { companyId: string };
    if (!companyId) {
      return Response.json({ error: "companyId required" }, { status: 400 });
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, userId: session.userId },
      include: { generatedContent: true, user: { include: { profile: true } } },
    });

    if (!company || !company.generatedContent) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const gc = company.generatedContent;
    const profile = company.user?.profile;

    const content = {
      selfIntro: gc.selfIntro,
      motivation: gc.motivation,
      jobAxis: gc.jobAxis,
      strengths: gc.strengths,
      weaknesses: gc.weaknesses,
      careerPlan: gc.careerPlan,
      closingStatement: gc.closingStatement,
      reverseQuestions: JSON.parse(gc.reverseQuestions || "[]") as ReverseQuestion[],
      anticipatedQuestions: JSON.parse(gc.anticipatedQuestions || "[]") as AnticipatedQuestion[],
      preInterviewMemo: gc.preInterviewMemo || "",
    };

    const profileData = {
      name: profile?.displayName ?? "",
      university: profile?.university ?? "",
      faculty: profile?.faculty ?? "",
      gakuchika: profile?.gakuchika ?? "",
      strengths: profile?.strengths ?? "",
      weaknesses: profile?.weaknesses ?? "",
      jobAxis: profile?.jobAxis ?? "",
      background: profile?.background ?? "",
    };

    const extras = await generateSheetExtras(
      company.companyName,
      company.jobType,
      company.interviewPhase,
      company.desiredTalent,
      profileData,
      content
    );

    const text = buildTextSheet({
      companyName: company.companyName,
      jobType: company.jobType,
      interviewPhase: company.interviewPhase,
      userName: profileData.name || "応募者",
      university: profileData.university,
      faculty: profileData.faculty,
      content,
      extras,
    });

    return Response.json({
      company: {
        id: company.id,
        companyName: company.companyName,
        jobType: company.jobType,
        interviewPhase: company.interviewPhase,
        desiredTalent: company.desiredTalent,
        companyPhilosophy: company.companyPhilosophy,
        articles: company.articles,
      },
      profile: {
        name: profileData.name || "応募者",
        university: profileData.university,
        faculty: profileData.faculty,
      },
      content,
      extras,
      text,
    });
  } catch (error) {
    console.error("Sheet generation error:", error);
    return Response.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
