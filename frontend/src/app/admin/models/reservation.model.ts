import { CarType } from "./car-type.model";
import { Currency } from "./currency.model";

export class Reservation {
    id?: string; 
    
    number?: string; 

    amount?: string;
    currency?: string; 
    currency_obj?: Currency; 
    
    reservation_date?: Date;
    car_type?: string; 
    car_type_obj?: CarType; 
    transfer_date?: Date;
    transfer_time?: string;
    transfer_date_time?: string;
    flight_number?: string;
    flight_date?: string;
    flight_time?: string;
    flight_date_time?: string;
  
    passenger_name?: string;
    passenger_phone?: string;
    passenger_email?: string;
    passenger_count?: string;
    passenger_count_children?: string;
    note?: string; 
    
    is_round_trip?: boolean;
    pickup_short?: string;
    pickup_full?: string;
    dest_short?: string;
    dest_full?: string;
    pickup_lat?: string;
    pickup_lon?: string;
    dest_lat?: string;
    dest_lon?: string;
    
    status?: string;
    
    need_child_seat?: string;
    child_seat_count?: string;
    
    need_greet_sign?: string;
    
    created_at?: string;
    updated_at?: string;
  }
  
  
