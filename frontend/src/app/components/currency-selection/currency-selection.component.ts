import { Component, OnInit } from '@angular/core';
import { SUPPORTED_CURRENCIES } from '../../constants/currency.constants';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';

@Component({
  selector: 'app-currency-selection',
  templateUrl: './currency-selection.component.html',
  imports: [
    CommonModule, 
  ],
  styleUrls: ['./currency-selection.component.scss'],
})
export class CurrencySelectionComponent implements OnInit {
  supportedCurrencies = SUPPORTED_CURRENCIES; // Use the constants for supported currencies
  isDropdownVisible = false; // Tracks the visibility of the dropdown menu

  constructor(public currencyService: CurrencyService) {}

  ngOnInit(): void {
  }

  /**
   * Handles currency selection and closes the dropdown menu
   * @param currency - The selected currency object
   */
  onCurrencySelect(currency: any): void {
    this.currencyService.setCurrency(currency.code); // Update the currency via service
    this.isDropdownVisible = false; // Close the dropdown menu
  }

  /**
   * Toggles the visibility of the dropdown menu
   */
  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }

  /**
   * Closes the dropdown menu when the mouse leaves the dropdown area
   */
  closeDropdown(): void {
    this.isDropdownVisible = false;
  }
}
