import { auth } from '@/auth'
import { LoginButtonSolana } from '@/components/login-button-solana'
import { Header } from '@/components/header'
import { redirect } from 'next/navigation'

export default async function SignInPage() {
  return (
    <div>
      <Header />
      <LoginButtonSolana />
    </div>
  )
}
