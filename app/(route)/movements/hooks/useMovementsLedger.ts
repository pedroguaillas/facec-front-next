"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getDate } from "@/helpers/dateHelper";
import { getMovements, getMovementsSummary } from "@/services/movementServices";
import { Links, Meta, Movement, MovementSummary } from "@/types";

export type Direction = 'all' | 'in' | 'out';

// "YYYY-MM" → primer y último día del mes
export const monthRange = (month: string) => {
    const [y, m] = month.split('-').map(Number);
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return { date_from: `${month}-01`, date_to: `${month}-${String(last).padStart(2, '0')}` };
};

export const shiftMonth = (month: string, delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const currentMonth = () => getDate().slice(0, 7);

export const useMovementsLedger = () => {

    const axiosAuth = useAxiosAuth();
    const { status } = useSession();
    const [month, setMonth] = useState(currentMonth());
    const [direction, setDirection] = useState<Direction>('all');
    // Cuenta bancaria a filtrar ('' = todas)
    const [bankAccountId, setBankAccountId] = useState<number | ''>('');
    const [movements, setMovements] = useState<Movement[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [links, setLinks] = useState<Links | null>(null);
    const [summary, setSummary] = useState<MovementSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMovements = useCallback(async (page = 1) => {
        if (status !== 'authenticated') return;
        const { data } = await getMovements(axiosAuth, {
            ...monthRange(month),
            ...(bankAccountId ? { party_type: 'bank_account', party_id: bankAccountId } : {}),
            ...(direction !== 'all' ? { direction } : {}),
            paginate: 30,
            page,
        });
        if (data) {
            setMovements(data.data);
            setMeta(data.meta);
            setLinks(data.links);
        }
        setIsLoading(false);
    }, [axiosAuth, status, month, bankAccountId, direction]);

    const fetchSummary = useCallback(async () => {
        if (status !== 'authenticated') return;
        const { data } = await getMovementsSummary(axiosAuth, {
            ...monthRange(month),
            ...(bankAccountId ? { party_type: 'bank_account', party_id: bankAccountId } : {}),
        });
        setSummary(data ?? null);
    }, [axiosAuth, status, month, bankAccountId]);

    useEffect(() => { fetchMovements(); }, [fetchMovements]);
    useEffect(() => { fetchSummary(); }, [fetchSummary]);

    // Tras clasificar un movimiento: se reemplaza en la lista y se recalcula el resumen
    const replaceMovement = (updated: Movement) => {
        setMovements(prev => prev.map(it => (it.id === updated.id ? updated : it)));
        fetchSummary();
    };

    return {
        month, setMonth, direction, setDirection, bankAccountId, setBankAccountId,
        movements, meta, links, summary, isLoading,
        fetchMovements, fetchSummary, replaceMovement,
    };
};
