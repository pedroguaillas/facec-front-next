import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "./axios";
import { AxiosError } from "axios";
import { EMAIL_UNVERIFIED } from "@/constants/register";
import { AuthUser } from "@/types";
import { SESSION_UPDATABLE_PERMISSIONS } from "@/constants/sessionPermissions";

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
        try {
          const res = await axios.post("login", {
            user: credentials.user,
            password: credentials.password,
          });

          const user = res.data;
          return user ? user : null;
        } catch (err) {
          // Correo sin confirmar (registro público): el login lo distingue para ofrecer reenviar el correo
          const data = (err as AxiosError<{ error?: string }>).response?.data;
          if (data?.error === EMAIL_UNVERIFIED) throw new Error(EMAIL_UNVERIFIED);
          return null;
        }
      },
    }),
  ],
  // pages: { signIn: "/app/auth/login" },
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) token.user = user; // Store the token
      // useSession().update({ permissions }) tras guardar en Configuración > Permisos:
      // solo se aceptan estas banderas (el plan y demás permisos vienen únicamente del login)
      // useSession().update({ refreshPlan: true }) tras activar la prueba Financiero:
      // el plan se vuelve a pedir al backend con el token del usuario
      if (trigger === "update" && session?.refreshPlan && token.user) {
        const current = token.user as AuthUser;
        try {
          const { data } = await axios.get("subscription/current", { headers: { Authorization: `Bearer ${current.token}` } });
          token.user = {
            ...current,
            permissions: {
              ...current.permissions,
              plan: data.plan ?? null,
              plan_ends_at: data.plan_ends_at ?? null,
              financiero: !!data.financiero,
              financiero_trial_available: !!data.financiero_trial_available,
            },
          };
        } catch {
          // Sin respuesta se conserva el plan anterior
        }
      }
      if (trigger === "update" && session?.permissions && token.user) {
        const current = token.user as AuthUser;
        const updatable = SESSION_UPDATABLE_PERMISSIONS.filter(key => typeof session.permissions[key] === "boolean");
        token.user = {
          ...current,
          permissions: {
            ...current.permissions,
            ...Object.fromEntries(updatable.map(key => [key, session.permissions[key]])),
          },
        };
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
