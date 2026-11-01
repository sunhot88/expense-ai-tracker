import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import ExpenseForm from "./ExpenseForm";

// 此頁依 cookie 讀取登入狀態，需在請求時渲染
export const instant = false;

export default async function Home() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <ExpenseForm userName={session.name} />;
}
