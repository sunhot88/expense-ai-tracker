import Icon from "./Icon";

const FEATURES = [
  {
    icon: "spark",
    title: "一句話自動記帳",
    desc: "輸入「昨天跟朋友吃火鍋 480」，AI 會辨識金額、分類與日期，連「昨天」「上週五」都看得懂。",
    fg: "#4f46e5",
    bg: "#eef0ff",
  },
  {
    icon: "chart",
    title: "月與年統計",
    desc: "各分類占比一目了然，年統計還有每月支出長條圖，花在哪裡不再模糊。",
    fg: "#db2777",
    bg: "#fdebf4",
  },
  {
    icon: "shield",
    title: "每人獨立帳本",
    desc: "每個帳號只看得到自己記下的紀錄，登入後狀態會保留，下次打開直接使用。",
    fg: "#0d9488",
    bg: "#e2f7f4",
  },
] as const;

const STEPS = [
  { n: "1", title: "註冊並登入", desc: "輸入 Email、密碼與名稱，幾秒完成。" },
  { n: "2", title: "輸入一句話", desc: "像聊天一樣描述這筆花費。" },
  { n: "3", title: "查看統計", desc: "日、月、年的收支與分類自動整理好。" },
];

const BARS = [
  { name: "餐飲", pct: 46, amount: "5,820", color: "#ea580c" },
  { name: "交通", pct: 28, amount: "3,540", color: "#2563eb" },
  { name: "購物", pct: 18, amount: "2,280", color: "#db2777" },
  { name: "娛樂", pct: 8, amount: "980", color: "#7c3aed" },
];

function PhoneDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <div className="pointer-events-none absolute -inset-8 rounded-full bg-brand/15 blur-3xl" />
      <div className="relative rounded-[36px] border border-line bg-surface p-3 shadow-[0_30px_60px_-20px_rgb(79_70_229/0.35)]">
        <div className="space-y-3 rounded-[28px] bg-bg p-4">
          {/* 使用者輸入 */}
          <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm text-white shadow-[0_8px_20px_-6px_rgb(79_70_229/0.45)]">
            昨天晚上跟朋友吃火鍋 480
          </div>
          {/* AI 解析結果 */}
          <div className="rounded-2xl bg-surface p-3 shadow-card">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-brand">
              <Icon name="spark" size={12} /> AI 已幫你記好
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: "#fff1e6", color: "#ea580c" }}
              >
                <Icon name="餐飲" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ink">跟朋友吃火鍋</div>
                <div className="text-xs text-faint">餐飲 · 昨天</div>
              </div>
              <div className="text-sm font-bold tabular-nums text-ink">-$480</div>
            </div>
          </div>
          {/* 統計 */}
          <div className="rounded-2xl bg-surface p-3 shadow-card">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-xs font-bold text-ink">本月各項目</span>
              <span className="text-[11px] text-faint">$12,620</span>
            </div>
            <div className="space-y-2.5">
              {BARS.map((b) => (
                <div key={b.name}>
                  <div className="mb-1 flex justify-between text-[11px]">
                    <span className="text-sub">{b.name}</span>
                    <span className="font-medium tabular-nums text-ink">${b.amount}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 登入／註冊共用的 Landing Page 外框；children 為表單卡片
export default function Landing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-bg">
      <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-[520px] h-[360px] w-[360px] rounded-full bg-pink-400/10 blur-3xl" />

      {/* 導覽列 */}
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-5 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-pop">
            <Icon name="spark" size={18} />
          </span>
          <span className="font-bold text-ink">SUNNY的AI家庭記帳本</span>
        </div>
        <div className="hidden items-center gap-6 text-sm text-sub sm:flex">
          <a href="#features" className="transition hover:text-ink">
            功能特色
          </a>
          <a href="#how" className="transition hover:text-ink">
            使用方式
          </a>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-24 md:pt-16">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-brand shadow-card">
            <Icon name="spark" size={13} /> AI 驅動的智慧記帳
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight text-ink sm:text-5xl">
            一句話，
            <br />
            <span className="bg-gradient-to-r from-brand to-pink-500 bg-clip-text text-transparent">
              AI 幫你記好帳
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-sub sm:text-lg">
            不用選分類、不用填表單。像傳訊息一樣說出你的花費，剩下的交給 AI，隨時掌握每日、每月、每年的收支。
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-ink">
            {["自動辨識金額、分類與日期", "日／月／年統計一目了然", "手機優先，隨時隨地記"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e5f7ea] text-[#16a34a]">
                  <Icon name="shield" size={12} stroke={2.5} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* 表單卡片 */}
        <div className="relative">{children}</div>
      </header>

      {/* 產品預覽 */}
      <section className="relative mx-auto max-w-5xl px-5 pb-20">
        <PhoneDemo />
      </section>

      {/* 功能特色 */}
      <section id="features" className="relative mx-auto max-w-5xl scroll-mt-6 px-5 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-balance text-xl font-bold tracking-tight text-ink sm:text-3xl">為什麼選擇 SUNNY的AI家庭記帳本</h2>
          <p className="mt-2 text-sm text-sub">把記帳變成十秒鐘的小事</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-3xl bg-surface p-6 shadow-card">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: f.bg, color: f.fg }}
              >
                <Icon name={f.icon} size={22} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-sub">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 使用方式 */}
      <section id="how" className="relative mx-auto max-w-5xl scroll-mt-6 px-5 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">三步驟開始</h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="flex items-start gap-4 rounded-3xl border border-line bg-surface/70 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-pop">
                {s.n}
              </span>
              <div>
                <h3 className="font-bold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-sub">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="relative border-t border-line py-8 text-center text-xs text-faint">
        © {new Date().getFullYear()} SUNNY的AI家庭記帳本
      </footer>
    </div>
  );
}
