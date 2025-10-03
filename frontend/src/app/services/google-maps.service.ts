import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {

  // private distanceMatrixService = new google.maps.DistanceMatrixService();
  private distanceMatrixService?: google.maps.DistanceMatrixService;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (isPlatformBrowser(this.platformId)) {
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
    }
  }
  /**
   * Extract formatted address, latitude, and longitude from PlaceResult.
   * @param place - The PlaceResult object from Google Places API.
   * @returns Object containing formatted address, latitude, and longitude.
   */
  getFormattedAddress(place: google.maps.places.PlaceResult): string {
    const name = place.name || '';
    const address = place.formatted_address || '';
    return name + (address ? ', ' + address : '');
  }

  /**
   * Split a formatted address string into a prominent primary line and a faded secondary line.
   */
  getAddressLines(address: string | null | undefined): { primary: string; secondary: string } {
    if (!address) {
      return { primary: '', secondary: '' };
    }

    const parts = address
      .split(',')
      .map((segment) => segment.trim())
      .filter((segment) => segment.length > 0);

    if (!parts.length) {
      return { primary: address, secondary: '' };
    }

    const primary = parts[0];
    const secondary = parts.slice(1).join(', ');

    return { primary, secondary };
  }

  getAddressLinesFromPlace(place: google.maps.places.PlaceResult): { primary: string; secondary: string } {
    return this.getAddressLines(this.getFormattedAddress(place));
  }

  getLatitude(place: google.maps.places.PlaceResult): number {
    if (!place.geometry || !place.geometry.location) {
      throw new Error('Invalid place object: Missing geometry data.');
    }
    return place.geometry.location.lat();
  }  

  getLongitude(place: google.maps.places.PlaceResult): number {
    if (!place.geometry || !place.geometry.location) {
      throw new Error('Invalid place object: Missing geometry data.');
    }
    return place.geometry.location.lng();
  }

  /**
   * Calculate driving distance and duration between two locations.
   * @param origin - Origin location as latitude and longitude.
   * @param destination - Destination location as latitude and longitude.
   * @returns Promise resolving with distance in kilometers and duration in minutes.
   */
  calculateDrivingDistanceAndTime(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ): Promise<{ distance: number; duration: number }> {
    return new Promise((resolve, reject) => {
      this.distanceMatrixService?.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response?.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            resolve({
              distance: element.distance.value / 1000, // Convert meters to kilometers
              duration: element.duration.value / 60, // Convert seconds to minutes
            });
          } else {
            reject(`Error calculating distance: ${status}`);
          }
        }
      );
    });
  }



}
