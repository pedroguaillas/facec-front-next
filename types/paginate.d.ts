interface GeneralPaginate<T> {
    data: T[];
    links: Links;
    meta: Meta;
}

interface Meta {
    current_page: number;
    last_page: number;
    path: string;
    per_page?: number;
    total?: number;
    links?: LinkMeta; // Se hace opcional para evitar errores si no se incluye
}; // Permite agregar propiedades adicionales sin romper el código

interface Links {
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
};

interface LinkMeta {
    url: string | null;
    label: string;
    active: boolean;
}

export type PaginateProps = {
    meta: Meta | null;
    reqNewPage: (e: React.MouseEvent<HTMLButtonElement>, url: string) => void;
};
