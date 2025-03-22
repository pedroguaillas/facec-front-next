import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            decimal: Number,
            expires_in: Number,
            inventory: Boolean,
            token: string,
            token_type: String,
            user: { id: Number, user: String, email: String, avatar: null, user_type_id: Number }
        };
    };
}