import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { BlogImage } from '../../../admin/blogs/models/blog-image.model';

@Component({
  selector: 'app-image-section-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-section-public.component.html',
  styleUrls: ['./image-section-public.component.scss'],
})
export class ImageSectionPublicComponent {
  /** images from API */
  @Input() images: BlogImage[] = [];

  /** language (for alt/caption if you need it later) */
  @Input() lang = 'en';

  /** starting slide index */
  @Input() startIndex = 0;

  /** allow wrap-around */
  @Input() loop = false;

  /** show dot indicators */
  @Input() showIndicators = true;

  /** fixed height (prevents vertical page shift). tweak to taste */
  @Input() height = 480; // px

  currentIndex = 0;

  ngOnChanges(): void {
    const last = Math.max(0, (this.images?.length ?? 1) - 1);
    this.currentIndex = Math.min(Math.max(this.startIndex, 0), last);
  }

  // navigation
  get canGoPrev(): boolean {
    const n = this.images?.length ?? 0;
    if (n <= 1) return false;
    return this.loop || this.currentIndex > 0;
  }
  get canGoNext(): boolean {
    const n = this.images?.length ?? 0;
    if (n <= 1) return false;
    return this.loop || this.currentIndex < n - 1;
  }

  go(delta: number) {
    const n = this.images?.length ?? 0;
    if (!n) return;

    if (this.loop) {
      this.currentIndex = (this.currentIndex + delta + n) % n;
      return;
    }
    this.currentIndex = Math.min(Math.max(this.currentIndex + delta, 0), n - 1);
  }

  jumpTo(i: number) {
    if (!this.images?.length) return;
    if (i < 0 || i >= this.images.length) return;
    this.currentIndex = i;
  }

  imgSrc(img?: BlogImage): string {
    return (img?.src || img?.image) ?? '';
  }

  // keyboard
  @HostListener('keydown.arrowLeft', ['$event'])
  onLeft(e: KeyboardEvent) {
    if (this.canGoPrev) {
      e.preventDefault();
      this.go(-1);
    }
  }
  @HostListener('keydown.arrowRight', ['$event'])
  onRight(e: KeyboardEvent) {
    if (this.canGoNext) {
      e.preventDefault();
      this.go(1);
    }
  }

  // touch swipe
  private startX: number | null = null;
  onTouchStart(e: TouchEvent) {
    this.startX = e.touches[0]?.clientX ?? null;
  }
  onTouchEnd(e: TouchEvent) {
    if (this.startX == null) return;
    const dx = (e.changedTouches[0]?.clientX ?? this.startX) - this.startX;
    const th = 40;
    if (dx > th && this.canGoPrev) this.go(-1);
    if (dx < -th && this.canGoNext) this.go(1);
    this.startX = null;
  }
}
