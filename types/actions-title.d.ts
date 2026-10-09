export type ActionsTitle = {
    label: string;
    type: 'button' | 'submit' | 'link';
    url?: string;
    // add btn + | save btn guardar | edit btn Editar | delete btn eliminar | import btn Importar | export btn Exportar | back btn Regresar
    action: 'login' | 'add' | 'store' | 'edit' | 'delete' | 'import' | 'export' | 'back';
    isLoading?: boolean;
    // Deshabilitado (un link deshabilitado se muestra como botón inactivo)
    disabled?: boolean;
    // Texto al pasar el mouse (ej. motivo por el que está deshabilitado)
    title?: string;
    onClick?: () => void;
}