// import NextAuth from "next-auth";

// declare module "next-auth" {
//     interface Session {
//         user: {
//             decimal: number,
//             expires_in: number,
//             inventory: boolean,
//             token: string,
//             token_type: string,
//             user: { id: number, user: string, email: string, avatar: null, user_type_id: number }
//         };
//     };
// }

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
