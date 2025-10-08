import CredentialsProvider from "next-auth/providers/credentials";

import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" },
        firstName: { label: "First Name", type: "text" },
        lastName: { label: "Last Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const { email, password, action, firstName, lastName } = credentials;
        return {
          id: "1",
          name: "Test User",
          email: email,
          password: password,
          action: action,
          firstName: firstName,
          lastName: lastName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback", { session, token });
      //   if (token && session.user) {
      //     session.user.id = token.user.id;
      //     session.user.email = token.user.email;
      //     session.user.name = token.user.name;
      //   }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
