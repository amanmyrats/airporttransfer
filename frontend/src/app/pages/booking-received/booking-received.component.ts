import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-booking-received',
  imports: [],
  templateUrl: './booking-received.component.html',
  styleUrl: './booking-received.component.scss'
})
export class BookingReceivedComponent implements OnInit {
  currentLanguage = { code: 'en', name: 'English', flag: 'flags/gb.svg' };

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }
}
