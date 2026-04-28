import Groq from "groq-sdk";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface PlanConfig {
  model: string;
  temperature: number;
  promptDepth: "basic" | "enhanced" | "premium";
  includeExecutiveFeatures: boolean;
}

const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    model: "llama-3.1-8b-instant",
    temperature: 0.75,
    promptDepth: "basic",
    includeExecutiveFeatures: false,
  },
  growth: {
    model: "llama-3.3-70b-versatile",
    temperature: 0.75,
    promptDepth: "enhanced",
    includeExecutiveFeatures: false,
  },
  executive: {
    model: "llama-3.3-70b-versatile",
    temperature: 0.65,
    promptDepth: "premium",
    includeExecutiveFeatures: true,
  },
};

async function getUserPlan(userId: string | null): Promise<PlanId> {
  if (!userId) return "starter";
  const userPlan = await prisma.userPlan.findUnique({ where: { userId } });
  if (!userPlan || userPlan.status !== "active") return "starter";
  return userPlan.planId as PlanId;
}

function buildBaseInfo(body: Record<string, string>, config: PlanConfig): string {
  const {
    name, university, faculty, background, gakuchika, jobAxis,
    strengths, weaknesses, strengthsOverride, weaknessesOverride,
    motivationMemo, companyName, jobType, interviewPhase,
    companyPhilosophy, desiredTalent, articles,
  } = body;

  const effectiveStrengths = strengthsOverride || strengths;
  const effectiveWeaknesses = weaknessesOverride || weaknesses;
  const isFinale = interviewPhase === "最終面接";

  const researchSection = [
    companyPhilosophy ? `企業理念・ビジョン:\n${companyPhilosophy}` : null,
    desiredTalent ? `求める人材像:\n${desiredTalent}` : null,
    articles ? `関連記事・ニュース・IR情報:\n${articles}` : null,
    motivationMemo ? `志望理由のメモ（必ず志望理由に組み込む）:\n${motivationMemo}` : null,
  ].filter(Boolean).join("\n\n");

  const researchNote =
    config.promptDepth === "premium"
      ? "（企業研究情報は必ず具体的に引用し、一般論ではなくこの企業固有の内容にすること）"
      : config.promptDepth === "enhanced"
      ? "（企業研究情報を積極的に活用すること）"
      : "";

  return `【応募者情報】
名前: ${name}
大学: ${university} ${faculty}
就活の軸: ${jobAxis}

【自己バックグラウンド】
${background || "（未入力）"}

【ガクチカ】
${gakuchika}

【強み】
${effectiveStrengths}

【弱み】
${effectiveWeaknesses}

【${companyName}の企業研究情報】${researchNote}
${researchSection || "（未入力 — あなたが持つ知識から推定してください）"}

【面接情報】
企業名: ${companyName}
希望職種: ${jobType}
面接フェーズ: ${interviewPhase}${isFinale ? "\n※最終面接のため、他社との比較・最終意思決定の理由も意識してください。" : ""}`;
}

function buildInterviewPrompt(baseInfo: string, companyName: string, jobType: string, config: PlanConfig): string {
  const depthInstructions =
    config.promptDepth === "premium"
      ? `
0. 【最高品質の原則】すべての回答は企業研究情報を最大限活用し、この企業・職種・面接フェーズに完全に特化した内容にすること。一般的な回答は絶対に許さない。
1. PREP法（結論→理由→具体例→結論）を厳格に守る
2. 数字・固有名詞・エピソードで具体性を最大化する
3. 企業の理念・求める人材像・ニュースを必ず明示的に引用する
4. 面接官の「なぜうちの会社？」「なぜあなた？」に完璧に答える構成にする
5. 口頭で1分以内で話せるリズムと文体にする
6. 弱みは根本的な性質を就活向けに言い換え、改善行動と前向きな締めを必ず含める`
      : config.promptDepth === "enhanced"
      ? `
0. 【大原則】入力内容は「素材」として扱う。本質を保ちつつ面接向けに変換する。作り話は絶対にしない。
1. すべての回答は「結論→具体的な説明」の順（PREP法）
2. ガクチカはSTAR形式（状況→課題→行動→成果）に整理する
3. 強みは具体エピソードを含める
4. 弱みは根本にある性質を就活向けに言い換え、克服行動と前向きな締めを加える
5. 企業名・職種・バックグラウンドを各回答に絡める
6. 自然な日本語で口頭で話せる文体にする`
      : `
1. 結論から話す（PREP法）
2. 具体的なエピソードを含める
3. 企業名・職種に関連付ける
4. 自然な日本語で話せる文体にする`;

  const jsonSchema = `{
  "selfIntro": "1分程度の自己紹介",
  "motivation": "志望理由 200〜300字",
  "jobAxis": "就活の軸 150〜200字",
  "strengths": "強み 150〜200字",
  "weaknesses": "弱み 150〜200字",
  "careerPlan": "キャリアプラン 200〜250字",
  "reverseQuestions": [
    { "opinion": "自分の意見・仮説", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説", "question": "具体的な質問" }
  ],
  "closingStatement": "最後の一言 100〜150字"
}`;

  return `あなたは就活生の面接対策を専門とするトッププロのキャリアアドバイザーです。
以下の情報を最大限活用して、実際の面接で使える具体的な回答を生成してください。

${baseInfo}

【生成ルール】${depthInstructions}

以下のJSON形式のみで回答（マークダウン不要）:
${jsonSchema}`;
}

