"use client";

import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import React, { useCallback, useEffect, useState } from 'react'
import { ModalFormBranch } from './ModalFormBranch';
import Link from 'next/link';

export const BranchesList = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const axiosAuth = useAxiosAuth();

    const fetchGetBraches = useCallback(async () => {
        const response = await axiosAuth.get('branches');
        setBranches(response.data.branches)
    }, [axiosAuth])

    useEffect(() => {
        fetchGetBraches()
    }, [axiosAuth, fetchGetBraches]);

    return (
        <>
            <ModalFormBranch fetchGetBraches={fetchGetBraches} />
            <div className="w-full overflow-x-auto py-4">
                <table className="w-full">
                    <thead>
                        <tr className="[&>th]:py-2 [&>th]:dark:border-gray-500">
                            <th className='text-left'>Estab</th>
                            <th className='text-left'>Nombre</th>
                            <th className='text-left'>Dirección</th>
                            <th>Tipo</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch, index) => (
                            <tr key={branch.store}
                                className={`${index % 2 === 0 ? 'bg-gray-200 dark:bg-gray-900 rounded' : ''} [&>td]:p-1`}
                            >
                                <td>{(branch.store + '').padStart(3, '0')}</td>
                                <td>{branch.name}</td>
                                <td>{branch.address}</td>
                                <td className='text-center'>{branch.type}</td>
                                <td className='text-blue-500 hover:underline text-right'>
                                    <Link href={`/settings/branches/${branch.id}`}>Puntos de emisión</Link>
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
