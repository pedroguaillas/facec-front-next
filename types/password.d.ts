export interface ForgotPasswordPayload {
    user: string;
}

export interface ResetPasswordPayload {
    user: string;
    token: string;
    password: string;
    password_confirmation: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    password: string;
    password_confirmation: string;
}

export interface PasswordMessageResponse {
    succes: boolean;
    message: string;
    email?: string;
}
