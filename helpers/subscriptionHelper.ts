import { getDate } from "./dateHelper";
import { Subscription } from "@/types";

// YYYY-MM-DD → dd/mm/yyyy
export const formatPlanDate = (date: string | null | undefined) => {
    if (!date) return '-';
    const [y, m, d] = date.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
};

// ended_at es inclusivo: vencido solo si ya pasó (zona America/Guayaquil)
export const isSubscriptionExpired = (subscription: Subscription) =>
    !!subscription.ended_at && subscription.ended_at.slice(0, 10) < getDate();

export const subscriptionAmount = (subscription: Subscription) => Number(subscription.amount ?? 0);


export const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;
