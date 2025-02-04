import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactUsMessageService } from '../../admin/services/contact-us-message.service';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent, 
    FormsModule, ReactiveFormsModule, 
    ButtonModule, MessageModule, 
    CommonModule, 
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {
  currentLanguage: any = { code: 'en', name: 'English', flag: 'flags/gb.svg' };
  contactForm: FormGroup;
  isSending: boolean = false;
  isSentSuccessfully: boolean = false;
  isSendingFailed: boolean = false;

  contactUsMessageService!: ContactUsMessageService;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any, 
    private route: ActivatedRoute, 
    private meta: Meta, 
    private title: Title, 
    private fb: FormBuilder, 
  ) { 
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]], // Name is required
      email: ['', [Validators.required, Validators.email]], // Email is required and must be valid
      phone: '', // Phone is optional
      message: ['', [Validators.required]], // Message is required
    });
    if (typeof window !== 'undefined') {
      this.contactUsMessageService = inject(ContactUsMessageService);
    }
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);

  }

  onSubmit(): void {
    this.isSending = true;
    if (typeof window !== 'undefined') {
      const name = this.contactForm.get('name')?.value;
      const email = this.contactForm.get('email')?.value;
      const phone = this.contactForm.get('phone')?.value;
      const message = this.contactForm.get('message')?.value;
      console.log('Name:', name, 'Email:', email, 'Phone:', phone, 'Message:', message);
        if (this.contactForm.valid) {
        this.contactUsMessageService.sendMessage(this.contactForm.value)
          .subscribe({
            next: (response: any) => {
              console.log('Response:', response);
              this.contactForm.reset();
              this.isSending = false;
              this.isSentSuccessfully = true;
              this.isSendingFailed = false;
            },
            error: (err: any) => {
              console.error('Error:', err);
              this.isSending = false;
              this.isSendingFailed = true;
              this.isSentSuccessfully = false;
            }
      });
      } else {
        this.isSending = false;
        this.isSendingFailed = true;
        this.isSentSuccessfully = false;
      }
  }
}
  
  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: 'Contact for 24/7 Private Antalya Airport Transfer',
        description: 'Get in touch to arrange affordable and reliable 24/7 private airport transfers in Antalya, Istanbul, and more.',
      },
      de: {
        title: "Kontakt für 24/7 privaten Flughafentransfer in Antalya",
        description: "Kontaktieren Sie uns, um günstige und zuverlässige 24/7 private Flughafentransfers in Antalya, Istanbul und weiteren Städten zu arrangieren."
      },
      ru: {
        title: "Свяжитесь с нами для 24/7 частного трансфера из аэропорта Анталии",
        description: "Свяжитесь с нами, чтобы организовать доступные и надежные 24/7 частные трансферы из аэропорта в Анталии, Стамбуле и других городах."
      },
      tr: {
        title: "7/24 Özel Antalya Havalimanı Transferi İçin İletişim",
        description: "Antalya, İstanbul ve diğer şehirlerde uygun fiyatlı ve güvenilir 7/24 özel havalimanı transferleri ayarlamak için bizimle iletişime geçin."
      }
    };
    
    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

  translations: any = {
    en: {
      contactUs: 'Contact Us for 24/7 Private Airport Transfers Across Turkey',
      contactUsDescription: 'We are here to help! Contact us for bookings, inquiries, or any assistance with your 24/7 private airport transfer needs across Turkey. Contact us for airport transfers across Turkey, including the cities of Istanbul, Antalya, Alanya, Bodrum, Mugla, Ankara, and Izmir.',
      ourAddress: 'Our Address',
      callUs: 'Call Us',
      getInTouch: 'Get in Touch',
      yourName: 'Your Name',
      email: 'Email',
      yourEmail: 'Your Email',
      yourPhone: 'Your Phone',
      yourMessage: 'Your Message',
      submit: 'Submit',
      successMessage: 'Thank you for contacting us. We will get back to you as soon as possible.',
      errorMessage: 'An error occurred. Please try again.', 
      errors: {
        nameRequired: 'Name is required.',
        emailRequired: 'Email is required.',
        invalidEmail: 'Please enter a valid email address.',
        messageRequired: 'Message is required.',
      },
    }, 
    de: {
      contactUs: "Kontaktieren Sie uns für 24/7 private Flughafen transfers in der Türkei",
      contactUsDescription: "Wir sind für Sie da! Kontaktieren Sie uns für Buchungen, Anfragen oder Unterstützung bei Ihren 24/7 privaten Flughafentransfer-Bedürfnissen in der Türkei. Wir bieten Flughafentransfers in ganz Türkei an, einschließlich der Städte Istanbul, Antalya, Alanya, Bodrum, Muğla, Ankara und Izmir.",
      ourAddress: 'Unsere Adresse',
      callUs: 'Rufen Sie uns an',
      getInTouch: 'Kontaktieren Sie uns',
      yourName: 'Ihr Name', 
      email: 'E-Mail',
      yourEmail: 'Ihre E-Mail',
      yourPhone: 'Ihr Telefon',
      yourMessage: 'Ihre Nachricht',
      submit: 'Einreichen',
      successMessage: 'Vielen Dank, dass Sie uns kontaktiert haben. Wir werden uns so schnell wie möglich bei Ihnen melden.',
      errorMessage: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 
      errors: {
        nameRequired: 'Name ist erforderlich.',
        emailRequired: 'E-Mail ist erforderlich.',
        invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        messageRequired: 'Nachricht ist erforderlich.',
      },
    },
    ru: {
      contactUs: "Свяжитесь с нами для 24/7 частных трансферов из аэропорта по всей Турции",
      contactUsDescription: "Мы здесь, чтобы помочь! Свяжитесь с нами для бронирования, запросов или любой помощи по вашим 24/7 частным трансферам из аэропорта в Турции. Мы предоставляем трансферы в аэропорты по всей Турции, включая Стамбул, Анталию, Аланью, Бодрум, Муглу, Анкару и Измир.", 
      ourAddress: 'Наш адрес',
      callUs: 'Позвоните нам',
      getInTouch: 'Связаться с нами',
      yourName: 'Ваше имя', 
      email: 'Электронная почта',
      yourPhone: 'Ваш телефон',
      yourEmail: 'Ваш адрес электронной почты',
      yourMessage: 'Ваше сообщение',
      submit: 'Отправить',
      successMessage: 'Спасибо, что связались с нами. Мы свяжемся с вами как можно скорее.',
      errorMessage: 'Произошла ошибка. Пожалуйста, попробуйте.', 
      errors: {
        nameRequired: 'Имя обязательно.',
        emailRequired: 'Электронная почта обязательна.',
        invalidEmail: 'Пожалуйста, введите действительный адрес электронной почты.',
        messageRequired: 'Сообщение обязательно.',
    }
  }, 
    tr: {
      contactUs: "Türkiye Genelinde 7/24 Özel Havalimanı Transferleri İçin Bize Ulaşın",
      contactUsDescription: "Size yardımcı olmak için buradayız! Türkiye genelinde 7/24 özel havalimanı transferi rezervasyonu, bilgi talepleri veya herhangi bir konuda destek almak için bizimle iletişime geçin. İstanbul, Antalya, Alanya, Bodrum, Muğla, Ankara ve İzmir dahil olmak üzere Türkiye'nin birçok şehrinde havalimanı transfer hizmeti sunuyoruz.", 
      ourAddress: 'Adresimiz',
      callUs: 'Bizi Arayın',
      getInTouch: 'Bize Ulaşın',
      yourName: 'Adınız',
      email: 'E-posta', 
      yourEmail: 'E-posta Adresiniz',
      yourPhone: 'Telefonunuz',
      yourMessage: 'Mesajınız',
      submit: 'Gönder',
      successMessage: 'Bize ulaştığınız için teşekkür ederiz. En kısa sürede size geri döneceğiz.',
      errorMessage: 'Bir hata oluştu. Lütfen tekrar deneyin.', 
      errors: {
        nameRequired: 'Ad gerekli.',
        emailRequired: 'E-posta gerekli.',
        invalidEmail: 'Lütfen geçerli bir e-posta adresi girin.',
        messageRequired: 'Mesaj gerekli.',
    }
    }
  }

}
