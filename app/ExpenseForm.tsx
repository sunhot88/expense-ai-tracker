"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon, { type IconName } from "./Icon";

type Expense = {
  _id: string;
  type: "expense" | "income";
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
};

// fg：圖示與長條顏色；bg：圖示底色
const CATEGORY_STYLE: Record<string, { fg: string; bg: string }> = {
  餐飲: { fg: "#ea580c", bg: "#fff1e6" },
  交通: { fg: "#2563eb", bg: "#e8f0ff" },
  購物: { fg: "#db2777", bg: "#fdebf4" },
  娛樂: { fg: "#7c3aed", bg: "#f1eaff" },
  居住: { fg: "#0d9488", bg: "#e2f7f4" },
  醫療: { fg: "#dc2626", bg: "#feeaea" },
  教育: { fg: "#ca8a04", bg: "#fdf5d9" },
  薪資: { fg: "#16a34a", bg: "#e5f7ea" },
  其他: { fg: "#64748b", bg: "#eef1f5" },
};
const styleOf = (c: string) => CATEGORY_STYLE[c] ?? CATEGORY_STYLE["其他"];
const iconOf = (c: string): IconName => (c in CATEGORY_STYLE ? (c as IconName) : "其他");

function CategoryBadge({ category, size = 44 }: { category: string; size?: number }) {
  const s = styleOf(category);
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl"
      style={{ width: size, height: size, background: s.bg, color: s.fg }}
    >
      <Icon name={iconOf(category)} size={Math.round(size * 0.46)} stroke={2} />
    </span>
  );
}

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const pad = (n: number) => String(n).padStart(2, "0");
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmt = (n: number) => Math.round(n).toLocaleString();

