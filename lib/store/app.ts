import { create } from 'zustand'
import { Agent } from '../types'

interface AppStore {
  activeAgent: Agent | null // agent_id
  setActiveAgent: (agent: Agent) => void
}

const useAppStore = create<AppStore>(set => ({
  activeAgent: null,
  setActiveAgent: agent => set({ activeAgent: agent })
}))

export default useAppStore
