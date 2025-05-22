import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SOCIAL_ICONS } from '../../constants/social.constants';

@Component({
  selector: 'app-whatsapp-popup',
  imports: [
    CommonModule, 
  ],
  templateUrl: './whatsapp-popup.component.html',
  styleUrl: './whatsapp-popup.component.scss'
})
export class WhatsappPopupComponent implements OnInit {
  @Input() phoneNumber: string = '';
  @Input() message: string = 'Hi! I have a quick question about your transfers.';
  @Input() delay: number = 2000;
  @Input() soundOnShow: boolean = true;
  @Input() position: 'bottom-right' | 'top-left' | 'center' = 'bottom-right';
  @Input() popupId: string = 'default';
  @Input() currentLanguage: any = {code: 'en', name: 'English', flag: 'flags/gb.svg'};

  socialIcons = SOCIAL_ICONS;

  isBrowser = false;
  showPopup = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    this.message = this.translations.message[this.currentLanguage.code] || this.message;

    const now = Date.now();
    const hideUntil = localStorage.getItem(this.hideUntilKey());

    if (hideUntil && now < +hideUntil) {
      return; // Still hidden
    }

    setTimeout(() => {
      this.showPopup = true;

      if (this.soundOnShow) {
        const audio = new Audio('assets/sounds/notification.mp3');
        audio.play().catch(() => {});
      }
    }, this.delay);
  }

  getWhatsAppLink(): string {
    const encoded = encodeURIComponent(this.message);
    return `https://wa.me/${this.phoneNumber.replace(/\D/g, '')}?text=${encoded}`;
  }

  remindLater(): void {
    const remindTime = Date.now() + 1 * 60 * 1000; // 3 mins
    localStorage.setItem(this.hideUntilKey(), remindTime.toString());
    this.showPopup = false;
  }

  dismissToday(): void {
    const tomorrow = Date.now() + 2 * 60 * 1000; // 24 hrs
    localStorage.setItem(this.hideUntilKey(), tomorrow.toString());
    this.showPopup = false;
  }

  private hideUntilKey(): string {
    return `whatsapp_popup_hide_until_${this.popupId}`;
  }

  translations: any = {
    startChat: {
      en: 'Start a Whatsapp chat',
      de: 'Starte einen Whatsapp-Chat',
      ru: 'Начать чат в Whatsapp',
      tr: 'Whatsapp sohbeti başlat',
    },
    needHelp: {
      en: 'Need help?', 
      de: 'Brauchen Sie Hilfe?',
      ru: 'Нужна помощь?',
      tr: 'Yardım mı lazım?',
    }, 
    chatWithSupport: {
      en: 'Chat with our support team on WhatsApp', 
      de: 'Chatten Sie mit unserem Support-Team auf WhatsApp',
      ru: 'Чат с нашей службой поддержки в WhatsApp',
      tr: 'WhatsApp\'ta destek ekibiyle konuşun',
    },
    message: {
      en: 'Hi! I have a quick question about your transfers.', 
      de: 'Hallo! Ich habe eine kurze Frage zu Ihren Transfers.',
      ru: 'Привет! У меня есть быстрый вопрос о ваших трансферах.',
      tr: 'Merhaba! Transferleriniz hakkında hızlı bir sorum var.',
    }
  }
}
