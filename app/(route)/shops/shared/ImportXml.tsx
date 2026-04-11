"use client";

import { resolveSupplier, storeSupplier } from "@/services/supplierServices";
import { useFormShop } from "../context/FormShopContext";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { PrimaryButton } from "@/components";
import { useFile } from "../hooks/useFile";
import { ChangeEvent, useState } from "react";
import { Supplier } from "@/types";
import { ModalConfirmSupplier } from "./ModalConfirmSupplier";

export const ImportXml = () => {
    const { selectDocXml } = useFile();
    const axiosAuth = useAxiosAuth();
    const { setSelectProvider, setShop } = useFormShop();

    const [modalOpen, setModalOpen] = useState(false);
    const [pendingSupplier, setPendingSupplier] = useState<Supplier | null>(null);

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
        const ruc = getTag(xmlDoc, "ruc");

        // const tv = parseInt(getTag(xmlDoc, "codDoc"));
        // if (tv !== voucher_type) {
        //   alert("No es un tipo de comprobante seleccionado");
        //   return;
        // }

        const { data: existing } = await resolveSupplier(axiosAuth, ruc);

        // branch_id !== 0 significa que ya existe en la BD local → usar directamente
        if (existing && existing.branch_id) {
            selectDocXml(xmlDoc, authorization, Number(existing.id));
            setSelectProvider({
                id: Number(existing.id),
                atts: { identication: existing.identication, name: existing.name, address: existing.address },
            });
            return;
        }

        // No está en la BD local (branch_id === 0 = vino del SRI, o no existe)
        // Poblar el formulario con los datos financieros del XML y abrir modal para confirmar el proveedor
        selectDocXml(xmlDoc, authorization);
        setPendingSupplier({
            id: ruc,
            type_identification: "ruc",
            identication: ruc,
            name: existing?.name ?? getTag(xmlDoc, "razonSocial"),
            address: existing?.address ?? getTag(xmlDoc, "dirMatriz"),
        });
        setModalOpen(true);
    };

    const handleModalSave = async (supplier: Supplier) => {
        const { data } = await storeSupplier(axiosAuth, supplier);

        if (data) {
            setShop((prev) => ({ ...prev, provider_id: Number(data.id) }));
            setSelectProvider({
                id: Number(data.id),
                atts: { identication: data.identication, name: data.name, address: data.address },
            });
        }

        setModalOpen(false);
    };

    const getTag = (xmlDoc: Document | Element, tag: string): string => {
        const element = xmlDoc.getElementsByTagName(tag)[0];
        return element?.textContent?.trim() ?? "";
    };

    return (
        <div className="mb-3">
            <PrimaryButton type="button" onClick={handleButton} label="Cargar XML" action="import" />
            <input type="file" id="file_invoice" onChange={handleSelectFile} className="hidden" accept=".xml" />

            {pendingSupplier && (
                <ModalConfirmSupplier
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    supplier={pendingSupplier}
                    onSave={handleModalSave}
                />
            )}
        </div>
    );
};
