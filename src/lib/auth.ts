import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'eep-professor-luis-felipe-secret-key-2026-super-secure',
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const operator = await prisma.operator.findUnique({
          where: { email: credentials.email as string },
          include: { role: true },
        })
        
        if (!operator || !operator.isActive) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          operator.passwordHash
        )
        
        if (!isValid) return null
        
        return {
          id: operator.id,
          name: operator.name,
          email: operator.email,
          role: operator.role.name,
          roleId: operator.roleId,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.roleId = (user as any).roleId
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).roleId = token.roleId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
