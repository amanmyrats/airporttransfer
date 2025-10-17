import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface NotificationMessage {
  severity: NotificationSeverity;
  summary?: string;
  detail: string;
  life?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly messagesSubject = new BehaviorSubject<NotificationMessage[]>([]);
  readonly messages$: Observable<NotificationMessage[]> = this.messagesSubject.asObservable();

  add(message: NotificationMessage): void {
    const current = this.messagesSubject.getValue();
    this.messagesSubject.next([...current, message]);
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
