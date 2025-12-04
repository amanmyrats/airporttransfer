
import { MainLocation } from '../../models/main-location.model';

export class PopularRoute {
    id?: string;
    airport?: string | null;
    airport_detail?: MainLocation | null;
    main_location?: string;
    destination?: string;
    car_type?: string;
    distance?: string;
    euro_price?: number;
}
