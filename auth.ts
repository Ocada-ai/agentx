import NextAuth, { type DefaultSession } from 'next-auth'
import { headers } from 'next/headers';
import CredentialsProvider from "next-auth/providers/credentials"
// import { SiweMessage } from "siwe"
import { SigninMessage } from './utils/signMessage';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}

const providers = [
  CredentialsProvider({
    name: "Solana",
    credentials: {
      message: {
        label: "Message",
        type: "text",
        placeholder: "0x0",
      },
      signature: {
        label: "Signature",
        type: "text",
        placeholder: "0x0",
      },
      nonce: {
        label: "Nonce",
        type: "text",
      }
    },
    async authorize(credentials) {
      try {
        const msg = credentials?.message;
        const siws = new SigninMessage(JSON.parse(msg ? (msg as string) : '{}'))
        const signature = credentials?.signature;
        const result = await siws.validate(signature ? (signature as string) : '',)
        if (result) {
          return {
            id: siws.publicKey,
          }
        }
        return null
      } catch (e) {
        return null
      }
    },
  }),
]

export const {
  handlers: { GET, POST },
  auth
} = NextAuth({
  providers,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.publicKey = token.sub;
      if (session.user) {
        session.user.name = token.sub;
        session.user.image = `https://ui-avatars.com/api/?name=${token.sub}&background=random`;
      }
      return session;
    },
  },
})
