"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { EmisionPoint, ProductOutput, ShopCreateProps, SupplierProps, Tax, TaxInput } from "@/types";
import { getCreateShop, getShop } from "../services/shopsServices";
import { initialTax } from "@/constants/initialValues";
import useAxiosAuth from "@/lib/hooks/useAxiosAuth";
import { getDate } from "@/helpers/dateHelper";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";

// ─── State ───────────────────────────────────────────────────────────────────

type FormShopState = {
    shop: ShopCreateProps;
    selectProvider: SupplierProps | null;
    points: EmisionPoint[];
    selectPoint: EmisionPoint | null;
    errorShop: Partial<Record<keyof ShopCreateProps, string>>;
    applieWithholding: boolean;
    taxInputs: TaxInput[];
    errorTaxes: Record<string, Partial<Record<keyof Tax, string>>>;
    productOutputs: ProductOutput[];
    taxes: Tax[];
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type FormShopAction =
    | { type: 'SET_SHOP'; payload: ShopCreateProps }
    | { type: 'SET_SELECT_PROVIDER'; payload: SupplierProps | null }
    | { type: 'SET_POINTS'; payload: EmisionPoint[] }
    | { type: 'SET_SELECT_POINT'; payload: EmisionPoint | null }
    | { type: 'SET_ERROR_SHOP'; payload: Partial<Record<keyof ShopCreateProps, string>> }
    | { type: 'SET_APPLIE_WITHHOLDING'; payload: boolean }
    | { type: 'SET_TAX_INPUTS'; payload: TaxInput[] }
    | { type: 'SET_ERROR_TAXES'; payload: Record<string, Partial<Record<keyof Tax, string>>> }
    | { type: 'SET_PRODUCT_OUTPUTS'; payload: ProductOutput[] }
    | { type: 'SET_TAXES'; payload: Tax[] }
    | { type: 'LOAD_SHOP'; payload: Pick<FormShopState, 'shop' | 'selectProvider' | 'applieWithholding' | 'taxInputs' | 'taxes' | 'productOutputs'> }
    | { type: 'LOAD_CREATE'; payload: Pick<FormShopState, 'points' | 'taxInputs'> };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function formShopReducer(state: FormShopState, action: FormShopAction): FormShopState {
    switch (action.type) {
        case 'SET_SHOP':              return { ...state, shop: action.payload };
        case 'SET_SELECT_PROVIDER':  return { ...state, selectProvider: action.payload };
        case 'SET_POINTS':           return { ...state, points: action.payload };
        case 'SET_SELECT_POINT':     return { ...state, selectPoint: action.payload };
        case 'SET_ERROR_SHOP':       return { ...state, errorShop: action.payload };
        case 'SET_APPLIE_WITHHOLDING': return { ...state, applieWithholding: action.payload };
        case 'SET_TAX_INPUTS':       return { ...state, taxInputs: action.payload };
        case 'SET_ERROR_TAXES':      return { ...state, errorTaxes: action.payload };
        case 'SET_PRODUCT_OUTPUTS':  return { ...state, productOutputs: action.payload };
        case 'SET_TAXES':            return { ...state, taxes: action.payload };
        case 'LOAD_SHOP':            return { ...state, ...action.payload };
        case 'LOAD_CREATE':          return { ...state, ...action.payload };
        default:                     return state;
    }
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialShop: ShopCreateProps = {
    serie: '001-010-000000001',
    date: getDate(),
    authorization: '',
    expiration_days: 0,
    voucher_type: 1,
    no_iva: 0,
    base0: 0,
    base5: 0,
    base12: 0,
    base15: 0,
    iva: 0,
    iva5: 0,
    iva15: 0,
    sub_total: 0,
    discount: 0,
    ice: 0,
    total: 0,
    description: null,
    provider_id: 0,

    // Retencion
    serie_retencion: '',
    date_retention: getDate(),
};

const initialState: FormShopState = {
    shop: initialShop,
    selectProvider: null,
    points: [],
    selectPoint: null,
    errorShop: {},
    applieWithholding: false,
    taxInputs: [],
    errorTaxes: {},
    productOutputs: [],
    taxes: [{ ...initialTax, id: nanoid() }],
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface ShopContextType {
    shop: ShopCreateProps;
    selectProvider: SupplierProps | null;
    errorShop: Partial<Record<keyof ShopCreateProps, string>>;
    points: EmisionPoint[];
    selectPoint: EmisionPoint | null;
    applieWithholding: boolean;
    taxInputs: TaxInput[];
    taxes: Tax[];
    errorTaxes: Record<string, Partial<Record<keyof Tax, string>>>;
    productOutputs: ProductOutput[];
    setShop: Dispatch<SetStateAction<ShopCreateProps>>;
    setSelectProvider: Dispatch<SetStateAction<SupplierProps | null>>;
    setSelectPoint: Dispatch<SetStateAction<EmisionPoint | null>>;
    setErrorShop: Dispatch<SetStateAction<Partial<Record<keyof ShopCreateProps, string>>>>;
    setTaxes: Dispatch<SetStateAction<Tax[]>>;
    setErrorTaxes: Dispatch<SetStateAction<Record<string, Partial<Record<keyof Tax, string>>>>>;
    setProductOutputs: Dispatch<SetStateAction<ProductOutput[]>>;
    setApplieWithholding: Dispatch<SetStateAction<boolean>>;
}

const FormShopContext = createContext<ShopContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface Props {
    children: ReactNode;
}

export const FormShopProvider = ({ children }: Props) => {
    const [state, dispatch] = useReducer(formShopReducer, initialState);
    const { status } = useSession();
    const axiosAuth = useAxiosAuth();
    const params = useParams();

    useEffect(() => {
        const fetchCreateShop = async () => {
            if (status !== "authenticated") return;

            if (typeof params?.id === 'string') {
                const { data } = await getShop(axiosAuth, params.id);
                if (data) {
                    dispatch({
                        type: 'LOAD_SHOP',
                        payload: {
                            shop: data.shop,
                            selectProvider: data.providers[0],
                            applieWithholding: data.shopretentionitems.length > 0,
                            taxInputs: data.taxes,
                            taxes: data.shopretentionitems.map((item: Tax) => ({ ...item, id: nanoid() })),
                            productOutputs: data.shopitems.map((item: ProductOutput) => ({
                                ...item,
                                id: item.id + '',
                                total_iva: (Number(item.price) * Number(item.quantity)).toFixed(2),
                            })),
                        },
                    });
                }
            } else {
                const { data } = await getCreateShop(axiosAuth);
                if (data) {
                    dispatch({ type: 'LOAD_CREATE', payload: { points: data.points, taxInputs: data.taxes } });
                }
            }
        };
        fetchCreateShop();
    }, [status, axiosAuth, params?.id]);

    // Ref siempre actualizado con el estado más reciente (evita closures obsoletos)
    const stateRef = useRef(state);
    stateRef.current = state;

    // Setters estables: dispatch es estable (garantía de useReducer), stateRef es un ref.
    // useCallback con [dispatch] equivale a [] → la función nunca cambia de referencia,
    // eliminando los bucles infinitos en useEffect/useCallback que dependen de estos setters.
    const setShop = useCallback((value: SetStateAction<ShopCreateProps>) => {
        dispatch({ type: 'SET_SHOP', payload: typeof value === 'function' ? value(stateRef.current.shop) : value });
    }, [dispatch]);

    const setSelectProvider = useCallback((value: SetStateAction<SupplierProps | null>) => {
        dispatch({ type: 'SET_SELECT_PROVIDER', payload: typeof value === 'function' ? value(stateRef.current.selectProvider) : value });
    }, [dispatch]);

    const setSelectPoint = useCallback((value: SetStateAction<EmisionPoint | null>) => {
        dispatch({ type: 'SET_SELECT_POINT', payload: typeof value === 'function' ? value(stateRef.current.selectPoint) : value });
    }, [dispatch]);

    const setErrorShop = useCallback((value: SetStateAction<Partial<Record<keyof ShopCreateProps, string>>>) => {
        dispatch({ type: 'SET_ERROR_SHOP', payload: typeof value === 'function' ? value(stateRef.current.errorShop) : value });
    }, [dispatch]);

    const setTaxes = useCallback((value: SetStateAction<Tax[]>) => {
        dispatch({ type: 'SET_TAXES', payload: typeof value === 'function' ? value(stateRef.current.taxes) : value });
    }, [dispatch]);

    const setErrorTaxes = useCallback((value: SetStateAction<Record<string, Partial<Record<keyof Tax, string>>>>) => {
        dispatch({ type: 'SET_ERROR_TAXES', payload: typeof value === 'function' ? value(stateRef.current.errorTaxes) : value });
    }, [dispatch]);

    const setProductOutputs = useCallback((value: SetStateAction<ProductOutput[]>) => {
        dispatch({ type: 'SET_PRODUCT_OUTPUTS', payload: typeof value === 'function' ? value(stateRef.current.productOutputs) : value });
    }, [dispatch]);

    const setApplieWithholding = useCallback((value: SetStateAction<boolean>) => {
        dispatch({ type: 'SET_APPLIE_WITHHOLDING', payload: typeof value === 'function' ? value(stateRef.current.applieWithholding) : value });
    }, [dispatch]);

    return (
        <FormShopContext.Provider value={{
            ...state,
            setShop, setErrorShop, setSelectProvider, setSelectPoint,
            setApplieWithholding, setTaxes, setErrorTaxes, setProductOutputs,
        }}>
            {children}
        </FormShopContext.Provider>
    );
};

export const useFormShop = () => {
    const context = useContext(FormShopContext);
    if (!context) {
        throw new Error("Shop must be used within an ShopCreateProvider");
    }
    return context;
};
