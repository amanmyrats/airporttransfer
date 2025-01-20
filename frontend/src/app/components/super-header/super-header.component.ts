import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { LanguageSelectionComponent } from '../language-selection/language-selection.component';
import { CurrencySelectionComponent } from '../currency-selection/currency-selection.component';
import { ActivatedRoute } from '@angular/router';

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
  currentLanguage: any = { code: 'en', name: 'English' };

  constructor(
    private route: ActivatedRoute, 
  ) { }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['languageCode'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  translations: any = {
    whatsapp: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on WhatsApp', 
          de: 'Türkei Flughafentransfer Kontakt auf WhatsApp',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в WhatsApp',
          tr: 'Türkiye Havaalanı Transferi WhatsApp üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-whatsapp-contact.svg',
          de: 'turkei-flughafentransfer-whatsapp-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-whatsapp-контакт.svg',
          tr: 'turkiye-havaalani-transferi-whatsapp-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer WhatsApp Contact', 
          de: 'Türkei Flughafentransfer WhatsApp Kontakt',
          ru: 'Турецкий трансфер из аэропорта WhatsApp контакт',
          tr: 'Türkiye Havaalanı Transferi WhatsApp İletişim',
        },
      }

    }, 
    telegram: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on Telegram', 
          de: 'Türkei Flughafentransfer Kontakt auf Telegram',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в Telegram',
          tr: 'Türkiye Havaalanı Transferi Telegram üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-telegram-contact.svg',
          de: 'turkei-flughafentransfer-telegram-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-telegram-контакт.svg',
          tr: 'turkiye-havaalani-transferi-telegram-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer Telegram Contact', 
          de: 'Türkei Flughafentransfer Telegram Kontakt',
          ru: 'Турецкий трансфер из аэропорта Telegram контакт',
          tr: 'Türkiye Havaalanı Transferi Telegram İletişim',
        },
      }
    },
    facebook: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on Facebook', 
          de: 'Türkei Flughafentransfer Kontakt auf Facebook',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в Facebook',
          tr: 'Türkiye Havaalanı Transferi Facebook üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-facebook-contact.svg',
          de: 'turkei-flughafentransfer-facebook-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-facebook-контакт.svg',
          tr: 'turkiye-havaalani-transferi-facebook-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer Facebook Contact', 
          de: 'Türkei Flughafentransfer Facebook Kontakt',
          ru: 'Турецкий трансфер из аэропорта Facebook контакт',
          tr: 'Türkiye Havaalanı Transferi Facebook İletişim',
        },
      }
    },
    instagram: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on Instagram', 
          de: 'Türkei Flughafentransfer Kontakt auf Instagram',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в Instagram',
          tr: 'Türkiye Havaalanı Transferi Instagram üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-instagram-contact.svg',
          de: 'turkei-flughafentransfer-instagram-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-instagram-контакт.svg',
          tr: 'turkiye-havaalani-transferi-instagram-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer Instagram Contact', 
          de: 'Türkei Flughafentransfer Instagram Kontakt',
          ru: 'Турецкий трансфер из аэропорта Instagram контакт',
          tr: 'Türkiye Havaalanı Transferi Instagram İletişim',
        },
      }
    },
    twitter: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on Twitter', 
          de: 'Türkei Flughafentransfer Kontakt auf Twitter',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в Twitter',
          tr: 'Türkiye Havaalanı Transferi Twitter üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-twitter-contact.svg',
          de: 'turkei-flughafentransfer-twitter-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-twitter-контакт.svg',
          tr: 'turkiye-havaalani-transferi-twitter-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer Twitter Contact', 
          de: 'Türkei Flughafentransfer Twitter Kontakt',
          ru: 'Турецкий трансфер из аэропорта Twitter контакт',
          tr: 'Türkiye Havaalanı Transferi Twitter İletişim',
        },
      }
    },
    tiktok: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on TikTok', 
          de: 'Türkei Flughafentransfer Kontakt auf TikTok',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в TikTok',
          tr: 'Türkiye Havaalanı Transferi TikTok üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-tiktok-contact.svg',
          de: 'turkei-flughafentransfer-tiktok-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-tiktok-контакт.svg',
          tr: 'turkiye-havaalani-transferi-tiktok-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer TikTok Contact', 
          de: 'Türkei Flughafentransfer TikTok Kontakt',
          ru: 'Турецкий трансфер из аэропорта TikTok контакт',
          tr: 'Türkiye Havaalanı Transferi TikTok İletişim',
        },
      }
    }, 
    linkedin: {
      anchor: {
        ariaLabel: {
          en: 'Turkey Airport Transfer Contact on LinkedIn', 
          de: 'Türkei Flughafentransfer Kontakt auf LinkedIn',
          ru: 'Турецкий трансфер из аэропорта свяжитесь в LinkedIn',
          tr: 'Türkiye Havaalanı Transferi LinkedIn üzerinden iletişime geçin',
        },
      }, 
      image: {
        name: {
          en: 'turkey-airport-transfer-linkedin-contact.svg',
          de: 'turkei-flughafentransfer-linkedin-kontakt.svg',
          ru: 'турецкий-трансфер-из-аэропорта-linkedin-контакт.svg',
          tr: 'turkiye-havaalani-transferi-linkedin-ile-iletisim.svg',
        }, 
        alt: {
          en: 'Turkey Airport Transfer LinkedIn Contact', 
          de: 'Türkei Flughafentransfer LinkedIn Kontakt',
          ru: 'Турецкий трансфер из аэропорта LinkedIn контакт',
          tr: 'Türkiye Havaalanı Transferi LinkedIn İletişim',
        },
      }
    }
  }
}
