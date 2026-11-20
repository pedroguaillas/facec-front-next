"use client";

import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import React, { useCallback, useEffect, useState } from 'react'
import { ModalFormBranch } from './ModalFormBranch';
import { IconButton } from '@/components';
import { Branch } from '@/types';

export const BranchesList = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const axiosAuth = useAxiosAuth();

    const fetchGetBraches = useCallback(async () => {
        const response = await axiosAuth.get('branches');
        setBranches(response.data)
    }, [axiosAuth])

    useEffect(() => {
        fetchGetBraches()
    }, [axiosAuth, fetchGetBraches]);

    return (
        <>
            <ModalFormBranch fetchGetBraches={fetchGetBraches} isFirstBranch={branches.length === 0} />
            <div className="w-full overflow-x-auto py-4">
                <table className="w-full">
                    <thead>
                        <tr className="[&>th]:py-2 [&>th]:dark:border-gray-500">
                            <th className='text-left'>Logo</th>
                            <th className='text-left'>Estab</th>
                            <th className='text-left'>Nombre</th>
                            <th className='text-left'>Dirección</th>
                            <th>Tipo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch) => (
                            <tr key={branch.store}
                                className="[&>td]:p-1"
                            >
                                <td>
                                    {branch.logo_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={branch.logo_url} alt={`Logo establecimiento ${branch.store}`} className="w-8 h-8 object-contain rounded" />
                                    ) : (
                                        <span className="text-xs text-ink-3" title="Usa el logo de la empresa">Empresa</span>
                                    )}
                                </td>
                                <td>{(branch.store + '').padStart(3, '0')}</td>
                                <td>{branch.name}</td>
                                <td>{branch.address}</td>
                                <td className='text-center'>{branch.type}</td>
                                <td>
                                    <div className='flex justify-end gap-2'>
                                        <IconButton type="link" action="view" url={`/settings/branches/${branch.id}`} title="Puntos de emisión" />
                                        <ModalFormBranch fetchGetBraches={fetchGetBraches} editBranch={branch} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        <tr></tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
