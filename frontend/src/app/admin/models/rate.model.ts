import { Currency } from "./currency.model";

export class Rate {
    id?: string;
    currency?: string;
    currency_obj?: Currency;
    rate_date?: string;
    buying_rate?: string;
    selling_rate?: string;
    created_at?: string;
    updated_at?: string;
}
