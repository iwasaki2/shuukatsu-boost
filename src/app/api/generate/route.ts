import Groq from "groq-sdk";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

let _groq: Groq | null = null;
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
}

interface PlanConfig {
  model: string;
  temperature: number;
  promptDepth: "basic" | "enhanced" | "premium";
  includeExecutiveFeatures: boolean;
}

class AppError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    model: "llama-3.3-70b-versatile",
    temperature: 0.65,
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
6. 入力文をそのまま清書するのではなく、事実を変えずに就活で最も評価されやすい言葉へ再編集する
7. 強みは抽象語で終わらせず、仕事で再現性のある行動特性として見せる
8. 弱みは根本的な性質を就活向けに言い換え、改善行動と前向きな締めを必ず含める
9. ガクチカはSTAR形式で整理し、行動・工夫・成果・学びが明確に伝わるように美化する
10. 志望理由は「なぜこの会社か」「なぜこの職種か」「なぜ自分が合うか」が一読で伝わるようにする
11. 強み・弱みは元の入力文をなぞらず、構成から組み直して別の完成文として書く
12. 各回答の冒頭1文は必ず結論を言い切る
13. 面接官に刺さるキーワードや実績、差別化要素は **この形式** で太字強調する
14. 太字にする箇所は一般論で決めず、その企業の事業内容・面接フェーズ・求める人物像を踏まえて「この会社の面接官が反応しそうな論点」だけを選ぶ`
      : config.promptDepth === "enhanced"
      ? `
0. 【大原則】入力内容は「素材」として扱う。本質を保ちつつ面接向けに変換する。作り話は絶対にしない。
1. すべての回答は「結論→具体的な説明」の順（PREP法）
2. ガクチカはSTAR形式（状況→課題→行動→成果）に整理する
3. 入力文をそのまま整形するのではなく、就活で強く見える完成文に再編集する
4. 強みは具体エピソードを含め、仕事でも再現性がありそうに見える表現にする
5. 弱みは根本にある性質を就活向けに言い換え、克服行動と前向きな締めを加える
6. 志望理由は企業研究との接続を強め、企業名・職種・バックグラウンドを各回答に絡める
7. 自然な日本語で口頭で話せる文体にする
8. 強み・弱みは入力文の単なる言い換えではなく、結論・根拠・具体例・仕事での活かし方まで補って構造化する
9. 各回答の冒頭1文は必ず結論を言い切る
10. 面接官に刺さるキーワードや実績、差別化要素は **この形式** で太字強調する
11. 太字にする箇所は、その企業の面接官が重視しそうな論点に絞って選ぶ`
      : `
