export const getStateBadgeClasses = (state?: string | null): string => {
    switch (state) {
        case "AUTORIZADO":
            return "bg-green-700 text-white";
        case "ANULADO":
            return "bg-red-700 text-white";
        case "PENDIENTE DE ANULAR":
            return "bg-[#ff6347] text-white";
        case "CREADO":
        case "FIRMADO":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900";
        case "RECIBIDA":
        case "ENVIADO":
            return "bg-lime-200 text-lime-800 dark:bg-lime-300 dark:text-lime-900";
        case "NO AUTORIZADO":
        case "EN PROCESO":
        case "DEVUELTA":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-300 dark:text-yellow-900";
        default:
            return "";
    }
};
