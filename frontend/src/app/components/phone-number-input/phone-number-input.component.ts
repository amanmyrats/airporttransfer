import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';


@Component({
  selector: 'app-phone-number-input',
  imports: [
    FormsModule, 
  ],
  templateUrl: './phone-number-input.component.html',
  styleUrl: './phone-number-input.component.scss'
})
export class PhoneNumberInputComponent {
  @Output() phoneChange = new EventEmitter<string>();

  selectedCountry = 'tr';
  number = '';

  countries = [
    { iso: 'tr', code: '90' },
    { iso: 'de', code: '49' },
    { iso: 'ru', code: '7' },
    { iso: 'gb', code: '44' },
  ];

  formatNumber() {
    const parsed = parsePhoneNumberFromString(this.number, this.selectedCountry as CountryCode);

    if (parsed && parsed.isValid()) {
      this.phoneChange.emit(parsed.formatInternational()); // e.g., +90 532 123 4567
    } else {
      this.phoneChange.emit(this.number); // fallback to raw
    }
  }

  onCountryChange() {
    this.formatNumber();
  }
}
