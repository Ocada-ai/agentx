import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
  auth: {}
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface User extends Record<string, any> {
  id: string
  userId: string
  auth: {
    genNonce: number,
    lastAuth: string,
    lastAuthStatus: string
  }
}