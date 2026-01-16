import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { SOCIAL_ICONS } from '../../constants/social.constants';
import { SUPPORTED_LANGUAGES } from '../../constants/language.contants';
import { Language } from '../../models/language.model';

@Component({
  selector: 'app-data-deletion',
  imports: [SuperHeaderComponent, NavbarComponent, FooterComponent],
  templateUrl: './data-deletion.component.html',
  styleUrl: './data-deletion.component.scss',
})
export class DataDeletionComponent implements OnInit {
  socialIcons = SOCIAL_ICONS;
  currentLanguage: Language = { ...SUPPORTED_LANGUAGES[0]! };

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] as string | undefined;
    const resolved =
      SUPPORTED_LANGUAGES.find(({ code }) => code === languageCode) ?? SUPPORTED_LANGUAGES[0]!;
    this.currentLanguage = { ...resolved };
    this.setMetaTags(this.currentLanguage.code);
  }

  setMetaTags(langCode: string): void {
    const metaTags: Record<string, { title: string; description: string }> = {
      en: {
        title: 'Data Deletion Instructions | Airport Transfer Hub',
        description: 'Learn how to request deletion of your personal data at Airport Transfer Hub, including Facebook login data.',
      },
      de: {
        title: 'Anleitung zur Datenlöschung | Airport Transfer Hub',
        description: 'Erfahren Sie, wie Sie die Löschung Ihrer personenbezogenen Daten bei Airport Transfer Hub anfordern.',
      },
      ru: {
        title: 'Инструкции по удалению данных | Airport Transfer Hub',
        description: 'Узнайте, как запросить удаление персональных данных в Airport Transfer Hub.',
      },
      tr: {
        title: 'Veri Silme Talimatları | Airport Transfer Hub',
        description: 'Airport Transfer Hub’da kişisel verilerinizin silinmesini nasıl talep edebileceğinizi öğrenin.',
      },
    };

    const defaultLang = SUPPORTED_LANGUAGES[0]!.code;
    const meta = metaTags[langCode] || metaTags[defaultLang];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }
}
