import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { createSession } from "@/lib/session";
import { User } from "@/models/User";

// 註冊驗證碼（暫時寫死）
const REGISTER_CODE = "love";

// POST /api/auth/register  body: { email, password, name, code }（role 由系統預設為 user）
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (code !== REGISTER_CODE) return Response.json({ error: "驗證碼錯誤" }, { status: 403 });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "Email 格式不正確" }, { status: 400 });
  if (password.length < 8) return Response.json({ error: "密碼至少需要 8 個字元" }, { status: 400 });
  if (!name) return Response.json({ error: "請輸入名稱" }, { status: 400 });

  try {
    await connectDB();
    if (await User.exists({ email })) return Response.json({ error: "此 Email 已被註冊" }, { status: 409 });
    const user = await User.create({ email, name, passwordHash: await bcrypt.hash(password, 10) });
    await createSession({ userId: String(user._id), name: user.name, role: user.role });
    return Response.json({ user: { email: user.email, name: user.name, role: user.role } }, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "註冊失敗" }, { status: 500 });
  }
}
