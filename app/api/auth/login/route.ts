import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { createSession } from "@/lib/session";
import { User } from "@/models/User";

// POST /api/auth/login  body: { email, password }
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return Response.json({ error: "請輸入 Email 與密碼" }, { status: 400 });

  try {
    await connectDB();
    const user = await User.findOne({ email });
    // 不區分「帳號不存在」與「密碼錯誤」，避免被用來探測帳號
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ error: "Email 或密碼錯誤" }, { status: 401 });
    }
    await createSession({ userId: String(user._id), name: user.name, role: user.role });
    return Response.json({ user: { email: user.email, name: user.name, role: user.role } });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "登入失敗" }, { status: 500 });
  }
}
