// import NextAuth from "next-auth";
import { AuthUser } from "./types/auth"; // ajusta la ruta si está en otro lugar

declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }
  interface JWT {
    user: AuthUser;
  }
}
