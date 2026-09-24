"use client";

import { useEffect, useState } from "react";
import { SelectOption } from "@/components";
import { getUsersLookup } from "@/services/userServices";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { UserLookup } from "@/types";

interface Props {
    label?: string;
    name: string;
    selectedValue: number | string;
    error?: string;
    handleSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const SelectUser = ({ label = 'Responsable', name, selectedValue, error, handleSelect }: Props) => {

    const axiosAuth = useAxiosAuth();
    const [users, setUsers] = useState<UserLookup[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await getUsersLookup(axiosAuth);
            if (data) {
                setUsers(data);
            }
        }
        fetchUsers();
    }, [axiosAuth]);

    const options = users.map(user => ({
        value: user.id,
        label: `${user.name} - ${user.email}`,
    }));

    return (
        <SelectOption
            label={label}
            name={name}
            options={options}
            selectedValue={selectedValue}
            error={error}
            handleSelect={handleSelect}
            select
            required
        />
    )
}
