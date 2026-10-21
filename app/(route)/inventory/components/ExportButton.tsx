"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useToast } from "@/context/ToastContext";
import { downloadFile } from "@/helpers/downloadHelper";

interface Props {
    url: string;
    params: Record<string, string | number | undefined>;
    fileName: string;
    label?: string;
    disabled?: boolean;
}

// Descarga en Excel el reporte con los mismos filtros de la pantalla
export const ExportButton = ({ url, params, fileName, label = 'Exportar', disabled }: Props) => {
    const axiosAuth = useAxiosAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        const error = await downloadFile(axiosAuth, url, params, fileName);
        setIsLoading(false);
        if (error) toast(error, 'error');
    };

    return (
        <PrimaryButton label={label} type="button" action="export" onClick={handleClick} isLoading={isLoading} disabled={disabled} compact />
    );
};
