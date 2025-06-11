import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { LanguageSelectionComponent } from '../language-selection/language-selection.component';
import { CurrencySelectionComponent } from '../currency-selection/currency-selection.component';
import { ActivatedRoute } from '@angular/router';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-super-header',  
  imports: [FormsModule, SelectModule, ButtonModule, 
    CommonModule, 
    LanguageSelectionComponent, 
    CurrencySelectionComponent, 
  ],
  templateUrl: './super-header.component.html',
  styleUrl: './super-header.component.scss'
})
export class SuperHeaderComponent implements OnInit {
  @Input() langInput: any | null = null; // Input property for language selection
  socialIcons = SOCIAL_ICONS;
  currentLanguage: any = { code: 'en', name: 'English' };
  private languageService!: LanguageService;


  constructor(private route: ActivatedRoute) {
      if (typeof window !== 'undefined') {
        this.languageService = inject(LanguageService);}
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

}
