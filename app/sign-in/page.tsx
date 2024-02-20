import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LoginButtonMetamask } from '@/components/login-button-metamask'

export default async function SignInPage() {
  const user = await auth()
  // redirect to home if user is already logged in
  if (user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <LoginButtonMetamask />
    </div>
  )
}
