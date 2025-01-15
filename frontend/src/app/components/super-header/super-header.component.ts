import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { LanguageSelectionComponent } from '../language-selection/language-selection.component';
import { CurrencySelectionComponent } from '../currency-selection/currency-selection.component';

@Component({
  selector: 'app-super-header',  
  imports: [FormsModule, SelectModule, ButtonModule, 
    CommonModule, 
    LanguageSelectionComponent, 
    // CurrencySelectionComponent, 
  ],
  templateUrl: './super-header.component.html',
  styleUrl: './super-header.component.scss'
})
export class SuperHeaderComponent implements OnInit {
  isClient = false;

  ngOnInit(): void {
    this.isClient = typeof window !== 'undefined';
  }
}
