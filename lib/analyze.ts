import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const CATEGORIES = ["餐飲", "交通", "購物", "娛樂", "居住", "醫療", "教育", "薪資", "其他"] as const;

export type Analysis = {
  type: "expense" | "income";
  amount: number;
  currency: string;
  category: (typeof CATEGORIES)[number];
  description: string;
  date: string; // YYYY-MM-DD
};

export async function analyzeText(text: string): Promise<Analysis> {
  const today = new Date().toISOString().slice(0, 10);
  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `你是記帳助理。把使用者的一段文字解析成一筆帳。今天是 ${today}，"昨天"、"上週五"等相對日期請換算成 YYYY-MM-DD；沒提到日期就用今天。沒提到幣別預設 TWD。`,
      },
      { role: "user", content: text },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "expense",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["type", "amount", "currency", "category", "description", "date"],
          properties: {
            type: { type: "string", enum: ["expense", "income"] },
            amount: { type: "number", description: "正數金額" },
            currency: { type: "string" },
            category: { type: "string", enum: [...CATEGORIES] },
            description: { type: "string", description: "簡短描述" },
            date: { type: "string", description: "YYYY-MM-DD" },
          },
        },
      },
    },
  });
  const content = res.choices[0]?.message.content;
  if (!content) throw new Error("OpenAI 沒有回傳內容");
  return JSON.parse(content) as Analysis;
}
