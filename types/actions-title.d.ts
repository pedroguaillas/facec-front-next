export type ActionsTitle = {
    label: string;
    type: 'button' | 'submit' | 'link';
    url?: string;
    // add btn + | save btn guardar | edit btn Editar | delete btn eliminar | import btn Importar | export btn Exportar 
    action: 'add' | 'store' | 'edit' | 'delete' | 'import' | 'export';
    isLoading?: boolean;
    onClick?: () => void;
}