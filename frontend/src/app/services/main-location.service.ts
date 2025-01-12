import { Injectable } from '@angular/core';
import { SUPPORTED_MAIN_LOCATIONS } from '../constants/main-location.constants';
import { MainLocation } from '../models/main-location.model';

@Injectable({
  providedIn: 'root'
})
export class MainLocationService {
  private locations: MainLocation[] = SUPPORTED_MAIN_LOCATIONS;

  constructor() {}

  /**
   * Get the full list of supported main locations.
   * @returns MainLocation[]
   */
  getMainLocations(): MainLocation[] {
    return this.locations;
  }

  /**
   * Find a location by its code.
   * @param code The location code.
   * @returns MainLocation | undefined
   */
  getMainLocationByCode(code: string): MainLocation | undefined {
    return this.locations.find((location) => location.code === code);
  }

  /**
   * Get the location name in a specific language.
   * @param code The location code.
   * @param lang The language code ('en', 'tr', 'ru', etc.).
   * @returns string | undefined
   */
  getMainLocationNameInLanguage(code: string, lang: keyof MainLocation): string | undefined {
    const location = this.getMainLocationByCode(code);
    return location ? location[lang] : undefined;
  }
}
