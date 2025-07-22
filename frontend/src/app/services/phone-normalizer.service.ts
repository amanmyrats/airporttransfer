import { Injectable } from '@angular/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

@Injectable({
  providedIn: 'root'
})
export class PhoneNormalizerService {

  constructor() { }


getFormattedPhone(rawPhone: string) {
  // Ensure it starts with "+" or "00"
  let normalized = rawPhone.trim();
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  } else if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  const phone = parsePhoneNumberFromString(normalized);

  if (!phone || !phone.isValid()) {
    console.warn('❌ Invalid phone:', rawPhone);
    return null;
  }

  return {
    number: phone.number, // E.164
    internationalNumber: phone.formatInternational(),
    nationalNumber: phone.nationalNumber,
    countryCode: phone.country?.toLowerCase(), // e.g. 'ru'
    dialCode: phone.countryCallingCode         // e.g. '7'
  };
}

}
