"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const input =
  "h-13 w-full rounded-2xl border border-line bg-bg px-4 text-base text-ink outline-none transition placeholder:text-faint focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ email: "", password: "", name: "", code: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? form : { email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-line bg-surface p-6 shadow-[0_30px_60px_-24px_rgb(79_70_229/0.3)]">
      {/* 登入／註冊切換 */}
      <div className="mb-6 flex rounded-2xl bg-[#e9ebf5] p-1 text-sm">
        {(["login", "register"] as const).map((m) => (
          <Link
            key={m}
            href={`/${m}`}
            replace
            className={`flex-1 rounded-xl py-2 text-center font-medium transition ${
              mode === m ? "bg-surface text-ink shadow-sm" : "text-sub"
            }`}
          >
            {m === "login" ? "登入" : "註冊"}
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-bold text-ink">{isRegister ? "建立你的帳號" : "歡迎回來"}</h2>
      <p className="mb-5 mt-1 text-sm text-sub">
        {isRegister ? "免費開始，用一句話輕鬆記帳" : "登入以繼續管理你的收支"}
      </p>

      <form onSubmit={submit} className="space-y-3">
        {isRegister && (
          <input value={form.name} onChange={set("name")} placeholder="名稱" autoComplete="name" required className={input} />
        )}
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="Email"
          autoComplete="email"
          required
          className={input}
        />
        <input
          type="password"
          value={form.password}
          onChange={set("password")}
          placeholder={isRegister ? "密碼（至少 8 個字元）" : "密碼"}
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={isRegister ? 8 : undefined}
          required
          className={input}
        />
        {isRegister && (
          <input value={form.code} onChange={set("code")} placeholder="驗證碼" autoComplete="off" required className={input} />
        )}
        {error && <p className="px-1 text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="mt-1 h-13 w-full rounded-2xl bg-brand font-bold text-white shadow-pop transition active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
        >
          {loading ? "處理中…" : isRegister ? "立即註冊" : "登入"}
        </button>
      </form>
    </div>
  );
}
