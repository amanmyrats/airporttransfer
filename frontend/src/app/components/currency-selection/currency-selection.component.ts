import { Component, effect, inject, OnInit } from '@angular/core';
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
  supportedCurrencies: any = SUPPORTED_CURRENCIES;
  selectedCurrency: any = { name: 'Euro', code: 'EUR', symbol: '€' };
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
