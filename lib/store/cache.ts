import { create } from 'zustand'
import { Agent } from '../types'

interface CacheStore {
  agents: Agent[] | null
  setAgents: (agents: Agent[]) => void
}

const useCacheStore = create<CacheStore>(set => ({
  agents: null,
  setAgents: (agents: Agent[] | null) => set({ agents })
}))

export default useCacheStore