1. 結論から話す（PREP法）
2. 具体的なエピソードを含める
3. 入力文をそのまま使わず、就活向けに前向きで完成度の高い表現へ磨く
4. 強みは評価されやすい行動特性として、弱みは改善努力が伝わる形で書く
5. 志望理由は企業名・職種に関連付ける
6. 自然な日本語で話せる文体にする
7. 強み・弱みは元の文をほぼそのまま使わず、面接回答として十分な長さと具体性を持つ別の文章に再構成する
8. 各回答の冒頭1文は必ず結論を言い切る
9. 面接官に刺さるキーワードや実績、差別化要素は **この形式** で太字強調する
10. 太字にする箇所は、その企業の仕事内容や面接官の関心を想定して選ぶ`;

  const jsonSchema = `{
  "selfIntro": "自己紹介 320〜420字",
  "motivation": "志望理由 320〜420字",
  "jobAxis": "就活の軸 220〜320字",
  "strengths": "強み 320〜420字。結論→具体エピソード→仕事での再現性まで含める",
  "weaknesses": "弱み 320〜420字。結論→出やすい場面→改善行動→現在の向き合い方まで含める",
  "careerPlan": "キャリアプラン 320〜420字",
  "reverseQuestions": [
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" }
  ],
  "closingStatement": "最後に一言 150〜200字",
  "anticipatedQuestions": [
    {
      "category": "志望理由",
      "intent": "面接官が見たい点",
      "hook": "最初の一言フック（15〜25字）",
      "question": "想定質問",
      "answerShort": "短答版 60〜90字",
      "answer": "本番回答 180〜260字",
      "followUps": ["この回答のあとに来やすい深掘り質問1", "この回答のあとに来やすい深掘り質問2"],
      "mustMention": ["必ず入れる固有名詞や実績1", "必ず入れる固有名詞や実績2"],
      "risk": "この回答で突っ込まれやすい点",
      "pivot": "詰まった時に戻す論点"
    }
  ],
  "preInterviewMemo": "面接直前に一読すれば準備完了の5行まとめ。各行を「・」で始め、①志望の核心（なぜこの会社か一言で）②強みと引用すべきエピソード③弱みのフォロー方針④最も使いたい逆質問⑤入社後に実現したいこと、の順で書く"
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
- 入力文をそのまま整形せず、事実を変えない範囲で就活向けに完成度高く磨く
- 強みは仕事で活きる再現性が伝わるように書く
- 弱みや課題感を連想させる要素がある場合は、改善努力と学びが伝わる表現に変換する
- ガクチカは行動・工夫・成果・学びが見えるように再構成する
- 志望理由は「なぜこの会社か」が明確に伝わるよう企業研究情報と結びつける
${qualityNote}

以下のJSON形式のみで回答（マークダウン不要）:
{
  "esSelfPR": "【自己PR】${wordCount}。強みと具体的エピソード、${companyName}での活かし方を含める",
  "esAppealPoints": "【アピールポイント】${wordCount}。ガクチカや経験をもとに、この企業・職種で特にアピールできる強みや資質を具体的に記述",
  "esMotivation": "【志望理由】${wordCount}。企業研究情報を具体的に引用し、志望の根拠を明確に記述"
}`;
}

function extractJsonCandidate(text: string): string {
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  if (!cleaned) {
    throw new AppError("AIから空のレスポンスが返されました。", 502);
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  throw new AppError("AIの応答をJSONとして解釈できませんでした。", 502);
}

function parseJsonResponse(text: string): Record<string, unknown> {
  try {
    return JSON.parse(extractJsonCandidate(text));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("AIの応答形式が崩れていたため、生成結果を読み取れませんでした。", 502);
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "生成に失敗しました";
}

function getErrorStatus(error: unknown): number {
  if (error instanceof AppError) return error.status;
  return 500;
}

async function requestStructuredJson(
  prompt: string,
  model: string,
  temperature: number
): Promise<Record<string, unknown>> {
  const completion = await getGroq().chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });

  const text = completion.choices[0].message.content ?? "";

  try {
    return parseJsonResponse(text);
  } catch (error) {
    const repairPrompt = `以下はJSONとして返すべきAIの応答ですが、形式が崩れています。
意味を変えずに、有効なJSONオブジェクト1つだけへ修復してください。
説明・注釈・マークダウンは一切不要です。JSONのみ返してください。

壊れた応答:
${text}`;

    const repaired = await getGroq().chat.completions.create({
      model,
      messages: [{ role: "user", content: repairPrompt }],
      temperature: 0,
    });

    const repairedText = repaired.choices[0].message.content ?? "";

    try {
      return parseJsonResponse(repairedText);
    } catch {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("AIの応答形式が崩れていたため、生成結果を読み取れませんでした。", 502);
    }
  }
}

async function polishInterviewOutput(
  baseInfo: string,
  rawData: Record<string, unknown>,
  config: PlanConfig
): Promise<Record<string, unknown>> {
  const polishPrompt = `あなたは新卒就活の最終仕上げを担当するトップレベルのキャリアアドバイザーです。
以下の「元の入力情報」と「一次生成された回答案」をもとに、内容を就活向けに磨き直してください。

【最重要ルール】
- 事実関係は変えない
- 実績・経歴・数字を捏造しない
- ただし、表現は甘くせず、面接で評価されやすい完成文へ再編集する
- ただし、表現は甘くせず、面接で評価されやすい完成文へ再編集する
- 子どもっぽい言い回し、曖昧な言い回し、繰り返し表現は避ける
- 給与・待遇への関心が入力に含まれていても、そのまま露骨に書かず、「専門性を高められる環境」「成果に見合う評価」「中長期で納得感のあるキャリア形成」など、就活で自然な表現へ変換する
- 志望理由は必ず「なぜこの会社か」「なぜこの職種か」「自分の経験がどう接続するか」が伝わる構成にする
- 強みは抽象語で終わらせず、行動特性と再現性が伝わる文章にする
- 弱みは印象が悪くなりすぎないように言い換えつつ、改善努力と現在の向き合い方を入れる
- 就活の軸は本音を残しつつも、面接でそのまま話せる成熟した表現にする
- 最後に一言は繰り返しではなく、志望度と面接機会への感謝で締める
- 強み・弱み・志望理由・キャリアプランは、一次生成案の文をなぞらず、別の完成文として書き直す
- 特に強み・弱みは十分な文字数を使い、短すぎる一段落で終わらせない
- 各回答は必ず最初の1文で結論を言い切る
- 面接官に刺さるキーワード、差別化要素、成果、志望の核心は **太字** で2〜4箇所強調する
- 太字化は一般的な目立ちやすさではなく、その企業の面接官が評価しやすい論点かどうかで判断する
- 例えば、物流企業なら「現場理解」「実装と運用の接続」「業界課題への解像度」、SaaS企業なら「顧客課題理解」「再現性」「改善サイクル」など、企業ごとに基準を変える
- 読みやすさのため、必要に応じて改行を入れてよい
- anticipatedQuestions は8〜12問作る
- anticipatedQuestions は面接フェーズに応じて優先順位を変える
  - 1次面接: 人柄・基礎・コミュニケーション確認を厚めに
  - 2次面接: 志望度・ガクチカ再現性・職種理解の深掘りを厚めに
  - 最終面接: 他社比較・入社意思・入社後貢献・価値観整合を厚めに
- anticipatedQuestions の category は、志望理由 / なぜこの会社か / なぜこの職種か / ガクチカ / 強み / 弱み / キャリアプラン / 入社後貢献 / 他社比較 の中から適切に振り分ける
- anticipatedQuestions の answer は必ず結論先行で、short と full で内容の芯を揃える
- anticipatedQuestions の mustMention には、その企業の面接官に刺さる固有論点を2〜3個入れる

【元の入力情報】
${baseInfo}

【一次生成案】
${JSON.stringify(rawData, null, 2)}

以下のJSON形式のみで返してください:
{
  "selfIntro": "自己紹介 300〜350字",
  "motivation": "志望理由 300〜350字",
  "jobAxis": "就活の軸 300〜350字",
  "strengths": "強み 300〜350字",
  "weaknesses": "弱み 300〜350字",
  "careerPlan": "キャリアプラン 300〜350字",
  "reverseQuestions": [
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" },
    { "opinion": "自分の意見・仮説 80〜100字", "question": "具体的な質問" }
  ],
  "closingStatement": "最後に一言 150〜200字",
  "anticipatedQuestions": [
    {
      "category": "質問カテゴリ",
      "intent": "面接官の狙い",
      "hook": "最初の一言フック",
      "question": "想定質問",
      "answerShort": "短答版 60〜90字",
      "answer": "本番回答 180〜260字",
      "followUps": ["深掘り質問1", "深掘り質問2"],
      "mustMention": ["必須キーワード1", "必須キーワード2"],
      "risk": "この回答の弱点",
      "pivot": "詰まった時の戻し先"
    }
  ],
  "preInterviewMemo": "面接直前に読む5行まとめ"
}`;

return requestStructuredJson(polishPrompt, config.model, 0.35);
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
    const data = await requestStructuredJson(executivePrompt, config.model, 0.6);

    return {
      finalInterviewDeepDive: String(data.finalInterviewDeepDive ?? ""),
      competitorComparison: String(data.competitorComparison ?? ""),
      variations: {
        strengths: [String(data.strengthVariation ?? "")],
        motivation: [String(data.motivationVariation ?? "")],
      },
    };
  } catch {
    return { finalInterviewDeepDive: "", competitorComparison: "", variations: {} };
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new AppError("GROQ_API_KEY が未設定です。", 500);
    }

    const body = await request.json();
    const { mode = "interview", companyName, jobType, interviewPhase } = body;

    if (!companyName || !jobType) {
      throw new AppError("企業名と希望職種を入力してください。", 400);
    }

    const session = await getSession();
    const planId = await getUserPlan(session?.userId ?? null);
    const config = PLAN_CONFIGS[planId];

    const baseInfo = buildBaseInfo(body, config);

    let mainData: Record<string, unknown>;
    let executiveExtras = { finalInterviewDeepDive: "", competitorComparison: "", variations: {} as Record<string, string[]> };

    if (mode === "es") {
      const prompt = buildEsPrompt(baseInfo, companyName, config);
      mainData = await requestStructuredJson(prompt, config.model, config.temperature);
    } else {
      const prompt = buildInterviewPrompt(baseInfo, companyName, jobType, config);
      const firstDraft = await requestStructuredJson(prompt, config.model, config.temperature);
      mainData = await polishInterviewOutput(baseInfo, firstDraft, config);

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
    return Response.json({ error: getErrorMessage(error) }, { status: getErrorStatus(error) });
  }
}