export default function ExpenseForm({ userName }: { userName: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"month" | "year">("month");
  const [month, setMonth] = useState(todayStr().slice(0, 7));
  const [selected, setSelected] = useState(todayStr());
  const [items, setItems] = useState<Expense[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const stripRef = useRef<HTMLDivElement>(null);
  const year = month.slice(0, 4);

  // key 為 "YYYY-MM"（月）或 "YYYY"（年）
  const load = useCallback(async (key: string) => {
    const res = await fetch(`/api/expenses?${key.length === 4 ? "year" : "month"}=${key}`);
    if (res.ok) setItems((await res.json()).items);
  }, []);

  const loadKey = mode === "year" ? year : month;
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/expenses?${loadKey.length === 4 ? "year" : "month"}=${loadKey}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setItems(data.items);
      });
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function switchMode(next: "month" | "year") {
    if (next === mode) return;
    setItems([]);
    setMode(next);
  }

  // 當月所有日期
  const days = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => {
      const day = i + 1;
      return {
        key: `${month}-${pad(day)}`,
        day,
        week: WEEK[new Date(y, m - 1, day).getDay()],
      };
    });
  }, [month]);

  // 捲動到選取日期
  useEffect(() => {
    stripRef.current
      ?.querySelector<HTMLElement>(`[data-date="${selected}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected, month]);

  const datesWithRecords = useMemo(() => new Set(items.map((i) => i.date.slice(0, 10))), [items]);
  const dayItems = items.filter((i) => i.date.slice(0, 10) === selected);
  const dayTotal = dayItems.reduce((s, i) => s + (i.type === "expense" ? i.amount : -i.amount), 0);

  const stats = useMemo(() => {
    const expenses = items.filter((i) => i.type === "expense");
    const total = expenses.reduce((s, i) => s + i.amount, 0);
    const income = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const byCat = new Map<string, number>();
    expenses.forEach((i) => byCat.set(i.category, (byCat.get(i.category) ?? 0) + i.amount));
    const list = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
    // 年統計用：每月支出
    const monthly = Array.from({ length: 12 }, () => 0);
    expenses.forEach((i) => {
      monthly[Number(i.date.slice(5, 7)) - 1] += i.amount;
    });
    return { total, income, list, monthly };
  }, [items]);

  function goMonth(next: string) {
    setMonth(next);
    setSelected(next === todayStr().slice(0, 7) ? todayStr() : `${next}-01`);
  }

  function shift(delta: number) {
    setItems([]);
    if (mode === "year") {
      goMonth(`${Number(year) + delta}-${month.slice(5)}`);
      return;
    }
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    goMonth(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "發生錯誤");
      setText("");
      const saved = data.saved.date.slice(0, 10) as string;
      const m = saved.slice(0, 7);
      setSelected(saved);
      if (m !== month) setMonth(m);
      await load(mode === "year" ? m.slice(0, 4) : m);
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setLoading(false);
    }
  }

  const isYear = mode === "year";
  const isCurrent = isYear ? year === todayStr().slice(0, 4) : month === todayStr().slice(0, 7);
  const period = isYear ? "年" : "月";
  const [yy, mm] = month.split("-");
  const maxMonthly = Math.max(...stats.monthly, 1);
  const currentMonthIdx = isCurrent && isYear ? new Date().getMonth() : -1;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg">
      <main className="flex-1 space-y-6 px-5 pb-36 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {/* 頂列：使用者 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-pop">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <div className="leading-tight">
              <div className="text-xs text-sub">歡迎回來</div>
              <div className="font-bold text-ink">{userName}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-sub shadow-card transition active:scale-95"
            aria-label="登出"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>

        {/* 月／年切換 */}
        <div className="flex rounded-2xl bg-[#e9ebf5] p-1 text-sm">
          {(["month", "year"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-xl py-2 font-medium transition ${
                mode === m ? "bg-surface text-ink shadow-sm" : "text-sub"
              }`}
            >
              {m === "month" ? "月統計" : "年統計"}
            </button>
          ))}
        </div>

        {/* 總覽卡片 */}
        <section className="relative overflow-hidden rounded-[28px] bg-surface p-5 shadow-card">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-brand/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-pink-400/15 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <button
                onClick={() => shift(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-sub transition active:scale-95"
                aria-label="上一期"
              >
                <Icon name="prev" size={18} />
              </button>
              <span className="text-sm font-medium text-ink">{isYear ? `${yy} 年` : `${yy} 年 ${Number(mm)} 月`}</span>
              <button
                onClick={() => shift(1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-bg text-sub transition active:scale-95"
                aria-label="下一期"
              >
                <Icon name="next" size={18} />
              </button>
            </div>
            <div className="mt-6 text-sm text-sub">{isCurrent ? `本${period}目前支出` : `當${period}支出`}</div>
            <div className="mt-1 flex items-baseline gap-1 text-ink">
              <span className="text-2xl font-medium text-sub">$</span>
              <span className="text-5xl font-bold tracking-tight tabular-nums">{fmt(stats.total)}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-[#e5f7ea] px-3 py-1 text-xs font-medium text-[#15803d]">
                收入 +${fmt(stats.income)}
              </span>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
                {items.length} 筆紀錄
              </span>
            </div>
          </div>
        </section>

        {/* 年統計：每月支出長條圖，點選可跳到該月 */}
        {isYear && (
          <section className="rounded-3xl bg-surface p-5 shadow-card">
            <h2 className="mb-4 text-sm font-bold text-ink">每月支出</h2>
            <div className="flex h-36 items-end gap-1.5">
              {stats.monthly.map((v, i) => {
                const key = `${year}-${pad(i + 1)}`;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setItems([]);
                      goMonth(key);
                      setMode("month");
                    }}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                    aria-label={`${i + 1} 月 ${fmt(v)}`}
                  >
                    <div
                      className={`w-full rounded-lg ${v > 0 ? "bg-brand" : "bg-line"} ${
                        i === currentMonthIdx ? "" : v > 0 ? "opacity-70" : ""
                      }`}
                      style={{ height: `${v > 0 ? Math.max((v / maxMonthly) * 100, 6) : 4}%` }}
                    />
                    <span className={`text-[10px] ${i === currentMonthIdx ? "font-bold text-brand" : "text-faint"}`}>
                      {i + 1}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-faint">點選長條可查看該月明細</p>
          </section>
        )}

        {/* 各項目統計 */}
        <section className="rounded-3xl bg-surface p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold text-ink">
            {isCurrent ? "本" : "當"}
            {period}各項目花費
          </h2>
          {stats.list.length === 0 ? (
            <p className="py-3 text-center text-sm text-faint">還沒有支出</p>
          ) : (
            <>
              <div className="mb-5 flex h-3 gap-0.5 overflow-hidden rounded-full">
                {stats.list.map(([c, v]) => (
                  <div
                    key={c}
                    className="first:rounded-l-full last:rounded-r-full"
                    style={{ width: `${(v / stats.total) * 100}%`, background: styleOf(c).fg }}
                  />
                ))}
              </div>
              <ul className="space-y-4">
                {stats.list.map(([c, v]) => (
                  <li key={c} className="flex items-center gap-3">
                    <CategoryBadge category={c} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-ink">{c}</span>
                        <span className="text-sm font-bold tabular-nums text-ink">${fmt(v)}</span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(v / stats.total) * 100}%`, background: styleOf(c).fg }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs tabular-nums text-faint">
                          {Math.round((v / stats.total) * 100)}%
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* 可滑動日期 */}
        {!isYear && (
          <section>
            <div
              ref={stripRef}
              className="-mx-5 flex snap-x gap-2.5 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {days.map((d) => {
                const active = d.key === selected;
                const isToday = d.key === todayStr();
                return (
                  <button
                    key={d.key}
                    data-date={d.key}
                    onClick={() => setSelected(d.key)}
                    className={`flex w-[52px] shrink-0 snap-center flex-col items-center gap-1 rounded-2xl border py-2.5 transition ${
                      active
                        ? "border-brand bg-brand text-white shadow-pop"
                        : "border-line bg-surface text-ink shadow-card"
                    }`}
                  >
                    <span className={`text-xs ${active ? "text-white/80" : "text-faint"}`}>{d.week}</span>
                    <span className={`text-lg font-bold tabular-nums ${!active && isToday ? "text-brand" : ""}`}>
                      {d.day}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        datesWithRecords.has(d.key) ? (active ? "bg-white" : "bg-brand") : "bg-transparent"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 當日紀錄 */}
        {!isYear && (
          <section>
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="text-base font-bold text-ink">
                {selected === todayStr() ? "今天" : selected.slice(5).replace("-", "/")}
              </h2>
              {dayItems.length > 0 && (
                <span className="text-sm text-sub">
                  合計 <b className="tabular-nums text-ink">${fmt(dayTotal)}</b>
                </span>
              )}
            </div>
            <ul className="space-y-3">
              {dayItems.map((it) => (
                <li key={it._id} className="flex items-center gap-3.5 rounded-3xl bg-surface p-3.5 shadow-card">
                  <CategoryBadge category={it.category} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-ink">{it.description}</div>
                    <div className="mt-0.5 text-xs text-faint">{it.category}</div>
                  </div>
                  <div
                    className={`text-base font-bold tabular-nums ${it.type === "income" ? "text-[#16a34a]" : "text-ink"}`}
                  >
                    {it.type === "income" ? "+" : "-"}${fmt(it.amount)}
                  </div>
                </li>
              ))}
              {dayItems.length === 0 && (
                <li className="rounded-3xl border border-dashed border-[#d9dcec] bg-surface/60 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Icon name="spark" size={22} />
                  </div>
                  <div className="text-sm font-medium text-ink">這天還沒有紀錄</div>
                  <div className="mt-1 text-xs text-faint">在下方輸入一句話，AI 幫你記帳</div>
                </li>
              )}
            </ul>
          </section>
        )}
      </main>

      {/* 底部輸入列 */}
      <form
        onSubmit={submit}
        className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-line bg-white/85 px-5 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl"
      >
        {error && <p className="mb-2 px-1 text-xs text-red-600">{error}</p>}
        <div className="flex items-center gap-2.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：午餐拉麵 250"
            enterKeyHint="send"
            className="h-12 min-w-0 flex-1 rounded-full border border-line bg-bg px-5 text-base text-ink outline-none transition placeholder:text-faint focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
          />
          <button
            disabled={loading || !text.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-pop transition active:scale-95 disabled:opacity-40 disabled:shadow-none"
            aria-label="記一筆"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Icon name="send" size={20} stroke={2.4} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
