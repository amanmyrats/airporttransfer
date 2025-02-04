import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { title } from 'node:process';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-gallery',
  imports: [
    SuperHeaderComponent,
    NavbarComponent,
    FooterComponent,
    CommonModule, 
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  currentLanguage: any = {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
  };

  constructor(
    private route: ActivatedRoute,
    private meta: Meta, 
    private title: Title, 
  ) {
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
    this.setMetaTags(this.currentLanguage.code);
  }
  
  setMetaTags(langCode: string): void {
    const metaTags: any = {
      en: {
        title: '24/7 Private Antalya Airport Transfers Images',
        description: 'Explore our gallery for 24/7 private airport transfers in Antalya and other Turkish cities.',
      },
      de: {
        title: "Bilder von 24/7 privaten Flughafentransfers in Antalya",
        description: "Entdecken Sie unsere Galerie für 24/7 private Flughafentransfers in Antalya und anderen türkischen Städten."
      },
      ru: {
        title: "Галерея 24/7 частных трансферов из аэропорта Анталии",
        description: "Ознакомьтесь с нашей галереей 24/7 частных трансферов из аэропорта Анталии и других городов Турции."
      },
      tr: {
        title: "7/24 Özel Antalya Havalimanı Transfer Görselleri",
        description: "Antalya ve diğer Türk şehirlerindeki 7/24 özel havalimanı transferleri için galerimizi keşfedin."
      }
    };

    const meta: any = metaTags[langCode] || metaTags['en'];
    this.title.setTitle(meta.title);
    this.meta.updateTag({ name: 'description', content: meta.description });
  }

  getImageUrl(image: any, languageCode: string): string {
    return `images/gallery/${image.url[languageCode]}`;
  }

  getSmallImagePath(image: any, languageCode: string): string {
    return `images/gallery/${image.smallImageName[languageCode]}`;
  }

  getLargeImagePath(image: any, languageCode: string): string {
    return `images/gallery/${image.largeImageName[languageCode]}`;
  }

  getImageDataTitle(image: any, languageCode: string): string {
    return image.dataTitle[languageCode];
  }

  getImageAlt(image: any, languageCode: string): string {
    return image.alt[languageCode];
  }

  getImageCaption(image: any, languageCode: string): string {
    return image.caption[languageCode];
  }

  getImageDescription(image: any, languageCode: string): string {
    return image.description[languageCode];
  }

  GALLERY_IMAGES = [

    // For Istanbul Airport
    {
      url: {
        en: '24-7-private-istanbul-airport-transfer.webp',
        de: '24-7-private-istanbul-flughafentransfer.webp',
        ru: '24-7-индивидуальный-трансфер-из-аэропорта-стамбул.webp',
        tr: '7-24-özel-istanbul-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-istanbul-airport-mercedes-vito.webp',
        de: '24-7-private-istanbul-flughafen-mercedes-vito.webp',
        ru: '24-7-частный-стамбул-аэропорт-мерседес-вито.webp',
        tr: '7-24-özel-istanbul-havalimani-mercedes-vito.webp',
      },
      largeImageName: {
        en: '24-7-private-istanbul-airport-mercedes-vito-large.webp',
        de: '24-7-private-istanbul-flughafen-mercedes-vito-groß.webp',
        ru: '24-7-частный-стамбул-аэропорт-мерседес-вито-большой.webp',
        tr: '7-24-özel-istanbul-havalimani-mercedes-vito-buyuk.webp',
      },
      dataTitle: {
        en: 'Luxury 24/7 Private Airport Transfer - Mercedes Vito in Istanbul',
        de: 'Luxus 24/7 Privater Flughafentransfer - Mercedes Vito in Istanbul',
        ru: 'Роскошный 24/7 частный трансфер из аэропорта - Mercedes Vito в Стамбуле',
        tr: 'Lüks 7/24 Özel Havalimanı Transferi - Mercedes Vito İstanbul',
      },
      alt: {
        en: 'Mercedes Vito luxury 24/7 private airport transfer in Istanbul', 
        de: 'Mercedes Vito Luxus 24/7 privater Flughafentransfer in Istanbul',
        ru: 'Mercedes Vito роскошный 24/7 частный трансфер из аэропорта в Стамбуле',
        tr: 'İstanbul’da lüks Mercedes Vito 7/24 özel havalimanı transferi',
      },
      caption: {
        en: 'Experience Istanbul with our luxurious Mercedes Vito 24/7 private airport transfers.',
        de: 'Erleben Sie Istanbul mit unseren luxuriösen Mercedes Vito 24/7 privaten Flughafentransfers.',
        ru: 'Почувствуйте Стамбул с нашими роскошными 24/7 частными трансферами из аэропорта на Mercedes Vito.',
        tr: 'Lüks Mercedes Vito 7/24 özel havalimanı transferlerimizle İstanbul’u keşfedin.',
      },
      description: {
        en: 'Travel in comfort with our Mercedes Vito 24/7 private airport transfer in Istanbul. Serving Istanbul Airport (IST) and Sabiha Gökçen Airport (SAW).',
        de: 'Reisen Sie mit unserem Mercedes Vito 24/7 privaten Flughafentransfer in Istanbul komfortabel. Bedienung des Flughafens Istanbul (IST) und des Flughafens Sabiha Gökçen (SAW).',
        ru: 'Путешествуйте с комфортом с нашим 24/7 частным трансфером из аэропорта на Mercedes Vito в Стамбуле. Обслуживание аэропорта Стамбул (IST) и аэропорта Сабиха Гёкчен (SAW).',
        tr: 'İstanbul’da Mercedes Vito 7/24 özel havalimanı transferimizle konforlu bir şekilde seyahat edin. İstanbul Havalimanı (IST) ve Sabiha Gökçen Havalimanı (SAW) hizmetindedir.',
      },
    },

    // For Antalya Airport
    {
      url: {
        en: '24-7-private-antalya-airport-transfer.webp',
        de: '24-7-private-antalya-flughafentransfer.webp',
        ru: '24-7-частный-трансфер-из-аэропорта-анталии.webp',
        tr: '7-24-özel-antalya-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-airport-mercedes-sprinter.webp',
        de: '24-7-private-antalya-flughafen-mercedes-sprinter.webp',
        ru: '24-7-частный-анталия-аэропорт-мерседес-спринтер.webp',
        tr: '7-24-özel-antalya-havalimani-mercedes-sprinter.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-airport-mercedes-sprinter-large.webp',
        de: '24-7-private-antalya-flughafen-mercedes-sprinter-groß.webp',
        ru: '24-7-частный-анталия-аэропорт-мерседес-спринтер-большой.webp',
        tr: '7-24-özel-antalya-havalimani-mercedes-sprinter-buyuk.webp',
      },
      dataTitle: {
        en: 'Luxury 24/7 Private Airport Transfer - Mercedes Sprinter in Antalya',
        de: 'Luxus 24/7 Privater Flughafentransfer - Mercedes Sprinter in Antalya',
        ru: 'Роскошный 24/7 частный трансфер из аэропорта - Mercedes Sprinter в Анталии',
        tr: 'Lüks 7/24 Özel Havalimanı Transferi - Mercedes Sprinter Antalya',
      },
      alt: {
        en: 'Mercedes Sprinter 24/7 private airport transfer in Antalya',
        de: 'Mercedes Sprinter Luxus 24/7 privater Flughafentransfer in Antalya',
        ru: 'Mercedes Sprinter роскошный 24/7 частный трансфер из аэропорта в Анталии',
        tr: 'Antalya’da lüks Mercedes Sprinter 7/24 özel havalimanı transferi',
      },
      caption: {
        en: '24/7 Private and Premium transfers in Antalya with Mercedes Sprinter.',
        de: '24/7 Privat- und Premiumtransfers in Antalya mit Mercedes Sprinter.',
        ru: '24/7 Частные и премиальные трансферы в Анталии на Mercedes Sprinter.',
        tr: 'Antalya’da Mercedes Sprinter ile 7/24 Özel ve Premium transferler.',
      },
      description: {
        en: 'Explore Antalya with our luxury 24/7 Private Mercedes Sprinter transfers, ideal for groups. Serving Antalya Airport (AYT).',
        de: 'Erkunden Sie Antalya mit unseren luxuriösen 24/7 privaten Mercedes Sprinter-Transfers, ideal für Gruppen. Bedienung des Flughafens Antalya (AYT).',
        ru: 'Исследуйте Анталью с нашими роскошными 24/7 частными трансферами Mercedes Sprinter, идеально подходящими для групп. Обслуживание аэропорта Анталья (AYT).',
        tr: 'Antalya’da lüks 24/7 Özel Mercedes Sprinter transferlerimizle gruplar için ideal bir şekilde Antalya Havalimanı (AYT) hizmetindedir.',
      },
    },

    // For Izmir Adnan Menderes Airport
    {
      url: {
        en: '24-7-private-izmir-adnan-menderes-airport-transfer.webp',
        de: '24-7-private-izmir-adnan-menderes-flughafentransfer.webp',
        ru: '24-7-частный-измир-аднан-мендерес-аэропорт-трансфер.webp',
        tr: '7-24-özel-izmir-adnan-menderes-havalimani-transfer.webp',
      }, 
      smallImageName: {
        en: '24-7-private-izmir-adnan-menderes-airport-mercedes-maybach.webp',
        de: '24-7-private-izmir-adnan-menderes-flughafen-mercedes-maybach.webp',
        ru: '24-7-частный-измир-аднан-мендерес-аэропорт-мерседес-майбах.webp',
        tr: '7-24-özel-izmir-adnan-menderes-havalimani-mercedes-maybach.webp',
      },
      largeImageName: {
        en: '24-7-private-izmir-adnan-menderes-airport-mercedes-maybach-large.webp',
        de: '24-7-private-izmir-adnan-menderes-flughafen-mercedes-maybach-groß.webp',
        ru: '24-7-частный-измир-аднан-мендерес-аэропорт-мерседес-майбах-большой.webp',
        tr: '7-24-özel-izmir-adnan-menderes-havalimani-mercedes-maybach-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Private and Premium Transfer - Mercedes Maybach S-Class in Izmir Adnan Menderes Airport', 
        de: '24/7 Privater und Premium-Transfer - Mercedes Maybach S-Klasse in Izmir Adnan Menderes Flughafen',
        ru: '24/7 Частный и премиальный трансфер - Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт',
        tr: '24/7 Özel ve Premium Transfer - İzmir Adnan Menderes Havalimanı’nda Mercedes Maybach S Sınıfı',
      },
      alt: {
        en: '24/7 Private Luxury Mercedes Maybach S-Class transfer in Izmir Adnan Menderes Airport', 
        de: '24/7 Privater Luxus-Mercedes Maybach S-Klasse-Transfer am Izmir Adnan Menderes Flughafen',
        ru: '24/7 Частный роскошный трансфер Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт',
        tr: 'İzmir Adnan Menderes Havalimanı’nda 24/7 Özel Lüks Mercedes Maybach S Sınıfı transfer',
      },
      caption: {
        en: 'Travel in style with Mercedes Maybach S-Class in Izmir Adnan Menderes Airport.',
        de: 'Reisen Sie stilvoll mit der Mercedes Maybach S-Klasse in Izmir Adnan Menderes Flughafen.',
        ru: 'Путешествуйте с комфортом на Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт.',
        tr: 'İzmir’de Mercedes Maybach S Sınıfı ile şık bir yolculuk yapın Adnan Menderes Havalimanı.',
      },
      description: {
        en: 'Arrive in elegance with our premium Mercedes Maybach S-Class 24/7 Private transfer service in Izmir. Serving Izmir Adnan Menderes Airport (ADB).', 
        de: 'Kommen Sie elegant an mit unserem Premium Mercedes Maybach S-Klasse 24/7 Privattransfer-Service in Izmir. Bedienung des Flughafens Izmir Adnan Menderes (ADB).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на Mercedes Maybach S-Класс 24/7 Частный сервис в Измире. Обслуживание аэропорта Измир Аднан Мендерес (ADB).',
        tr: 'İzmir Adnan Menderes Havalimanı (ADB) hizmetimizde lüks Mercedes Maybach S Sınıfı 24/7 Özel transferimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // For Gazipasa Airport
    {
      url: {
        en: '24-7-private-alanya-gazipasa-airport-transfer.webp',
        de: '24-7-private-alanya-gazipasa-flughafentransfer.webp',
        ru: '24-7-частный-аланья-газипаша-аэропорт-трансфер.webp',
        tr: '7-24-özel-alanya-gazipasa-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-alanya-gazipasa-airport-mercedes-e-class.webp',
        de: '24-7-private-alanya-gazipasa-flughafen-mercedes-e-klasse.webp',
        ru: '24-7-частный-аланья-газипаша-аэропорт-мерседес-e-класс.webp',
        tr: '7-24-özel-alanya-gazipasa-havalimani-mercedes-e-sınıfı.webp',
      },
      largeImageName: {
        en: '24-7-private-alanya-gazipasa-airport-mercedes-e-class-large.webp',
        de: '24-7-private-alanya-gazipasa-flughafen-mercedes-e-klasse-groß.webp',
        ru: '24-7-частный-аланья-газипаша-аэропорт-мерседес-e-класс-большой.webp',
        tr: '7-24-özel-alanya-gazipasa-havalimani-mercedes-e-sınıfı-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Private and Premium Transfer - Mercedes E-Class in Alanya Gazipasa Airport', 
        de: '24/7 Privater und Premium-Transfer - Mercedes E-Klasse in Alanya Gazipasa Flughafen',
        ru: '24/7 Частный и премиальный трансфер - Mercedes E-Класс в аэропорт Аланья Газипаша',
        tr: '24/7 Özel ve Premium Transfer - Alanya Gazipaşa Havalimanı’nda Mercedes E-Sınıfı',
      },
      alt: {
        en: '24/7 Private Luxury Mercedes E-Class transfer in Alanya Gazipasa Airport', 
        de: '24/7 Privater Luxus-Mercedes E-Klasse-Transfer am Alanya Gazipasa Flughafen',
        ru: '24/7 Частный роскошный трансфер Mercedes E-Класс в аэропорт Аланья Газипаша',
        tr: 'Alanya Gazipaşa Havalimanı’nda 24/7 Özel Lüks Mercedes E-Sınıfı transfer',
      },
      caption: {
        en: 'Travel in style with Mercedes E-Class in Alanya Gazipasa Airport.',
        de: 'Reisen Sie stilvoll mit der Mercedes E-Klasse in Alanya Gazipasa Airport.',
        ru: 'Путешествуйте с комфортом на Mercedes E-Класс в аэропорт Аланья Газипаша.',
        tr: 'Alanya Gazipaşa Havalimanı’nda Mercedes E-Sınıfı ile şık bir yolculuk yapın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Mercedes E-Class transfer service in Alanya Gazipasa Airport. Serving Alanya Gazipasa Airport (GZP).',
        de: 'Kommen Sie elegant an mit unserem Premium Mercedes E-Klasse Transfer-Service in Alanya Gazipasa Airport. Bedienung des Flughafens Alanya Gazipasa (GZP).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на Mercedes E-Класс в аэропорт Аланья Газипаша. Обслуживание аэропорта Аланья Газипаша (GZP).',
        tr: 'Alanya Gazipaşa Havalimanı (GZP) hizmetimizde lüks Mercedes E-Sınıfı transferimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // For Istanbul Sabiha Gokcen Airport
    {
      url: {
        en: '24-7-private-istanbul-sabiha-gokcen-airport-transfer.webp',
        de: '24-7-private-istanbul-sabiha-gokcen-flughafentransfer.webp',
        ru: '24-7-частный-стамбул-сабиха-гёкчен-аэропорт-трансфер.webp',
        tr: '7-24-özel-istanbul-sabiha-gokcen-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-istanbul-sabiha-gokcen-airport-mercedes-s-class.webp',
        de: '24-7-private-istanbul-sabiha-gokcen-flughafen-mercedes-s-klasse.webp',
        ru: '24-7-частный-стамбул-сабиха-гёкчен-аэропорт-мерседес-s-класс.webp',
        tr: '7-24-özel-istanbul-sabiha-gokcen-havalimanı-mercedes-s-sınıfı.webp',
      },
      largeImageName: {
        en: '24-7-private-istanbul-sabiha-gokcen-airport-mercedes-s-class-large.webp',
        de: '24-7-private-istanbul-sabiha-gokcen-flughafen-mercedes-s-klasse-groß.webp',
        ru: '24-7-частный-стамбул-сабиха-гёкчен-аэропорт-мерседес-s-класс-большой.webp',
        tr: '7-24-özel-istanbul-sabiha-gokcen-havalimanı-mercedes-s-sınıfı-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Mercedes S-Class in Istanbul Sabiha Gokcen Airport',
        de: '24/7 Premium Transfer - Mercedes S-Klasse in Istanbul Sabiha Gokcen Flughafen',
        ru: '24/7 Премиальный трансфер - Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен',
        tr: '7/24 Premium Transfer - İstanbul Sabiha Gökçen Havalimanı’nda Mercedes S-Sınıfı',
      },
      alt: {
        en: '24/7 Luxury Mercedes S-Class transfer in Istanbul Sabiha Gokcen Airport',
        de: '24/7 Luxus Mercedes S-Klasse Transfer in Istanbul Sabiha Gokcen Airport',
        ru: '24/7 Роскошный трансфер на Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен',
        tr: '7/24 İstanbul Sabiha Gökçen Havalimanı’nda lüks Mercedes S-Sınıfı transferi',
      },
      caption: {
        en: 'Travel in style with Mercedes S-Class in Istanbul Sabiha Gokcen Airport.',
        de: 'Reisen Sie stilvoll mit der Mercedes S-Klasse in Istanbul Sabiha Gokcen Airport.',
        ru: 'Путешествуйте с комфортом на Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен.',
        tr: 'İstanbul Sabiha Gökçen Havalimanı’nda Mercedes S-Sınıfı ile şık bir yolculuk yapın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Mercedes S-Class transfer service in Istanbul Sabiha Gokcen Airport. Serving Istanbul Sabiha Gokcen Airport (SAW).',
        de: 'Kommen Sie elegant an mit unserem Premium Mercedes S-Klasse Transfer-Service in Istanbul Sabiha Gokcen Airport. Bedienung des Flughafens Istanbul Sabiha Gokcen (SAW).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен. Обслуживание аэропорта Стамбул Сабиха Гёкчен (SAW).',
        tr: 'İstanbul Sabiha Gökçen Havalimanı (SAW) hizmetimizde lüks Mercedes S-Sınıfı transferimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // For Bodrum Milas Airport, but don't specify car name, specify aiport name, city name, and transfer itself
    {
      url: {
        en: '24-7-private-bodrum-milas-airport-transfer.webp',
        de: '24-7-private-bodrum-milas-flughafentransfer.webp',
        ru: '24-7-частный-бодрум-милас-аэропорт-трансфер.webp',
        tr: '7-24-özel-bodrum-milas-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-bodrum-milas-airport-transfer.webp',
        de: '24-7-private-bodrum-milas-flughafentransfer.webp',
        ru: '24-7-частный-бодрум-милас-аэропорт-трансфер.webp',
        tr: '7-24-özel-bodrum-milas-havalimani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-bodrum-milas-airport-transfer-large.webp',
        de: '24-7-private-bodrum-milas-flughafentransfer-gross.webp',
        ru: '24-7-частный-бодрум-милас-аэропорт-трансфер-большой.webp',
        tr: '7-24-özel-bodrum-milas-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Bodrum Milas Airport Transfer',
        de: '24/7 Premium Transfer - Bodrum Milas Flughafen Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер аэропорт Бодрум Милас',
        tr: '7/24 Premium Transfer - Bodrum Milas Havalimanı Transfer',
      },
      alt: {
        en: '24/7 Luxury Bodrum Milas Airport transfer',
        de: '24/7 Luxus Bodrum Milas Flughafen Transfer',
        ru: '24/7 Роскошный трансфер аэропорт Бодрум Милас',
        tr: '7/24 Lüks Bodrum Milas Havalimanı transferi',
      },
      caption: {
        en: 'Travel in style with Bodrum Milas Airport transfer.',
        de: 'Reisen Sie stilvoll mit dem Bodrum Milas Flughafen Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером аэропорт Бодрум Милас.',
        tr: 'Bodrum Milas Havalimanı transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Bodrum Milas Airport transfer service. Serving Bodrum Milas Airport (BJV).',
        de: 'Kommen Sie elegant an mit unserem Premium Bodrum Milas Flughafen Transfer-Service. Bedienung des Flughafens Bodrum Milas (BJV).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером аэропорт Бодрум Милас. Обслуживание аэропорта Бодрум Милас (BJV).',
        tr: 'Bodrum Milas Havalimanı transfer hizmetimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // For Mugla Dalaman Airport, but don't specify car name, specify aiport name, city name, and transfer itself
    {
      url: {
        en: '24-7-private-mugla-dalaman-airport-transfer.webp',
        de: '24-7-private-mugla-dalaman-flughafentransfer.webp',
        ru: '24-7-частный-мугла-даламан-аэропорт-трансфер.webp',
        tr: '7-24-özel-mugla-dalaman-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-mugla-dalaman-airport-transfer.webp',
        de: '24-7-private-mugla-dalaman-flughafentransfer.webp',
        ru: '24-7-частный-мугла-даламан-аэропорт-трансфер.webp',
        tr: '7-24-özel-mugla-dalaman-havalimani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-mugla-dalaman-airport-transfer-large.webp',
        de: '24-7-private-mugla-dalaman-flughafentransfer-gross.webp',
        ru: '24-7-частный-мугла-даламан-аэропорт-трансфер-большой.webp',
        tr: '7-24-özel-mugla-dalaman-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Mugla Dalaman Airport Transfer',
        de: '24/7 Premium Transfer - Mugla Dalaman Flughafen Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер аэропорт Мугла Даламан',
        tr: '7/24 Premium Transfer - Mugla Dalaman Havalimanı Transfer',
      },
      alt: {
        en: '24/7 Luxury Mugla Dalaman Airport transfer',
        de: '24/7 Luxus Mugla Dalaman Flughafen Transfer',
        ru: '24/7 Роскошный трансфер аэропорт Мугла Даламан',
        tr: '7/24 Lüks Mugla Dalaman Havalimanı transferi',
      },
      caption: {
        en: 'Travel in style with Mugla Dalaman Airport transfer.',
        de: 'Reisen Sie stilvoll mit dem Mugla Dalaman Flughafen Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером аэропорт Мугла Даламан.',
        tr: 'Mugla Dalaman Havalimanı transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Mugla Dalaman Airport transfer service. Serving Mugla Dalaman Airport (DLM).',
        de: 'Kommen Sie elegant an mit unserem Premium Mugla Dalaman Flughafen Transfer-Service. Bedienung des Flughafens Mugla Dalaman (DLM).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером аэропорт Мугла Даламан. Обслуживание аэропорта Мугла Даламан (DLM).',
        tr: 'Mugla Dalaman Havalimanı transfer hizmetimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // Ankara Esenboga Airport, but don't specify car name, specify aiport name, city name, and transfer itself
    {
      url: {
        en: '24-7-private-ankara-esenboga-airport-transfer.webp',
        de: '24-7-private-ankara-esenboga-flughafentransfer.webp',
        ru: '24-7-частный-анкара-эсенбога-аэропорт-трансфер.webp',
        tr: '7-24-özel-ankara-esenboga-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-ankara-esenboga-airport-transfer.webp',
        de: '24-7-private-ankara-esenboga-flughafentransfer.webp',
        ru: '24-7-частный-анкара-эсенбога-аэропорт-трансфер.webp',
        tr: '7-24-özel-ankara-esenboga-havalimani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-ankara-esenboga-airport-transfer-large.webp',
        de: '24-7-private-ankara-esenboga-flughafentransfer-gross.webp',
        ru: '24-7-частный-анкара-эсенбога-аэропорт-трансфер-большой.webp',
        tr: '7-24-özel-ankara-esenboga-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Ankara Esenboga Airport Transfer',
        de: '24/7 Premium Transfer - Ankara Esenboga Flughafen Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер аэропорт Анкара Эсенбога',
        tr: '7/24 Premium Transfer - Ankara Esenboga Havalimanı Transfer',
      },
      alt: {
        en: '24/7 Luxury Ankara Esenboga Airport transfer',
        de: '24/7 Luxus Ankara Esenboga Flughafen Transfer',
        ru: '24/7 Роскошный трансфер аэропорт Анкара Эсенбога',
        tr: '7/24 Lüks Ankara Esenboga Havalimanı transferi',
      },
      caption: {
        en: 'Travel in style with Ankara Esenboga Airport transfer.',
        de: 'Reisen Sie stilvoll mit dem Ankara Esenboga Flughafen Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером аэропорт Анкара Эсенбога.',
        tr: 'Ankara Esenboga Havalimanı transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Ankara Esenboga Airport transfer service. Serving Ankara Esenboga Airport (ESB).',
        de: 'Kommen Sie elegant an mit unserem Premium Ankara Esenboga Flughafen Transfer-Service. Bedienung des Flughafens Ankara Esenboga (ESB).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером аэропорт Анкара Эсенбога. Обслуживание аэропорта Анкара Эсенбога (ESB).',
        tr: 'Ankara Esenboga Havalimanı transfer hizmetimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // Focus on Airport Transfer in Turkey generally, don't specify car name, specify airport transfer services
    {
      url: {
        en: '24-7-private-turkey-airport-transfer.webp',
        de: '24-7-private-turkei-flughafentransfer.webp',
        ru: '24-7-частный-турция-аэропорт-трансфер.webp',
        tr: '7-24-özel-turkiye-havalimani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-turkey-airport-transfer.webp',
        de: '24-7-private-turkei-flughafentransfer.webp',
        ru: '24-7-частный-турция-аэропорт-трансфер.webp',
        tr: '7-24-özel-turkiye-havalimani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-turkey-airport-transfer-large.webp',
        de: '24-7-private-turkei-flughafentransfer-gross.webp',
        ru: '24-7-частный-турция-аэропорт-трансфер-большой.webp',
        tr: '7-24-özel-turkiye-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Airport Transfer Services in Turkey',
        de: '24/7 Premium Flughafentransferdienste in der Türkei',
        ru: '24/7 Премиальные трансферы из аэропортов в Турции',
        tr: '7/24 Türkiye’de Premium Havalimanı Transfer Hizmetleri',
      },
      alt: {
        en: '24/7 Luxury airport transfer services in Turkey',
        de: '24/7 Luxus Flughafentransferdienste in der Türkei',
        ru: '24/7 Роскошные трансферы из аэропортов в Турции',
        tr: '7/24 Türkiye’de lüks havalimanı transfer hizmetleri',
      },
      caption: {
        en: 'Travel in style with our premium airport transfer services in Turkey.',
        de: 'Reisen Sie stilvoll mit unseren Premium-Flughafentransferdiensten in der Türkei.',
        ru: 'Путешествуйте с комфортом с нашими премиальными трансферами из аэропортов в Турции.',
        tr: 'Türkiye’deki premium havalimanı transfer hizmetlerimizle şık bir yolculuk yapın.',
      },
      description: {
        en: 'Arrive in elegance with our premium airport transfer services in Turkey. Serving all major airports in Turkey.',
        de: 'Kommen Sie elegant an mit unseren Premium-Flughafentransferdiensten in der Türkei. Bedienung aller wichtigen Flughäfen in der Türkei.',
        ru: 'Прибывайте с элегантностью с нашими премиальными трансферами из аэропортов в Турции. Обслуживание всех крупных аэропортов в Турции.',
        tr: 'Türkiye’deki premium havalimanı transfer hizmetlerimizle şıklıkla ulaşım sağlayın. Türkiye’deki tüm büyük havalimanlarına hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Kapadokya, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-cappadocia-transfer.webp',
        de: '24-7-private-kappadokien-transfer.webp',
        ru: '24-7-частный-трансфер-в-каппадокию.webp',
        tr: '7-24-özel-kappadokya-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-cappadocia-transfer.webp',
        de: '24-7-private-kappadokien-transfer.webp',
        ru: '24-7-частный-трансфер-в-каппадокию.webp',
        tr: '7-24-özel-kappadokya-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-cappadocia-transfer-large.webp',
        de: '24-7-private-kappadokien-transfer-gross.webp',
        ru: '24-7-частный-трансфер-в-каппадокию-большой.webp',
        tr: '7-24-özel-kappadokya-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Cappadocia Transfer',
        de: '24/7 Premium Transfer - Kappadokien Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Каппадокию',
        tr: '7/24 Premium Transfer - Kappadokya Transfer',
      },
      alt: {
        en: '24/7 Luxury Cappadocia transfer',
        de: '24/7 Luxus Kappadokien Transfer',
        ru: '24/7 Роскошный трансфер в Каппадокию',
        tr: '7/24 Lüks Kappadokya transferi',
      },
      caption: {
        en: 'Travel in style with Cappadocia transfer.',
        de: 'Reisen Sie stilvoll mit dem Kappadokien Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Каппадокию.',
        tr: 'Kappadokya transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Cappadocia transfer service. Serving Cappadocia.',
        de: 'Kommen Sie elegant an mit unserem Premium Kappadokien Transfer-Service. Bedienung von Kappadokien.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Каппадокию. Обслуживание Каппадокии.',
        tr: 'Kappadokya transfer hizmetimizle şıklıkla ulaşım sağlayın. Kappadokya’ya hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Taksim Square from airports, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-taksim-square-transfer.webp',
        de: '24-7-private-taksim-platz-transfer.webp',
        ru: '24-7-частный-таксим-площадь-трансфер.webp',
        tr: '7-24-özel-taksim-meydani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-taksim-square-transfer.webp',
        de: '24-7-private-taksim-platz-transfer.webp',
        ru: '24-7-частный-таксим-площадь-трансфер.webp',
        tr: '7-24-özel-taksim-meydani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-taksim-square-transfer-large.webp',
        de: '24-7-private-taksim-platz-transfer-gross.webp',
        ru: '24-7-частный-таксим-площадь-трансфер-большой.webp',
        tr: '7-24-özel-taksim-meydani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Taksim Square Transfer',
        de: '24/7 Premium Transfer - Taksim Platz Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер на площадь Таксим',
        tr: '7/24 Premium Transfer - Taksim Meydanı Transfer',
      },
      alt: {
        en: '24/7 Luxury Taksim Square transfer',
        de: '24/7 Luxus Taksim Platz Transfer',
        ru: '24/7 Роскошный трансфер на площадь Таксим',
        tr: '7/24 Lüks Taksim Meydanı transferi',
      },
      caption: {
        en: 'Travel in style with Taksim Square transfer.',
        de: 'Reisen Sie stilvoll mit dem Taksim Platz Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером на площадь Таксим.',
        tr: 'Taksim Meydanı transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Taksim Square transfer service. Serving Taksim Square.',
        de: 'Kommen Sie elegant an mit unserem Premium Taksim Platz Transfer-Service. Bedienung von Taksim Platz.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на площадь Таксим. Обслуживание площади Таксим.',
        tr: 'Taksim Meydanı transfer hizmetimizle şıklıkla ulaşım sağlayın. Taksim Meydanı’na hizmet veriyoruz.',
      },
    },

    // Focus on Sultanahmet Square and airport transfer services, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-sultanahmet-square-transfer.webp',
        de: '24-7-private-sultanahmet-platz-transfer.webp',
        ru: '24-7-частный-султанахмет-площадь-трансфер.webp',
        tr: '7-24-özel-sultanahmet-meydani-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-sultanahmet-square-transfer.webp',
        de: '24-7-private-sultanahmet-platz-transfer.webp',
        ru: '24-7-частный-султанахмет-площадь-трансфер.webp',
        tr: '7-24-özel-sultanahmet-meydani-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-sultanahmet-square-transfer-large.webp',
        de: '24-7-private-sultanahmet-platz-transfer-gross.webp',
        ru: '24-7-частный-султанахмет-площадь-трансфер-большой.webp',
        tr: '7-24-özel-sultanahmet-meydani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Sultanahmet Square Transfer',
        de: '24/7 Premium Transfer - Sultanahmet Platz Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер на площадь Султанахмет',
        tr: '7/24 Premium Transfer - Sultanahmet Meydanı Transfer',
      },
      alt: {
        en: '24/7 Luxury Sultanahmet Square transfer',
        de: '24/7 Luxus Sultanahmet Platz Transfer',
        ru: '24/7 Роскошный трансфер на площадь Султанахмет',
        tr: '7/24 Lüks Sultanahmet Meydanı transferi',
      },
      caption: {
        en: 'Travel in style with Sultanahmet Square transfer.',
        de: 'Reisen Sie stilvoll mit dem Sultanahmet Platz Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером на площадь Султанахмет.',
        tr: 'Sultanahmet Meydanı transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Sultanahmet Square transfer service. Serving Sultanahmet Square.',
        de: 'Kommen Sie elegant an mit unserem Premium Sultanahmet Platz Transfer-Service. Bedienung von Sultanahmet Platz.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на площадь Султанахмет. Обслуживание площади Султанахмет.',
        tr: 'Sultanahmet Meydanı transfer hizmetimizle şıklıkla ulaşım sağlayın. Sultanahmet Meydanı’na hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Istanbul Fatih, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-istanbul-fatih-transfer.webp',
        de: '24-7-private-istanbul-fatih-transfer.webp',
        ru: '24-7-частный-истанбул-фатих-трансфер.webp',
        tr: '7-24-özel-istanbul-fatih-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-istanbul-fatih-transfer.webp',
        de: '24-7-private-istanbul-fatih-transfer.webp',
        ru: '24-7-частный-истанбул-фатих-трансфер.webp',
        tr: '7-24-özel-istanbul-fatih-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-istanbul-fatih-transfer-large.webp',
        de: '24-7-private-istanbul-fatih-transfer-gross.webp',
        ru: '24-7-частный-истанбул-фатих-трансфер-большой.webp',
        tr: '7-24-özel-istanbul-fatih-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Istanbul Fatih Transfer',
        de: '24/7 Premium Transfer - Istanbul Fatih Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Стамбул Фатих',
        tr: '7/24 Premium Transfer - Istanbul Fatih Transfer',
      },
      alt: {
        en: '24/7 Luxury Istanbul Fatih transfer',
        de: '24/7 Luxus Istanbul Fatih Transfer',
        ru: '24/7 Роскошный трансфер в Стамбул Фатих',
        tr: '7/24 Lüks Istanbul Fatih transferi',
      },
      caption: {
        en: 'Travel in style with Istanbul Fatih transfer.',
        de: 'Reisen Sie stilvoll mit dem Istanbul Fatih Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Стамбул Фатих.',
        tr: 'Istanbul Fatih transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Istanbul Fatih transfer service. Serving Istanbul Fatih.',
        de: 'Kommen Sie elegant an mit unserem Premium Istanbul Fatih Transfer-Service. Bedienung von Istanbul Fatih.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Стамбул Фатих. Обслуживание Стамбул Фатих.',
        tr: 'Istanbul Fatih transfer hizmetimizle şıklıkla ulaşım sağlayın. Istanbul Fatih’e hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Alanya/Antalya Belek, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-belek-transfer.webp',
        de: '24-7-private-antalya-belek-transfer.webp',
        ru: '24-7-частный-анталья-белек-трансфер.webp',
        tr: '7-24-özel-antalya-belek-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-belek-transfer.webp',
        de: '24-7-private-antalya-belek-transfer.webp',
        ru: '24-7-частный-анталья-белек-трансфер.webp',
        tr: '7-24-özel-antalya-belek-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-belek-transfer-large.webp',
        de: '24-7-private-antalya-belek-transfer-gross.webp',
        ru: '24-7-частный-анталья-белек-трансфер-большой.webp',
        tr: '7-24-özel-antalya-belek-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya Belek Transfer',
        de: '24/7 Premium Transfer - Antalya Belek Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Белек',
        tr: '7/24 Premium Transfer - Antalya Belek Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya Belek transfer',
        de: '24/7 Luxus Antalya Belek Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Белек',
        tr: '7/24 Lüks Antalya Belek transferi',
      },
      caption: {
        en: 'Travel in style with Antalya Belek transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya Belek Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Белек.',
        tr: 'Antalya Belek transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya Belek transfer service. Serving Antalya Belek.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya Belek Transfer-Service. Bedienung von Antalya Belek.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Белек. Обслуживание Анталья Белек.',
        tr: 'Antalya Belek transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya Belek’e hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Kemer, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-kemer-transfer.webp',
        de: '24-7-private-kemer-transfer.webp',
        ru: '24-7-частный-кемер-трансфер.webp',
        tr: '7-24-özel-kemer-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-kemer-transfer.webp',
        de: '24-7-private-kemer-transfer.webp',
        ru: '24-7-частный-кемер-трансфер.webp',
        tr: '7-24-özel-kemer-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-kemer-transfer-large.webp',
        de: '24-7-private-kemer-transfer-gross.webp',
        ru: '24-7-частный-кемер-трансфер-большой.webp',
        tr: '7-24-özel-kemer-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Kemer Transfer',
        de: '24/7 Premium Transfer - Kemer Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Кемер',
        tr: '7/24 Premium Transfer - Kemer Transfer',
      },
      alt: {
        en: '24/7 Luxury Kemer transfer',
        de: '24/7 Luxus Kemer Transfer',
        ru: '24/7 Роскошный трансфер в Кемер',
        tr: '7/24 Lüks Kemer transferi',
      },
      caption: {
        en: 'Travel in style with Kemer transfer.',
        de: 'Reisen Sie stilvoll mit dem Kemer Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Кемер.',
        tr: 'Kemer transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Kemer transfer service. Serving Kemer.',
        de: 'Kommen Sie elegant an mit unserem Premium Kemer Transfer-Service. Bedienung von Kemer.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Кемер. Обслуживание Кемер.',
        tr: 'Kemer transfer hizmetimizle şıklıkla ulaşım sağlayın. Kemer’e hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Side, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-side-transfer.webp',
        de: '24-7-private-side-transfer.webp',
        ru: '24-7-частный-сиде-трансфер.webp',
        tr: '7-24-özel-side-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-side-transfer.webp',
        de: '24-7-private-side-transfer.webp',
        ru: '24-7-частный-сиде-трансфер.webp',
        tr: '7-24-özel-side-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-side-transfer-large.webp',
        de: '24-7-private-side-transfer-gross.webp',
        ru: '24-7-частный-сиде-трансфер-большой.webp',
        tr: '7-24-özel-side-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Side Transfer',
        de: '24/7 Premium Transfer - Side Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Сайд',
        tr: '7/24 Premium Transfer - Side Transfer',
      },
      alt: {
        en: '24/7 Luxury Side transfer',
        de: '24/7 Luxus Side Transfer',
        ru: '24/7 Роскошный трансфер в Сайд',
        tr: '7/24 Lüks Side transferi',
      },
      caption: {
        en: 'Travel in style with Side transfer.',
        de: 'Reisen Sie stilvoll mit dem Side Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Сайд.',
        tr: 'Side transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Side transfer service. Serving Side.',
        de: 'Kommen Sie elegant an mit unserem Premium Side Transfer-Service. Bedienung von Side.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Сайд. Обслуживание Сайд.',
        tr: 'Side transfer hizmetimizle şıklıkla ulaşım sağlayın. Side’ye hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Antalya Lara, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-lara-transfer.webp',
        de: '24-7-private-antalya-lara-transfer.webp',
        ru: '24-7-частный-анталья-лара-трансфер.webp',
        tr: '7-24-özel-antalya-lara-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-lara-transfer.webp',
        de: '24-7-private-antalya-lara-transfer.webp',
        ru: '24-7-частный-анталья-лара-трансфер.webp',
        tr: '7-24-özel-antalya-lara-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-lara-transfer-large.webp',
        de: '24-7-private-antalya-lara-transfer-gross.webp',
        ru: '24-7-частный-анталья-лара-трансфер-большой.webp',
        tr: '7-24-özel-antalya-lara-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya Lara Transfer',
        de: '24/7 Premium Transfer - Antalya Lara Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Лара',
        tr: '7/24 Premium Transfer - Antalya Lara Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya Lara transfer',
        de: '24/7 Luxus Antalya Lara Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Лара',
        tr: '7/24 Lüks Antalya Lara transferi',
      },
      caption: {
        en: 'Travel in style with Antalya Lara transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya Lara Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Лара.',
        tr: 'Antalya Lara transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya Lara transfer service. Serving Antalya Lara.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya Lara Transfer-Service. Bedienung von Antalya Lara.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Лара. Обслуживание Анталья Лара.',
        tr: 'Antalya Lara transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya Lara’ya hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Antalya Konyaalti, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-konyaalti-transfer.webp',
        de: '24-7-private-antalya-konyaalti-transfer.webp',
        ru: '24-7-частный-анталья-коньяалты-трансфер.webp',
        tr: '7-24-özel-antalya-konyaalti-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-konyaalti-transfer.webp',
        de: '24-7-private-antalya-konyaalti-transfer.webp',
        ru: '24-7-частный-анталья-коньяалты-трансфер.webp',
        tr: '7-24-özel-antalya-konyaalti-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-konyaalti-transfer-large.webp',
        de: '24-7-private-antalya-konyaalti-transfer-gross.webp',
        ru: '24-7-частный-анталья-коньяалты-трансфер-большой.webp',
        tr: '7-24-özel-antalya-konyaalti-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya Konyaalti Transfer',
        de: '24/7 Premium Transfer - Antalya Konyaalti Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Коньяалты',
        tr: '7/24 Premium Transfer - Antalya Konyaalti Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya Konyaalti transfer',
        de: '24/7 Luxus Antalya Konyaalti Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Коньяалты',
        tr: '7/24 Lüks Antalya Konyaalti transferi',
      },
      caption: {
        en: 'Travel in style with Antalya Konyaalti transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya Konyaalti Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Коньяалты.',
        tr: 'Antalya Konyaalti transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya Konyaalti transfer service. Serving Antalya Konyaalti.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya Konyaalti Transfer-Service .Bedienung von Antalya Konyaalti.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Коньяалты. Обслуживание Анталья Коньяалты.',
        tr: 'Antalya Konyaalti transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya Konyaalti’ye hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Antalya Kundu, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-kundu-transfer.webp',
        de: '24-7-private-antalya-kundu-transfer.webp',
        ru: '24-7-частный-анталья-кунду-трансфер.webp',
        tr: '7-24-özel-antalya-kundu-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-kundu-transfer.webp',
        de: '24-7-private-antalya-kundu-transfer.webp',
        ru: '24-7-частный-анталья-кунду-трансфер.webp',
        tr: '7-24-özel-antalya-kundu-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-kundu-transfer-large.webp',
        de: '24-7-private-antalya-kundu-transfer-gross.webp',
        ru: '24-7-частный-анталья-кунду-трансфер-большой.webp',
        tr: '7-24-özel-antalya-kundu-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya Kundu Transfer',
        de: '24/7 Premium Transfer - Antalya Kundu Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Кунду',
        tr: '7/24 Premium Transfer - Antalya Kundu Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya Kundu transfer',
        de: '24/7 Luxus Antalya Kundu Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Кунду',
        tr: '7/24 Lüks Antalya Kundu transferi',
      },
      caption: {
        en: 'Travel in style with Antalya Kundu transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya Kundu Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Кунду.',
        tr: 'Antalya Kundu transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya Kundu transfer service. Serving Antalya Kundu.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya Kundu Transfer-Service. Bedienung von Antalya Kundu.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Кунду. Обслуживание Анталья Кунду.',
        tr: 'Antalya Kundu transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya Kundu’ya hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Antalya Old Town, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-old-town-transfer.webp',
        de: '24-7-private-antalya-old-town-transfer.webp',
        ru: '24-7-частный-анталья-старый-город-transfer.webp',
        tr: 'antalya-old-town-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-old-town-transfer.webp',
        de: '24-7-private-antalya-old-town-transfer.webp',
        ru: '24-7-частный-анталья-старый-город-transfer.webp',
        tr: '7-24-özel-antalya-old-town-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-old-town-transfer-large.webp',
        de: '24-7-private-antalya-old-town-transfer-gross.webp',
        ru: '24-7-частный-анталья-старый-город-transfer-большой.webp',
        tr: '7-24-özel-antalya-old-town-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya Old Town Transfer',
        de: '24/7 Premium Transfer - Antalya Old Town Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Старый Город',
        tr: '7/24 Premium Transfer - Antalya Old Town Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya Old Town transfer',
        de: '24/7 Luxus Antalya Old Town Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Старый Город',
        tr: '7/24 Lüks Antalya Old Town transferi',
      },
      caption: {
        en: 'Travel in style with Antalya Old Town transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya Old Town Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Старый Город.',
        tr: 'Antalya Old Town transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya Old Town transfer service. Serving Antalya Old Town.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya Old Town Transfer-Service. Bedienung von Antalya Old Town.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Старый Город. Обслуживание Анталья Старый Город.',
        tr: 'Antalya Old Town transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya Old Town’a hizmet veriyoruz.',
      },
    },

    // Focus on transfers to Antalya City Center, don't specify car name, specify city name, and transfer itself
    {
      url: {
        en: '24-7-private-antalya-city-center-transfer.webp',
        de: '24-7-private-antalya-city-center-transfer.webp',
        ru: '24-7-частный-анталья-центральный-район-трансфер.webp',
        tr: '7-24-özel-antalya-city-center-transfer.webp',
      },
      smallImageName: {
        en: '24-7-private-antalya-city-center-transfer.webp',
        de: '24-7-private-antalya-city-center-transfer.webp',
        ru: '24-7-частный-анталья-центральный-район-трансфер.webp',
        tr: '7-24-özel-antalya-city-center-transfer.webp',
      },
      largeImageName: {
        en: '24-7-private-antalya-city-center-transfer-large.webp',
        de: '24-7-private-antalya-city-center-transfer-gross.webp',
        ru: '24-7-частный-анталья-центральный-район-трансфер-большой.webp',
        tr: '7-24-özel-antalya-city-center-transfer-buyuk.webp',
      },
      dataTitle: {
        en: '24/7 Premium Transfer - Antalya City Center Transfer',
        de: '24/7 Premium Transfer - Antalya City Center Transfer',
        ru: '24/7 Премиальный трансфер - Трансфер в Анталья Центр Города',
        tr: '7/24 Premium Transfer - Antalya City Center Transfer',
      },
      alt: {
        en: '24/7 Luxury Antalya City Center transfer',
        de: '24/7 Luxus Antalya City Center Transfer',
        ru: '24/7 Роскошный трансфер в Анталья Центр Города',
        tr: '7/24 Lüks Antalya City Center transferi',
      },
      caption: {
        en: 'Travel in style with Antalya City Center transfer.',
        de: 'Reisen Sie stilvoll mit dem Antalya City Center Transfer.',
        ru: 'Путешествуйте с комфортом с трансфером в Анталья Центр Города.',
        tr: 'Antalya City Center transferi ile şık bir yol alın.',
      },
      description: {
        en: 'Arrive in elegance with our premium Antalya City Center transfer service. Serving Antalya City Center.',
        de: 'Kommen Sie elegant an mit unserem Premium Antalya City Center Transfer-Service. Bedienung von Antalya City Center.',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером в Анталья Центр Города. Обслуживание Анталья Центр Города.',
        tr: 'Antalya City Center transfer hizmetimizle şıklıkla ulaşım sağlayın. Antalya City Center’a hizmet veriyoruz.',
      },
    },

  ];
  
}