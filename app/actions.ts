'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) return []
  
  try {
    const results = await kv.get(`chathistory:${userId}`)
    // return results as Chat[]
    return results as Chat[]

  } catch (error) {
    return []
  }
}

export async function getChat(userId: string) {
  const chat = await kv.get(`chathistory:${userId}`) as Chat

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  // const session = await auth()

  // if (!session) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  // const uid = await kv.hget<string>(`chat:${id}`, 'userId')

  // if (uid !== session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  await kv.del(`chat:${id}`)
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  // const session = await auth()

  // if (!session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  const chats: string[] = await kv.zrange(`user:chat`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    // pipeline.zrem(`user:chat:${session.user.id}`, chat)
  }

  await pipeline.exec()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  // const session = await auth()

  // if (!session?.user?.id) {
  //   return {
  //     error: 'Unauthorized'
  //   }
  // }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  // if (!chat || chat.userId !== session.user.id) {
  //   return {
  //     error: 'Something went wrong'
  //   }
  // }

  const payload = {
    ...chat,
    // sharePath: `/share/${chat.id}`
  }

  // await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}
