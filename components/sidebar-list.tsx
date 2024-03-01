import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string) => {
  return await getChats(userId)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const chats = await loadChats(userId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden min-h-full">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 relative">
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
