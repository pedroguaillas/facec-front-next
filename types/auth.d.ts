export type AuthUser = {
  expires_in: number;
  token: string;
  token_type: string;
  // permisos
  permissions: {
    inventory: boolean;
    decimal: number;
    printf: boolean;
    guia_in_invoice: boolean;
    import_in_invoice: boolean;
    import_in_invoices: boolean;
  };
  // usuario
  user: {
    id: number;
    user: string;
    email: string;
    avatar: null;
    user_type_id: number;
  };
}