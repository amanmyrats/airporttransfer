import {
  Directive,
  ElementRef,
  EventEmitter,
  Output,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[appGmapsAutocomplete]'
})
export class GmapsAutocompleteDirective implements OnInit {
    @Output() placeChanged: EventEmitter<google.maps.places.PlaceResult> = new EventEmitter();
  
    private autocomplete!: google.maps.places.Autocomplete;
  
    constructor(private el: ElementRef) {}
  
    ngOnInit(): void {
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
  