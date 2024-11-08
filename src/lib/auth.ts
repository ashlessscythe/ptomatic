import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Role, UserStatus } from "@prisma/client";
import { JWT } from "next-auth/jwt";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    status: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      status: UserStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: Role;
    status: UserStatus;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Handle sign up
          if (credentials.isSignUp === "true") {
            if (!credentials.name) {
              throw new Error("Name is required for sign up");
            }

            const existingUser = await prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
            });

            if (existingUser) {
              throw new Error("Email already registered");
            }

            const hashedPassword = await hash(credentials.password, 10);
            const user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.name,
                password: hashedPassword,
                role: Role.USER,
                status: UserStatus.PENDING,
              },
            });

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              status: user.status,
            };
          }

          // Handle sign in
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            throw new Error("Invalid email or password");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error("Invalid email or password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
      } else if (token?.id) {
        // Check for user status/role changes on subsequent requests
        const currentUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, status: true },
        });

        if (!currentUser) {
          // User no longer exists
          throw new Error("User not found");
        }

        if (currentUser.role !== token.role || currentUser.status !== token.status) {
          // Force sign out if role or status has changed
          throw new Error("User role or status has changed");
        }
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role as Role,
          status: token.status as UserStatus,
        },
      };
    },
  },
  debug: process.env.NODE_ENV === "development",
};
