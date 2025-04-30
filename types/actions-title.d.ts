export type ActionsTitle = {
    label: string;
    type: 'button' | 'submit' | 'link';
    url?: string;
    action: 'add' | 'create' | 'edit' | 'delete' | 'import' | 'export';
    isLoading?: boolean;
    onClick?: () => void;
}