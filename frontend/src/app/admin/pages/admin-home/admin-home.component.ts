import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { Router, RouterOutlet, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { PopoverModule } from 'primeng/popover';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MenuModule } from 'primeng/menu';
import { OverlayModule } from 'primeng/overlay';
import { AuthService } from '../../../auth/services/auth.service';
import { ActiveRouteService } from '../../../services/active-route.service';
import { SOCIAL_ICONS } from '../../../constants/social.constants';
import { usePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { Meta } from '@angular/platform-browser';
import { LoginComponent as AuthLoginComponent } from '../../../auth/pages/login/login.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

import {
  Reservation,
  ReservationChangeRequest,
} from '../../models/reservation.model';
import { ReservationService } from '../../services/reservation.service';
import { ChangeRequestService } from '../../services/change-request.service';
import { ContactUsMessageService } from '../../services/contact-us-message.service';
import { ReviewsService } from '../../services/reviews.service';
import { AdminReview } from '../../../account/models/review.models';
import { PendingSettlementIntent } from '../../../payment/models/payment.models';
import { PaymentAdminService } from '../../payment/services/payment-admin.service';
import { formatMinor } from '../../../payment/utils/money.util';

interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  icon: string;
  helper?: string;
}

interface ActivityItem {
  id: string;
  type: 'reservation' | 'review';
  title: string;
  subtitle: string;
  timestamp: string;
  relativeTime: string;
  icon: string;
  route: string;
  queryParams?: Record<string, unknown>;
}

@Component({
  selector: 'app-admin-home',
  imports: [
    RouterOutlet,
    MenubarModule,
    ButtonModule,
    PopoverModule,
    BadgeModule,
    AvatarModule,
    RippleModule,
    CommonModule,
    MenuModule,
    OverlayModule,
    RouterModule,
    AuthLoginComponent,
    FormsModule,
    InputTextModule,
    CardModule,
    TagModule,
  ],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.scss'
})
export class AdminHomeComponent implements OnInit {
  socialIcons = SOCIAL_ICONS;

  @ViewChild('op') op: any | null = null;

  items: MenuItem[] | undefined;
  userMenuItems: MenuItem[] | undefined;
  activeRoute: string = '';
  firstName: string = '';

  showDashboard = false;
  private hasLoadedDashboard = false;

