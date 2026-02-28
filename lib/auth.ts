import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "./axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        user: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.user || !credentials.password)
          return null;
        const res = await axios.post("login", {
          user: credentials.user,
          password: credentials.password,
        });

        const user = res.data;
        return user ? user : null;
      },
    }),
  ],
  // pages: { signIn: "/app/auth/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.user = user; // Store the token
      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user; // Pass the token to the session
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Add this line
};
