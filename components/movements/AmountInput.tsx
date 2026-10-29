"use client";

// Monto protagonista: grande y con el signo $ fijo, como se escribe en un cheque
interface Props {
    value: string;
    error?: string;
    onChange: (value: string) => void;
    label?: string;
    id?: string;
    autoFocus?: boolean;
}

export const AmountInput = ({ value, error, onChange, label = 'Monto', id = 'movement-amount', autoFocus }: Props) => (
    <div className="flex flex-col gap-1 my-2">
        <label htmlFor={id} className="text-sm font-medium text-ink-2">
            {label} <span className="text-red-500">*</span>
        </label>
        <div className={`flex items-center rounded-lg border bg-[var(--background)] px-3 focus-within:border-primary transition-colors ${error ? 'border-red-400' : 'border-[var(--border-strong)]'}`}>
            <span aria-hidden="true" className="text-lg text-ink-3">$</span>
            <input
                id={id}
                autoFocus={autoFocus}
                name="amount"
                type="text"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={error ? 'true' : 'false'}
                className="w-full min-w-0 bg-transparent py-1.5 pl-1.5 text-xl font-semibold tabular-nums text-ink-1 placeholder:text-ink-4 focus:outline-none"
            />
        </div>
        {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
);
