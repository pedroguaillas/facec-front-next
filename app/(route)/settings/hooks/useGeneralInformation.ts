import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { ChangeEvent, useEffect, useState } from "react";
import { downloadSignService, getCompany, updateCompany } from "../services/companyServices";

export const useGeneralInformation = () => {
    const axiosAuth = useAxiosAuth();

    const [form, setForm] = useState({
        id: 0,
        ruc: '',
        company: '',
        rimpe: 0,
        accounting: false,
        retention_agent: false,
        pass_cert: '',
        logo: null as File | null,
        logo_dir: null as string | null,
        logo_url: null as string | null,
        cert: null as File | null,
        sign_valid_to: '',
        has_cert: false,
    });

    const [editingCert, setEditingCert] = useState(false);

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

    const clearFile = (name: 'logo' | 'cert') => {
        setForm(prev => ({ ...prev, [name]: null }))
    }

    const editCert = () => setEditingCert(true);

    const cancelEditCert = () => {
        setEditingCert(false);
        setForm(prev => ({ ...prev, cert: null, pass_cert: '' }));
    }

    const submit = async () => {
        const formData = new FormData();
        formData.append('rimpe', form.rimpe + '');
        formData.append('accounting', String(form.accounting));
        formData.append('retention_agent', form.retention_agent ? '1' : '0');
        formData.append('sign_valid_to', form.sign_valid_to);

        if (form.logo) {
            formData.append('logo', form.logo);
        }

        if (editingCert && form.cert) {
            formData.append('cert', form.cert);
            formData.append('pass_cert', form.pass_cert);
        }

        const { data } = await updateCompany(axiosAuth, formData);

        if (data) {
            alert('Se ha editado los datos');
            setEditingCert(false);
            setForm(prev => ({ ...prev, cert: null, pass_cert: '', ...(data as unknown as Partial<typeof prev>) }));
        }
    }

    const downloadSign = async () => {
        const { data } = await downloadSignService(axiosAuth);
        if (!data) return;

        const a = document.createElement('a') //Create <a>
        a.href = 'data:text/xml;base64,' + data.cert //Image Base64 Goes here
        a.download = `${form.company}.p12` //File name Here
        a.click() //Downloaded file
    }

    useEffect(() => {
        const fetchCompany = async () => {
            const { data } = await getCompany(axiosAuth);
            if (!data) return;

            setForm(prev => ({
                ...prev,
                ...(data as unknown as Partial<typeof prev>),
                // Guard: backend a veces manda "company" como objeto anidado (relación/accessor
                // homónimo, ver laravel_through_key) en vez del string de razón social.
                company: typeof data.company === 'string' ? data.company : prev.company,
            }))

            setEditingCert(!data.has_cert);
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

    return { optionType, form, editingCert, editCert, cancelEditCert, handleChange, handleCheckbox, handleFile, clearFile, submit, downloadSign }
}