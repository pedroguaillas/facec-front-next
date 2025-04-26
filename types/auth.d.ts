// types/auth.ts

export type AuthUser = {
    decimal: number;
    expires_in: number;
    inventory: boolean;
    token: string;
    token_type: string;
    user: {
      id: number;
      user: string;
      email: string;
      avatar: null;
      user_type_id: number;
    };
  };
  