import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { companyName } = await request.json();
    if (!companyName) return Response.json({ error: "企業名が必要です" }, { status: 400 });

    const prompt = `あなたは企業リサーチの専門家です。「${companyName}」について、採用面接対策に役立つ情報を日本語でまとめてください。

以下のJSON形式のみで回答してください（マークダウン不要）:

{
  "companyPhilosophy": "${companyName}の企業理念・ビジョン・ミッション・バリューを具体的に。公式サイトやIR情報をもとに200字程度で。",
  "desiredTalent": "${companyName}が採用で求める人材像・スキル・価値観を200字程度で。",
  "articles": "${companyName}の最近の取り組み・新事業・注目ポイント・業界での立ち位置・成長戦略を300字程度で。面接の逆質問に使えるトピックも含める。"
}

情報が不確かな場合は「確認が必要ですが〜」と前置きして推測で補完してください。`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const text = completion.choices[0].message.content ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const data = JSON.parse(cleaned);

    return Response.json(data);
  } catch (error) {
    console.error("Research error:", error);
    return Response.json({ error: "調査に失敗しました" }, { status: 500 });
  }
}
