export interface ReferralGuideProps {
    id: string,
    atts: {
        date_start: string,
        date_end: string,
        serie: string,
        state: string,
        xml: string,
        extra_detail: string,
    },
    customer: {
        name: string,
    },
    carrier: {
        name: string,
    }
}