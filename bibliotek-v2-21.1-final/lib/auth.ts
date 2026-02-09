import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Utvid JWT token type
declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    rolle?: string
    bibliotekkortnummer?: string
  }
}

// Utvid Session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      rolle?: string
      bibliotekkortnummer?: string
    }
  }
  
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    rolle?: string
    bibliotekkortnummer?: string
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "bibliotekkortet",
      name: "Bibliotekkortet",
      credentials: {
        bibliotekkortnummer: { label: "Lånekort", type: "text", placeholder: "1234567890" },
        pin: { label: "PIN-kode", type: "password", placeholder: "****" }
      },
      async authorize(credentials) {
        if (!credentials?.bibliotekkortnummer || !credentials?.pin) {
          return null
        }

        // Finn bruker
        const bruker = await prisma.bruker.findUnique({
          where: {
            bibliotekkortnummer: credentials.bibliotekkortnummer,
          },
        })

        if (!bruker) {
          return null
        }

        // Sjekk om bruker er aktiv
        if (!bruker.aktiv) {
          return null
        }

        // For demo: Aksepter PIN "1234" for alle brukere
        // I produksjon: const pinValid = await compare(credentials.pin, bruker.pin || "")
        const pinValid = credentials.pin === "1234"

        if (!pinValid) {
          return null
        }

        // Return bruker-objekt
        return {
          id: bruker.id,
          name: bruker.navn,
          email: bruker.epost || null,
          image: bruker.image || null,
          rolle: bruker.rolle,
          bibliotekkortnummer: bruker.bibliotekkortnummer,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.rolle = user.rolle
        token.bibliotekkortnummer = user.bibliotekkortnummer
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id
        session.user.rolle = token.rolle
        session.user.bibliotekkortnummer = token.bibliotekkortnummer
      }
      return session
    },
  },
}

