import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export interface Agent extends Record<string, any> {
  agent_id: string
  name: string
  apiKey: string
  apiEndpoint: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
