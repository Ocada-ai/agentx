'use client'
import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import useAppStore from '@/lib/store/app'
import { cache } from 'react'

interface SidebarListProps {
  userId?: string
  agentId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string, agentId?: string) => {
  return await getChats(userId, agentId)
})

export async function SidebarList({ userId, agentId }: SidebarListProps) {
  const { activeAgent } = useAppStore()
  const chats = await loadChats(userId, activeAgent?.agent_id)

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-full">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-1 relative">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground ml-7">
              No chat history
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between py-4 px-0 mt-auto">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}
