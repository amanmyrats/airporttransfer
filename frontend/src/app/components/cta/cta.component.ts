import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-cta',
  imports: [],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.scss'
})
export class CtaComponent implements OnInit {
  currentLanguage: any = { code: 'en', name: 'English', flag: 'flags/gb.svg' };

  constructor(
    private route: ActivatedRoute, 
  ) {}

  ngOnInit(): void {
      const languageCode = this.route.snapshot.data['language'] || 'en';
      this.currentLanguage.code = languageCode;
  }

}
