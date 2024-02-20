import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { redirect } from 'next/navigation'
import { getChat } from '../actions';

export default async function IndexPage() {
  
  const id = nanoid()
  const user = await auth()
  if (!user) {
    redirect(`/sign-in`)
  } else {
    const messages = await getChat(user.userId)
    return <Chat id={id} initialMessages={messages?.messages} />
  }
}
