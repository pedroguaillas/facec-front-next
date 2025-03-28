export type Meta = {
    current_page: number;
    last_page: number;
    path: string;
    per_page?: number;
    total?: number;
    links?: Links; // Se hace opcional para evitar errores si no se incluye
} & Record<string, any>; // Permite agregar propiedades adicionales sin romper el código

export type Links = {
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
};

export type PaginateProps = {
    meta: Meta | null;
    reqNewPage: (e: React.MouseEvent<HTMLButtonElement>, url: string) => void;
};
