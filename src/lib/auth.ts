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
        
        // Never put large data URIs into the auth session to prevent 494 HTTP header cookie limits
        const safeAvatar = operator.avatarUrl && operator.avatarUrl.startsWith('http') && operator.avatarUrl.length < 500
          ? operator.avatarUrl
          : null;

        return {
          id: operator.id,
          name: operator.name,
          nickname: operator.nickname || null,
          email: operator.email,
          image: safeAvatar,
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
        
        // Strict guard against large avatar payloads in JWT cookie
        const img = (user as any).image;
        token.picture = img && typeof img === 'string' && img.startsWith('http') && img.length < 500 ? img : null;
        token.nickname = (user as any).nickname || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.image = (token.picture as string) || null
        ;(session.user as any).role = token.role
        ;(session.user as any).roleId = token.roleId
        ;(session.user as any).nickname = token.nickname || null
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
