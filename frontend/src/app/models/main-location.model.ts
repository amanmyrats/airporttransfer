export class MainLocation {
    id?: number;
    code?: string;
    iata_code?: string;
    icao_code?: string;
    name?: string;
    value?: string;
    en?: string;
    tr?: string;
    ru?: string;
    fr?: string;
    de?: string;
    hl?: string;
    city?: string;
    state?: string;
    country?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
    elevation_meters?: number;
    website?: string;
    phone?: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    short?: {
        en?: string;
        de?: string;
        ru?: string;
        tr?: string;
        [key: string]: string | undefined;
    };
}
