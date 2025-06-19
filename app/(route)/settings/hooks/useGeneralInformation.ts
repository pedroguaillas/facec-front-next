import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { ChangeEvent, useEffect, useState } from "react";

export const useGeneralInformation = () => {
    const axiosAuth = useAxiosAuth();

    const [form, setForm] = useState({
        ruc: '',
        company: '',
        rimpe: 0,
        accounting: false,
        retention_agent: false,
        pass_cert: '',
        logo: null as File | null,
        cert: null as File | null,
        sign_valid_to: ''
    });

    const optionType = [
        { label: 'GENERAL', value: '0' },
        { label: 'RIMPE EMPRENDEDOR', value: '1' },
        { label: 'RIMPE NEGOCIO POPULAR', value: '2' },
    ]

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckbox = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: checked }))
    }

    const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (!files?.length) return
        setForm(prev => ({ ...prev, [name]: files?.[0] }))
    }

    const submit = async () => {
        const formData = new FormData();
        formData.append('rimpe', form.rimpe + '');
        formData.append('accounting', String(form.accounting));
        formData.append('retention_agent', form.retention_agent ? '1' : '0');
        formData.append('pass_cert', form.pass_cert);
        formData.append('sign_valid_to', form.sign_valid_to);

        if (form.logo) {
            formData.append('logo', form.logo);
        }

        if (form.cert) {
            formData.append('cert', form.cert);
        }

        const response = await axiosAuth.post('company_update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.status) {
            alert('Se ha editado los datos');
        }
    }

    const downloadSign = async () => {
        try {
            const response = await axiosAuth.get('downloadsign');
            const a = document.createElement('a') //Create <a>
            a.href = 'data:text/xml;base64,' + response.data.cert //Image Base64 Goes here
            a.download = `${form.company}.p12` //File name Here
            a.click() //Downloaded file
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const fetchCompany = async () => {
            const response = await axiosAuth.get('companies');
            setForm(response.data.company)
        }

        fetchCompany()
    }, [axiosAuth])

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!form.cert || !form.pass_cert) return;

            try {
                const formData = new FormData();
                formData.append('cert', form.cert);
                formData.append('password', form.pass_cert);

                const response = await fetch('/api/read-cert', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json();
                    console.error('Certificado inválido o expirado:', err.message);
                    return;
                }

                const data = await response.json();
                setForm(prev => ({ ...prev, sign_valid_to: data.expiresAt }))
            } catch (err) {
                console.error('Error leyendo el certificado:', err);
            }
        };

        fetchCertificate();
    }, [form.cert, form.pass_cert]);

    return { optionType, form, handleChange, handleCheckbox, handleFile, submit, downloadSign }
}