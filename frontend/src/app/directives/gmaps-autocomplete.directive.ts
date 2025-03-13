import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';

@Directive({
  selector: '[appGmapsAutocomplete]'
})
export class GmapsAutocompleteDirective implements OnInit {
    @Output() placeChanged: EventEmitter<google.maps.places.PlaceResult> = new EventEmitter();
  
    private autocomplete!: google.maps.places.Autocomplete;
  
    constructor(
      private el: ElementRef, 
      @Inject(PLATFORM_ID) private platformId: Object,
    ) {}
  
    ngOnInit(): void {
    // Only run this in the browser (prevent execution on the server)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
      if (!window['google']) {
        console.error('Google Maps API is not loaded.');
        return;
      }
  
      this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement, {
        // types: ['geocode'],
        componentRestrictions: { country: 'TR' }, // Restrict results to Turkey
      });
  
      this.autocomplete.addListener('place_changed', () => {
        const place: google.maps.places.PlaceResult = this.autocomplete.getPlace();
        this.placeChanged.emit(place);
      });
    }
  }
  