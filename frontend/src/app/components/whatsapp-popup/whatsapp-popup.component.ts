import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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
export class WhatsappPopupComponent implements OnInit, OnDestroy {
  @Input() phoneNumber: string = '';
  @Input() message: string = 'Hi! I have a quick question about your transfers.';
  @Input() delay: number = 15000;
  @Input() soundOnShow: boolean = false;
  @Input() position: 'bottom-right' | 'top-left' | 'center' = 'bottom-right';
  @Input() popupId: string = 'default';
  @Input() currentLanguage: any = {code: 'en', name: 'English', flag: 'flags/gb.svg'};
  @Input() scrollThreshold = 0.45;

  socialIcons = SOCIAL_ICONS;

  isBrowser = false;
  showPopup = false;
  isExpanded = false;

  private delayElapsed = false;
  private scrollThresholdReached = false;
  private scrollListener?: () => void;
  private delayTimerId?: number;

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

    this.startDelayTimer();
    this.registerScrollTrigger();
  }

  ngOnDestroy(): void {
    if (this.delayTimerId) {
      window.clearTimeout(this.delayTimerId);
      this.delayTimerId = undefined;
    }
    this.removeScrollTrigger();
  }

  getWhatsAppLink(): string {
    const encoded = encodeURIComponent(this.message);
    return `https://wa.me/${this.phoneNumber.replace(/\D/g, '')}?text=${encoded}`;
  }

  remindLater(): void {
    const remindTime = Date.now() + 3 * 60 * 1000; // 3 mins
    localStorage.setItem(this.hideUntilKey(), remindTime.toString());
    this.showPopup = false;
    this.isExpanded = false;
  }

  dismissToday(): void {
    const tomorrow = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
    localStorage.setItem(this.hideUntilKey(), tomorrow.toString());
    this.showPopup = false;
    this.isExpanded = false;
  }

  private hideUntilKey(): string {
    if (!this.isBrowser) {
      return `whatsapp_popup_hide_until_${this.popupId}`;
    }
    const lang = this.currentLanguage?.code ?? 'en';
    const path = window.location?.pathname?.replace(/[^a-zA-Z0-9]+/g, '-') ?? 'root';
    return `whatsapp_popup_hide_until_${this.popupId}_${lang}_${path}`;
  }

  private startDelayTimer(): void {
    if (this.delay <= 0) {
      this.delayElapsed = true;
      this.tryRevealPopup();
      return;
    }
    this.delayTimerId = window.setTimeout(() => {
      this.delayElapsed = true;
      this.tryRevealPopup();
    }, this.delay);
  }

  private registerScrollTrigger(): void {
    if (this.scrollListener) {
      return;
    }
    this.scrollListener = () => {
      if (this.scrollThresholdReached) {
        return;
      }
      const doc = document.documentElement;
      const scrollY = window.scrollY || doc.scrollTop;
      const viewportHeight = window.innerHeight;
      const totalHeight = doc.scrollHeight || document.body.scrollHeight;
      if (!totalHeight) {
        return;
      }
      const progress = Math.min((scrollY + viewportHeight) / totalHeight, 1);
      if (progress >= this.scrollThreshold) {
        this.scrollThresholdReached = true;
        this.removeScrollTrigger();
        this.tryRevealPopup();
      }
    };
    window.addEventListener('scroll', this.scrollListener, { passive: true });
    this.scrollListener();
  }

  private removeScrollTrigger(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = undefined;
    }
  }

  private tryRevealPopup(): void {
    if (!this.delayElapsed || !this.scrollThresholdReached || this.showPopup) {
      return;
    }
    this.revealPopup();
  }

  private revealPopup(): void {
    this.showPopup = true;
    this.isExpanded = false;

    if (this.soundOnShow) {
      const audio = new Audio('assets/sounds/notification.mp3');
      audio.play().catch(() => {});
    }
  }

  expandPopup(): void {
    this.isExpanded = true;
  }

  collapsePopup(): void {
    this.isExpanded = false;
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
    },
    remindLater: {
      en: 'Remind me later',
      de: 'Später erinnern',
      ru: 'Напомнить позже',
      tr: 'Bana sonra hatırlat',
    },
    dontShow: {
      en: "Don't show today",
      de: 'Heute nicht mehr anzeigen',
      ru: 'Не показывать сегодня',
      tr: 'Bugün tekrar gösterme',
    },
  }
}
