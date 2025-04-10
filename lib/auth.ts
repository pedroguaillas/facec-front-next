import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "./axios";
import { jwtDecode } from "jwt-decode";
import { signOut } from "next-auth/react";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        user: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const res = await axios.post("api/login", {
          user: credentials.user,
          password: credentials.password
        });

        const user = res.data;
        return user ? user : null;
        // if (
        //   credentials?.user === "Peterio" &&
        //   credentials?.password === "password123"
        // ) {
        //   return { id: "1", user: "Peterio", name: "Test User" };
        // }
        // return null;
      },
    }),
  ],
  // pages: { signIn: "/app/auth/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token.user = user; // Store the token

      // Refrescar el token si está vencido
      const { exp } = jwtDecode(token.user.token);
      console.log("Llega al JWT: ", token?.user?.token);

      if (Date.now() >= exp * 1000) {
        try {
          const res = await axios.get("api/refreshtoken", {
            headers: { Authorization: `Bearer ${token.user.token}` },
          });

          token.user.token = res.data.token;
        } catch (error) {
          console.error("Error refrescando el token EN CALLBACKS: ", error);
          // 🔴 Redirigir al login
          signOut({ callbackUrl: "/app/auth/login" });
          return null;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.user = token.user; // Pass the token to the session
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Add this line
};
