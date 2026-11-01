import { analyzeText } from "@/lib/analyze";
import { connectDB } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Expense } from "@/models/Expense";

const unauthorized = () => Response.json({ error: "請先登入" }, { status: 401 });

// POST /api/expenses  body: { "text": "今天午餐吃拉麵 250" }
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (!text) return Response.json({ error: "請提供 text 欄位" }, { status: 400 });

  try {
    const analysis = await analyzeText(text);
    await connectDB();
    const saved = await Expense.create({
      ...analysis,
      userId: session.userId,
      rawText: text,
      date: new Date(analysis.date),
    });
    return Response.json({ analysis, saved }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "分析或儲存失敗" }, { status: 500 });
  }
}

// GET /api/expenses?month=YYYY-MM 或 ?year=YYYY  列出「目前登入者」該月／該年的紀錄（預設當月）
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const params = new URL(request.url).searchParams;
  const yearParam = params.get("year");
  const monthParam = params.get("month");
  let from: Date, to: Date;
  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const y = Number(yearParam);
    from = new Date(Date.UTC(y, 0, 1));
    to = new Date(Date.UTC(y + 1, 0, 1));
  } else {
    const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : new Date().toISOString().slice(0, 7);
    const [y, m] = month.split("-").map(Number);
    from = new Date(Date.UTC(y, m - 1, 1));
    to = new Date(Date.UTC(y, m, 1));
  }
  try {
    await connectDB();
    const items = await Expense.find({ userId: session.userId, date: { $gte: from, $lt: to } }).sort({
      date: -1,
      createdAt: -1,
    });
    return Response.json({ items });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "讀取失敗" }, { status: 500 });
  }
}
