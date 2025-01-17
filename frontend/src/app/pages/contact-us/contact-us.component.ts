import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {
  currentLanguage: any = { code: 'en', name: 'English', flag: 'flags/gb.svg' };

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
  }

  translations: any = {
    de: {
      contactUs: 'Kontaktieren Sie uns für Flughafentransfers in der gesamten Türkei',
      contactUsDescription: 'Wir sind hier, um Ihnen zu helfen! Kontaktieren Sie uns für Buchungen, Anfragen oder jegliche Unterstützung bei Ihren Flughafentransfer-Bedürfnissen in der Türkei. Kontaktieren Sie uns für Flughafentransfers in ganz Türkei, einschließlich der Städte Istanbul, Antalya, Alanya, Bodrum, Mugla, Ankara und Izmir.',
      ourAddress: 'Unsere Adresse',
      callUs: 'Rufen Sie uns an',
      getInTouch: 'Kontaktieren Sie uns',
      yourName: 'Ihr Name', 
      email: 'E-Mail',
      yourEmail: 'Ihre E-Mail',
      yourMessage: 'Ihre Nachricht',
      submit: 'Einreichen',
      successMessage: 'Vielen Dank, dass Sie uns kontaktiert haben. Wir werden uns so schnell wie möglich bei Ihnen melden.',
      errorMessage: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    },
    ru: {
      contactUs: 'Свяжитесь с нами для трансферов из аэропорта по всей Турции',
      contactUsDescription: 'Мы здесь, чтобы помочь! Свяжитесь с нами для бронирования, вопросов или любой помощи с вашими потребностями в трансфере из аэропорта по Турции.Свяжитесь с нами для трансфера из аэропорта по всей Турции, включая города Стамбул, Анталья, Аланья, Бодрум, Мугла, Анкара и Измир.',
      ourAddress: 'Наш адрес',
      callUs: 'Позвоните нам',
      getInTouch: 'Связаться с нами',
      yourName: 'Ваше имя', 
      email: 'Электронная почта',
      yourEmail: 'Ваш адрес электронной почты',
      yourMessage: 'Ваше сообщение',
      submit: 'Отправить',
      successMessage: 'Спасибо, что связались с нами. Мы свяжемся с вами как можно скорее.',
      errorMessage: 'Произошла ошибка. Пожалуйста, попробуйте позже.'
    }, 
    tr: {
      contactUs: 'Türkiye genelindeki havalimanı transferleri için bizimle iletişime geçin',
      contactUsDescription: 'Buradayız, size yardımcı olmak için! Türkiye’deki havalimanı transfer ihtiyaçlarınız için rezervasyon, sorular veya herhangi bir destek için bizimle iletişime geçin.İstanbul, Antalya, Alanya, Bodrum, Muğla, Ankara ve İzmir gibi şehirler dahil olmak üzere, Türkiye genelinde havalimanı transferi için bizimle iletişime geçin.',
      ourAddress: 'Adresimiz',
      callUs: 'Bizi Arayın',
      getInTouch: 'Bize Ulaşın',
      yourName: 'Adınız',
      email: 'E-posta',
      yourEmail: 'E-posta Adresiniz',
      yourMessage: 'Mesajınız',
      submit: 'Gönder',
      successMessage: 'Bize ulaştığınız için teşekkür ederiz. En kısa sürede size geri döneceğiz.',
      errorMessage: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
    },
  }

}
