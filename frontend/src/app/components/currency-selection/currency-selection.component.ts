import { Component, effect, inject, OnInit } from '@angular/core';
import { SUPPORTED_CURRENCIES } from '../../constants/currency.constants';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../services/currency.service';
import { Currency } from '../../models/currency.model';

const DEFAULT_CURRENCY_SELECTION: Currency = {
  ...(SUPPORTED_CURRENCIES.find((currency) => currency.code === 'EUR') ?? SUPPORTED_CURRENCIES[0]),
};

@Component({
  selector: 'app-currency-selection',
  templateUrl: './currency-selection.component.html',
  imports: [
    CommonModule, 
  ],
  styleUrls: ['./currency-selection.component.scss'],
})
export class CurrencySelectionComponent implements OnInit {
  supportedCurrencies: Currency[] = SUPPORTED_CURRENCIES.map((currency) => ({ ...currency }));
  selectedCurrency: Currency = { ...DEFAULT_CURRENCY_SELECTION };
  isDropdownVisible = false; // Tracks the visibility of the dropdown menu
  currencyService!: CurrencyService;
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.currencyService = inject(CurrencyService);

      effect(() => {
        this.selectedCurrency = this.currencyService.currentCurrency();
      }
      );
    }
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.selectedCurrency = this.currencyService.currentCurrency();
    }
  }

  /**
   * Handles currency selection and closes the dropdown menu
   * @param currency - The selected currency object
   */
  onCurrencySelect(currency: Currency): void {
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