  readonly pendingSettlementLimit = 5;
  readonly upcomingTransferLimit = 5;
  readonly urgentChangeRequestLimit = 5;
  readonly urgentReviewLimit = 5;
  readonly pendingConfirmationLimit = 5;
  readonly activityItemLimit = 8;
  readonly dashboardNumberFormatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  });
  readonly pendingConfirmationQueryParams: Record<string, unknown> = {
    status: 'draft',
  };
  readonly pendingSettlementQueryParams: Record<string, string> = {
    status: 'processing',
  };
  readonly changeRequestQueryParams: Record<string, unknown> = {
    has_change_request: true,
  };
  readonly urgentReviewQueryParams: Record<string, unknown> = {
    status: 'pending',
  };
  upcomingTransferQueryParams: Record<string, string> = {};

  kpis: DashboardKpi[] = [];
  showKpis = false;
  pendingSettlementIntents: PendingSettlementIntent[] = [];
  upcomingTransfers: Reservation[] = [];
  urgentChangeRequests: ReservationChangeRequest[] = [];
  urgentReviews: AdminReview[] = [];
  pendingConfirmationReservations: Reservation[] = [];
  activityFeed: ActivityItem[] = [];

  dashboardLoading = false;
  dashboardError: string | null = null;

  globalSearchTerm = '';
  systemStatusMessage = 'All systems operational';

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private activeRouteService: ActiveRouteService,
    private router: Router,
    public userService: UserService,
    public authService: AuthService,
    private meta: Meta,
    private reservationService: ReservationService,
    private changeRequestService: ChangeRequestService,
    private paymentAdminService: PaymentAdminService,
    private contactUsMessageService: ContactUsMessageService,
    private reviewsService: ReviewsService,
  ) {
    this.setNavbarMenu();
  }

  ngOnInit() {
    this.userService.initGetUserDetail();
    this.activeRouteService.activeRoute$.subscribe(route => {
      this.activeRoute = route;
      this.updateDashboardVisibility(route);
    });

    usePreset(Aura);
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    this.updateDashboardVisibility(this.router.url);
    this.upcomingTransferQueryParams = this.buildUpcomingTransferQueryParams();
  }

  setNavbarMenu(): void {
    this.setSuperAdminMenu();
    this.setUserMenu();
  }

  onMenuItemClick(linkAddress: string) {
    (this.op ?? { hide: () => { } }).hide();
    this.router.navigateByUrl(linkAddress);
  }

  logOut() {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.router.navigateByUrl('/'),
    });
  }

  getFirstName(): void {
    this.firstName = localStorage?.getItem('firstName')!;
  }

  onGlobalSearch(): void {
    const term = this.globalSearchTerm.trim();
    if (!term) {
      return;
    }
    this.router.navigate(['/admin/reservations'], {
      queryParams: { search: term },
    });
  }

  openActivityItem(item: ActivityItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.router.navigate([item.route], {
      queryParams: item.queryParams,
    });
  }

  openReservation(reservation: Reservation, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const searchToken = reservation.number ?? reservation.passenger_email ?? reservation.passenger_name;
    this.router.navigate(['/admin/reservations'], {
      queryParams: searchToken ? { search: searchToken } : undefined,
    });
  }

  openChangeRequest(request: ReservationChangeRequest, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.router.navigate(['/admin/reservations'], {
      queryParams: request.reservation_number ? { search: request.reservation_number } : undefined,
      fragment: request.id ? `cr-${request.id}` : undefined,
    });
  }

  openReview(review: AdminReview, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const searchToken = review.reservation_obj?.number || review.id.toString();
    this.router.navigate(['/admin/reviews'], {
      queryParams: searchToken ? { search: searchToken } : undefined,
    });
  }

  openPendingIntent(intent: PendingSettlementIntent, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const queryParams: Record<string, string> = {
      ...this.pendingSettlementQueryParams,
    };
    if (intent.booking_ref) {
      queryParams['search'] = intent.booking_ref;
    }
    this.router.navigate(['/admin/payments/intents'], {
      queryParams,
    });
  }

  private setSuperAdminMenu() {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/admin/'
      },
      {
        label: 'Rezervasyonlar',
        icon: 'pi pi-star',
        routerLink: '/admin/reservations/'
      },
      {
        label: 'Yorumlar',
        icon: 'pi pi-comments',
        routerLink: '/admin/reviews/'
      },
      {
        label: 'Meşhur Güzergahlar Fiyat Listesi',
        icon: 'pi pi-euro',
        routerLink: '/admin/popularroutes/'
      },
      {
        label: 'Kurlar',
        icon: 'pi pi-dollar',
        routerLink: '/admin/rates/'
      },
      {
        label: 'Ödemeler',
        icon: 'pi pi-credit-card',
        items: [
          {
            label: 'Ödeme Niyetleri',
            icon: 'pi pi-check',
            routerLink: '/admin/payments/intents'
          },
          {
            label: 'İşlem Kayıtları',
            icon: 'pi pi-list',
            routerLink: '/admin/payments/transactions'
          },
          {
            label: 'Manuel Tahsilat',
            icon: 'pi pi-check-square',
            routerLink: '/admin/payments/offline-settlement'
          },
          {
            label: 'İade Oluştur',
            icon: 'pi pi-refresh',
            routerLink: '/admin/payments/refund-issue'
          },
        ],
      },
      {
        label: 'Kullanıcılar',
        icon: 'pi pi-user',
        routerLink: '/admin/users/'
      },
      {
        label: 'Blogs Posts',
        icon: 'pi pi-user',
        routerLink: '/admin/blog-posts/'
      },
      {
        label: 'FAQ',
        icon: 'pi pi-question',
        routerLink: '/admin/faqlibraries/'
      }
    ];
  }

  private setUserMenu() {
    this.userMenuItems = [
      {
        label: 'Profil',
        icon: 'pi pi-user',
        command: () => this.onMenuItemClick('/admin/profile')

      },
      {
        label: 'Şifre değiştir',
        icon: 'pi pi-key',
        command: () => this.onMenuItemClick('/admin/changepassword')
      },
      {
        label: 'Çıkış',
        icon: 'pi pi-sign-out',
        command: () => this.logOut()
      },
    ];
  }

  private updateDashboardVisibility(url: string): void {
    const normalized = this.normalizeUrl(url);
    this.showDashboard = normalized === '/admin' || normalized === '';
    if (this.showDashboard && !this.hasLoadedDashboard && this.authService.isLoggedIn()) {
      this.loadDashboardData();
      this.hasLoadedDashboard = true;
    }
  }

  private normalizeUrl(url: string | null | undefined): string {
    if (!url) {
      return '';
    }
    const trimmed = url.split('?')[0].split('#')[0];
    return trimmed.replace(/\/+$/, '') || '';
  }

  private loadDashboardData(): void {
    this.dashboardLoading = true;
    this.dashboardError = null;

    const now = new Date();
    const todayStr = this.formatDateInput(now);
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    this.upcomingTransferQueryParams = this.buildUpcomingTransferQueryParams(now);

    const todaysReservations$ = this.reservationService.listAdmin({
      start_date: todayStr,
      end_date: todayStr,
      ordering: '-created_at',
      page_size: 1000,
    });

    const upcomingTransfers$ = this.reservationService.listAdmin({
      transfer_date_time_from: now.toISOString(),
      transfer_date_time_to: next24h.toISOString(),
      ordering: 'transfer_date,transfer_time',
      page_size: this.upcomingTransferLimit,
    });

    const pendingReviewChangeRequests$ = this.changeRequestService.listAdmin({
      status: 'pending_review',
      page_size: this.urgentChangeRequestLimit,
    });

    const awaitingPaymentChangeRequests$ = this.changeRequestService.listAdmin({
      status: 'awaiting_user_payment',
      page_size: this.urgentChangeRequestLimit,
    });

    const todaysContactMessages$ = this.contactUsMessageService.getContactUsMessages(
      this.buildQueryString({
        created_at_date: todayStr,
        page_size: 1,
      }),
    );

    const flaggedReviews$ = this.reviewsService.listAdmin({
      is_flagged: true,
      ordering: '-updated_at',
      page_size: this.urgentReviewLimit,
    });

    const pendingReviews$ = this.reviewsService.listAdmin({
      status: 'pending',
      ordering: '-updated_at',
      page_size: this.urgentReviewLimit,
    });

    const pendingConfirmationReservations$ = this.reservationService.listAdmin({
      status: 'draft',
      ordering: '-created_at',
      page_size: this.pendingConfirmationLimit,
    });

    const pendingSettlementIntents$ = this.paymentAdminService.listPendingSettlementIntents(
      this.pendingSettlementLimit,
    );

    const recentReservations$ = this.reservationService.listAdmin({
      ordering: '-created_at',
      page_size: this.activityItemLimit,
    });

    const recentReviews$ = this.reviewsService.listAdmin({
      ordering: '-created_at',
      page_size: this.activityItemLimit,
    });

    forkJoin({
      todaysReservations: todaysReservations$,
      upcomingTransfers: upcomingTransfers$,
      pendingReviewChangeRequests: pendingReviewChangeRequests$,
      awaitingPaymentChangeRequests: awaitingPaymentChangeRequests$,
      todaysContactMessages: todaysContactMessages$,
      flaggedReviews: flaggedReviews$,
      pendingReviews: pendingReviews$,
      pendingConfirmationReservations: pendingConfirmationReservations$,
      pendingSettlementIntents: pendingSettlementIntents$,
      recentReservations: recentReservations$,
      recentReviews: recentReviews$,
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(error => {
          console.error('Failed to load admin dashboard', error);
          this.dashboardError = 'Dashboard verileri alınamadı.';
          this.dashboardLoading = false;
          return of(null);
        }),
      )
      .subscribe(results => {
        if (!results) {
          return;
        }
        const {
          todaysReservations,
          upcomingTransfers,
          pendingReviewChangeRequests,
          awaitingPaymentChangeRequests,
          todaysContactMessages,
          flaggedReviews,
          pendingReviews,
          pendingConfirmationReservations,
          pendingSettlementIntents,
          recentReservations,
          recentReviews,
        } = results;

        if (this.showKpis) {
          this.populateKpis(
            todaysReservations.results ?? [],
            todaysReservations.count ?? todaysReservations.results?.length ?? 0,
            todaysContactMessages.count ?? todaysContactMessages.results?.length ?? 0,
            pendingReviewChangeRequests.count ?? 0,
            awaitingPaymentChangeRequests.count ?? 0,
          );
        }

        this.upcomingTransfers = (upcomingTransfers.results ?? []).slice(
          0,
          this.upcomingTransferLimit,
        );

        this.urgentChangeRequests = this.mergeChangeRequests(
          pendingReviewChangeRequests.results ?? [],
          awaitingPaymentChangeRequests.results ?? [],
        );

        this.urgentReviews = this.mergeReviews(
          flaggedReviews.results ?? [],
          pendingReviews.results ?? [],
        );

        this.pendingConfirmationReservations = (pendingConfirmationReservations.results ?? []).slice(
          0,
          this.pendingConfirmationLimit,
        );

        this.pendingSettlementIntents = (pendingSettlementIntents ?? []).slice(
          0,
          this.pendingSettlementLimit,
        );

        this.activityFeed = this.buildActivityFeed(
          recentReservations.results ?? [],
          recentReviews.results ?? [],
        );

        this.dashboardLoading = false;
      });
  }

  private populateKpis(
    todaysReservations: Reservation[],
    todayReservationCount: number,
    todaysContactMessageCount: number,
    pendingReviewCount: number,
    awaitingPaymentCount: number,
  ): void {
    const todayRevenue = todaysReservations.reduce((total, reservation) => {
      const amount = typeof reservation.amount === 'string'
        ? parseFloat(reservation.amount)
        : reservation.amount ?? 0;
      return total + (Number.isFinite(amount) ? Number(amount) : 0);
    }, 0);

    const currencyCode =
      todaysReservations.find(reservation => reservation.currency_code)?.currency_code || 'TRY';

    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(todayRevenue);

    const totalPendingChanges = pendingReviewCount + awaitingPaymentCount;

    this.kpis = [
      {
        id: 'today-reservations',
        label: "Today's Reservations",
        value: this.dashboardNumberFormatter.format(todayReservationCount),
        icon: 'pi pi-calendar-clock',
      },
      {
        id: 'pending-changes',
        label: 'Pending Change Requests',
        value: this.dashboardNumberFormatter.format(totalPendingChanges),
        icon: 'pi pi-history',
      },
      {
        id: 'contact-messages',
        label: 'New Contact Messages',
        value: this.dashboardNumberFormatter.format(todaysContactMessageCount),
        icon: 'pi pi-inbox',
      },
      {
        id: 'today-revenue',
        label: "Today's Revenue",
        value: formattedRevenue,
        icon: 'pi pi-chart-line',
      },
    ];
  }

  private mergeChangeRequests(
    pending: ReservationChangeRequest[],
    awaitingPayment: ReservationChangeRequest[],
  ): ReservationChangeRequest[] {
    const combined = [...pending, ...awaitingPayment];
    const uniqueMap = new Map<number, ReservationChangeRequest>();
    combined.forEach(request => {
      if (!uniqueMap.has(request.id)) {
        uniqueMap.set(request.id, request);
      }
    });
    return Array.from(uniqueMap.values()).slice(0, this.urgentChangeRequestLimit);
  }

  private buildActivityFeed(
    reservations: Reservation[],
    reviews: AdminReview[],
  ): ActivityItem[] {
    const reservationItems: ActivityItem[] = reservations.map(reservation => {
      const createdAt = reservation.created_at ?? '';
      return {
        id: `reservation-${reservation.id ?? reservation.number ?? createdAt}`,
        type: 'reservation',
        title: reservation.passenger_name || reservation.passenger_email || 'New reservation',
        subtitle: reservation.number
          ? `Reservation ${reservation.number}`
          : 'New reservation created',
        timestamp: createdAt,
        relativeTime: this.formatRelativeTime(createdAt),
        icon: 'pi pi-briefcase',
        route: '/admin/reservations',
        queryParams: reservation.number
          ? { search: reservation.number }
          : undefined,
      };
    });

    const reviewItems: ActivityItem[] = reviews.map(review => {
      const createdAt = review.created_at ?? review.updated_at ?? '';
      return {
        id: `review-${review.id}`,
        type: 'review',
        title: review.title || `Review #${review.id}`,
        subtitle: `Rating ${review.rating}/5 ${
          review.is_flagged ? '(Flagged)' : ''
        }`.trim(),
        timestamp: createdAt,
        relativeTime: this.formatRelativeTime(createdAt),
        icon: 'pi pi-comments',
        route: '/admin/reservations',
        queryParams: review.reservation_obj?.number
          ? { search: review.reservation_obj.number }
          : undefined,
      };
    });

    return [...reservationItems, ...reviewItems]
      .sort((a, b) => {
        const aTime = new Date(a.timestamp || 0).getTime();
        const bTime = new Date(b.timestamp || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, this.activityItemLimit);
  }

  private mergeReviews(
    flagged: AdminReview[],
    pending: AdminReview[],
  ): AdminReview[] {
    const combined = [...flagged, ...pending];
    const reviewMap = new Map<number, AdminReview>();

    combined.forEach(review => {
      if (!review) {
        return;
      }
      const existing = reviewMap.get(review.id);
      if (!existing) {
        reviewMap.set(review.id, review);
        return;
      }

      if (!existing.is_flagged && review.is_flagged) {
        reviewMap.set(review.id, { ...existing, is_flagged: true });
      }
    });

    return Array.from(reviewMap.values())
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, this.urgentReviewLimit);
  }

  private formatDateInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatRelativeTime(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) {
      return '';
    }
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / (60 * 1000));
    const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffMinutes) < 60) {
      return relativeFormatter.format(diffMinutes, 'minute');
    }
    const diffHours = Math.round(diffMs / (60 * 60 * 1000));
    if (Math.abs(diffHours) < 24) {
      return relativeFormatter.format(diffHours, 'hour');
    }
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    return relativeFormatter.format(diffDays, 'day');
  }

  private buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      searchParams.append(key, String(value));
    });
    const query = searchParams.toString();
    return query ? `?${query}` : '';
  }

  private buildUpcomingTransferQueryParams(baseDate: Date = new Date()): Record<string, string> {
    const next24h = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    return {
      transfer_date_time_from: baseDate.toISOString(),
      transfer_date_time_to: next24h.toISOString(),
      ordering: 'transfer_date,transfer_time',
    };
  }

  formatCurrency(amountMinor: number | null | undefined, currency: string | null | undefined): string {
    if (typeof amountMinor !== 'number' || !currency) {
      return '—';
    }
    return formatMinor(amountMinor, currency);
  }
}
