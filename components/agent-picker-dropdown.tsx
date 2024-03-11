'use client'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import {
  IconArrowDown,
  IconExternalLink,
  IconModel,
  IconSpinner
} from './ui/icons'
import useCacheStore from '@/lib/store/cache'
import { useEffect } from 'react'
import { getAgents } from '@/app/actions'
import toast from 'react-hot-toast'
import useAppStore from '@/lib/store/app'
import { useRouter } from 'next/navigation'
import { Agent } from '@/lib/types'

export function AgentPickerDropdown() {
  const { agents, setAgents } = useCacheStore()
  const { activeAgent, setActiveAgent } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (agents === null) {
      getAgents()
        .then(agents => {
          setAgents(agents)
          setActiveAgent(agents.find(v => v.agent_id === 'ocada') as Agent)
        })
        .catch(err => toast.error('Agents fetch failed'))
    }
  }, [])

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 w-full justify-between bg-[#171717] px-4 shadow-none transition-colors hover:bg-zinc-200/40 border-none mb-2 rounded-full ring-[3px] ring-[#1a1a1a] flex'
            )}
          >
            {activeAgent ? (
              activeAgent.name
            ) : (
              <IconSpinner className="mr-2 animate-spin" />
            )}
            <IconModel className="-translate-x-2" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          {agents &&
            agents.map(agent =>
              agent.agent_id === activeAgent?.agent_id ? null : (
                <>
                  <DropdownMenuItem
                    onClick={() => {
                      setActiveAgent(agent)
                      router.push('/')
                    }}
                  >
                    {agent.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
