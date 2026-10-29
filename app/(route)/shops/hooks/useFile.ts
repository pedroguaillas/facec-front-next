import { XmlPurchaseLine } from "@/types";
import { useFormShop } from "../context/FormShopContext";

export const useFile = () => {

    const { setShop, setXmlImported } = useFormShop();

    // Llena la cabecera y las bases con los valores del XML y devuelve sus detalles (productos)
    const selectDocXml = (xmlDoc: Document, authorization: string, provider_id?: number): XmlPurchaseLine[] => {

        const tv = parseInt(getTag(xmlDoc, 'codDoc'));
        const dateRaw = getTag(xmlDoc, 'fechaEmision');
        const dateParts = dateRaw.split('/').reverse();
        const formattedDate = dateParts.join('-');

        let no_iva = 0;
        let base0 = 0;
        let base5 = 0;
        let base12 = 0;
        let base15 = 0;
        let iva = 0;
        let iva5 = 0;
        let iva15 = 0;
        let ice = 0;
        let discount = 0;

        const descuento = getTag(xmlDoc, 'totalDescuento');
        if (descuento !== '') {
            discount = parseFloat(descuento);
        }

        const impuestos = xmlDoc.getElementsByTagName(tv === 1 ? 'totalImpuesto' : 'impuesto');

        for (let i = 0; i < impuestos.length; i++) {
            const impuesto = impuestos[i];
            const porcentaje = parseInt(getTag(impuesto, 'codigoPorcentaje'));
            const baseImponible = parseFloat(getTag(impuesto, 'baseImponible'));
            const valor = parseFloat(getTag(impuesto, 'valor'));

            switch (porcentaje) {
                case 0:
                    base0 += baseImponible;
                    break;
                case 2:
                    base12 += baseImponible;
                    iva += valor;
                    break;
                case 4:
                    base15 += baseImponible;
                    iva15 += valor;
                    break;
                case 5:
                    base5 += baseImponible;
                    iva5 += valor;
                    break;
                case 6:
                    no_iva += baseImponible;
                    break;
                default:
                    if (parseInt(getTag(impuesto, 'codigo')) === 3) {
                        ice += valor;
                    }
            }
        }

        const sub_total = no_iva + base0 + base5 + base12 + base15;
        const total = parseFloat(getTag(xmlDoc, tv === 1 ? 'importeTotal' : 'valorTotal'));

        setShop(prev => ({
            ...prev,
            serie: `${getTag(xmlDoc, 'estab')}-${getTag(xmlDoc, 'ptoEmi')}-${getTag(xmlDoc, 'secuencial')}`,
            date: formattedDate,
            authorization,
            no_iva,
            base0,
            base5,
            base12,
            base15,
            iva,
            iva5,
            iva15,
            sub_total,
            discount,
            ice,
            total,
            ...(provider_id !== undefined && { provider_id }),
        }));
        setXmlImported(true);

        return readDetails(xmlDoc);
    }

    // <detalle> de la factura: el costo con ICE es lo que paga por la línea antes del IVA
    const readDetails = (xmlDoc: Document): XmlPurchaseLine[] =>
        Array.from(xmlDoc.getElementsByTagName('detalle')).map(detalle => {
            let ice = 0;
            let iva_code = 0;
            let iva_rate = 0;
            Array.from(detalle.getElementsByTagName('impuesto')).forEach(impuesto => {
                const codigo = parseInt(getTag(impuesto, 'codigo'));
                if (codigo === 2) {
                    iva_code = parseInt(getTag(impuesto, 'codigoPorcentaje'));
                    iva_rate = parseFloat(getTag(impuesto, 'tarifa')) || 0;
                } else if (codigo === 3) {
                    ice += parseFloat(getTag(impuesto, 'valor')) || 0;
                }
            });
            const additional: Record<string, string> = {};
            Array.from(detalle.getElementsByTagName('detAdicional')).forEach(det => {
                const name = det.getAttribute('nombre')?.trim();
                if (name) additional[name] = det.getAttribute('valor')?.trim() ?? '';
            });
            return {
                // codigoInterno / codigoAdicional: versiones anteriores del esquema
                code: (getTag(detalle, 'codigoPrincipal') || getTag(detalle, 'codigoInterno')).trim(),
                aux_code: (getTag(detalle, 'codigoAuxiliar') || getTag(detalle, 'codigoAdicional')).trim(),
                description: getTag(detalle, 'descripcion').trim(),
                quantity: parseFloat(getTag(detalle, 'cantidad')) || 0,
                cost_total: Number(((parseFloat(getTag(detalle, 'precioTotalSinImpuesto')) || 0) + ice).toFixed(2)),
                iva_code,
                iva_rate,
                additional,
                match: null,
            };
        });

    const getTag = (xmlDoc: Document | Element, tag: string): string => {
        const elements = xmlDoc.getElementsByTagName(tag);
        return elements.length > 0 && elements[0].childNodes.length > 0
            ? elements[0].textContent ?? ''
            : '';
    };

    return { selectDocXml }
}
