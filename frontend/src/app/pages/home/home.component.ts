import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { LanguageSelectionComponent } from '../../components/language-selection/language-selection.component';
import { CurrencySelectionComponent } from '../../components/currency-selection/currency-selection.component';

@Component({
  selector: 'app-home',
  imports: [FormsModule, SelectModule, ButtonModule, 
    CommonModule, 
    LanguageSelectionComponent, 
    CurrencySelectionComponent, 
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor() {
  }

  ngOnInit(): void {

  }

}
