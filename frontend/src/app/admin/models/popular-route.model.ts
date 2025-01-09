import { CarType } from "./car-type.model";
import { MainLocation } from "./main-location.model";

export class PopularRoute {
    id?: string;
    car_type?: string;
    car_type_obj?: CarType;
    main_location?: string;
    main_location_obj?: MainLocation;
    destination?: string;
    distance?: string;
    euro_price?: string;
}
