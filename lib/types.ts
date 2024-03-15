import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  user_id: string
  title: string
  created_at: Date
  // path: string
  // messages: Message[]
  // sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>
