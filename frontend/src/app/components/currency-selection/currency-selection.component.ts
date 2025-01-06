import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { SUPPORTED_CURRENCIES } from '../../constants/currency.constants';
import { CommonModule } from '@angular/common';

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
  selectedCurrency: any;
  isDropdownVisible = false; // Tracks the visibility of the dropdown menu

  constructor(private currencyService: CurrencyService) {}

  ngOnInit(): void {
    // Set initial selected currency from the service
    this.selectedCurrency = this.currencyService.currentCurrency();
  }

  /**
   * Handles currency selection and closes the dropdown menu
   * @param currency - The selected currency object
   */
  onCurrencySelect(currency: any): void {
    this.currencyService.setCurrency(currency.code); // Update the currency via service
    this.selectedCurrency = currency; // Update the locally selected currency
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
