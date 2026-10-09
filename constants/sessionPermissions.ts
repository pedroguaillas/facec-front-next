// Permisos que el cliente puede cambiar desde Configuración > Permisos y se reflejan
// en la sesión sin re-loguear (useSession().update). El plan solo viene del login.
export const SESSION_UPDATABLE_PERMISSIONS = ["printf", "guia_in_invoice", "import_in_invoice", "import_in_invoices"] as const;
