import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AuthForm from "../AuthForm";
import Landing from "../Landing";

// 此頁依 cookie 讀取登入狀態，需在請求時渲染
export const instant = false;

export default async function RegisterPage() {
  if (await getSession()) redirect("/");
  return (
    <Landing>
      <AuthForm mode="register" />
    </Landing>
  );
}
