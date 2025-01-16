import { Component } from '@angular/core';
import { BLOG_ANTALYA } from '../../../blog-content/blogs/blog-antalya';
import { SuperHeaderComponent } from '../../../components/super-header/super-header.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { SafeHtmlPipe } from '../../../pipes/safe-html.pipe';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-antalya-airport-transfer',
  imports: [
    SuperHeaderComponent, 
    NavbarComponent, 
    FooterComponent, 
    // SafeHtmlPipe,  
  ],
  templateUrl: './antalya-airport-transfer.component.html',
  styleUrl: './antalya-airport-transfer.component.scss'
})
export class AntalyaAirportTransferComponent {

  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };
  blog: any = BLOG_ANTALYA;
  
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  getBlogContent(langCode: string): string {
    if (this.blog.content_with_html && this.blog.content_with_html[langCode]) {
      return this.blog.content_with_html[langCode];
    }
    return '';
  }

}
