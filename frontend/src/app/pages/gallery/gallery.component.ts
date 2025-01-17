import { Component, OnInit } from '@angular/core';
import { SuperHeaderComponent } from '../../components/super-header/super-header.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { title } from 'node:process';
import { CommonModule } from '@angular/common';

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
  ) {
  }

  ngOnInit(): void {
    const languageCode = this.route.snapshot.data['language'] || 'en';
    this.currentLanguage.code = languageCode;
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
        en: 'istanbul-airport-transfer.webp',
        de: 'istanbul-flughafentransfer.webp',
        ru: 'transfer-aeroport-stambul.webp',
        tr: 'istanbul-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'istanbul-airport-mercedes-vito.webp',
        de: 'istanbul-flughafen-mercedes-vito.webp',
        ru: 'стамбул-аэропорт-мерседес-вито.webp',
        tr: 'istanbul-havalimani-mercedes-vito.webp',
      },
      largeImageName: {
        en: 'istanbul-airport-mercedes-vito-large.webp',
        de: 'istanbul-flughafen-mercedes-vito-groß.webp',
        ru: 'стамбул-аэропорт-мерседес-вито-большой.webp',
        tr: 'istanbul-havalimani-mercedes-vito-buyuk.webp',
      },
      dataTitle: {
        en: 'Luxury Airport Transfer - Mercedes Vito in Istanbul',
        de: 'Luxus Flughafentransfer - Mercedes Vito in Istanbul',
        ru: 'Роскошный трансфер из аэропорта - Mercedes Vito в Стамбуле',
        tr: 'Lüks Havalimanı Transferi - Mercedes Vito İstanbul',
      },
      alt: {
        en: 'Mercedes Vito luxury airport transfer in Istanbul',
        de: 'Mercedes Vito Luxus Flughafentransfer in Istanbul',
        ru: 'Роскошный трансфер на Mercedes Vito в Стамбуле',
        tr: 'İstanbul’da lüks Mercedes Vito havalimanı transferi',
      },
      caption: {
        en: 'Experience Istanbul with our luxurious Mercedes Vito airport transfers.',
        de: 'Erleben Sie Istanbul mit unseren luxuriösen Mercedes Vito Flughafentransfers.',
        ru: 'Откройте для себя Стамбул с нашими роскошными трансферами на Mercedes Vito.',
        tr: 'Lüks Mercedes Vito havalimanı transferlerimizle İstanbul’u keşfedin.',
      },
      description: {
        en: 'Travel in comfort with our Mercedes Vito airport transfer in Istanbul. Serving Istanbul Airport (IST) and Sabiha Gökçen Airport (SAW).',
        de: 'Reisen Sie bequem mit unserem Mercedes Vito Flughafentransfer in Istanbul. Bedienung des Flughafens Istanbul (IST) und Sabiha Gökçen Flughafen (SAW).',
        ru: 'Путешествуйте с комфортом с нашим трансфером на Mercedes Vito в Стамбуле. Обслуживание аэропортов Стамбула (IST) и Сабиха Гёкчен (SAW).',
        tr: 'Mercedes Vito havalimanı transferimizle İstanbul’da konforlu bir seyahat deneyimi yaşayın. İstanbul Havalimanı (IST) ve Sabiha Gökçen Havalimanı (SAW) hizmetindedir.',
      },
    },

    // For Antalya Airport
    {
      url: {
        en: 'antalya-airport-transfer.webp',
        de: 'antalya-flughafentransfer.webp',
        ru: 'transfer-aeroport-antalya.webp',
        tr: 'antalya-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-airport-mercedes-sprinter.webp',
        de: 'antalya-flughafen-mercedes-sprinter.webp',
        ru: 'анталия-аэропорт-мерседес-спринтер.webp',
        tr: 'antalya-havalimani-mercedes-sprinter.webp',
      },
      largeImageName: {
        en: 'antalya-airport-mercedes-sprinter-large.webp',
        de: 'antalya-flughafen-mercedes-sprinter-groß.webp',
        ru: 'анталия-аэропорт-мерседес-спринтер-большой.webp',
        tr: 'antalya-havalimani-mercedes-sprinter-buyuk.webp',
      },
      dataTitle: {
        en: 'Luxury Airport Transfer - Mercedes Sprinter in Antalya',
        de: 'Luxus Flughafentransfer - Mercedes Sprinter in Antalya',
        ru: 'Роскошный трансфер из аэропорта - Mercedes Sprinter в Анталии',
        tr: 'Lüks Havalimanı Transferi - Mercedes Sprinter Antalya',
      },
      alt: {
        en: 'Mercedes Sprinter airport transfer in Antalya',
        de: 'Mercedes Sprinter Flughafentransfer in Antalya',
        ru: 'Трансфер на Mercedes Sprinter из аэропорта в Анталии',
        tr: 'Antalya’da Mercedes Sprinter havalimanı transferi',
      },
      caption: {
        en: 'Premium transfers in Antalya with Mercedes Sprinter.',
        de: 'Premium-Transfers in Antalya mit Mercedes Sprinter.',
        ru: 'Премиальные трансферы в Анталии на Mercedes Sprinter.',
        tr: 'Antalya’da Mercedes Sprinter ile premium transferler.',
      },
      description: {
        en: 'Explore Antalya with our luxury Mercedes Sprinter transfers, ideal for groups. Serving Antalya Airport (AYT).',
        de: 'Entdecken Sie Antalya mit unseren luxuriösen Mercedes Sprinter Transfers, ideal für Gruppen. Bedienung des Flughafens Antalya (AYT).',
        ru: 'Исследуйте Анталию с нашими роскошными трансферами на Mercedes Sprinter, идеально для групп. Обслуживание аэропорта Анталии (AYT).',
        tr: 'Gruplar için ideal olan lüks Mercedes Sprinter transferlerimizle Antalya’yı keşfedin. Antalya Havalimanı (AYT) hizmetindedir.',
      },
    },

    // For Izmir Adnan Menderes Airport
    {
      url: {
        en: 'izmir-adnan-menderes-airport-transfer.webp',
        de: 'izmir-adnan-menderes-flughafentransfer.webp',
        ru: 'transfer-aeroport-adnan-menderes-izmir.webp',
        tr: 'izmir-adnan-menderes-havalimani-transfer.webp',
      }, 
      smallImageName: {
        en: 'izmir-adnan-menderes-airport-mercedes-maybach.webp',
        de: 'izmir-adnan-menderes-flughafen-mercedes-maybach.webp',
        ru: 'измир-аэропорт-мерседес-майбах.webp',
        tr: 'izmir-adnan-menderes-havalimani-mercedes-maybach.webp',
      },
      largeImageName: {
        en: 'izmir-adnan-menderes-airport-mercedes-maybach-large.webp',
        de: 'izmir-adnan-menderes-flughafen-mercedes-maybach-groß.webp',
        ru: 'измир-аэропорт-мерседес-майбах-большой.webp',
        tr: 'izmir-adnan-menderes-havalimani-mercedes-maybach-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Mercedes Maybach S-Class in Izmir Adnan Menderes Airport',
        de: 'Premium Transfer - Mercedes Maybach S-Klasse in Izmir Adnan Menderes Flughafen',
        ru: 'Премиальный трансфер - Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт',
        tr: 'Premium Transfer - Mercedes Maybach S Sınıfı İzmir Adnan Menderes Havalimanı',
      },
      alt: {
        en: 'Luxury Mercedes Maybach S-Class transfer in Izmir Adnan Menderes Airport',
        de: 'Luxus Mercedes Maybach S-Klasse Transfer in Izmir Adnan Menderes Flughafen',
        ru: 'Роскошный трансфер на Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт',
        tr: 'İzmir’de lüks Mercedes Maybach S Sınıfı transferi Adnan Menderes Havalimanı',
      },
      caption: {
        en: 'Travel in style with Mercedes Maybach S-Class in Izmir Adnan Menderes Airport.',
        de: 'Reisen Sie stilvoll mit der Mercedes Maybach S-Klasse in Izmir Adnan Menderes Flughafen.',
        ru: 'Путешествуйте с комфортом на Mercedes Maybach S-Класс в Измире Аднан Мендерес Аэропорт.',
        tr: 'İzmir’de Mercedes Maybach S Sınıfı ile şık bir yolculuk yapın Adnan Menderes Havalimanı.',
      },
      description: {
        en: 'Arrive in elegance with our premium Mercedes Maybach S-Class transfer service in Izmir. Serving Izmir Adnan Menderes Airport (ADB).',
        de: 'Kommen Sie elegant an mit unserem Premium Mercedes Maybach S-Klasse Transfer-Service in Izmir. Bedienung des Flughafens Izmir Adnan Menderes (ADB).',
        ru: 'Прибывайте с элегантностью с нашим премиальным трансфером на Mercedes Maybach S-Класс в Измире. Обслуживание аэропорта Измир Аднан Мендерес (ADB).',
        tr: 'İzmir Adnan Menderes Havalimanı (ADB) hizmetimizde lüks Mercedes Maybach S Sınıfı transferimizle şıklıkla ulaşım sağlayın.',
      },
    },

    // For Gazipasa Airport
    {
      url: {
        en: 'alanya-gazipasa-airport-transfer.webp',
        de: 'alanya-gazipasa-flughafentransfer.webp',
        ru: 'transfer-aeroport-alanya-gazipasa.webp',
        tr: 'alanya-gazipasa-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'alanya-gazipasa-airport-mercedes-e-class.webp',
        de: 'alanya-gazipasa-flughafen-mercedes-e-klasse.webp',
        ru: 'аланья-газипаша-аэропорт-мерседес-e-класс.webp',
        tr: 'alanya-gazipasa-havalimani-mercedes-e-sinifi.webp',
      },
      largeImageName: {
        en: 'alanya-gazipasa-airport-mercedes-e-class-large.webp',
        de: 'alanya-gazipasa-flughafen-mercedes-e-klasse-groß.webp',
        ru: 'аланья-газипаша-аэропорт-мерседес-e-класс-большой.webp',
        tr: 'alanya-gazipasa-havalimani-mercedes-e-siniifi-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Mercedes E-Class in Alanya Gazipasa Airport',
        de: 'Premium Transfer - Mercedes E-Klasse in Alanya Gazipasa Airport',
        ru: 'Премиальный трансфер - Mercedes E-Класс в аэропорт Аланья Газипаша',
        tr: 'Premium Transfer - Mercedes E-Sınıfı Alanya Gazipaşa Havalimanı',
      },
      alt: {
        en: 'Luxury Mercedes E-Class transfer in Alanya Gazipasa Airport',
        de: 'Luxus Mercedes E-Klasse Transfer in Alanya Gazipasa Airport',
        ru: 'Роскошный трансфер на Mercedes E-Класс в аэропорт Аланья Газипаша',
        tr: 'Alanya Gazipaşa Havalimanı’nda lüks Mercedes E-Sınıfı transferi',
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
        en: 'istanbul-sabiha-gokcen-airport-transfer.webp',
        de: 'istanbul-sabiha-gokcen-flughafentransfer.webp',
        ru: 'transfer-aeroport-stambul-sabiha-gokcen.webp',
        tr: 'istanbul-sabiha-gokcen-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'istanbul-sabiha-gokcen-airport-mercedes-s-class.webp',
        de: 'istanbul-sabiha-gokcen-flughafen-mercedes-s-klasse.webp',
        ru: 'стамбул-сабиха-гёкчен-аэропорт-мерседес-s-класс.webp',
        tr: 'istanbul-sabiha-gokcen-havalimani-mercedes-s-siniifi.webp',
      },
      largeImageName: {
        en: 'istanbul-sabiha-gokcen-airport-mercedes-s-class-large.webp',
        de: 'istanbul-sabiha-gokcen-flughafen-mercedes-s-klasse-groß.webp',
        ru: 'стамбул-сабиха-гёкчен-аэропорт-мерседес-s-класс-большой.webp',
        tr: 'istanbul-sabiha-gokcen-havalimani-mercedes-s-siniifi-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Mercedes S-Class in Istanbul Sabiha Gokcen Airport',
        de: 'Premium Transfer - Mercedes S-Klasse in Istanbul Sabiha Gokcen Airport',
        ru: 'Премиальный трансфер - Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен',
        tr: 'Premium Transfer - Mercedes S-Sınıfı İstanbul Sabiha Gökçen Havalimanı',
      },
      alt: {
        en: 'Luxury Mercedes S-Class transfer in Istanbul Sabiha Gokcen Airport',
        de: 'Luxus Mercedes S-Klasse Transfer in Istanbul Sabiha Gokcen Airport',
        ru: 'Роскошный трансфер на Mercedes S-Класс в аэропорт Стамбул Сабиха Гёкчен',
        tr: 'İstanbul Sabiha Gökçen Havalimanı’nda lüks Mercedes S-Sınıfı transferi',
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
        en: 'bodrum-milas-airport-transfer.webp',
        de: 'bodrum-milas-flughafentransfer.webp',
        ru: 'transfer-aeroport-bodrum-milas.webp',
        tr: 'bodrum-milas-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'bodrum-milas-airport-transfer.webp',
        de: 'bodrum-milas-flughafentransfer.webp',
        ru: 'бодрум-милас-аэропорт-трансфер.webp',
        tr: 'bodrum-milas-havalimani-transfer.webp',
      },
      largeImageName: {
        en: 'bodrum-milas-airport-transfer-large.webp',
        de: 'bodrum-milas-flughafentransfer-gross.webp',
        ru: 'бодрум-милас-аэропорт-трансфер-большой.webp',
        tr: 'bodrum-milas-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Bodrum Milas Airport Transfer',
        de: 'Premium Transfer - Bodrum Milas Flughafen Transfer',
        ru: 'Премиальный трансфер - Трансфер аэропорт Бодрум Милас',
        tr: 'Premium Transfer - Bodrum Milas Havalimanı Transfer',
      },
      alt: {
        en: 'Luxury Bodrum Milas Airport transfer',
        de: 'Luxus Bodrum Milas Flughafen Transfer',
        ru: 'Роскошный трансфер аэропорт Бодрум Милас',
        tr: 'Lüks Bodrum Milas Havalimanı transferi',
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
        en: 'mugla-dalaman-airport-transfer.webp',
        de: 'mugla-dalaman-flughafentransfer.webp',
        ru: 'transfer-aeroport-mugla-dalaman.webp',
        tr: 'mugla-dalaman-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'mugla-dalaman-airport-transfer.webp',
        de: 'mugla-dalaman-flughafentransfer.webp',
        ru: 'мугла-даламан-аэропорт-трансфер.webp',
        tr: 'mugla-dalaman-havalimani-transfer.webp',
      },
      largeImageName: {
        en: 'mugla-dalaman-airport-transfer-large.webp',
        de: 'mugla-dalaman-flughafentransfer-gross.webp',
        ru: 'мугла-даламан-аэропорт-трансфер-большой.webp',
        tr: 'mugla-dalaman-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Mugla Dalaman Airport Transfer',
        de: 'Premium Transfer - Mugla Dalaman Flughafen Transfer',
        ru: 'Премиальный трансфер - Трансфер аэропорт Мугла Даламан',
        tr: 'Premium Transfer - Mugla Dalaman Havalimanı Transfer',
      },
      alt: {
        en: 'Luxury Mugla Dalaman Airport transfer',
        de: 'Luxus Mugla Dalaman Flughafen Transfer',
        ru: 'Роскошный трансфер аэропорт Мугла Даламан',
        tr: 'Lüks Mugla Dalaman Havalimanı transferi',
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
        en: 'ankara-esenboga-airport-transfer.webp',
        de: 'ankara-esenboga-flughafentransfer.webp',
        ru: 'transfer-aeroport-ankara-esenboga.webp',
        tr: 'ankara-esenboga-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'ankara-esenboga-airport-transfer.webp',
        de: 'ankara-esenboga-flughafentransfer.webp',
        ru: 'анкара-эсенбога-аэропорт-трансфер.webp',
        tr: 'ankara-esenboga-havalimani-transfer.webp',
      },
      largeImageName: {
        en: 'ankara-esenboga-airport-transfer-large.webp',
        de: 'ankara-esenboga-flughafentransfer-gross.webp',
        ru: 'анкара-эсенбога-аэропорт-трансфер-большой.webp',
        tr: 'ankara-esenboga-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Ankara Esenboga Airport Transfer',
        de: 'Premium Transfer - Ankara Esenboga Flughafen Transfer',
        ru: 'Премиальный трансфер - Трансфер аэропорт Анкара Эсенбога',
        tr: 'Premium Transfer - Ankara Esenboga Havalimanı Transfer',
      },
      alt: {
        en: 'Luxury Ankara Esenboga Airport transfer',
        de: 'Luxus Ankara Esenboga Flughafen Transfer',
        ru: 'Роскошный трансфер аэропорт Анкара Эсенбога',
        tr: 'Lüks Ankara Esenboga Havalimanı transferi',
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
        en: 'turkey-airport-transfer.webp',
        de: 'turkei-flughafentransfer.webp',
        ru: 'transfer-aeroport-turciya.webp',
        tr: 'turkiye-havalimani-transfer.webp',
      },
      smallImageName: {
        en: 'turkey-airport-transfer.webp',
        de: 'turkei-flughafentransfer.webp',
        ru: 'турция-аэропорт-трансфер.webp',
        tr: 'turkiye-havalimani-transfer.webp',
      },
      largeImageName: {
        en: 'turkey-airport-transfer-large.webp',
        de: 'turkei-flughafentransfer-gross.webp',
        ru: 'турция-аэропорт-трансфер-большой.webp',
        tr: 'turkiye-havalimani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Airport Transfer Services in Turkey',
        de: 'Premium Flughafentransferdienste in der Türkei',
        ru: 'Премиальные трансферы из аэропортов в Турции',
        tr: 'Türkiye’de Premium Havalimanı Transfer Hizmetleri',
      },
      alt: {
        en: 'Luxury airport transfer services in Turkey',
        de: 'Luxus Flughafentransferdienste in der Türkei',
        ru: 'Роскошные трансферы из аэропортов в Турции',
        tr: 'Türkiye’de lüks havalimanı transfer hizmetleri',
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
        en: 'cappadocia-transfer.webp',
        de: 'kappadokien-transfer.webp',
        ru: 'transfer-v-kapadokiyu.webp',
        tr: 'kappadokya-transfer.webp',
      },
      smallImageName: {
        en: 'cappadocia-transfer.webp',
        de: 'kappadokien-transfer.webp',
        ru: 'кападокию-transfer.webp',
        tr: 'kappadokya-transfer.webp',
      },
      largeImageName: {
        en: 'cappadocia-transfer-large.webp',
        de: 'kappadokien-transfer-gross.webp',
        ru: 'трансфер-в-каппадокию-большой.webp',
        tr: 'kappadokya-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Cappadocia Transfer',
        de: 'Premium Transfer - Kappadokien Transfer',
        ru: 'Премиальный трансфер - Трансфер в Каппадокию',
        tr: 'Premium Transfer - Kappadokya Transfer',
      },
      alt: {
        en: 'Luxury Cappadocia transfer',
        de: 'Luxus Kappadokien Transfer',
        ru: 'Роскошный трансфер в Каппадокию',
        tr: 'Lüks Kappadokya transferi',
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
        en: 'taksim-square-transfer.webp',
        de: 'taksim-platz-transfer.webp',
        ru: 'transfer-na-ploshchad-taksim.webp',
        tr: 'taksim-meydani-transfer.webp',
      },
      smallImageName: {
        en: 'taksim-square-transfer.webp',
        de: 'taksim-platz-transfer.webp',
        ru: 'таксим-площадь-трансфер.webp',
        tr: 'taksim-meydani-transfer.webp',
      },
      largeImageName: {
        en: 'taksim-square-transfer-large.webp',
        de: 'taksim-platz-transfer-gross.webp',
        ru: 'таксим-площадь-трансфер-большой.webp',
        tr: 'taksim-meydani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Taksim Square Transfer',
        de: 'Premium Transfer - Taksim Platz Transfer',
        ru: 'Премиальный трансфер - Трансфер на площадь Таксим',
        tr: 'Premium Transfer - Taksim Meydanı Transfer',
      },
      alt: {
        en: 'Luxury Taksim Square transfer',
        de: 'Luxus Taksim Platz Transfer',
        ru: 'Роскошный трансфер на площадь Таксим',
        tr: 'Lüks Taksim Meydanı transferi',
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
        en: 'sultanahmet-square-transfer.webp',
        de: 'sultanahmet-platz-transfer.webp',
        ru: 'transfer-na-ploshchad-sultanakhmet.webp',
        tr: 'sultanahmet-meydani-transfer.webp',
      },
      smallImageName: {
        en: 'sultanahmet-square-transfer.webp',
        de: 'sultanahmet-platz-transfer.webp',
        ru: 'султанахмет-площадь-трансфер.webp',
        tr: 'sultanahmet-meydani-transfer.webp',
      },
      largeImageName: {
        en: 'sultanahmet-square-transfer-large.webp',
        de: 'sultanahmet-platz-transfer-gross.webp',
        ru: 'султанахмет-площадь-трансфер-большой.webp',
        tr: 'sultanahmet-meydani-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Sultanahmet Square Transfer',
        de: 'Premium Transfer - Sultanahmet Platz Transfer',
        ru: 'Премиальный трансфер - Трансфер на площадь Султанахмет',
        tr: 'Premium Transfer - Sultanahmet Meydanı Transfer',
      },
      alt: {
        en: 'Luxury Sultanahmet Square transfer',
        de: 'Luxus Sultanahmet Platz Transfer',
        ru: 'Роскошный трансфер на площадь Султанахмет',
        tr: 'Lüks Sultanahmet Meydanı transferi',
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
        en: 'istanbul-fatih-transfer.webp',
        de: 'istanbul-fatih-transfer.webp',
        ru: 'transfer-v-stambul-fatikh.webp',
        tr: 'istanbul-fatih-transfer.webp',
      },
      smallImageName: {
        en: 'istanbul-fatih-transfer.webp',
        de: 'istanbul-fatih-transfer.webp',
        ru: 'истанбул-фатих-трансфер.webp',
        tr: 'istanbul-fatih-transfer.webp',
      },
      largeImageName: {
        en: 'istanbul-fatih-transfer-large.webp',
        de: 'istanbul-fatih-transfer-gross.webp',
        ru: 'истанбул-фатих-трансфер-большой.webp',
        tr: 'istanbul-fatih-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Istanbul Fatih Transfer',
        de: 'Premium Transfer - Istanbul Fatih Transfer',
        ru: 'Премиальный трансфер - Трансфер в Стамбул Фатих',
        tr: 'Premium Transfer - Istanbul Fatih Transfer',
      },
      alt: {
        en: 'Luxury Istanbul Fatih transfer',
        de: 'Luxus Istanbul Fatih Transfer',
        ru: 'Роскошный трансфер в Стамбул Фатих',
        tr: 'Lüks Istanbul Fatih transferi',
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
        en: 'antalya-belek-transfer.webp',
        de: 'antalya-belek-transfer.webp',
        ru: 'transfer-v-antalya-belek.webp',
        tr: 'antalya-belek-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-belek-transfer.webp',
        de: 'antalya-belek-transfer.webp',
        ru: 'анталья-белек-трансфер.webp',
        tr: 'antalya-belek-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-belek-transfer-large.webp',
        de: 'antalya-belek-transfer-gross.webp',
        ru: 'анталья-белек-трансфер-большой.webp',
        tr: 'antalya-belek-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya Belek Transfer',
        de: 'Premium Transfer - Antalya Belek Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Белек',
        tr: 'Premium Transfer - Antalya Belek Transfer',
      },
      alt: {
        en: 'Luxury Antalya Belek transfer',
        de: 'Luxus Antalya Belek Transfer',
        ru: 'Роскошный трансфер в Анталья Белек',
        tr: 'Lüks Antalya Belek transferi',
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
        en: 'kemer-transfer.webp',
        de: 'kemer-transfer.webp',
        ru: 'transfer-v-kemer.webp',
        tr: 'kemer-transfer.webp',
      },
      smallImageName: {
        en: 'kemer-transfer.webp',
        de: 'kemer-transfer.webp',
        ru: 'кемер-transfer.webp',
        tr: 'kemer-transfer.webp',
      },
      largeImageName: {
        en: 'kemer-transfer-large.webp',
        de: 'kemer-transfer-gross.webp',
        ru: 'кемер-transfer-большой.webp',
        tr: 'kemer-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Kemer Transfer',
        de: 'Premium Transfer - Kemer Transfer',
        ru: 'Премиальный трансфер - Трансфер в Кемер',
        tr: 'Premium Transfer - Kemer Transfer',
      },
      alt: {
        en: 'Luxury Kemer transfer',
        de: 'Luxus Kemer Transfer',
        ru: 'Роскошный трансфер в Кемер',
        tr: 'Lüks Kemer transferi',
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
        en: 'side-transfer.webp',
        de: 'side-transfer.webp',
        ru: 'transfer-v-sayd.webp',
        tr: 'side-transfer.webp',
      },
      smallImageName: {
        en: 'side-transfer.webp',
        de: 'side-transfer.webp',
        ru: 'сиде-трансфер.webp',
        tr: 'side-transfer.webp',
      },
      largeImageName: {
        en: 'side-transfer-large.webp',
        de: 'side-transfer-gross.webp',
        ru: 'сиде-трансфер-большой.webp',
        tr: 'side-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Side Transfer',
        de: 'Premium Transfer - Side Transfer',
        ru: 'Премиальный трансфер - Трансфер в Сайд',
        tr: 'Premium Transfer - Side Transfer',
      },
      alt: {
        en: 'Luxury Side transfer',
        de: 'Luxus Side Transfer',
        ru: 'Роскошный трансфер в Сайд',
        tr: 'Lüks Side transferi',
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
        en: 'antalya-lara-transfer.webp',
        de: 'antalya-lara-transfer.webp',
        ru: 'transfer-v-antalya-lara.webp',
        tr: 'antalya-lara-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-lara-transfer.webp',
        de: 'antalya-lara-transfer.webp',
        ru: 'анталья-лара-трансфер.webp',
        tr: 'antalya-lara-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-lara-transfer-large.webp',
        de: 'antalya-lara-transfer-gross.webp',
        ru: 'анталья-лара-трансфер-большой.webp',
        tr: 'antalya-lara-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya Lara Transfer',
        de: 'Premium Transfer - Antalya Lara Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Лара',
        tr: 'Premium Transfer - Antalya Lara Transfer',
      },
      alt: {
        en: 'Luxury Antalya Lara transfer',
        de: 'Luxus Antalya Lara Transfer',
        ru: 'Роскошный трансфер в Анталья Лара',
        tr: 'Lüks Antalya Lara transferi',
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
        en: 'antalya-konyaalti-transfer.webp',
        de: 'antalya-konyaalti-transfer.webp',
        ru: 'transfer-v-antalya-konyaalti.webp',
        tr: 'antalya-konyaalti-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-konyaalti-transfer.webp',
        de: 'antalya-konyaalti-transfer.webp',
        ru: 'анталья-коньяалты-трансфер.webp',
        tr: 'antalya-konyaalti-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-konyaalti-transfer-large.webp',
        de: 'antalya-konyaalti-transfer-gross.webp',
        ru: 'анталья-коньяалты-трансфер-большой.webp',
        tr: 'antalya-konyaalti-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya Konyaalti Transfer',
        de: 'Premium Transfer - Antalya Konyaalti Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Коньяалты',
        tr: 'Premium Transfer - Antalya Konyaalti Transfer',
      },
      alt: {
        en: 'Luxury Antalya Konyaalti transfer',
        de: 'Luxus Antalya Konyaalti Transfer',
        ru: 'Роскошный трансфер в Анталья Коньяалты',
        tr: 'Lüks Antalya Konyaalti transferi',
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
        en: 'antalya-kundu-transfer.webp',
        de: 'antalya-kundu-transfer.webp',
        ru: 'transfer-v-antalya-kundu.webp',
        tr: 'antalya-kundu-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-kundu-transfer.webp',
        de: 'antalya-kundu-transfer.webp',
        ru: 'анталья-кунду-трансфер.webp',
        tr: 'antalya-kundu-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-kundu-transfer-large.webp',
        de: 'antalya-kundu-transfer-gross.webp',
        ru: 'анталья-кунду-трансфер-большой.webp',
        tr: 'antalya-kundu-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya Kundu Transfer',
        de: 'Premium Transfer - Antalya Kundu Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Кунду',
        tr: 'Premium Transfer - Antalya Kundu Transfer',
      },
      alt: {
        en: 'Luxury Antalya Kundu transfer',
        de: 'Luxus Antalya Kundu Transfer',
        ru: 'Роскошный трансфер в Анталья Кунду',
        tr: 'Lüks Antalya Kundu transferi',
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
        en: 'antalya-old-town-transfer.webp',
        de: 'antalya-old-town-transfer.webp',
        ru: 'transfer-v-antalya-staryi-gorod.webp',
        tr: 'antalya-old-town-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-old-town-transfer.webp',
        de: 'antalya-old-town-transfer.webp',
        ru: 'анталья-старый-город-transfer.webp',
        tr: 'antalya-old-town-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-old-town-transfer-large.webp',
        de: 'antalya-old-town-transfer-gross.webp',
        ru: 'анталья-старый-город-transfer-большой.webp',
        tr: 'antalya-old-town-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya Old Town Transfer',
        de: 'Premium Transfer - Antalya Old Town Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Старый Город',
        tr: 'Premium Transfer - Antalya Old Town Transfer',
      },
      alt: {
        en: 'Luxury Antalya Old Town transfer',
        de: 'Luxus Antalya Old Town Transfer',
        ru: 'Роскошный трансфер в Анталья Старый Город',
        tr: 'Lüks Antalya Old Town transferi',
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
        en: 'antalya-city-center-transfer.webp',
        de: 'antalya-city-center-transfer.webp',
        ru: 'transfer-v-antalya-tsentralnyi-raion.webp',
        tr: 'antalya-city-center-transfer.webp',
      },
      smallImageName: {
        en: 'antalya-city-center-transfer.webp',
        de: 'antalya-city-center-transfer.webp',
        ru: 'анталья-центральный-район-трансфер.webp',
        tr: 'antalya-city-center-transfer.webp',
      },
      largeImageName: {
        en: 'antalya-city-center-transfer-large.webp',
        de: 'antalya-city-center-transfer-gross.webp',
        ru: 'анталья-центральный-район-трансфер-большой.webp',
        tr: 'antalya-city-center-transfer-buyuk.webp',
      },
      dataTitle: {
        en: 'Premium Transfer - Antalya City Center Transfer',
        de: 'Premium Transfer - Antalya City Center Transfer',
        ru: 'Премиальный трансфер - Трансфер в Анталья Центр Города',
        tr: 'Premium Transfer - Antalya City Center Transfer',
      },
      alt: {
        en: 'Luxury Antalya City Center transfer',
        de: 'Luxus Antalya City Center Transfer',
        ru: 'Роскошный трансфер в Анталья Центр Города',
        tr: 'Lüks Antalya City Center transferi',
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