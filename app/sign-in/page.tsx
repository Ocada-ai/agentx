import { auth } from "@/auth";
import { LoginButtonSolana } from "@/components/login-button-solana";
import { Header } from "@/components/header";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  return (
    <div className="h-full">
      <Header />
      <LoginButtonSolana />
    </div>
  );
}
