import { Injectable } from '@angular/core';
import { SUPPORTED_CAR_TYPES } from '../constants/car-type.constants';
import { CarType } from '../models/car-type.model';

@Injectable({
  providedIn: 'root'
})
export class CarTypeService {
  private carTypes: CarType[] = SUPPORTED_CAR_TYPES;

  constructor() {}

  /**
   * Get the list of all supported car types.
   * @returns CarType[]
   */
  getCarTypes(queryString: string = ''): CarType[] {
    return this.carTypes;
  }

  /**
   * Find a car type by its code.
   * @param code The code of the car type.
   * @returns CarType | undefined
   */
  getCarTypeByCode(code: string): CarType | undefined {
    return this.carTypes.find((carType) => carType.code === code);
  }

}
