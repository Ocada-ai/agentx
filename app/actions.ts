'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { kv } from '@vercel/kv'

import { auth } from '@/auth'
import { Agent, type Chat } from '@/lib/types'
import useAppStore from '@/lib/store/app'

export async function getChats(
  userId?: string | null,
  agentId?: string | null
) {
  if (!userId) {
    return []
  }

  try {
    const pipeline = kv.pipeline()
    const chats: string[] = await kv.zrange(
      `user:agent:chat:${userId}:${agentId}`,
      0,
      -1,
      {
        rev: true
      }
    )

    for (const chat of chats) {
      pipeline.hgetall(chat)
    }

    const results = await pipeline.exec()

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || (userId && chat.userId !== userId)) {
    return null
  }

  return chat
}

export async function removeChat({
  id,
  path,
  agentId
}: {
  id: string
  path: string
  agentId: string
}) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  const uid = String(await kv.hget(`chat:${id}`, 'userId'))

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  await kv.del(`chat:${id}`)
  await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`)
  await kv.zrem(`user:agent:chat:${session.user.id}:${agentId}`, `chat:${id}`)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chats: string[] = await kv.zrange(`user:chat:${session.user.id}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }
  const pipeline = kv.pipeline()

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${session.user.id}`, chat)
    pipeline.zrem(
      `user:agent:chat:${session.user.id}:${useAppStore.getState().activeAgent?.agent_id}`,
      chat
    )
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
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function getAgents() {
  const agentsId = (await kv.lrange<string>(`agents`, 0, -1)).map(
    id => 'agent:' + id
  )

  const agents = await kv.mget<Agent[]>(...agentsId)

  return agents
}

export async function getMatchingKeys(pattern: string) {
  let cursor = 0
  const iterCount = 20
  const matchedKeys: string[] = []
  while (true) {
    if (cursor === -1) break
    const [curCursor, keys] = await kv.scan(cursor, {
      count: iterCount,
      match: pattern
    })
    // console.log({ curCursor, keys })
    matchedKeys.push(...keys)
    cursor = curCursor == 0 ? -1 : curCursor
  }
  return matchedKeys
}
