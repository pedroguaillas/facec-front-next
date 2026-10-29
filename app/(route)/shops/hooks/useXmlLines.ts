import { useCallback } from "react";
import { nanoid } from "nanoid";
import { initialProductItem } from "@/constants/initialValues";
import { getProducts } from "@/services/productServices";
import { getProviderProductCodes } from "@/services/providerProductCodeServices";
import { requiresUnit } from "@/helpers/productTemplateHelper";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { useProductTemplates } from "@/lib/hooks/useProductTemplates";
import { ProductOutput, ProductPresentation, ProductProps, ProductTemplate, XmlPurchaseLine } from "@/types";

const same = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toUpperCase() === b.trim().toUpperCase();

// Línea(s) de la compra para un detalle del XML: cantidad y costo (con ICE) tal como vienen.
// Sin producto queda por vincular. Un modelo con campos por unidad (ej. moto) se separa en una
// línea por unidad, cada una con su parte del costo
export const xmlLineOutputs = (
    xml: XmlPurchaseLine,
    product: ProductProps | null,
    templates: ProductTemplate[],
    presentation: ProductPresentation | null = null,
): ProductOutput[] => {
    const quantity = xml.quantity || 1;
    const unitCost = Number((xml.cost_total / quantity).toFixed(6));
    const base: ProductOutput = {
        ...initialProductItem,
        id: nanoid(),
        xml,
        name: xml.description,
        quantity,
        price: unitCost,
        total_iva: xml.cost_total.toFixed(2),
        iva: xml.iva_code,
        percentage: xml.iva_rate,
    };
    if (!product) return [base];

    const withProduct: ProductOutput = {
        ...base,
        product_id: product.id,
        name: product.atts.name,
        unit_price: product.atts.price1,
        type_product: product.atts.type_product,
        presentations: product.presentations ?? [],
        presentation_id: presentation?.id ?? null,
        conversion_factor: presentation?.conversion_factor ?? null,
        parent_product_id: product.parent_product_id ?? null,
        characteristics: product.characteristics ?? [],
    };

    const template = !product.parent_product_id && product.product_template_id
        ? templates.find(t => t.id === product.product_template_id)
        : undefined;
    if (!template || !requiresUnit(template)) return [withProduct];

    const units = Math.max(1, Math.round(quantity));
    const unitXml = { ...xml, quantity: 1, cost_total: Number((xml.cost_total / units).toFixed(2)) };
    return Array.from({ length: units }, () => ({
        ...withProduct,
        id: nanoid(),
        xml: unitXml,
        quantity: 1,
        price: Number((xml.cost_total / units).toFixed(6)),
        total_iva: unitXml.cost_total.toFixed(2),
        presentations: [],
        presentation_id: null,
        conversion_factor: null,
        unit_template_id: template.id,
        unit: {},
        unit_code: '',
    }));
};

// Busca el producto de cada detalle del XML: primero el código vinculado a este proveedor,
// después un producto propio con el mismo código o código auxiliar
export const useXmlLines = () => {
    const axiosAuth = useAxiosAuth();
    const templates = useProductTemplates();

    const resolveLines = useCallback(async (lines: XmlPurchaseLine[], providerId?: number): Promise<ProductOutput[]> => {
        const { data: codes } = providerId ? await getProviderProductCodes(axiosAuth, providerId) : { data: [] };
        const linked = new Map((codes ?? []).map(c => [c.code.toUpperCase(), c]));

        const termsOf = (line: XmlPurchaseLine) => {
            const link = linked.get(line.code.toUpperCase());
            return link ? [link.product_code ?? ''] : [line.code, line.aux_code];
        };
        const terms = [...new Set(lines.flatMap(termsOf).filter(Boolean))];
        const results = await Promise.all(terms.map(async term => {
            const { data } = await getProducts(axiosAuth, `products?page=1&paginate=20&search=${encodeURIComponent(term)}`);
            return data?.data ?? [];
        }));
        const found = results.flat();

        return lines.flatMap(line => {
            const link = linked.get(line.code.toUpperCase());
            const product = link
                ? found.find(p => p.id === link.product_id)
                : found.find(p => [line.code, line.aux_code].some(code => same(p.atts.code, code) || same(p.atts.aux_cod ?? p.aux_cod, code)));
            const match = product ? (link ? 'provider' : 'code') : null;
            return xmlLineOutputs({ ...line, match }, product ?? null, templates);
        });
    }, [axiosAuth, templates]);

    return { resolveLines, templates };
};
