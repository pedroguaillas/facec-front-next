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
        if (!credentials || !credentials.user || !credentials.password) return null;
        const res = await axios.post("api/login", {
          user: credentials.user,
          password: credentials.password
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

      // Refrescar el token si está vencido
      const { exp } = jwtDecode<{ exp: number }>((token.user as { token: string }).token);

      if (Date.now() >= exp * 1000) {
        try {
          const res = await axios.get("api/refreshtoken", {
            headers: { Authorization: `Bearer ${(token.user as { token: string }).token}` },
          });

          (token.user as { token: string }).token = res.data.token;
        } catch (error) {
          // console.error("Error refrescando el token EN CALLBACKS: ", error);
          // 🔴 Redirigir al login
          console.log(error)
          signOut({ callbackUrl: "/app/auth/login" });
          // Retorno el user null para invalidar la sesión
          return {};
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
