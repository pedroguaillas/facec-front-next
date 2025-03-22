interface OrderProps {
    atts: {
        date: string;
        extra_detail: string | null;
        send_mail: boolean;
        serie: string;
        state: string | null;
        total: number;
        voucher_type: number;
        xml: string | null;
    }
    customer: {
        email: string | null;
        name: string;
    }
    id: number
}