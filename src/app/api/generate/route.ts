import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name, university, faculty, background, gakuchika, jobAxis,
      strengths, weaknesses,
      strengthsOverride, weaknessesOverride, motivationMemo,
      companyName, jobType, interviewPhase,
      companyPhilosophy, desiredTalent, articles,
      mode = "interview",
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

    const baseInfo = `【応募者情報】
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

【${companyName}の企業研究情報】
${researchSection || "（未入力 — あなたが持つ知識から推定してください）"}

【面接情報】
企業名: ${companyName}
希望職種: ${jobType}
面接フェーズ: ${interviewPhase}${isFinale ? "\n※最終面接のため、他社との比較・最終意思決定の理由も意識してください。" : ""}`;

    let prompt: string;

    if (mode === "es") {
      prompt = `あなたはエントリーシート（ES）の添削を専門とするキャリアアドバイザーです。
以下の情報をもとに、${companyName}のESに使える文章を生成してください。

${baseInfo}

【ES生成ルール】
- 各項目200〜250字（文字数制限に合わせた簡潔な文章）
- 文章体（体言止め・箇条書き禁止）
- 「結論→根拠→まとめ」の構成
- 具体的なエピソードを必ず含める
- 企業名・職種と関連付ける
- 読み手が理解しやすい平易な日本語

以下のJSON形式のみで回答（マークダウン不要）:
{
  "esSelfPR": "【自己PR】200〜250字の文章",
  "esGakuchika": "【ガクチカ】200〜250字の文章。STAR形式（状況・課題・行動・成果）を意識",
  "esMotivation": "【志望動機】200〜250字の文章。企業研究情報を具体的に引用"
}`;
    } else {
      prompt = `あなたは就活生の面接対策を専門とするトッププロのキャリアアドバイザーです。
以下の情報を最大限活用して、実際の面接で使える具体的な回答を生成してください。

${baseInfo}

【生成ルール】
0. 【大原則】入力内容は「素材」として扱う。すでに就活の場に適した表現・エピソードはそのまま活かす。口語・箇条書き・荒削りな表現は本質を保ちつつ面接向けに変換する。作り話は絶対にしない。

1. すべての回答は「結論→具体的な説明」の順（PREP法）

2. 【ガクチカ・自己紹介】入力されたエピソードをそのまま使い、STAR形式（状況→課題→行動→成果）に整理する。数字や具体的な成果が含まれていれば必ず活かす。

3. 【強み】入力が具体的なエピソードを含んでいればそのまま活用。「細かい作業が得意」のような抽象表現は、バックグラウンドから具体エピソードを補って肉付けする。

4. 【弱み】入力をそのまま使わず必ず変換する：根本にある性質を読み取り就活向けの言葉に言い換え、エピソード・気づき・克服行動・前向きな締めを加える。

5. 【就活の軸・志望理由】入力をそのまま使えるなら活用。抽象表現はバックグラウンドと企業情報を結びつけて具体化する。

6. 逆質問は企業研究情報を具体的に引用し、自分の意見・仮説を述べてから質問する

7. 企業名・職種・バックグラウンドを各回答に必ず絡める

8. 自然な日本語で口頭で話せる文体にする

以下のJSON形式のみで回答（マークダウン不要）:

{
  "selfIntro": "結論（氏名・大学・一言キャッチコピー）→ガクチカの要点をSTAR形式で簡潔に→バックグラウンドから滲む人柄→締め。1分程度。",
  "motivation": "結論（一言で志望理由）→バックグラウンド・ガクチカから生まれた問題意識や価値観→${companyName}の理念・事業・取り組みとの一致（企業研究情報を具体的に引用）→志望理由メモがあれば必ず組み込む→締め。200〜300字。",
  "jobAxis": "結論（軸を一言）→その軸を持つに至ったバックグラウンドのエピソード→${companyName}でその軸が実現できる根拠→締め。150〜200字。",
  "strengths": "結論（具体化した一言）→バックグラウンドやガクチカから引き出した具体エピソード→${jobType}でどう活かすか→締め。150〜200字。",
  "weaknesses": "根本にある性質を就活向けに言い換えた結論→その性質が出たエピソード→気づき→克服への具体的行動→前向きな締め。150〜200字。",
  "careerPlan": "結論（将来像を一言）→入社3年目の具体目標→5年目→10年後のビジョン→${companyName}でそれが実現できる根拠→締め。200〜250字。",
  "reverseQuestions": [
    {
      "opinion": "${companyName}の理念・記事・取り組みを具体的に引用した上での自分の意見・仮説",
      "question": "その仮説を踏まえた具体的な質問"
    },
    {
      "opinion": "${jobType}として働く上で大切にしたいことへの自分の考え",
      "question": "現場の実態や文化に関する具体的な質問"
    },
    {
      "opinion": "長期的なキャリアや成長について自分が目指す方向性",
      "question": "${companyName}でのキャリアパスや成長機会に関する質問"
    }
  ],
  "closingStatement": "結論（熱意を一言）→入社後にやりたいことの具体像→締め（強い意志）。100〜150字。"
}`;
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75,
    });

    const text = completion.choices[0].message.content ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return Response.json(data);
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json({ error: "生成に失敗しました" }, { status: 500 });
  }
}
