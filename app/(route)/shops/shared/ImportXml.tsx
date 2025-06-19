import { storeSupplier } from '@/services/supplierServices';
import { useFormShop } from '../context/FormShopContext';
import useAxiosAuth from '@/lib/hooks/useAxiosAuth';
import { PrimaryButton } from '@/components';
import { useFile } from '../hooks/useFile';
import { ChangeEvent } from 'react';
import { Supplier } from '@/types';

export const ImportXml = () => {

    const { selectDocXml } = useFile();
    const axiosAuth = useAxiosAuth();
    const { setSelectProvider, setShop } = useFormShop();

    const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        if (!input.files || input.files.length === 0) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                testDataXml(reader.result);
            }
        };
        reader.readAsText(input.files[0]);
    };

    const handleButton = () => {
        const input = document.getElementById("file_invoice");
        input?.click();
    };

    const testDataXml = async (xml: string) => {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(xml, "text/xml");

        const comprobanteElement = xmlDoc.querySelector("comprobante");

        if (comprobanteElement) {
            const comprobante = getTag(xmlDoc, "comprobante");
            parser = new DOMParser();
            xmlDoc = parser.parseFromString(comprobante, "text/xml");
        }

        const authorization = getTag(xmlDoc, "claveAcceso");

        selectDocXml(xmlDoc, authorization);

        // const tv = parseInt(getTag(xmlDoc, "codDoc"));
        // if (tv !== voucher_type) {
        //   alert("No es un tipo de comprobante seleccionado");
        //   return;
        // }

        const ruc = getTag(xmlDoc, "ruc");

        const provider: Supplier = {
            id: ruc,
            type_identification: "ruc",
            identication: ruc,
            name: getTag(xmlDoc, "razonSocial"),
            address: getTag(xmlDoc, "dirMatriz"),
        };

        const supplier = await storeSupplier(axiosAuth, provider);

        if (supplier) {
            setShop((prevState) => ({ ...prevState, provider_id: supplier.id }))
            setSelectProvider(supplier);
        }
    };

    const getTag = (xmlDoc: Document | Element, tag: string): string => {
        const element = xmlDoc.getElementsByTagName(tag)[0];
        return element?.textContent?.trim() ?? "";
    };

    return (
        <div className='mb-3'>
            <PrimaryButton type='button' onClick={handleButton} label='Cargar XML' action='import' />
            <input type='file' id='file_invoice' onChange={handleSelectFile} className='hidden' accept='.xml' />
        </div>
    )
}

