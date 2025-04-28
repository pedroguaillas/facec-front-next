"use client";

import { FaSearch } from 'react-icons/fa';
import React, { useState } from 'react';
import ModalSelectRetention from './ModalSelectRetention';

export const SelectRetention = () => {

    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<boolean>(false);
    const error = true;

    const toogle = () => {
        setModal(!modal);
    }

    return (
        <div className='flex flex-col w-full'>
            <div className='flex w-full'>
                <input
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    placeholder='...'
                    className={`w-full border border-primary hover:border-primaryhover rounded-l px-2
                                  ${error ? 'border-red-500 focus:ring-red-400' : 'border-slate-400 focus:ring-blue-500'}`}
                    type='text'
                />
                <button onClick={toogle} className='rounded-r p-2 bg-primary text-white cursor-pointer'>
                    <FaSearch />
                </button>
                <ModalSelectRetention show={modal} onClose={toogle} />
            </div>
        </div>
    )
}