function buildEsPrompt(baseInfo: string, companyName: string, config: PlanConfig): string {
  const wordCount = config.promptDepth === "premium" ? "250〜300字" : "200〜250字";
  const qualityNote =
    config.promptDepth === "premium"
      ? "企業研究情報を具体的に引用し、この企業でなければならない理由を明確に示すこと。"
      : "";

  return `あなたはエントリーシート（ES）の添削を専門とするキャリアアドバイザーです。
以下の情報をもとに、${companyName}のESに使える文章を生成してください。

${baseInfo}

【ES生成ルール】
- 各項目${wordCount}（文字数制限に合わせた簡潔な文章）
- 文章体（体言止め・箇条書き禁止）
- 「結論→根拠→まとめ」の構成
- 具体的なエピソードを必ず含める
- 企業名・職種と関連付ける
${qualityNote}

以下のJSON形式のみで回答（マークダウン不要）:
{
  "esSelfPR": "【自己PR】${wordCount}。強みと具体的エピソード、${companyName}での活かし方を含める",
  "esAppealPoints": "【アピールポイント】${wordCount}。ガクチカや経験をもとに、この企業・職種で特にアピールできる強みや資質を具体的に記述",
  "esMotivation": "【志望理由】${wordCount}。企業研究情報を具体的に引用し、志望の根拠を明確に記述"
}`;
}

async function buildExecutiveFeatures(
  baseInfo: string,
  companyName: string,
  jobType: string,
  interviewPhase: string,
  config: PlanConfig
): Promise<{ finalInterviewDeepDive: string; competitorComparison: string; variations: Record<string, string[]> }> {
  if (!config.includeExecutiveFeatures) {
    return { finalInterviewDeepDive: "", competitorComparison: "", variations: {} };
  }

  const isFinale = interviewPhase === "最終面接";

  const executivePrompt = `あなたは最高レベルの就活コンサルタントです。以下の情報をもとに、Executive専用の深掘り分析を行ってください。

${baseInfo}

以下のJSON形式のみで回答（マークダウン不要）:
{
  "finalInterviewDeepDive": "${isFinale ? `最終面接で必ず聞かれる「なぜ競合他社ではなく${companyName}なのか」「5年後の自分のビジョン」「入社後に実現したいこと」への具体的な回答。300〜400字。` : `${companyName}の面接で想定される深掘り質問3〜5個と、それぞれへの回答例。`}",
  "competitorComparison": "同業他社と比較した場合の${companyName}の強み・差別化ポイントと、それを踏まえた志望理由への組み込み方。200〜300字。",
  "strengthVariation": "強みの別バリエーション回答（メインの強みとは異なる角度から）150〜200字",
  "motivationVariation": "志望理由の別バリエーション（より感情的・ストーリー的な切り口で）200〜250字"
}`;

  try {
    const completion = await groq.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: executivePrompt }],
      temperature: 0.6,
    });

    const text = completion.choices[0].message.content ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return {
      finalInterviewDeepDive: data.finalInterviewDeepDive ?? "",
      competitorComparison: data.competitorComparison ?? "",
      variations: {
        strengths: [data.strengthVariation ?? ""],
        motivation: [data.motivationVariation ?? ""],
      },
    };
  } catch {
    return { finalInterviewDeepDive: "", competitorComparison: "", variations: {} };
  }
}

function parseJsonResponse(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode = "interview", companyName, jobType, interviewPhase } = body;

    const session = await getSession();
    const planId = await getUserPlan(session?.userId ?? null);
    const config = PLAN_CONFIGS[planId];

    const baseInfo = buildBaseInfo(body, config);

    let mainData: Record<string, unknown>;
    let executiveExtras = { finalInterviewDeepDive: "", competitorComparison: "", variations: {} as Record<string, string[]> };

    if (mode === "es") {
      const prompt = buildEsPrompt(baseInfo, companyName, config);
      const completion = await groq.chat.completions.create({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: config.temperature,
      });
      mainData = parseJsonResponse(completion.choices[0].message.content ?? "");
    } else {
      const prompt = buildInterviewPrompt(baseInfo, companyName, jobType, config);
      const completion = await groq.chat.completions.create({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        temperature: config.temperature,
      });
      mainData = parseJsonResponse(completion.choices[0].message.content ?? "");

      if (config.includeExecutiveFeatures) {
        executiveExtras = await buildExecutiveFeatures(
          baseInfo, companyName, jobType, interviewPhase, config
        );
      }
    }

    return Response.json({
      ...mainData,
      ...(mode !== "es" ? {
        finalInterviewDeepDive: executiveExtras.finalInterviewDeepDive,
        competitorComparison: executiveExtras.competitorComparison,
        variations: executiveExtras.variations,
      } : {}),
      _plan: planId,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
