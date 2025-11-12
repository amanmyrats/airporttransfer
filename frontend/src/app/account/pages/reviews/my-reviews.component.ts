import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { ReviewsService } from '../../../admin/services/reviews.service';
import { LanguageService } from '../../../services/language.service';
import { MyReview, ReviewStatus } from '../../models/review.models';
import {
  ACCOUNT_FALLBACK_LANGUAGE,
  AccountLanguageCode,
  normalizeAccountLanguage,
} from '../../constants/account-language.constants';

type StatusVariant = 'live' | 'pending';

interface StatusMeta {
  label: string;
  variant: StatusVariant;
  note?: string;
}

const STATUS_META = {
  pending: {
    label: {
      en: 'Under review',
      de: 'Wird geprüft',
      ru: 'На проверке',
      tr: 'İncelemede',
    },
    note: {
      en: 'Thanks for sharing your experience. Our team is reviewing it now—no further action needed.',
      de: 'Danke für Ihr Feedback. Unser Team prüft es gerade – es ist nichts weiter nötig.',
      ru: 'Спасибо за отзыв. Мы его проверяем, никаких действий от вас не требуется.',
      tr: 'Deneyiminizi paylaştığınız için teşekkürler. Ekibimiz inceliyor, başka bir aksiyon gerekmiyor.',
    },
  },
  published: {
    label: {
      en: 'Published',
      de: 'Veröffentlicht',
      ru: 'Опубликовано',
      tr: 'Yayınlandı',
    },
    note: null,
  },
  rejected: {
    label: {
      en: 'Under review',
      de: 'Wird geprüft',
      ru: 'На проверке',
      tr: 'İncelemede',
    },
    note: {
      en: 'This feedback isn’t on the public site, but we still use it to improve future trips.',
      de: 'Dieses Feedback erscheint nicht öffentlich, hilft uns aber weiterhin, Transfers zu verbessern.',
      ru: 'Этот отзыв не опубликован, но мы используем его для улучшений.',
      tr: 'Bu geri bildirim sitede görünmüyor ama yine de gelecekteki transferleri iyileştirmek için kullanıyoruz.',
    },
  },
} as const;

const REVIEWS_TRANSLATIONS = {
  title: {
    en: 'My reviews',
    de: 'Meine Bewertungen',
    ru: 'Мои отзывы',
    tr: 'Yorumlarım',
  },
  subtitle: {
    en: 'Track the status of your ride feedback.',
    de: 'Verfolgen Sie den Status Ihres Feedbacks.',
    ru: 'Следите за статусом своих отзывов.',
    tr: 'Yolculuk geri bildirimlerinizin durumunu takip edin.',
  },
  refresh: {
    en: 'Refresh',
    de: 'Aktualisieren',
    ru: 'Обновить',
    tr: 'Yenile',
  },
  hint: {
    en: 'Reviews become editable for 15 minutes after submission.',
    de: 'Bewertungen können 15 Minuten lang bearbeitet werden.',
    ru: 'Редактирование доступно в течение 15 минут после отправки.',
    tr: 'Yorumlar gönderildikten sonra 15 dakika boyunca düzenlenebilir.',
  },
  empty: {
    en: 'You have not submitted any reviews yet. View a completed reservation to write your first review.',
    de: 'Sie haben noch keine Bewertungen abgegeben. Öffnen Sie eine abgeschlossene Buchung, um die erste Bewertung zu schreiben.',
    ru: 'Вы еще не оставили отзывов. Откройте завершенную бронь, чтобы написать первый отзыв.',
    tr: 'Henüz herhangi bir yorum yazmadınız. İlk yorumunuz için tamamlanan bir rezervasyonu açın.',
  },
  noTitle: {
    en: 'No title provided',
    de: 'Kein Titel angegeben',
    ru: 'Заголовок отсутствует',
    tr: 'Başlık girilmedi',
  },
  noComment: {
    en: 'No comment shared.',
    de: 'Kein Kommentar vorhanden.',
    ru: 'Комментарий отсутствует.',
    tr: 'Yorum girilmemiş.',
  },
  createdLabel: {
    en: 'Created',
    de: 'Erstellt',
    ru: 'Создано',
    tr: 'Oluşturuldu',
  },
  view: {
    en: 'View',
    de: 'Ansehen',
    ru: 'Посмотреть',
    tr: 'Görüntüle',
  },
} as const;

type ReviewsTranslationKey = keyof typeof REVIEWS_TRANSLATIONS;

@Component({
  selector: 'app-my-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, DatePipe],
  templateUrl: './my-reviews.component.html',
  styleUrl: './my-reviews.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyReviewsComponent implements OnInit {
  private readonly reviewsService = inject(ReviewsService);
  private readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  protected copy = this.buildCopy(ACCOUNT_FALLBACK_LANGUAGE);
  readonly reviews = this.reviewsService.myReviews;
  readonly loading = this.reviewsService.myReviewsLoading;
  readonly meta = this.reviewsService.myReviewsMeta;
  readonly currentLang = computed(() => this.languageService.extractLangFromUrl(this.router.url));

  ngOnInit(): void {
    const lang = this.detectLanguage();
    this.copy = this.buildCopy(lang);
    this.reviewsService.listMine().subscribe();
  }

  trackByReviewId(_: number, review: MyReview): number {
    return review.id;
  }

  statusMeta(status: ReviewStatus): StatusMeta {
    const lang = this.detectLanguage();
    const entry = STATUS_META[status] ?? STATUS_META['pending'];
    return {
      label: entry.label[lang] ?? entry.label[ACCOUNT_FALLBACK_LANGUAGE],
      variant: status === 'published' ? 'live' : 'pending',
      note: entry.note ? entry.note[lang] ?? entry.note[ACCOUNT_FALLBACK_LANGUAGE] : undefined,
    };
  }

  detailLink(review: MyReview): any[] {
    return this.languageService.commandsWithLang(
      this.currentLang(),
      'account',
      'reviews',
      String(review.id),
    );
  }

  reviewReservationLabel(review: MyReview): string {
    const reservation = review.reservation_obj;
    if (!reservation) {
      return `Reservation #${review.reservation_id}`;
    }
    const pickup = reservation.pickup ?? 'Pickup';
    const destination = reservation.destination ?? 'Destination';
    return `${pickup} → ${destination}`;
  }

  refresh(): void {
    if (this.loading()) {
      return;
    }
    this.reviewsService.listMine().subscribe();
  }

  private detectLanguage(): AccountLanguageCode {
    const lang = this.languageService.extractLangFromUrl(this.router.url);
    const serviceLang = this.languageService.currentLang?.()?.code ?? null;
    return normalizeAccountLanguage(lang ?? serviceLang ?? null);
  }

  private buildCopy(lang: AccountLanguageCode) {
    return {
      title: this.translate('title', lang),
      subtitle: this.translate('subtitle', lang),
      refresh: this.translate('refresh', lang),
      hint: this.translate('hint', lang),
      empty: this.translate('empty', lang),
      noTitle: this.translate('noTitle', lang),
      noComment: this.translate('noComment', lang),
      createdLabel: this.translate('createdLabel', lang),
      view: this.translate('view', lang),
    };
  }

  private translate(key: ReviewsTranslationKey, lang: AccountLanguageCode): string {
    const entry = REVIEWS_TRANSLATIONS[key];
    return entry[lang] ?? entry[ACCOUNT_FALLBACK_LANGUAGE];
  }
}
